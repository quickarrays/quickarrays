#!/usr/bin/env python3
"""  Common constants for TypeScript file processing """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
ALGORITHM_TS = SCRIPT_DIR / 'algorithm.ts'
GENERATOR_TS = SCRIPT_DIR / 'generator.ts'
UTILITY_TS = SCRIPT_DIR / 'utility.ts'

JS_DIR = SCRIPT_DIR / 'js'
COUNTERS_JS = JS_DIR / 'counters.js'
ALGORITHM_PIPELINE_JS = JS_DIR / 'algorithm_pipeline.js'
GENERATOR_PIPELINE_JS = JS_DIR / 'generator_pipeline.js'
TUTORIAL_JS = JS_DIR / 'tutorial.js'
CITATION_JS = JS_DIR / 'citation.js'

HTML_DIR = SCRIPT_DIR / 'html'
COUNTERS_HTML = HTML_DIR / 'counters.html'
ALGORITHM_ENABLE_HTML = HTML_DIR / 'algorithm_enable.html'
ALGORITHM_DISABLE_HTML = HTML_DIR / 'algorithm_disable.html'
TRANSFORM_HTML = HTML_DIR / 'transform.html'
GENERATOR_HTML = HTML_DIR / 'generator.html'

ALL_TS_FILES = [ALGORITHM_TS, GENERATOR_TS, UTILITY_TS]

assert(ALGORITHM_TS.is_file()), f"File not found: {ALGORITHM_TS}"
assert(GENERATOR_TS.is_file()), f"File not found: {GENERATOR_TS}"
assert(UTILITY_TS.is_file()), f"File not found: {UTILITY_TS}"

HTML_DIR.mkdir(parents=True, exist_ok=True)
JS_DIR.mkdir(parents=True, exist_ok=True)
assert(HTML_DIR.is_dir()), f"HTML directory not found: {HTML_DIR}"
assert(JS_DIR.is_dir()), f"JS directory not found: {JS_DIR}"



# Matches annotation block + function definition
BLOCK_FUNC_RE = re.compile(
	r"/\*\*([\s\S]*?)\*/\s*function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)",
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
		elif line.startswith("@oeis "):
			ann["oeis"] = line[len("@oeis "):].strip()
		elif line.startswith("@tutorial "):
			ann["tutorial"] = line[len("@tutorial "):].strip()
		elif line.startswith("@cite "):
			ann["cite"] = line[len("@cite "):].strip()
		elif line.startswith("@wikipedia "):
			ann["wikipedia"] = line[len("@wikipedia "):].strip()
	return ann

def short_prop(fname):
	# count_xxx → xxx
	if fname.startswith("generate_"):
		return fname[len("generate_"):]
	if fname.startswith("count_"):
		return fname[len("count_"):]
	# construct_xxx_transform → xxx_transform
	if fname.startswith("construct_"):
		return fname[len("construct_"):]
	return fname

