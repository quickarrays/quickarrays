#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import argparse
from pathlib import Path

import common as C

def js_escape(s):
	return s.replace("\\", "\\\\").replace("'", "\\'")

def main():
	parser = argparse.ArgumentParser(description="Generate tutorials JS entries")
	parser.add_argument("files", nargs="+", help="TypeScript files")
	args = parser.parse_args()

	lines = ['const tutorials = {};']

	for ts_file in args.files:
		code = Path(ts_file).read_text(encoding="utf-8")

		for block, fname, _ in C.BLOCK_FUNC_RE.findall(code):
			ann = C.parse_annotation(block)

			# Required annotations
			if not all(k in ann for k in ("name", "description", "tutorial")):
				continue

			key = C.short_prop(fname)

			lines.append(f"tutorials['{key}'] = {{")
			lines.append(f"\t'title' : '{js_escape(ann['name'])}',")
			lines.append(f"\t'content' : '{js_escape(ann['tutorial'])}',")

			if "oeis" in ann:
				lines.append(f"\t'oeis' : '{js_escape(ann['oeis'])}',")
			if "cite" in ann:
				lines.append(f"\t'cite' : '{js_escape(ann['cite'])}',")
			if "wikipedia" in ann:
				lines.append(f"\t'wikipedia' : '{js_escape(ann['wikipedia'])}',")

			# remove trailing comma safely
			if lines[-1].endswith(","):
				lines[-1] = lines[-1][:-1]

			lines.append("};\n")

	Path(C.TUTORIAL_JS).write_text("\n".join(lines), encoding="utf-8")

if __name__ == "__main__":
	main()
