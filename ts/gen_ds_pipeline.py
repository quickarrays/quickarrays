#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re
import sys
from pathlib import Path
from collections import defaultdict, deque

import argparse


FUNC_PATTERN = re.compile(r'function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)')

def is_target(name):
	return name.startswith("construct_") or name.endswith("_factorization")

def parse_args(arglist):
	args = []
	for a in arglist.split(","):
		a = a.strip()
		if not a:
			continue
		args.append(a.split(":")[0].strip())
	return args

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

def main():
	parser = argparse.ArgumentParser(description="Generate TypeScript wiring code.")
	parser.add_argument('-i', "--infile", help="Input TypeScript file", type=Path, required=True)
	parser.add_argument('-o', "--outfile", help="Output TypeScript file", type=Path, required=True)
	prgargs = parser.parse_args()
	assert prgargs.infile.is_file(), f"Input file {prgargs.infile} does not exist."

	code = prgargs.infile.read_text()

	# Parse target functions
	funcs = {}
	for m in FUNC_PATTERN.finditer(code):
		name = m.group(1)
		if not is_target(name):
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

	with open(prgargs.outfile, "w", encoding="utf-8") as out_f:
		# Emit runnable TypeScript
		print("// Auto-generated wiring", file=out_f)
		print("function construct_ds(ds_text) {", file=out_f)
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

if __name__ == "__main__":
	main()
