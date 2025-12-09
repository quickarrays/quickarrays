#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import argparse
from pathlib import Path

def inline_files(html_path):
	html = Path(html_path).read_text(encoding='utf-8')
	pattern = re.compile(r"\{\{([^}]+)\}\}")

	def replace(match):
		filename = match.group(1)
		path = Path(filename)
		if not path.is_file():
			raise FileNotFoundError(f"Referenced file not found: {filename}")
		return path.read_text(encoding='utf-8')

	return pattern.sub(replace, html)

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("-i", required=True, help="input HTML file")
	parser.add_argument("-o", required=True, help="output HTML file")
	args = parser.parse_args()

	result = inline_files(args.i)
	Path(args.o).write_text(result, encoding='utf-8')

if __name__ == "__main__":
	main()
