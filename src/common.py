#!/usr/bin/env python3
"""Common constants for TypeScript file processing"""
# pylint: disable=bad-indentation,line-too-long,invalid-name

import os
import re
from pathlib import Path





SOURCE_DIR = Path(__file__).parent
REPOSITORY_DIR = SOURCE_DIR.parent
TS_DIR = SOURCE_DIR
ALGORITHM_TS = TS_DIR / 'algorithm.ts'
GENERATOR_TS = TS_DIR / 'generator.ts'
UTILITY_TS = TS_DIR / 'utility.ts'

REFERENCES_BIBTEX_FILE = SOURCE_DIR / 'references.bib'
BIBIOLGRAPHY_STYLE_FILE = SOURCE_DIR / 'plain.csl'

BUILD_DIR = SOURCE_DIR.parent / 'build'

JS_DIR = BUILD_DIR / 'js'
GENERATED_JS = JS_DIR / 'generated.js'
CONCATENATED_JS = BUILD_DIR / 'concatenated.js'
WORKER_JS = BUILD_DIR / 'worker.js'

JS_GEN_DIR = JS_DIR / 'gen'
ALGORITHM_PIPELINE_JS = JS_GEN_DIR / 'algorithm_pipeline.js'
GENERATOR_PIPELINE_JS = JS_GEN_DIR / 'generator_pipeline.js'
GENERATOR_LENGTHS_JS = JS_GEN_DIR / 'generator_lengths.js'
TUTORIAL_JS = JS_GEN_DIR / 'tutorial.js'
CITATION_JS = JS_GEN_DIR / 'citation.js'

EXTERNAL_JS_DIR = JS_DIR / 'ext'

HTML_DIR = BUILD_DIR / 'html'
SKELETON_HTML = SOURCE_DIR / 'skeleton.html'
BUILD_HTML = BUILD_DIR / 'uncompressed.html'
COUNTERS_HTML = HTML_DIR / 'counters.html'
COUNTERS_ENABLE_HTML = HTML_DIR / 'counters_enable.html'
ALGORITHM_ENABLE_HTML = HTML_DIR / 'algorithm_enable.html'
ALGORITHM_DISABLE_HTML = HTML_DIR / 'algorithm_disable.html'
TRANSFORM_HTML = HTML_DIR / 'transform.html'
GENERATOR_HTML = HTML_DIR / 'generator.html'
STANDALONE_HTML = BUILD_DIR / 'index.html'


CONCATENATED_CSS = BUILD_DIR / "concatenated.css"
CONCATENATED_HTML = BUILD_DIR / 'concatenated.html'

DIST_DIR = SOURCE_DIR.parent / 'dist'
DIST_PACKED_HTML = DIST_DIR / 'index.html'


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
		elif line.startswith("@structures "):
			ann["structures"] = line[len("@structures "):].strip()
		elif line.startswith("@transform_name "):
			ann["transform_name"] = line[len("@transform_name "):].strip()
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

MAKEFILE = REPOSITORY_DIR / 'Makefile'
TS_CONFIG = REPOSITORY_DIR / 'tsconfig.json'

ALGORITHM_PY = SOURCE_DIR / 'algorithm.py'
GENERATOR_PY = SOURCE_DIR / 'generator.py'
GENERATOR_LENGTHS_PY = SOURCE_DIR / 'generator_lengths.py'
TUTORIAL_PY = SOURCE_DIR / 'tutorial.py'
CITATION_PY = SOURCE_DIR / 'citation.py'
SKELETON_PY = SOURCE_DIR / 'skeleton.py'

ALL_GEN_JS_FILES = [ALGORITHM_PIPELINE_JS, GENERATOR_PIPELINE_JS, GENERATOR_LENGTHS_JS, TUTORIAL_JS, CITATION_JS] + list(map(lambda name: JS_GEN_DIR / (Path(name).stem + '.js'), [ALGORITHM_TS, GENERATOR_TS, UTILITY_TS]))


COMPILE_JAVASCRIPT_PY =  SOURCE_DIR / 'compile_javascript.py'

EXTERNAL_PY = SOURCE_DIR / 'external.py'

ASSET_DIR = SOURCE_DIR.parent / 'assets'
EXTERNAL_ASSETS_DIR = ASSET_DIR / 'external'

STANDALONE_PY = SOURCE_DIR / 'standalone.py'


def generate_makefile() -> str:
	ext_vendored = sorted(EXTERNAL_ASSETS_DIR.glob('*.js'))
	asset_css_files = list(Path.glob(ASSET_DIR, '*.css'))
	asset_js_files  = list(Path.glob(ASSET_DIR, '*.js'))
	buffer = []
	buffer.append(f"EXTERNAL_JS_FILES := {' '.join(str(EXTERNAL_JS_DIR / f.name) for f in ext_vendored)}")
	buffer.append(f"TS_CONFIG := {TS_CONFIG}")
	buffer.append(f"TS_FILES := {' '.join(str(f) for f in ALL_TS_FILES)}")
	buffer.append(f"JS_GEN_FILES := {' '.join(str(f) for f in ALL_GEN_JS_FILES)}")
	buffer.append(f"GENERATED_JS := {GENERATED_JS}")
	buffer.append(f"BUILD_HTML := {BUILD_HTML}")
	buffer.append(f'ASSETS_DIR := {ASSET_DIR}')
	buffer.append(f'BUILD_DIR := {BUILD_DIR}')
	buffer.append(f'STANDALONE_HTML := {STANDALONE_HTML}')
	buffer.append(f'DIST_PACKED_HTML := {DIST_PACKED_HTML}')
	buffer.append('ASSET_CSS := {}'.format(' '.join(str(f) for f in asset_css_files)))
	buffer.append('ASSET_JS := {}'.format(' '.join(str(f) for f in asset_js_files)))
	buffer.append('BUILD_DIR_ASSET_CSS := $(subst $(ASSETS_DIR),$(BUILD_DIR)/css,$(ASSET_CSS))')
	buffer.append('BUILD_DIR_ASSET_JS := $(subst $(ASSETS_DIR),$(BUILD_DIR)/js,$(ASSET_JS))')

	buffer.append('.PHONY: all check test clean')
	buffer.append('all: $(BUILD_HTML) $(STANDALONE_HTML) $(DIST_PACKED_HTML)')

	for asset_file in asset_css_files:
		dest_file = BUILD_DIR / 'css' / asset_file.name
		rel = os.path.relpath(str(asset_file), str(dest_file.parent))
		buffer.append(f'{dest_file}: {asset_file}')
		buffer.append(f'\t@mkdir -p {dest_file.parent}')
		buffer.append(f'\tln -s {rel} {dest_file}')
	for asset_file in asset_js_files:
		dest_file = BUILD_DIR / 'js' / asset_file.name
		rel = os.path.relpath(str(asset_file), str(dest_file.parent))
		buffer.append(f'{dest_file}: {asset_file}')
		buffer.append(f'\t@mkdir -p {dest_file.parent}')
		buffer.append(f'\tln -s {rel} {dest_file}')


	for ts_file in ALL_TS_FILES:
		js_file = JS_GEN_DIR / (ts_file.stem + '.js')
		buffer.append(f"{js_file}: {ts_file} $(TS_CONFIG)")
		buffer.append(f"\t@mkdir -p {JS_GEN_DIR}")
		buffer.append(f"\tnpx babel {ts_file} --out-file {js_file} --presets=@babel/preset-typescript")
		# buffer.append(f"\ttsc --outDir {JS_DIR} {ts_file}")
	buffer.append(f'{ALGORITHM_PIPELINE_JS}: {ALGORITHM_TS} {ALGORITHM_PY}')
	buffer.append(f'\t@mkdir -p {ALGORITHM_PIPELINE_JS.parent}')
	buffer.append(f'\tpython3 {ALGORITHM_PY}')

	ext_deps = ' '.join(str(f) for f in ext_vendored) + f' {EXTERNAL_PY}'
	buffer.append(f'$(EXTERNAL_JS_FILES): {ext_deps}')
	buffer.append(f'\t@mkdir -p {EXTERNAL_JS_DIR}')
	buffer.append(f'\tpython3 {EXTERNAL_PY}')

	buffer.append(f'{GENERATOR_PIPELINE_JS}: {GENERATOR_TS} {GENERATOR_PY}')
	buffer.append(f'\t@mkdir -p {GENERATOR_PIPELINE_JS.parent}')
	buffer.append(f'\tpython3 {GENERATOR_PY}')

	generator_js = JS_GEN_DIR / 'generator.js'
	buffer.append(f'{GENERATOR_LENGTHS_JS}: {generator_js} {GENERATOR_PIPELINE_JS} {GENERATOR_LENGTHS_PY}')
	buffer.append(f'\t@mkdir -p {GENERATOR_LENGTHS_JS.parent}')
	buffer.append(f'\tpython3 {GENERATOR_LENGTHS_PY}')

	buffer.append(f'{TUTORIAL_JS}: {GENERATOR_TS} {ALGORITHM_TS}  {TUTORIAL_PY}')
	buffer.append(f'\t@mkdir -p {TUTORIAL_JS.parent}')
	buffer.append(f'\tpython3 {TUTORIAL_PY} {GENERATOR_TS} {ALGORITHM_TS}')

	buffer.append(f'{CITATION_JS}: {GENERATOR_TS} {ALGORITHM_TS} {CITATION_PY}')
	buffer.append(f'\t@mkdir -p {CITATION_JS.parent}')
	buffer.append(f'\tpython3 {CITATION_PY} {GENERATOR_TS} {ALGORITHM_TS}')

	buffer.append(f'$(BUILD_HTML): {SKELETON_PY} $(EXTERNAL_JS_FILES) {SKELETON_HTML} $(GENERATED_JS) $(BUILD_DIR_ASSET_JS) $(BUILD_DIR_ASSET_CSS)')
	buffer.append(f'\t@mkdir -p {BUILD_HTML.parent}')
	buffer.append(f'\tpython3 {SKELETON_PY}')

	buffer.append(f'$(DIST_PACKED_HTML): $(STANDALONE_HTML)')
	buffer.append(f'\t@npx parcel build $< --public-url ./')

	buffer.append('$(GENERATED_JS): $(JS_GEN_FILES) ')
	buffer.append(f'\tpython3 {COMPILE_JAVASCRIPT_PY}')
	
	buffer.append(f'$(STANDALONE_HTML): $(BUILD_HTML) {STANDALONE_PY}')
	buffer.append(f'\t@mkdir -p {STANDALONE_HTML.parent}')
	buffer.append(f'\tpython3 {STANDALONE_PY}')

	buffer.append('check:')
	buffer.append('\tnpx tsc -p .')
	buffer.append('test:')
	buffer.append('\tnpx jest')
	buffer.append('clean:')
	buffer.append('\trm -rf $(BUILD_DIR) $(DIST_DIR)')

	return buffer

def main():
	makefile_content = '\n'.join(generate_makefile()).replace(str(REPOSITORY_DIR), '.')
	with open(MAKEFILE, 'w', encoding='utf-8') as f:
		f.write(makefile_content + '\n')


	

if __name__ == "__main__":
	main()


