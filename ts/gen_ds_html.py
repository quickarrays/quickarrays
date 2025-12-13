#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import sys
from pathlib import Path
import argparse

# Regex: annotation block + following function
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
		elif line.startswith("@kind "):
			ann["kind"] = line[len("@kind "):].strip()
		elif line.startswith("@type "):
			ann["type"] = line[len("@type "):].strip()
		elif line.startswith("@description"):
			ann["description"] = line[len("@description "):].strip()
	return ann

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("--infile", "-i", required=True, help="input HTML file")
	args = parser.parse_args()

	assert Path(args.infile).is_file(), f"Input file not found: {args.infile}"
	ts = Path(args.infile).read_text(encoding='utf-8')

	enable_out = []
	disable_out = []

	for block, fname in BLOCK_FUNC_RE.findall(ts):
		# Only consider compute_* or construct_* functions
		if not (fname.startswith("compute_") or fname.startswith("construct_")):
			continue

		ann = parse_annotation(block)

		# Must have all three
		if not all(k in ann for k in ("name", "kind", "type")):
			continue

		if ann["kind"] == "hidden":
			continue

		# Remove prefixes to make DS-ID
		if fname.startswith("construct_"):
			dsname = fname[len("construct_"):]
		elif fname.startswith("compute_"):
			dsname = fname[len("compute_"):]
		else:
			dsname = fname

		html = (
			f'<div class="qa-item qa-structure qa-structure-{ann["type"]}" '
			f'data-ds="{dsname}">{ann["name"]}'
		)
		if 'description' in ann:
			html += '<span class="qa-tooltiptext">' + ann["description"] + '</span>'
		html += '</div>'

		if ann["kind"] == "enable":
			enable_out.append(html)
		elif ann["kind"] == "disable":
			disable_out.append(html)

	# Write HTML files
	Path("gen/ds_enable.html").write_text("\n".join(enable_out))
	Path("gen/ds_disable.html").write_text("\n".join(disable_out))

if __name__ == "__main__":
	main()

