#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import argparse
from pathlib import Path

# Match annotation block + following function
BLOCK_FUNC_RE = re.compile(
	r"/\*\*([\s\S]*?)\*/\s*function\s+([A-Za-z0-9_]+)\s*\(",
	re.MULTILINE
)

def parse_annotation(block):
	ann = {}
	for line in block.split("\n"):
		line = line.strip("* ").strip()
		if line.startswith("@name "):
			ann["name"] = line[len("@name "):].strip()
		if line.startswith("@description "):
			ann["description"] = line[len("@description "):].strip()
	return ann

def main():
	parser = argparse.ArgumentParser(description="Generate transform options.")
	parser.add_argument("-i", required=True, help="Input TypeScript file")
	parser.add_argument("-o", required=True, help="Output HTML file")
	args = parser.parse_args()

	code = Path(args.i).read_text(encoding="utf-8")

	options = []

	for block, fname in BLOCK_FUNC_RE.findall(code):
		if not fname.startswith("construct_"):
			continue
		if not fname.endswith("_transform"):
			continue

		ann = parse_annotation(block)
		if "name" not in ann:
			continue

		short = fname[len("construct_"):]  # remove prefix
		display = ann["name"]
		if "description" in ann:
			description = ann["description"]
			line = f'<option value="{short}" title="{description}">{display}</option>'
		else:
			line = f'<option value="{short}">{display}</option>'

		options.append(line)

	Path(args.o).parent.mkdir(exist_ok=True, parents=True)
	Path(args.o).write_text("\n".join(options))

if __name__ == "__main__":
	main()

