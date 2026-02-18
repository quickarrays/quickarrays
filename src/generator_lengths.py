#!/usr/bin/env python3
"""Precomputes order-to-length mappings for all string generators up to length 2^15."""
# pylint: disable=bad-indentation,line-too-long,invalid-name

import subprocess
import sys
import common as C


_JS = r"""
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const repoDir = process.cwd();

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
"""


def main():
	result = subprocess.run(
		['node', '--input-type=commonjs'],
		input=_JS,
		capture_output=True, text=True,
		cwd=str(C.REPOSITORY_DIR)
	)
	if result.returncode != 0:
		print(result.stderr, file=sys.stderr)
		sys.exit(1)
	C.GENERATOR_LENGTHS_JS.write_text(result.stdout, encoding='utf-8')


if __name__ == '__main__':
	main()
