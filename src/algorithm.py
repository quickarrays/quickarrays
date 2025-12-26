#!/usr/bin/env python3
"""Generates algorithm pipeline JavaScript and HTML from TypeScript function annotations."""
# pylint: disable=bad-indentation,line-too-long,invalid-name


from pathlib import Path
import sys
import re
from collections import deque

import common as C


def parse_args(arglist):
	args = []
	for a in arglist.split(","):
		a = a.strip()
		if not a:
			continue
		name = a.split(":")[0].strip()
		args.append(name)
	return args


def generate_counters(code : str):
	count_funcs = []
	factor_funcs = []
	transform_funcs = []
	annotations = {}  # fname → annotation fields

	
	for block, fname, argstr in C.BLOCK_FUNC_RE.findall(code):
		args = parse_args(argstr)
		ann = C.parse_annotation(block)
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

	# ---------------- C.COUNTERS_JS ----------------

	js = []
	js.append("function build_counters(ds) {")
	js.append("\treturn {")

	# ---- count_XXX → XXX : count_XXX(ds.argument)
	for fname, args in count_funcs:
		prop = C.short_prop(fname)
		arg = args[0] if args else ""
		js.append(f"\t\t{prop} : {fname}(ds.{arg}),")

	# ---- *_factorization → XXX_factorization : number_of_factors(ds.XXX_factorization)
	for fname, args in factor_funcs:
		prop = C.short_prop(fname)
		js.append(f"\t\t{prop} : number_of_factors(ds.{prop}),")

	# ---- *_transform → XXX_transform : number_of_runs(ds.XXX_transform)
	for fname, args in transform_funcs:
		prop = C.short_prop(fname)
		js.append(f"\t\t{prop} : number_of_runs(ds.{prop}),")

	js.append("\t}")
	js.append("}")

	Path(C.COUNTERS_JS).write_text("\n".join(js), encoding='utf-8')

	# ---------------- C.COUNTERS_HTML ----------------

	html_items = []

	def add_html(fname):
		if fname not in annotations:
			return
		ann = annotations[fname]
		prop = C.short_prop(fname)

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
		datapair = (block, name)

		html_items.append(datapair)

	# HTML for all entries
	for fname, _ in count_funcs:
		add_html(fname)
	for fname, _ in factor_funcs:
		add_html(fname)
	for fname, _ in transform_funcs:
		add_html(fname)

	html_items.sort(key=lambda x: (x[1] is None, x[1].lower()) )
	Path(C.COUNTERS_HTML).write_text("\n\n".join(map(lambda x: x[0], html_items)), encoding='utf-8')


def generate_algorithm(code):
	enable_functions = []
	disable_functions = []
	for block, fname, _ in C.BLOCK_FUNC_RE.findall(code):
		# Only consider compute_* or construct_* functions
		if not fname.startswith("construct_"):
			continue

		ann = C.parse_annotation(block)

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

		datapair = (html, ann["name"])
		if ann["kind"] == "enable":
			enable_functions.append(datapair)
		elif ann["kind"] == "disable":
			disable_functions.append(datapair)

	enable_functions.sort(key=lambda x: (x[1] is None, x[1].lower()) )
	disable_functions.sort(key=lambda x: (x[1] is None, x[1].lower()) )
	# Write HTML files
	Path(C.ALGORITHM_ENABLE_HTML).write_text("\n".join(map(lambda x: x[0], enable_functions)), encoding='utf-8')
	Path(C.ALGORITHM_DISABLE_HTML).write_text("\n".join(map(lambda x: x[0], disable_functions)), encoding='utf-8')

def provider_for(arg):
	if arg in ("text", "n"):
		return None
	return f"construct_{arg}"

def out_var_name(func):
	if func.startswith("construct_"):
		return func[len("construct_"):]
	if func.startswith("compute_"):
		return func[len("compute_"):]
	return func

def generate_algorithm_pipeline(code):
	FUNC_PATTERN = re.compile(r'function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)')
	# Parse target functions
	funcs = {}
	for m in FUNC_PATTERN.finditer(code):
		name = m.group(1)
		if not name.startswith("construct_"):
			continue
		funargs = parse_args(m.group(2))
		funcs[name] = funargs

	# Build dependency graph
	deps = {f: [] for f in funcs}
	for f, fargs in funcs.items():
		for a in fargs:
			p = provider_for(a)
			if p in funcs:
				deps[f].append(p)
			elif a not in ['n', 'text']:
				print(f"Note: argument {a} of function {f} has no provider function.", file=sys.stderr)

	# Topological sort
	in_degree = {f: 0 for f in funcs}
	for f in funcs:
		in_degree[f] = len(deps[f])

	q = deque([f for f in funcs if in_degree[f] == 0])
	order = []

	while q:
		f = q.popleft()
		# print(f'Processing {f} with deps {deps[f]}', file=sys.stderr)
		assert f not in order, f"Cyclic dependency detected at {f}"
		for dep in deps[f]:
			assert dep in order, f"Dependency {dep} of {f} not resolved"
		order.append(f)
		for g in funcs:
			if f in deps[g]:
				in_degree[g] -= 1
				if in_degree[g] == 0:
					q.append(g)

	with open(C.ALGORITHM_PIPELINE_JS, "w", encoding="utf-8") as out_f:
		# Emit runnable TypeScript
		print("// Auto-generated wiring", file=out_f)
		print("function build_ds(ds_text) {", file=out_f)
		print(" const ds_n = ds_text.length;", file=out_f)
		for f in order:
			fargs = map(lambda x: "ds_" + x, funcs[f])
			outv = out_var_name(f)
			print(f"const ds_{outv} = {f}({', '.join(fargs)});", file=out_f)
		print("return {", file=out_f)
		for f in order:
			outv = out_var_name(f)
			print(f"  {outv}: ds_{outv},", file=out_f)
		print("};", file=out_f)
		print("}", file=out_f)


def generate_transform(code : str):
	options = []
	for block, fname, _ in C.BLOCK_FUNC_RE.findall(code):
		if not fname.startswith("construct_"):
			continue
		# if not fname.endswith("_transform"):
		# 	continue
		ann = C.parse_annotation(block)
		if "name" not in ann or "type" not in ann or ann["type"] != "string":
			continue
		short = fname[len("construct_"):]  # remove prefix
		display = ann["name"]
		if "description" in ann:
			description = ann["description"]
			line = f'<option value="{short}" title="{description}">{display}</option>'
		else:
			line = f'<option value="{short}">{display}</option>'
		datapair = (line, ann["name"])
		options.append(datapair)
	options.sort(key=lambda x: (x[1] is None, x[1].lower()) )
	Path(C.TRANSFORM_HTML).write_text("\n".join(map(lambda x: x[0], options)), encoding='utf-8')



def main():
	code = Path(C.ALGORITHM_TS).read_text(encoding='utf-8')
	generate_counters(code)
	generate_algorithm(code)
	generate_algorithm_pipeline(code)
	generate_transform(code)


if __name__ == "__main__":
	main()
