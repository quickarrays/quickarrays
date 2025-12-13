#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import argparse
from pathlib import Path

# Annotation block + function
BLOCK_FUNC_RE = re.compile(
	r"/\*\*([\s\S]*?)\*/\s*function\s+(generate_[A-Za-z0-9_]+)\s*\(",
	re.MULTILINE
)

def parse_annotation(block):
	ann = {}
	for line in block.split("\n"):
		line = line.strip("* ").strip()
		if line.startswith("@name "):
			ann["name"] = line[len("@name "):].strip()
		elif line.startswith("@description "):
			ann["description"] = line[len("@description "):].strip()
	return ann

def main():
	parser = argparse.ArgumentParser(description="Extract generate_* functions")
	parser.add_argument("-i", required=True, help="Input TypeScript file")
	parser.add_argument("-j", required=True, help="Output JavaScript file")
	parser.add_argument("-o", required=True, help="Output HTML file")
	args = parser.parse_args()

	code = Path(args.i).read_text()

	generators = []  # (short_name, func_name, ann)

	for block, fname in BLOCK_FUNC_RE.findall(code):
		ann = parse_annotation(block)
		if "name" not in ann:
			continue

		# function generate_fibonacci_word → short name = fibonacci (example logic)
		# You did not specify the shortening logic in detail.
		# We take annotation @name, convert to lowercase identifier.
		short = ann["name"].lower().replace(" ", "_")

		generators.append((short, fname, ann))

	# ---------------- JS output ----------------

	js_lines = []
	js_lines.append("const string_generators = {")
	for short, fname, ann in generators:
		js_lines.append(f"\t'{short}': {fname},")
	js_lines.append("};")

	Path(args.j).write_text("\n".join(js_lines))

	# ---------------- HTML output ----------------

	html_rows = []
	for short, fname, ann in generators:
		name = ann["name"]
		desc = ann.get("description", "")
		title_attr = f' title="{desc}"' if desc else ""
		html_rows.append(
			f'<option value="{short}"{title_attr}>{name}</option>'
		)

	Path(args.o).write_text("\n".join(html_rows))

if __name__ == "__main__":
	main()

