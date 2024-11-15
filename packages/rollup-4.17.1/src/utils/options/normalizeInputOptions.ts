import type {
	HasModuleSideEffects,
	InputOptions,
	ModuleSideEffectsOption,
	NormalizedInputOptions,
	RollupBuild
} from '../../rollup/types';
import { EMPTY_ARRAY } from '../blank';
import { ensureArray } from '../ensureArray';
import { getLogger } from '../logger';
import { LOGLEVEL_INFO } from '../logging';
import { error, logInvalidOption } from '../logs';
import { resolve } from '../path';
import { URL_TREESHAKE, URL_TREESHAKE_MODULESIDEEFFECTS } from '../urls';
import {
	getOnLog,
	getOptionWithPreset,
	normalizePluginOption,
	treeshakePresets,
	warnUnknownOptions
} from './options';

export interface CommandConfigObject {
	[key: string]: unknown;
	external: (string | RegExp)[];
	globals: { [id: string]: string } | undefined;
}

/**
 * normalizeInputOptions 函数用于规范化输入选项，并返回一个 Promise，该 Promise 在解析完成后返回规范化后的选项对象以及未设置的选项集合。
 * @param config 输入选项对象，包含用户提供的配置信息
 * @param watchMode 是否处于监视模式
 * @returns 一个 Promise，解析后返回规范化后的选项对象以及未设置的选项集合
 */
export async function normalizeInputOptions(
	config: InputOptions, // 用户传入的输入选项对象
	watchMode: boolean // 是否处于监视模式
): Promise<{
	options: NormalizedInputOptions; // 规范化后的输入选项对象
	unsetOptions: Set<string>; // 未设置的选项集合
}> {
	// 创建一个 Set 对象来存储未设置的选项名称
	const unsetOptions = new Set<string>();

	// 获取上下文，如果用户未提供，则默认为 'undefined'
	const context = config.context ?? 'undefined';

	// 规范化插件选项
	const plugins = await normalizePluginOption(config.plugins);

	// 获取日志级别，如果用户未提供，则默认为 LOGLEVEL_INFO
	const logLevel = config.logLevel || LOGLEVEL_INFO;

	// 获取日志记录器
	const onLog = getLogger(plugins, getOnLog(config, logLevel), watchMode, logLevel);

	// 是否启用严格的废弃警告模式
	const strictDeprecations = config.strictDeprecations || false;

	// 获取并设置最大并行文件操作数
	const maxParallelFileOps = getMaxParallelFileOps(config);

	// 组装规范化后的输入选项对象
	const options: NormalizedInputOptions & InputOptions = {
		cache: getCache(config), // 获取缓存选项
		context, // 上下文
		experimentalCacheExpiry: config.experimentalCacheExpiry ?? 10, // 实验性缓存过期时间
		experimentalLogSideEffects: config.experimentalLogSideEffects || false, // 是否记录副作用的实验性选项
		external: getIdMatcher(config.external), // 外部模块的匹配器
		input: getInput(config), // 入口点
		logLevel, // 日志级别
		makeAbsoluteExternalsRelative: config.makeAbsoluteExternalsRelative ?? 'ifRelativeSource', // 将绝对路径外部模块转换为相对路径的选项
		maxParallelFileOps, // 最大并行文件操作数
		moduleContext: getModuleContext(config, context), // 模块上下文
		onLog, // 日志记录器
		perf: config.perf || false, // 性能指标
		plugins, // 插件
		preserveEntrySignatures: config.preserveEntrySignatures ?? 'exports-only', // 保留入口点签名的选项
		preserveSymlinks: config.preserveSymlinks || false, // 是否保留符号链接
		shimMissingExports: config.shimMissingExports || false, // 是否 shim 缺失的导出
		strictDeprecations, // 是否启用严格的废弃警告模式
		treeshake: getTreeshake(config) // 树摇选项
	};

	// 警告用户未知的选项
	warnUnknownOptions(
		config,
		[...Object.keys(options), 'onwarn', 'watch'], // 需要检查的选项列表，包括 options 对象的所有属性、'onwarn' 和 'watch'
		'input options', // 警告信息中的来源描述
		onLog, // 日志记录器
		/^(output)$/ // 需要忽略的选项模式
	);

	// 返回规范化后的选项对象以及未设置的选项集合
	return { options, unsetOptions };
}

const getCache = (config: InputOptions): NormalizedInputOptions['cache'] =>
	config.cache === true // `true` is the default
		? undefined
		: (config.cache as unknown as RollupBuild)?.cache || config.cache;

const getIdMatcher = <T extends Array<any>>(
	option:
		| undefined
		| boolean
		| string
		| RegExp
		| (string | RegExp)[]
		| ((id: string, ...parameters: T) => boolean | null | void)
): ((id: string, ...parameters: T) => boolean) => {
	if (option === true) {
		return () => true;
	}
	if (typeof option === 'function') {
		return (id, ...parameters) => (!id.startsWith('\0') && option(id, ...parameters)) || false;
	}
	if (option) {
		const ids = new Set<string>();
		const matchers: RegExp[] = [];
		for (const value of ensureArray(option)) {
			if (value instanceof RegExp) {
				matchers.push(value);
			} else {
				ids.add(value);
			}
		}
		return (id: string, ..._arguments) => ids.has(id) || matchers.some(matcher => matcher.test(id));
	}
	return () => false;
};

const getInput = (config: InputOptions): NormalizedInputOptions['input'] => {
	const configInput = config.input;
	return configInput == null ? [] : typeof configInput === 'string' ? [configInput] : configInput;
};

const getMaxParallelFileOps = (
	config: InputOptions
): NormalizedInputOptions['maxParallelFileOps'] => {
	const maxParallelFileOps = config.maxParallelFileOps;
	if (typeof maxParallelFileOps === 'number') {
		if (maxParallelFileOps <= 0) return Infinity;
		return maxParallelFileOps;
	}
	return 20;
};

const getModuleContext = (
	config: InputOptions,
	context: string
): NormalizedInputOptions['moduleContext'] => {
	const configModuleContext = config.moduleContext;
	if (typeof configModuleContext === 'function') {
		return id => configModuleContext(id) ?? context;
	}
	if (configModuleContext) {
		const contextByModuleId: {
			[key: string]: string;
		} = Object.create(null);
		for (const [key, moduleContext] of Object.entries(configModuleContext)) {
			contextByModuleId[resolve(key)] = moduleContext;
		}
		return id => contextByModuleId[id] ?? context;
	}
	return () => context;
};

const getTreeshake = (config: InputOptions): NormalizedInputOptions['treeshake'] => {
	const configTreeshake = config.treeshake;
	if (configTreeshake === false) {
		return false;
	}
	const configWithPreset = getOptionWithPreset(
		config.treeshake,
		treeshakePresets,
		'treeshake',
		URL_TREESHAKE,
		'false, true, '
	);
	return {
		annotations: configWithPreset.annotations !== false,
		correctVarValueBeforeDeclaration: configWithPreset.correctVarValueBeforeDeclaration === true,
		manualPureFunctions:
			(configWithPreset.manualPureFunctions as readonly string[] | undefined) ?? EMPTY_ARRAY,
		moduleSideEffects: getHasModuleSideEffects(
			configWithPreset.moduleSideEffects as ModuleSideEffectsOption | undefined
		),
		propertyReadSideEffects:
			configWithPreset.propertyReadSideEffects === 'always'
				? 'always'
				: configWithPreset.propertyReadSideEffects !== false,
		tryCatchDeoptimization: configWithPreset.tryCatchDeoptimization !== false,
		unknownGlobalSideEffects: configWithPreset.unknownGlobalSideEffects !== false
	};
};

const getHasModuleSideEffects = (
	moduleSideEffectsOption: ModuleSideEffectsOption | undefined
): HasModuleSideEffects => {
	if (typeof moduleSideEffectsOption === 'boolean') {
		return () => moduleSideEffectsOption;
	}
	if (moduleSideEffectsOption === 'no-external') {
		return (_id, external) => !external;
	}
	if (typeof moduleSideEffectsOption === 'function') {
		return (id, external) =>
			id.startsWith('\0') ? true : moduleSideEffectsOption(id, external) !== false;
	}
	if (Array.isArray(moduleSideEffectsOption)) {
		const ids = new Set(moduleSideEffectsOption);
		return id => ids.has(id);
	}
	if (moduleSideEffectsOption) {
		error(
			logInvalidOption(
				'treeshake.moduleSideEffects',
				URL_TREESHAKE_MODULESIDEEFFECTS,
				'please use one of false, "no-external", a function or an array'
			)
		);
	}
	return () => true;
};
