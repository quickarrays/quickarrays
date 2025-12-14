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
		if fname.startswith("construct_") or fname.startswith("generate_"):
			suffix = fname.split("_", 1)[1]
			test_name = f"test_{suffix}"
			if test_name not in test_functions:
				print(
					f"WARNING: missing test for {fname} (expected {test_name})",
					file=sys.stderr
				)

	# ---- Remove test functions and assert_eq ----
	def strip_function(code, fname):
		pattern = re.compile(
			rf"function\s+{fname}\s*\([^)]*\)\s*\{{[\s\S]*?\n\}}",
			re.MULTILINE
		)
		return pattern.sub("", code)

	for t in test_functions:
		full_code = strip_function(full_code, t)

	full_code = strip_function(full_code, "assert_eq")

	# ---- Final cleanup ----
	full_code = "\n".join(
		line for line in full_code.splitlines()
		if line.strip()
	)

	output_file.parent.mkdir(parents=True, exist_ok=True)
	output_file.write_text(full_code, encoding="utf-8")

if __name__ == "__main__":
	main()

