---
title: Integrating Rollup With Other Tools
---

# {{ $frontmatter.title }}

[[toc]]

## With NPM Packages

At some point, it's likely that your project will depend on packages installed from NPM into your `node_modules` folder. Unlike other bundlers such as Webpack and Browserify, Rollup doesn't know "out of the box" how to handle these dependencies - we need to add some configuration.

Let's add a simple dependency called [the-answer](https://www.npmjs.com/package/the-answer), which exports the answer to the question of life, the universe and everything:

```shell
npm install the-answer
# or `npm i the-answer`
```

If we update our `src/main.js` file…

```js
// src/main.js
import answer from 'the-answer';

export default function () {
	console.log('the answer is ' + answer);
}
```

…and run Rollup…

```shell
npm run build
```

…we'll see a warning like this:

```
(!) Unresolved dependencies
https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency
the-answer (imported by main.js)
```

The resulting `bundle.js` will still work in Node.js, because the `import` declaration gets turned into a CommonJS `require` statement, but `the-answer` does _not_ get included in the bundle. For that, we need a plugin.

### @rollup/plugin-node-resolve

The [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve) plugin teaches Rollup how to find external modules. Install it…

```shell
npm install --save-dev @rollup/plugin-node-resolve
```

…and add it to your config file:

```js twoslash
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';

// ---cut-start---
/** @type {import('rollup').RollupOptions} */
// ---cut-end---
export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [resolve()]
};
```

This time, when you `npm run build`, no warning is emitted — the bundle contains the imported module.

### @rollup/plugin-commonjs

Some libraries expose ES modules that you can import as-is — `the-answer` is one such module. But at the moment, the majority of packages on NPM are exposed as CommonJS modules instead. Until that changes, we need to convert CommonJS to ES2015 before Rollup can process them.

The [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) plugin does exactly that.

Note that most of the time `@rollup/plugin-commonjs` should go _before_ other plugins that transform your modules — this is to prevent other plugins from making changes that break the CommonJS detection. An exception for this rule is the Babel plugin, if you're using it then place it before the commonjs one.

## Peer dependencies

Let's say that you're building a library that has a peer dependency, such as React or Lodash. If you set up externals as described above, your rollup will bundle _all_ imports:

```js
import answer from 'the-answer';
import _ from 'lodash';
```

You can finely tune which imports are bundled and which are treated as external. For this example, we'll treat `lodash` as external, but not `the-answer`.

Here is the config file:

```js twoslash
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';

// ---cut-start---
/** @type {import('rollup').RollupOptions} */
// ---cut-end---
export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [
		resolve({
			// pass custom options to the resolve plugin
			moduleDirectories: ['node_modules']
		})
	],
	// indicate which modules should be treated as external
	external: ['lodash']
};
```

Voilà, `lodash` will now be treated as external, and not be bundled with your library.

The `external` key accepts either an array of module names, or a function which takes the module name and returns true if it should be treated as external. For example:

```js twoslash
// ---cut-start---
/** @type {import('rollup').RollupOptions} */
// ---cut-end---
export default {
	// ...
	external: id => /lodash/.test(id)
};
```

You might use this form if you're using [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) to cherry-pick `lodash` modules. In this case, Babel will convert your import statements to look like this:

```js
import _merge from 'lodash/merge';
```

The array form of `external` does not handle wildcards, so this import will only be treated as external in the functional form.

## Babel

Many developers use [Babel](https://babeljs.io/) in their projects in order to use the latest JavaScript features that aren't yet supported by browsers and Node.js.

The easiest way to use both Babel and Rollup is with [@rollup/plugin-babel](https://github.com/rollup/plugins/tree/master/packages/babel). First, install the plugin:

```shell
npm i -D @rollup/plugin-babel @rollup/plugin-node-resolve
```

Add it to `rollup.config.js`:

```js twoslash
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

// ---cut-start---
/** @type {import('rollup').RollupOptions} */
// ---cut-end---
export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [resolve(), babel({ babelHelpers: 'bundled' })]
};
```

Before Babel will actually compile your code, it needs to be configured. Create a new file, `src/.babelrc.json`:

```json
{
	"presets": ["@babel/env"]
}
```

We're putting our `.babelrc.json` file in `src`, rather than the project root. This allows us to have a different `.babelrc.json` for things like tests, if we need that later – See the [Babel documentation](https://babeljs.io/docs/en/config-files#project-wide-configuration) for more information on both project wide and file relative configuration.

Now, before we run rollup, we need to install [`babel-core`](https://babeljs.io/docs/en/babel-core) and the [`env`](https://babeljs.io/docs/en/babel-preset-env) preset:

```shell
npm i -D @babel/core @babel/preset-env
```

Running Rollup now will create a bundle - except we're not actually using any ES2015 features. Let's change that by editing `src/main.js`:

```js
// src/main.js
import answer from 'the-answer';

export default () => {
	console.log(`the answer is ${answer}`);
};
```

Run Rollup with `npm run build`, and check the bundle:

```js
'use strict';

var index = 42;

var main = function () {
	console.log('the answer is ' + index);
};

module.exports = main;
```

## Gulp

Rollup returns Promises which are understood by gulp so integration is relatively painless.

The syntax is very similar to the configuration file, but the properties are split across two different operations corresponding to the [JavaScript API](../javascript-api/index.md):

```js twoslash
const gulp = require('gulp');
const rollup = require('rollup');
const rollupTypescript = require('@rollup/plugin-typescript');

gulp.task('build', () => {
	return rollup
		.rollup({
			input: './src/main.ts',
			plugins: [rollupTypescript()]
		})
		.then(bundle => {
			return bundle.write({
				file: './dist/library.js',
				format: 'umd',
				name: 'library',
				sourcemap: true
			});
		});
});
```

You may also use the `async/await` syntax:

```js twoslash
const gulp = require('gulp');
const rollup = require('rollup');
const rollupTypescript = require('@rollup/plugin-typescript');

gulp.task('build', async function () {
	const bundle = await rollup.rollup({
		input: './src/main.ts',
		plugins: [rollupTypescript()]
	});

	await bundle.write({
		file: './dist/library.js',
		format: 'umd',
		name: 'library',
		sourcemap: true
	});
});
```

## Deno

If you like to run Rollup in Deno you can use [esm.sh](https://esm.sh/) like so:

```js
import { rollup } from "https://esm.sh/@rollup/browser";

const bundle = await rollup({ //...
```

But it is not suitable for complex compiling. Alternatively you can install rollup from npm:

```js
import { rollup } from "npm:rollup";

const bundle = await rollup({ //...
```

Notice: Deno will request some permissions when running Rollup.
