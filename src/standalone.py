#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

from pathlib import Path
import re
import sys
import common as C

WORKER_SCRIPT_RE = re.compile(
	r'<script\s+[^>]*type="text/js-worker"\s+src="([^"]+)"[^>]*class="concatenate"[^>]*></script>',
	re.IGNORECASE
)

SCRIPT_RE = re.compile(
	r'<script\s+[^>]*src="([^"]+)"[^>]*class="concatenate"[^>]*></script>',
	re.IGNORECASE
)

CSS_RE = re.compile(
	r'<link\s+[^>]*href="([^"]+)"[^>]*class="concatenate"[^>]*>',
	re.IGNORECASE
)

def warn(msg):
	print(f"Warning: {msg}", file=sys.stderr)

def main(html_output_filepath : Path, do_inplace: bool):
	if not C.BUILD_HTML.exists():
		print(f"Error: {C.BUILD_HTML} does not exist", file=sys.stderr)
		sys.exit(1)

	lines = C.BUILD_HTML.read_text(encoding="utf-8").splitlines(keepends=True)

	js_list = []
	worker_js_list = []
	css_list = []
	clean_lines = []

	for line in lines:
		worker_js_match = WORKER_SCRIPT_RE.search(line)
		if worker_js_match:
			worker_js_path = C.BUILD_DIR / Path(worker_js_match.group(1))
			if worker_js_path.exists():
				worker_js_list.append(worker_js_path)
			else:
				warn(f"Worker JS file not found: {worker_js_path}")
			continue

		js_match = SCRIPT_RE.search(line)
		if js_match:
			js_path = C.BUILD_DIR / Path(js_match.group(1))
			if js_path.exists():
				js_list.append(js_path)
			else:
				warn(f"JS file not found: {js_path}")
			continue

		css_match = CSS_RE.search(line)
		if css_match:
			css_path = C.BUILD_DIR / Path(css_match.group(1))
			if css_path.exists():
				css_list.append(css_path)
			else:
				warn(f"CSS file not found: {css_path}")
			continue

		clean_lines.append(line)

	# concatenate JS
	if worker_js_list:
		C.WORKER_JS.parent.mkdir(parents=True, exist_ok=True)
		combined_js = []
		for path in worker_js_list:
			try:
				combined_js.append(path.read_text(encoding="utf-8"))
			except Exception as e:
				warn(f"Failed to read JS {path}: {e}")
		C.WORKER_JS.write_text("\n".join(combined_js), encoding="utf-8")


	# concatenate JS
	if js_list:
		C.CONCATENATED_JS.parent.mkdir(parents=True, exist_ok=True)
		combined_js = []
		for path in js_list:
			try:
				combined_js.append(path.read_text(encoding="utf-8"))
			except Exception as e:
				warn(f"Failed to read JS {path}: {e}")
		C.CONCATENATED_JS.write_text("\n".join(combined_js), encoding="utf-8")

	# concatenate CSS
	if css_list:
		C.CONCATENATED_CSS.parent.mkdir(parents=True, exist_ok=True)
		combined_css = []
		for path in css_list:
			try:
				combined_css.append(path.read_text(encoding="utf-8"))
			except Exception as e:
				warn(f"Failed to read CSS {path}: {e}")
		C.CONCATENATED_CSS.write_text("\n".join(combined_css), encoding="utf-8")

	final_lines = []
	for line in clean_lines:
		lower = line.lower()

		if "</head>" in lower and css_list:
			if do_inplace:
				final_lines.append('<style rel="stylesheet" type="text/css">\n')
				final_lines.append(C.CONCATENATED_CSS.read_text(encoding="utf-8"))
				final_lines.append('</style>\n')
			else:
				final_lines.append(
					'<link rel="stylesheet" type="text/css" href="concatenated.css">\n'
				)
		if "</html>" in lower:
			if worker_js_list:
				final_lines.append('<script type="text/js-worker">\n')
				final_lines.append(C.WORKER_JS.read_text(encoding="utf-8"))
				final_lines.append('</script>\n')
			if js_list:
				if do_inplace:
					final_lines.append('<script>\n')
					final_lines.append(C.CONCATENATED_JS.read_text(encoding="utf-8"))
					final_lines.append('</script>\n')
				else:
					final_lines.append(f'<script src="{C.CONCATENATED_JS.name}"></script>\n')

		final_lines.append(line)

	html_output_filepath.write_text("".join(final_lines), encoding="utf-8")

if __name__ == "__main__":
	main(C.CONCATENATED_HTML, False)
	main(C.STANDALONE_HTML, True)
