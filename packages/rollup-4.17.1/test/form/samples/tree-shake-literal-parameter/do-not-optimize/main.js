function foo(enable) {
	console.log(enable ? 1 : 0);
}

foo(1);

export function bar(f = foo) {
	f(0);
}

// global variable
g = function (enable) {
	console.log(enable ? 1: 0);
};

g(1);
