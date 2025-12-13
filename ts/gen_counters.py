#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import sys
from pathlib import Path
import argparse

# Matches annotation block + function definition
BLOCK_FUNC_RE = re.compile(
	r"/\*\*([\s\S]*?)\*/\s*function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)",
	re.MULTILINE
)

def parse_args(arglist):
	args = []
	for a in arglist.split(","):
		a = a.strip()
		if not a:
			continue
		name = a.split(":")[0].strip()
		args.append(name)
	return args

def parse_annotation(block):
	ann = {}
	for line in block.split("\n"):
		line = line.strip("* ").strip()
		if line.startswith("@name "):
			ann["name"] = line[len("@name "):].strip()
		elif line.startswith("@description "):
			ann["description"] = line[len("@description "):].strip()
		elif line.startswith("@kind"):
			ann["kind"] = line[len("@kind"):].strip()
	return ann

def short_prop(fname):
	# count_xxx → xxx
	if fname.startswith("count_"):
		return fname[len("count_"):]
	# construct_xxx_transform → xxx_transform
	if fname.startswith("construct_"):
		return fname[len("construct_"):]
	return fname

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("--infile", "-i", required=True, help="input HTML file")
	args = parser.parse_args()

	assert Path(args.infile).is_file(), f"Input file not found: {args.infile}"
	code = Path(args.infile).read_text(encoding='utf-8')

	count_funcs = []
	factor_funcs = []
	transform_funcs = []
	annotations = {}  # fname → annotation fields

	for block, fname, argstr in BLOCK_FUNC_RE.findall(code):
		args = parse_args(argstr)
		ann = parse_annotation(block)
		if ann:
			annotations[fname] = ann

		if fname.startswith("count_"):
			count_funcs.append((fname, args))
			continue

		if fname.endswith("_factorization") and fname.startswith("construct_"):
			factor_funcs.append((fname, args))
			continue

		if fname.endswith("_transform") and fname.startswith("construct_"):
			transform_funcs.append((fname, args))
			continue

	# ---------------- JS OUTPUT ----------------

	js = []
	js.append("function construct_counters(ds) {")
	js.append("\treturn {")

	# ---- count_XXX → XXX : count_XXX(ds.argument)
	for fname, args in count_funcs:
		prop = short_prop(fname)
		arg = args[0] if args else ""
		js.append(f"\t\t{prop} : {fname}(ds.{arg}),")

	# ---- *_factorization → XXX_factorization : number_of_factors(ds.XXX_factorization)
	for fname, args in factor_funcs:
		prop = short_prop(fname)
		js.append(f"\t\t{prop} : number_of_factors(ds.{prop}),")

	# ---- *_transform → XXX_transform : number_of_runs(ds.XXX_transform)
	for fname, args in transform_funcs:
		prop = short_prop(fname)
		js.append(f"\t\t{prop} : number_of_runs(ds.{prop}),")

	js.append("\t}")
	js.append("}")

	Path("js/counters.js").write_text("\n".join(js))

	# ---------------- HTML OUTPUT ----------------

	html_items = []

	def add_html(fname):
		if fname not in annotations:
			return
		ann = annotations[fname]
		prop = short_prop(fname)

		name = ann.get("name", prop)
		desc = ann.get("description")
		kind = ann.get("kind")
		if kind and kind == 'hidden':
			return

		if desc:
			block = (
				f'<div class="qa-counter qa-item" data-ds="{prop}">{name}\n'
				f'\t<div class="qa-tooltiptext">{desc}</div>\n'
				f'</div>'
			)
		else:
			block = f'<div class="qa-counter qa-item" data-ds="{prop}">{name}</div>'

		html_items.append(block)

	# HTML for all entries
	for fname, _ in count_funcs:
		add_html(fname)
	for fname, _ in factor_funcs:
		add_html(fname)
	for fname, _ in transform_funcs:
		add_html(fname)

	Path("gen").mkdir(exist_ok=True)
	Path("gen/counters.html").write_text("\n\n".join(html_items))

if __name__ == "__main__":
	main()
