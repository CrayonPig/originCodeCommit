import { version as rollupVersion } from 'package.json';
import Bundle from '../Bundle';
import Graph from '../Graph';
import type { PluginDriver } from '../utils/PluginDriver';
import { getSortedValidatedPlugins } from '../utils/PluginDriver';
import { mkdir, writeFile } from '../utils/fs';
import { catchUnfinishedHookActions } from '../utils/hookActions';
import initWasm from '../utils/initWasm';
import { getLogHandler } from '../utils/logHandler';
import { getLogger } from '../utils/logger';
import { LOGLEVEL_DEBUG, LOGLEVEL_INFO, LOGLEVEL_WARN } from '../utils/logging';
import {
	error,
	logAlreadyClosed,
	logCannotEmitFromOptionsHook,
	logMissingFileOrDirOption,
	logPluginError
} from '../utils/logs';
import { normalizeInputOptions } from '../utils/options/normalizeInputOptions';
import { normalizeOutputOptions } from '../utils/options/normalizeOutputOptions';
import { getOnLog, normalizeLog, normalizePluginOption } from '../utils/options/options';
import { dirname, resolve } from '../utils/path';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from '../utils/pluginUtils';
import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import type {
	InputOptions,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputAsset,
	OutputBundle,
	OutputChunk,
	OutputOptions,
	Plugin,
	RollupBuild,
	RollupOptions,
	RollupOptionsFunction,
	RollupOutput,
	RollupWatcher
} from './types';

export default function rollup (rawInputOptions: RollupOptions): Promise<RollupBuild> {
	return rollupInternal(rawInputOptions, null);
}

/**
 * @param {RollupOptions} rawInputOptions - 原始Rollup输入选项
 * @param {RollupWatcher | null} watcher - Rollup监视器
 * @returns {Promise<RollupBuild>} - Rollup构建对象的Promise
 */
export async function rollupInternal (
	rawInputOptions: RollupOptions,
	watcher: RollupWatcher | null
): Promise<RollupBuild> {
	// 初始化输入配置
	const { options: inputOptions, unsetOptions: unsetInputOptions } = await getInputOptions(
		rawInputOptions,
		watcher !== null
	);
	// 初始化计时器
	initialiseTimers(inputOptions);

	await initWasm();

	const graph = new Graph(inputOptions, watcher);

	// remove the cache object from the memory after graph creation (cache is not used anymore)
	const useCache = rawInputOptions.cache !== false;
	if (rawInputOptions.cache) {
		inputOptions.cache = undefined;
		rawInputOptions.cache = undefined;
	}

	timeStart('BUILD', 1);

	await catchUnfinishedHookActions(graph.pluginDriver, async () => {
		try {
			timeStart('initialize', 2);
			await graph.pluginDriver.hookParallel('buildStart', [inputOptions]);
			timeEnd('initialize', 2);
			await graph.build();
		} catch (error_: any) {
			const watchFiles = Object.keys(graph.watchFiles);
			if (watchFiles.length > 0) {
				error_.watchFiles = watchFiles;
			}
			await graph.pluginDriver.hookParallel('buildEnd', [error_]);
			await graph.pluginDriver.hookParallel('closeBundle', []);
			throw error_;
		}
		await graph.pluginDriver.hookParallel('buildEnd', []);
	});

	timeEnd('BUILD', 1);

	const result: RollupBuild = {
		cache: useCache ? graph.getCache() : undefined,
		async close () {
			if (result.closed) return;

			result.closed = true;

			await graph.pluginDriver.hookParallel('closeBundle', []);
		},
		closed: false,
		async generate (rawOutputOptions: OutputOptions) {
			if (result.closed) return error(logAlreadyClosed());

			return handleGenerateWrite(false, inputOptions, unsetInputOptions, rawOutputOptions, graph);
		},
		get watchFiles () {
			return Object.keys(graph.watchFiles);
		},
		async write (rawOutputOptions: OutputOptions) {
			if (result.closed) return error(logAlreadyClosed());

			return handleGenerateWrite(true, inputOptions, unsetInputOptions, rawOutputOptions, graph);
		}
	};
	if (inputOptions.perf) result.getTimings = getTimings;
	return result;
}

/**
 * 获取输入选项
 * @param {InputOptions} initialInputOptions - 初始输入选项
 * @param {boolean} watchMode - 是否为监视模式
 * @returns {Promise<{ options: NormalizedInputOptions; unsetOptions: Set<string> }>} - 包含标准化后的输入选项和未设置的选项集合的Promise
 */
async function getInputOptions (
	initialInputOptions: InputOptions,
	watchMode: boolean
): Promise<{ options: NormalizedInputOptions; unsetOptions: Set<string> }> {
	// 确保初始化对象存在
	if (!initialInputOptions) {
		throw new Error('You must supply an options object to rollup');
	}
	const processedInputOptions = await getProcessedInputOptions(initialInputOptions, watchMode);
	// 规范输入参数的格式
	const { options, unsetOptions } = await normalizeInputOptions(processedInputOptions, watchMode);
	normalizePlugins(options.plugins, ANONYMOUS_PLUGIN_PREFIX);
	return { options, unsetOptions };
}


/**
 * getProcessedInputOptions 函数用于获取处理后的输入选项。
 * @param inputOptions 输入选项对象，包含用户提供的配置信息
 * @param watchMode 是否处于监视模式
 * @returns 一个 Promise，在处理完成后返回处理后的输入选项对象
 */
async function getProcessedInputOptions (
	inputOptions: InputOptions, // 用户传入的输入选项对象
	watchMode: boolean // 是否处于监视模式
): Promise<InputOptions> {
	// 获取并排序、验证插件
	const plugins = getSortedValidatedPlugins(
		'options',
		await normalizePluginOption(inputOptions.plugins)
	);

	// 获取日志级别，如果用户未提供，则默认为 LOGLEVEL_INFO
	const logLevel = inputOptions.logLevel || LOGLEVEL_INFO;

	// 获取日志记录器
	const logger = getLogger(plugins, getOnLog(inputOptions, logLevel), watchMode, logLevel);

	// 遍历插件列表，处理插件选项
	for (const plugin of plugins) {
		const { name, options } = plugin;

		// 获取插件处理函数
		const handler = 'handler' in options! ? options.handler : options!;

		// 调用插件处理函数，并传入上下文对象
		const processedOptions = await handler.call(
			{
				// 提供日志记录功能的 debug 函数
				debug: getLogHandler(LOGLEVEL_DEBUG, 'PLUGIN_LOG', logger, name, logLevel),

				// 抛出插件错误的 error 函数
				error: (error_): never =>
					error(logPluginError(normalizeLog(error_), name, { hook: 'onLog' })),

				// 提供日志记录功能的 info 函数
				info: getLogHandler(LOGLEVEL_INFO, 'PLUGIN_LOG', logger, name, logLevel),

				// 插件元数据对象，包含 rollup 版本和监视模式信息
				meta: { rollupVersion, watchMode },

				// 提供日志记录功能的 warn 函数
				warn: getLogHandler(LOGLEVEL_WARN, 'PLUGIN_WARNING', logger, name, logLevel)
			},
			inputOptions // 将输入选项对象传递给插件处理函数
		);

		// 如果插件处理函数返回了处理后的选项对象，则更新输入选项对象
		if (processedOptions) {
			inputOptions = processedOptions;
		}
	}

	// 返回处理后的输入选项对象
	return inputOptions;
}


/**
 * normalizePlugins 函数用于规范化插件列表，给没有名称的插件分配一个匿名名称。
 * @param plugins 插件数组，包含用户提供的插件对象列表
 * @param anonymousPrefix 匿名插件名称的前缀
 */
function normalizePlugins (plugins: readonly Plugin[], anonymousPrefix: string): void {
	// 遍历插件数组
	for (const [index, plugin] of plugins.entries()) {
		// 如果插件没有名称，则为其分配一个匿名名称，名称格式为 `${anonymousPrefix}${index + 1}`
		if (!plugin.name) {
			plugin.name = `${anonymousPrefix}${index + 1}`;
		}
	}
}

/**
 * handleGenerateWrite 函数用于处理生成和写入操作。
 * @param isWrite 是否执行写入操作
 * @param inputOptions 规范化后的输入选项对象
 * @param unsetInputOptions 未设置的输入选项集合
 * @param rawOutputOptions 输出选项对象，包含用户提供的配置信息
 * @param graph Rollup 构建图对象
 * @returns 一个 Promise，在处理完成后返回 RollupOutput 对象
 */
async function handleGenerateWrite (
	isWrite: boolean, // 是否执行写入操作
	inputOptions: NormalizedInputOptions, // 规范化后的输入选项对象
	unsetInputOptions: ReadonlySet<string>, // 未设置的输入选项集合
	rawOutputOptions: OutputOptions, // 输出选项对象，包含用户提供的配置信息
	graph: Graph // Rollup 构建图对象
): Promise<RollupOutput> {
	// 获取输出选项对象、输出插件驱动器以及未设置的输出选项集合
	const {
		options: outputOptions,
		outputPluginDriver,
		unsetOptions
	} = await getOutputOptionsAndPluginDriver(
		rawOutputOptions,
		graph.pluginDriver,
		inputOptions,
		unsetInputOptions
	);

	// 捕获未完成的钩子动作
	return catchUnfinishedHookActions(outputPluginDriver, async () => {
		// 创建 Bundle 对象
		const bundle = new Bundle(outputOptions, unsetOptions, inputOptions, outputPluginDriver, graph);

		// 生成代码
		const generated = await bundle.generate(isWrite);

		// 如果执行写入操作
		if (isWrite) {
			// 记录写入操作开始时间
			timeStart('WRITE', 1);

			// 如果未提供输出目录或文件选项，则抛出错误
			if (!outputOptions.dir && !outputOptions.file) {
				return error(logMissingFileOrDirOption());
			}

			// 并行执行写入文件操作
			await Promise.all(
				Object.values(generated).map(chunk =>
					graph.fileOperationQueue.run(() => writeOutputFile(chunk, outputOptions))
				)
			);

			// 执行输出插件的 writeBundle 钩子
			await outputPluginDriver.hookParallel('writeBundle', [outputOptions, generated]);

			// 记录写入操作结束时间
			timeEnd('WRITE', 1);
		}

		// 创建 RollupOutput 对象并返回
		return createOutput(generated);
	});
}


/**
 * 异步函数，用于获取输出选项和插件驱动器
 * @param {OutputOptions} rawOutputOptions - 原始输出选项
 * @param {PluginDriver} inputPluginDriver - 输入插件驱动器
 * @param {NormalizedInputOptions} inputOptions - 标准化后的输入选项
 * @param {ReadonlySet<string>} unsetInputOptions - 未设置的输入选项集合
 * @returns {Promise<{
*   options: NormalizedOutputOptions; // 标准化后的输出选项
*   outputPluginDriver: PluginDriver; // 输出插件驱动器
*   unsetOptions: Set<string>; // 未设置的选项集合
* }>} - 包含标准化后的输出选项、输出插件驱动器和未设置的选项集合的对象的Promise
*/
async function getOutputOptionsAndPluginDriver (
	rawOutputOptions: OutputOptions,
	inputPluginDriver: PluginDriver,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: ReadonlySet<string>
): Promise<{
	options: NormalizedOutputOptions;
	outputPluginDriver: PluginDriver;
	unsetOptions: Set<string>;
}> {
	if (!rawOutputOptions) {
		throw new Error('You must supply an options object'); // 如果没有原始输出选项，则抛出错误
	}
	const rawPlugins = await normalizePluginOption(rawOutputOptions.plugins); // 标准化插件选项
	normalizePlugins(rawPlugins, ANONYMOUS_OUTPUT_PLUGIN_PREFIX); // 标准化插件名称
	const outputPluginDriver = inputPluginDriver.createOutputPluginDriver(rawPlugins); // 创建输出插件驱动器

	// 返回包含标准化后的输出选项、输出插件驱动器和未设置的选项集合的对象
	return {
		...(await getOutputOptions(
			inputOptions,
			unsetInputOptions,
			rawOutputOptions,
			outputPluginDriver
		)), // 获取标准化后的输出选项，将其与其他属性结合
		outputPluginDriver // 输出插件驱动器
	};
}

/**
 * 获取输出选项
 * @param {NormalizedInputOptions} inputOptions - 标准化后的输入选项
 * @param {ReadonlySet<string>} unsetInputOptions - 未设置的输入选项集合
 * @param {OutputOptions} rawOutputOptions - 原始输出选项
 * @param {PluginDriver} outputPluginDriver - 输出插件驱动器
 * @returns {Promise<{
*   options: NormalizedOutputOptions; // 标准化后的输出选项
*   unsetOptions: Set<string>; // 未设置的选项集合
* }>} - 包含标准化后的输出选项和未设置的选项集合的Promise
*/
function getOutputOptions (
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: ReadonlySet<string>,
	rawOutputOptions: OutputOptions,
	outputPluginDriver: PluginDriver
): Promise<{ options: NormalizedOutputOptions; unsetOptions: Set<string> }> {
	return normalizeOutputOptions(
		outputPluginDriver.hookReduceArg0Sync(
			'outputOptions', // 输出选项钩子名称
			[rawOutputOptions], // 钩子参数，传入原始输出选项
			(outputOptions, result) => result || outputOptions, // 钩子回调函数，将结果合并或返回原始输出选项
			pluginContext => {
				const emitError = () => pluginContext.error(logCannotEmitFromOptionsHook()); // 错误处理函数
				return {
					...pluginContext,
					emitFile: emitError, // 将插件上下文中的 emitFile 方法替换为 emitError 函数
					setAssetSource: emitError // 将插件上下文中的 setAssetSource 方法替换为 emitError 函数
				};
			}
		),
		inputOptions,
		unsetInputOptions
	);
}


/**
 * 创建输出对象
 * @param {OutputBundle} outputBundle - 输出包对象
 * @returns {RollupOutput} - Rollup输出对象
 */
function createOutput (outputBundle: OutputBundle): RollupOutput {
	return {
		output: (
			Object.values(outputBundle).filter(outputFile => Object.keys(outputFile).length > 0) as (
				| OutputChunk
				| OutputAsset
			)[]
		).sort(
			(outputFileA, outputFileB) =>
				getSortingFileType(outputFileA) - getSortingFileType(outputFileB)
		) as [OutputChunk, ...(OutputChunk | OutputAsset)[]]
	};
}

/**
 * 输出文件类型枚举
 */
enum SortingFileType {
	ENTRY_CHUNK = 0, // 入口chunk
	SECONDARY_CHUNK = 1, // 二级chunk
	ASSET = 2 // 资源文件
}

/**
 * 获取文件排序类型
 * @param {OutputAsset | OutputChunk} file - 输出文件
 * @returns {SortingFileType} - 文件排序类型
 */
function getSortingFileType (file: OutputAsset | OutputChunk): SortingFileType {
	if (file.type === 'asset') {
		return SortingFileType.ASSET;
	}
	if (file.isEntry) {
		return SortingFileType.ENTRY_CHUNK;
	}
	return SortingFileType.SECONDARY_CHUNK;
}

/**
 * 写入输出文件
 * @param {OutputAsset | OutputChunk} outputFile - 输出文件
 * @param {NormalizedOutputOptions} outputOptions - 标准化后的输出选项
 * @returns {Promise<unknown>} - Promise对象
 */
async function writeOutputFile (
	outputFile: OutputAsset | OutputChunk,
	outputOptions: NormalizedOutputOptions
): Promise<unknown> {
	const fileName = resolve(outputOptions.dir || dirname(outputOptions.file!), outputFile.fileName);

	// 如果文件夹结构或其部分已经存在，则“recursive：true”不会触发
	await mkdir(dirname(fileName), { recursive: true });

	return writeFile(fileName, outputFile.type === 'asset' ? outputFile.source : outputFile.code);
}

/**
 * 用于定义rollup配置的辅助函数
 * 主要是为了方便IDE代码提示，毕竟export default不提示，即使添加了@type注释，也不准确
 * @param {RollupOptions | RollupOptions[] | RollupOptionsFunction} options - Rollup配置选项
 * @returns {RollupOptions | RollupOptions[] | RollupOptionsFunction} - Rollup配置选项
 */
export function defineConfig<T extends RollupOptions | RollupOptions[] | RollupOptionsFunction> (
	options: T
): T {
	return options;
}
