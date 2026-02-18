'use strict';
/**
 * Build-time script: computes the array of string lengths for each generator,
 * indexed by order, up to length 2^15 = 32768.
 * Outputs a JS assignment `const generator_lengths = {...};` to stdout.
 *
 * Run via: node src/generator_lengths_node.js (from repo root)
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const repoDir = path.join(__dirname, '..');

function loadStripped(file) {
	const code = fs.readFileSync(file, 'utf8');
	// Strip CommonJS/ESM boilerplate added by Babel.
	// Replace `const`/`let` with `var` at top level so declarations are added
	// to the vm context (block-scoped declarations are not).
	return code
		.replace(/^"use strict";\s*/gm, '')
		.replace(/^Object\.defineProperty\(exports.*$/gm, '')
		.replace(/^exports\.\w+\s*=.*$/gm, '')
		.replace(/\bexport\s+function\b/g, 'function')
		.replace(/\bexport\s+default\s+/g, '')
		.replace(/^\s*(const|let)\s+/gm, 'var ');
}

const context = {};
vm.createContext(context);
vm.runInContext(loadStripped(path.join(repoDir, 'build/js/gen/generator.js')), context);
vm.runInContext(loadStripped(path.join(repoDir, 'build/js/gen/generator_pipeline.js')), context);

const MAX_LEN = 32768; // 2^15
const result = {};

for (const [name, gen] of Object.entries(context.string_generators)) {
	const lengths = [];
	for (let k = 0; k <= 200; k++) {
		const text = gen(k);
		if (text.length > MAX_LEN) break;
		lengths.push(text.length);
	}
	result[name] = lengths;
}

process.stdout.write('const generator_lengths = ' + JSON.stringify(result) + ';\n');
