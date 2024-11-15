import process from 'node:process';
import type { Plugin } from '../../src/rollup/types';

export const stdinName = '-';

let stdinResult: Promise<string> | null = null;

export function stdinPlugin(argument: unknown): Plugin {
	const suffix = typeof argument == 'string' && argument.length > 0 ? '.' + argument : '';
	return {
		load(id) {
			if (id === stdinName || id.startsWith(stdinName + '.')) {
				return stdinResult || (stdinResult = readStdin());
			}
		},
		name: 'stdin',
		resolveId(id) {
			if (id === stdinName) {
				return id + suffix;
			}
		}
	};
}

function readStdin(): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		process.stdin.setEncoding('utf8');
		process.stdin
			.on('data', chunk => chunks.push(chunk))
			.on('end', () => {
				const result = chunks.join('');
				resolve(result);
			})
			.on('error', error => {
				reject(error);
			});
	});
}
