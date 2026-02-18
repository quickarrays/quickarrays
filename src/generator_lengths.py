#!/usr/bin/env python3
"""Precomputes order-to-length mappings for all string generators up to length 2^15."""
# pylint: disable=bad-indentation,line-too-long,invalid-name

import subprocess
import sys
from pathlib import Path
import common as C


def main():
	script = C.GENERATOR_LENGTHS_NODE_JS
	result = subprocess.run(
		['node', str(script)],
		capture_output=True, text=True,
		cwd=str(C.REPOSITORY_DIR)
	)
	if result.returncode != 0:
		print(result.stderr, file=sys.stderr)
		sys.exit(1)
	C.GENERATOR_LENGTHS_JS.write_text(result.stdout, encoding='utf-8')


if __name__ == '__main__':
	main()
