System.register(['./generated-dep.js', 'external2', 'starexternal2'], (function (exports) {
	'use strict';
	var _starExcludes = {
		__proto__: null,
		main: 1,
		default: 1,
		dep: 1,
		e: 1
	};
	return {
		setters: [function (module) {
			exports("dep", module.d);
		}, function (module) {
			exports("e", module.e);
		}, function (module) {
			var setter = { __proto__: null };
			for (var name in module) {
				if (!_starExcludes[name]) setter[name] = module[name];
			}
			exports(setter);
		}],
		execute: (function () {

			var main = exports("main", '2');

		})
	};
}));
