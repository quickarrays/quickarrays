#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import argparse
import re
import sys
from pathlib import Path

FUNC_RE = re.compile(
	r"function\s+([A-Za-z0-9_]+)\s*\(",
	re.MULTILINE
)

REMOVE_LINE_RE = re.compile(
	r'^\s*("use strict";|Object\.defineProperty\(exports|exports\.[A-Za-z0-9_]+\s*=).*',
	re.MULTILINE
)

FUNC_START_RE = re.compile(
	r"(export\s+)?function\s+([A-Za-z0-9_]+)\s*\(",
	re.MULTILINE
)

def strip_functions(code, names_to_strip):
	out = []
	pos = 0

	while True:
		m = FUNC_START_RE.search(code, pos)
		if not m:
			out.append(code[pos:])
			break

		fname = m.group(2)

		# keep function if not to be stripped
		if fname not in names_to_strip:
			out.append(code[pos:m.end()])
			pos = m.end()
			continue

		# drop everything from function start to matching closing brace
		out.append(code[pos:m.start()])

		i = m.end()
		# find first '{'
		while i < len(code) and code[i] != "{":
			i += 1

		if i == len(code):
			pos = i
			continue

		depth = 1
		i += 1

		while i < len(code) and depth > 0:
			if code[i] == "{":
				depth += 1
			elif code[i] == "}":
				depth -= 1
			i += 1

		pos = i

	return "".join(out)



def main():
	parser = argparse.ArgumentParser(description="Concatenate JS files and strip tests")
	parser.add_argument("--indir", "-i", required=True, help="Input directory with JS files")
	parser.add_argument("--outfile", "-o", required=True, help="Output JS file")
	args = parser.parse_args()

	input_dir = Path(args.indir)
	output_file = Path(args.outfile)

	all_code = []
	all_functions = set()
	test_functions = set()

	# ---- Read and collect ----
	for js_file in sorted(input_dir.rglob("*.js")):
		code = js_file.read_text()

		# Strip non-browser-compatible lines
		code = REMOVE_LINE_RE.sub("", code)

		# Collect function names
		for fname in FUNC_RE.findall(code):
			all_functions.add(fname)
			if fname.startswith("test_"):
				test_functions.add(fname)

		all_code.append(code)

	full_code = "\n".join(all_code)

	# ---- Check test coverage ----
	for fname in sorted(all_functions):
		if fname.startswith("construct_") or fname.startswith("generate_") or fname.startswith("count_"):
			suffix = fname.split("_", 1)[1]
			test_name = f"test_{suffix}"
			if test_name not in test_functions:
				print(
					f"WARNING: missing test for {fname} (expected {test_name})",
					file=sys.stderr
				)

	names_to_strip = set(test_functions)
	names_to_strip.add("assert_eq")
	full_code = strip_functions(full_code, names_to_strip)

	# ---- Final cleanup ----
	full_code = "\n".join(
		line for line in full_code.splitlines()
		if line.strip()
	)

	output_file.parent.mkdir(parents=True, exist_ok=True)
	output_file.write_text(full_code, encoding="utf-8")

if __name__ == "__main__":
	main()

