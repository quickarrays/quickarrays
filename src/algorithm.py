#!/usr/bin/env python3
"""Generates algorithm pipeline JavaScript and HTML from TypeScript function annotations."""
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import html as html_module
from pathlib import Path
from collections import defaultdict, deque

import typing
import common as C

FUNC_PATTERN = re.compile(r'function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)')

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


def generate_counters_html(code : str):
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

	html_items = []
	html_enable_items = []

	def add_html(fname, counter_type):
		if fname not in annotations:
			return
		ann = annotations[fname]
		prop = C.short_prop(fname)

		name = ann.get("name", prop)
		desc = ann.get("description")
		kind = ann.get("kind")
		if kind == 'hidden':
			return

		if counter_type == "rle":
			label = f"runs({name})"
		elif counter_type == "factor":
			label = f"size({name})"
		else:
			label = name

		structures = ann.get("structures", "")
		structures_attr = f' data-structures="{structures}"' if structures else ""

		if desc:
			block = f'<div class="qa-counter qa-item qa-counter-{counter_type}" data-ds="{prop}"{structures_attr}>{label}<span class="qa-tooltiptext">{desc}</span></div>'
		else:
			block = f'<div class="qa-counter qa-item qa-counter-{counter_type}" data-ds="{prop}"{structures_attr}>{label}</div>'
		datapair = (block, label)

		if kind == 'enable':
			html_enable_items.append(datapair)
		else:
			html_items.append(datapair)

	# HTML for all entries
	for fname, _ in count_funcs:
		add_html(fname, "other")
	for fname, _ in factor_funcs:
		add_html(fname, "factor")
	for fname, _ in transform_funcs:
		add_html(fname, "rle")

	sort_key = lambda x: (x[1] is None, html_module.unescape(x[1]).lower())
	html_items.sort(key=sort_key)
	html_enable_items.sort(key=sort_key)
	Path(C.COUNTERS_HTML).write_text("\n\n".join(map(lambda x: x[0], html_items)), encoding='utf-8')
	Path(C.COUNTERS_ENABLE_HTML).write_text("\n".join(map(lambda x: x[0], html_enable_items)), encoding='utf-8')


def generate_counters_js(code : str) -> typing.List[str]:
	count_funcs = []
	factor_funcs = []
	transform_funcs = []
	annotations = {}  # fname → annotation fields

	for block, fname, argstr in C.BLOCK_FUNC_RE.findall(code):
		args = parse_args(argstr)
		ann = C.parse_annotation(block)
		if ann:
			annotations[fname] = ann

		if fname.endswith("_factorization") and fname.startswith("construct_"):
			factor_funcs.append((fname, args))
			continue

		if fname.endswith("_transform") and fname.startswith("construct_"):
			transform_funcs.append((fname, args))
			continue

	# ---------------- COUNTERS JAVASCRIPT ----------------

	js = ["\t\tcounter_text : number_of_runs(var_text)"]

	# ---- count_XXX → XXX : count_XXX(var_argument)
	for fname, args in count_funcs:
		prop = C.short_prop(fname)
		arg = args[0] if args else ""
		js.append(f"\t\t{prop} : {fname}(var_{arg})")

	# ---- *_factorization → XXX_factorization : number_of_factors(var_XXX_factorization)
	for fname, args in factor_funcs:
		prop = C.short_prop(fname)
		js.append(f"\t\tcounter_{prop} : number_of_factors(var_{prop})")

	# ---- *_transform → XXX_transform : number_of_runs(var_XXX_transform)
	for fname, args in transform_funcs:
		prop = C.short_prop(fname)
		js.append(f"\t\tcounter_{prop} : number_of_runs(var_{prop})")

	return js



def is_target(name):
	return name.startswith("construct_") or name.startswith("count_")

def parse_args(arglist):
	return [
		a.split(":")[0].strip()
		for a in arglist.split(",")
		if a.strip()
	]

def provider_for(arg):
	if arg in ("text", "n"):
		return None
	return "construct_" + arg

def structure_name(f):
	if f.startswith("construct_"):
		return f[len("construct_"):]
	if f.startswith("count_"):
		return 'counter_' + f[len("count_"):]
	return f

def out_var(f):
	return 'var_' + structure_name(f)

def generate_algorithm_pipeline(code):
	funcs = {}
	for m in FUNC_PATTERN.finditer(code):
		name = m.group(1)
		if is_target(name):
			funcs[name] = parse_args(m.group(2))

	# dependency graph
	deps = defaultdict(list)
	rev = defaultdict(list)

	for f, args in funcs.items():
		for a in args:
			p = provider_for(a)
			if p in funcs:
				deps[f].append(p)
				rev[p].append(f)

	# topological sort
	in_deg = {f: len(deps[f]) for f in funcs}
	q = deque([f for f in funcs if in_deg[f] == 0])
	topo = []

	while q:
		f = q.popleft()
		topo.append(f)
		for g in rev[f]:
			in_deg[g] -= 1
			if in_deg[g] == 0:
				q.append(g)

	with open(C.ALGORITHM_PIPELINE_JS, "w", encoding="utf-8") as out_f:
		# Flags
		print("// === Structure flags ===", file=out_f)
		print("var structure_flags = {", file=out_f)
		for i, f in enumerate(topo):
			name = structure_name(f)
			comma = "," if i + 1 < len(topo) else ""
			print(f"\t{name}: 1 << {i}{comma}", file=out_f)
		print("};", file=out_f)

		# Builder
		print("\n// === Builder ===", file=out_f)
		print("function build_ds(text, flags = -1) {", file=out_f)

		print("\tconst n = text.length;", file=out_f)

		# need map (ES5 replacement for Set)
		print("\tvar need = {};", file=out_f)

		for f in topo:
			print(f"\tif (flags & structure_flags.{structure_name(f)}) need['{structure_name(f)}'] = true;", file=out_f)

		# dependency closure
		print("\tvar changed = true;", file=out_f)
		print("\twhile (changed) {", file=out_f)
		print("\t\tchanged = false;", file=out_f)
		for f in topo:
			for d in deps[f]:
				print(
					f"\t\tif (need['{structure_name(f)}'] && !need['{structure_name(d)}']) {{ need['{structure_name(d)}'] = true; changed = true; }}", file=out_f
				)
		print("\t}", file=out_f)

		# storage
		print("\n\t// storage", file=out_f)
		print("\tconst var_text = text;", file=out_f)
		print("\tconst var_n = text.length;", file=out_f)
		for f in topo:
			print(f"\tvar {out_var(f)};", file=out_f)

		# construction
		print("\n\t// construction", file=out_f)
		for f in topo:
			args = ", ".join(map(out_var, funcs[f]))
			print(f"\tif (need['{structure_name(f)}']) {{", file=out_f)
			print(f"\t\t{out_var(f)} = {f}({args});", file=out_f)
			print("\t}", file=out_f)

		# return object
		print("\n\treturn {", file=out_f)
		print("\t\t", end="", file=out_f)
		rows = []
		for i, f in enumerate(topo):
			rows.append(f"{structure_name(f)}: {out_var(f)}")
		rows.extend(generate_counters_js(code))
		print(",\n\t\t".join(rows), file=out_f)
		print("\t};", file=out_f)
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
	generate_counters_html(code)
	generate_algorithm(code)
	generate_algorithm_pipeline(code)
	generate_transform(code)


if __name__ == "__main__":
	main()
