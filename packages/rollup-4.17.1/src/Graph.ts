import flru from 'flru';
import type ExternalModule from './ExternalModule';
import Module from './Module';
import { ModuleLoader, type UnresolvedModule } from './ModuleLoader';
import GlobalScope from './ast/scopes/GlobalScope';
import { PathTracker } from './ast/utils/PathTracker';
import type {
	ModuleInfo,
	ModuleJSON,
	NormalizedInputOptions,
	ProgramNode,
	RollupCache,
	RollupWatcher,
	SerializablePluginCache,
	WatchChangeHook
} from './rollup/types';
import { PluginDriver } from './utils/PluginDriver';
import Queue from './utils/Queue';
import { BuildPhase } from './utils/buildPhase';
import { analyseModuleExecution } from './utils/executionOrder';
import { LOGLEVEL_WARN } from './utils/logging';
import {
	error,
	logCircularDependency,
	logImplicitDependantIsNotIncluded,
	logMissingExport
} from './utils/logs';
import type { PureFunctions } from './utils/pureFunctions';
import { getPureFunctions } from './utils/pureFunctions';
import { timeEnd, timeStart } from './utils/timers';
import { markModuleAndImpureDependenciesAsExecuted } from './utils/traverseStaticDependencies';

function normalizeEntryModules(
	entryModules: readonly string[] | Record<string, string>
): UnresolvedModule[] {
	if (Array.isArray(entryModules)) {
		return entryModules.map(id => ({
			fileName: null,
			id,
			implicitlyLoadedAfter: [],
			importer: undefined,
			name: null
		}));
	}
	return Object.entries(entryModules).map(([name, id]) => ({
		fileName: null,
		id,
		implicitlyLoadedAfter: [],
		importer: undefined,
		name
	}));
}

/**
 * Graph 类用于表示 Rollup 构建图，包含了模块、插件等相关信息，并提供了构建过程中的各种操作方法。
 */
export default class Graph {
	readonly astLru = flru<ProgramNode>(5); // AST 缓存
	readonly cachedModules = new Map<string, ModuleJSON>(); // 缓存的模块
	readonly deoptimizationTracker = new PathTracker(); // 优化路径追踪器
	entryModules: Module[] = []; // 入口模块数组
	readonly fileOperationQueue: Queue; // 文件操作队列
	readonly moduleLoader: ModuleLoader; // 模块加载器
	readonly modulesById = new Map<string, Module | ExternalModule>(); // 根据模块 ID 映射模块对象的 Map
	needsTreeshakingPass = false; // 是否需要进行树摇处理的标志
	phase: BuildPhase = BuildPhase.LOAD_AND_PARSE; // 构建阶段
	readonly pluginDriver: PluginDriver; // 插件驱动器
	readonly pureFunctions: PureFunctions; // 纯函数集合
	readonly scope = new GlobalScope(); // 全局作用域
	readonly watchFiles: Record<string, true> = Object.create(null); // 监视文件列表
	watchMode = false; // 是否处于监视模式

	// 私有属性
	private readonly externalModules: ExternalModule[] = []; // 外部模块数组
	private implicitEntryModules: Module[] = []; // 隐式入口模块数组
	private modules: Module[] = []; // 模块数组
	private declare pluginCache?: Record<string, SerializablePluginCache>; // 插件缓存

	/**
	 * 构造函数，初始化 Graph 对象。
	 * @param options 规范化后的输入选项对象
	 * @param watcher RollupWatcher 实例，用于监视文件变化
	 */
	constructor(
		private readonly options: NormalizedInputOptions, // 规范化后的输入选项对象
		watcher: RollupWatcher | null // RollupWatcher 实例，用于监视文件变化
	) {
		// 初始化插件缓存和相关属性
		if (options.cache !== false) {
			if (options.cache?.modules) {
				for (const module of options.cache.modules) this.cachedModules.set(module.id, module);
			}
			this.pluginCache = options.cache?.plugins || Object.create(null);

			// 增加插件缓存的访问计数器
			for (const name in this.pluginCache) {
				const cache = this.pluginCache[name];
				for (const value of Object.values(cache)) value[0]++;
			}
		}

		// 初始化监视模式相关属性
		if (watcher) {
			this.watchMode = true;
			const handleChange = (...parameters: Parameters<WatchChangeHook>) =>
				this.pluginDriver.hookParallel('watchChange', parameters);
			const handleClose = () => this.pluginDriver.hookParallel('closeWatcher', []);
			watcher.onCurrentRun('change', handleChange);
			watcher.onCurrentRun('close', handleClose);
		}

		// 初始化插件驱动器、模块加载器和文件操作队列
		this.pluginDriver = new PluginDriver(this, options, options.plugins, this.pluginCache);
		this.moduleLoader = new ModuleLoader(this, this.modulesById, this.options, this.pluginDriver);
		this.fileOperationQueue = new Queue(options.maxParallelFileOps);
		this.pureFunctions = getPureFunctions(options);
	}

	/**
	 * 执行构建过程。
	 */
	async build(): Promise<void> {
		timeStart('generate module graph', 2);
		await this.generateModuleGraph();
		timeEnd('generate module graph', 2);

		timeStart('sort and bind modules', 2);
		this.phase = BuildPhase.ANALYSE;
		this.sortModules();
		timeEnd('sort and bind modules', 2);

		timeStart('mark included statements', 2);
		this.includeStatements();
		timeEnd('mark included statements', 2);

		this.phase = BuildPhase.GENERATE;
	}

	/**
	 * 获取缓存信息。
	 * @returns RollupCache 对象
	 */
	getCache(): RollupCache {
		// 处理插件缓存过期
		for (const name in this.pluginCache) {
			const cache = this.pluginCache[name];
			let allDeleted = true;
			for (const [key, value] of Object.entries(cache)) {
				if (value[0] >= this.options.experimentalCacheExpiry) delete cache[key];
				else allDeleted = false;
			}
			if (allDeleted) delete this.pluginCache[name];
		}

		// 返回缓存信息对象
		return {
			modules: this.modules.map(module => module.toJSON()),
			plugins: this.pluginCache
		};
	}

	/**
	 * 根据模块 ID 获取模块信息。
	 * @param moduleId 模块 ID
	 * @returns 模块信息对象或 null（如果模块不存在）
	 */
	getModuleInfo = (moduleId: string): ModuleInfo | null => {
		const foundModule = this.modulesById.get(moduleId);
		if (!foundModule) return null;
		return foundModule.info;
	};

	// 私有方法

	/**
	 * 生成模块图。
	 */
	private async generateModuleGraph(): Promise<void> {
		// 加载入口模块，并将结果赋值给 this.entryModules 和 this.implicitEntryModules
		({ entryModules: this.entryModules, implicitEntryModules: this.implicitEntryModules } =
			await this.moduleLoader.addEntryModules(normalizeEntryModules(this.options.input), true));

		// 如果入口模块数量为0，则抛出错误
		if (this.entryModules.length === 0) {
			throw new Error('You must supply options.input to rollup');
		}

		// 遍历 this.modulesById 中的每个模块
		for (const module of this.modulesById.values()) {
			// 获取模块的缓存信息
			module.cacheInfoGetters();

			// 判断模块是否是 Module 实例
			if (module instanceof Module) {
				// 如果是 Module 实例，则将其添加到 this.modules 数组中
				this.modules.push(module);
			} else {
				// 如果不是 Module 实例，则将其添加到 this.externalModules 数组中
				this.externalModules.push(module);
			}
		}
	}

	/**
	 * 包含语句。
	 */
	private includeStatements(): void {
		const entryModules = [...this.entryModules, ...this.implicitEntryModules];
		for (const module of entryModules) {
			markModuleAndImpureDependenciesAsExecuted(module);
		}
		if (this.options.treeshake) {
			let treeshakingPass = 1;
			do {
				timeStart(`treeshaking pass ${treeshakingPass}`, 3);
				this.needsTreeshakingPass = false;
				for (const module of this.modules) {
					if (module.isExecuted) {
						if (module.info.moduleSideEffects === 'no-treeshake') {
							module.includeAllInBundle();
						} else {
							module.include();
						}
						// 如果模块被执行，且配置为 no-treeshake，则将其所有内容包含在 bundle 中
						// 否则执行 treeshake 操作
					}
				}
				if (treeshakingPass === 1) {
					// 在第一次 treeshaking 过程中，仅处理导出项，避免 TDZ（暂时死区）检测逻辑的问题
					for (const module of entryModules) {
						if (module.preserveSignature !== false) {
							module.includeAllExports(false);
							this.needsTreeshakingPass = true;
						}
					}
				}
				timeEnd(`treeshaking pass ${treeshakingPass++}`, 3);
			} while (this.needsTreeshakingPass);
		} else {
			for (const module of this.modules) module.includeAllInBundle();
		}
		for (const externalModule of this.externalModules) externalModule.warnUnusedImports();
		for (const module of this.implicitEntryModules) {
			for (const dependant of module.implicitlyLoadedAfter) {
				if (!(dependant.info.isEntry || dependant.isIncluded())) {
					error(logImplicitDependantIsNotIncluded(dependant));
				}
			}
		}
	}

	/**
	 * 排序模块。
	 */
	private sortModules(): void {
		const { orderedModules, cyclePaths } = analyseModuleExecution(this.entryModules);
		for (const cyclePath of cyclePaths) {
			this.options.onLog(LOGLEVEL_WARN, logCircularDependency(cyclePath));
		}
		this.modules = orderedModules;
		for (const module of this.modules) {
			module.bindReferences();
		}
		this.warnForMissingExports();
	}

	/**
	 * 发出缺失导出项的警告。
	 */
	private warnForMissingExports(): void {
		for (const module of this.modules) {
			for (const importDescription of module.importDescriptions.values()) {
				if (
					importDescription.name !== '*' &&
					!importDescription.module.getVariableForExportName(importDescription.name)[0]
				) {
					module.log(
						LOGLEVEL_WARN,
						logMissingExport(importDescription.name, module.id, importDescription.module.id),
						importDescription.start
					);
				}
			}
		}
	}
}

