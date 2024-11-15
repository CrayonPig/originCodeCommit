const assert = require('node:assert');

module.exports = defineTest({
	description: 'Associates method parameters with their call arguments with regard to mutations',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
