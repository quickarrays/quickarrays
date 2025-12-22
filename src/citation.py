#!/usr/bin/env python3
"""Generates citation JavaScript from TypeScript annotations using pandoc and CSL formatting."""
# pylint: disable=bad-indentation,line-too-long,invalid-name

import subprocess
import sys
from html.parser import HTMLParser
import re
import argparse
from pathlib import Path
import common as C

def js_escape(s):
	return s.replace("\\", "\\\\").replace("'", "\\'").replace('\n', ' ')


class CSLHTMLExtractor(HTMLParser):
	def __init__(self):
		super().__init__()
		self.capture = False
		self.depth = 0
		self.chunks = []

	def handle_starttag(self, tag, attrs):
		if tag == "div" and ("class", "csl-right-inline") in attrs:
			self.capture = True
			self.depth = 1
			return

		if self.capture:
			self.depth += 1
			attr_str = "".join(f' {k}="{v}"' for k, v in attrs)
			self.chunks.append(f"<{tag}{attr_str}>")

	def handle_endtag(self, tag):
		if self.capture:
			self.depth -= 1
			if self.depth == 0:
				self.capture = False
			else:
				self.chunks.append(f"</{tag}>")

	def handle_data(self, data):
		if self.capture:
			self.chunks.append(data)

	def handle_entityref(self, name):
		if self.capture:
			self.chunks.append(f"&{name};")

	def handle_charref(self, name):
		if self.capture:
			self.chunks.append(f"&#{name};")

	def get_html(self):
		return "".join(self.chunks).strip()


def get_reference_html(bib_id, bibfile, csl):
	cmd = [
		"pandoc",
		"--citeproc",
		f"--bibliography={bibfile}",
		f"--csl={csl}",
		"-M", f"nocite=@{bib_id}",
		"-t", "html"
	]

	proc = subprocess.run(
		cmd,
		input=bib_id,
		text=True,
		encoding="utf-8",
		capture_output=True,
		check=True
	)

	parser = CSLHTMLExtractor()
	parser.feed(proc.stdout)
	return parser.get_html()

def main():
	parser = argparse.ArgumentParser(description="Generate tutorials JS entries")
	parser.add_argument("files", nargs="+", help="TypeScript files")
	args = parser.parse_args()

	lines = ['const citations = {};']
	for ts_file in args.files:
		code = Path(ts_file).read_text(encoding="utf-8")

		for block, _, _ in C.BLOCK_FUNC_RE.findall(code):
			ann = C.parse_annotation(block)
			if "cite" not in ann:
				continue
			bibID = ann['cite']
			html_output = get_reference_html("@" + bibID, C.REFERENCES_BIBTEX_FILE, C.BIBIOLGRAPHY_STYLE_FILE)
			if not html_output:
				print(f"Warning: No output for citation {bibID}", file=sys.stderr)
				continue
			lines.append(f"citations['{bibID}'] = '{js_escape(html_output)}';")

	Path(C.CITATION_JS).write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
	main()

