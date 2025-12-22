#!/usr/bin/env python3
"""Generates string generator JavaScript and HTML from TypeScript function annotations."""
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
from pathlib import Path
import common as C


def main():
	code = Path(C.GENERATOR_TS).read_text(encoding="utf-8")

	generators = []  # (short_name, func_name, ann)

	for block, fname, _ in C.BLOCK_FUNC_RE.findall(code):
		ann = C.parse_annotation(block)
		if "name" not in ann:
			continue

		short = C.short_prop(fname)

		generators.append((short, fname, ann))

	# ---------------- JS output ----------------

	js_lines = []
	js_lines.append("const string_generators = {")
	for short, fname, ann in generators:
		js_lines.append(f"\t'{short}': {fname},")
	js_lines.append("};")

	Path(C.GENERATOR_PIPELINE_JS).write_text("\n".join(js_lines), encoding="utf-8")

	# ---------------- HTML output ----------------

	html_rows = []
	for short, fname, ann in generators:
		name = ann["name"]
		desc = ann.get("description", "")
		title_attr = f' title="{desc}"' if desc else ""
		html_rows.append(
			f'<option value="{short}"{title_attr}>{name}</option>'
		)

	Path(C.GENERATOR_HTML).write_text("\n".join(html_rows), encoding="utf-8")

if __name__ == "__main__":
	main()
