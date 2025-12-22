#!/usr/bin/env python3
"""Inlines referenced files into HTML template."""
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import argparse
from pathlib import Path
import common as C

def replace(match):
    filename = match.group(1)
    # Ensure filename is relative and doesn't escape
    if '..' in filename or filename.startswith('/'):
        raise ValueError(f"Invalid filename: {filename}")
    
    path = (Path(C.BUILD_DIR) / filename).resolve()
    
    if not path.is_file():
        raise FileNotFoundError(f"Referenced file not found: {filename}")
    
    return path.read_text(encoding='utf-8')


def inline_files(html_path):
	html = Path(html_path).read_text(encoding='utf-8')
	pattern = re.compile(r"\{\{([^}]+)\}\}")
	return pattern.sub(replace, html)


def main():
	result = inline_files(C.SKELETON_HTML)
	Path(C.BUILD_HTML).write_text(result, encoding='utf-8')

if __name__ == "__main__":
	main()
