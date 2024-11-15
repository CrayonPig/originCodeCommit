module.exports = defineTest({
	description: 'buildStart hooks can use this.error',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle() {
					this.error('nope');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: '[plugin test] nope',
		hook: 'generateBundle'
	}
});
