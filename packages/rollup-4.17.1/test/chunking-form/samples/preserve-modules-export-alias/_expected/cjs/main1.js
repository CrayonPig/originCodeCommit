'use strict';

var dep = require('./dep.js');



exports.bar = dep.foo;
exports.foo = dep.foo;
