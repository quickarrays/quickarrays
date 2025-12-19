#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import argparse
from pathlib import Path

def replace(match):
    filename = match.group(1)
    # Ensure filename is relative and doesn't escape
    if '..' in filename or filename.startswith('/'):
        raise ValueError(f"Invalid filename: {filename}")
    
    path = Path(filename).resolve()
    base_dir = Path(__file__).parent.resolve()
    
    # Ensure path is within base directory
    if not path.is_relative_to(base_dir):
        raise ValueError(f"Path {path} is outside base directory")
    
    if not path.is_file():
        raise FileNotFoundError(f"Referenced file not found: {filename}")
    
    return path.read_text(encoding='utf-8')


 

def inline_files(html_path):
	html = Path(html_path).read_text(encoding='utf-8')
	pattern = re.compile(r"\{\{([^}]+)\}\}")
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
