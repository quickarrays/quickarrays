#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen

import common as C


# Patches applied to downloaded files after download.
# Each entry maps a filename to a list of (old, new) string replacements.
PATCHES: dict[str, list[tuple[str, str]]] = {
	"Sortable.js": [
		# The passive event listener detection runs after the touchmove listener
		# is registered, so that listener ends up passive and can't preventDefault.
		# Swap the order so captureMode is set to {passive: false} first.
		(
			"\t// Fixed #973:\n"
			"\t_on(document, 'touchmove', function (evt) {\n"
			"\t\tif (Sortable.active) {\n"
			"\t\t\tevt.preventDefault();\n"
			"\t\t}\n"
			"\t});\n"
			"\n"
			"\ttry {\n"
			"\t\twindow.addEventListener('test', null, Object.defineProperty({}, 'passive', {\n"
			"\t\t\tget: function () {\n"
			"\t\t\t\tcaptureMode = {\n"
			"\t\t\t\t\tcapture: false,\n"
			"\t\t\t\t\tpassive: false\n"
			"\t\t\t\t};\n"
			"\t\t\t}\n"
			"\t\t}));\n"
			"\t} catch (err) {}",
			"\ttry {\n"
			"\t\twindow.addEventListener('test', null, Object.defineProperty({}, 'passive', {\n"
			"\t\t\tget: function () {\n"
			"\t\t\t\tcaptureMode = {\n"
			"\t\t\t\t\tcapture: false,\n"
			"\t\t\t\t\tpassive: false\n"
			"\t\t\t\t};\n"
			"\t\t\t}\n"
			"\t\t}));\n"
			"\t} catch (err) {}\n"
			"\n"
			"\t// Fixed #973:\n"
			"\t_on(document, 'touchmove', function (evt) {\n"
			"\t\tif (Sortable.active) {\n"
			"\t\t\tevt.preventDefault();\n"
			"\t\t}\n"
			"\t});"
		),
	],
}


def download(url: str) -> None:
	parsed = urlparse(url)
	filename = Path(parsed.path).name or "index.js"
	out_path = C.EXTERNAL_JS_DIR / filename

	with urlopen(url) as response:
		data = response.read()

	text = data.decode("utf-8")
	for old, new in PATCHES.get(filename, []):
		patched = text.replace(old, new)
		if patched == text:
			print(f"WARNING: patch for {filename} did not match — skipping")
		else:
			text = patched
			print(f"Patched {filename}")
	out_path.write_text(text, encoding="utf-8")
	print(f"Downloaded {url} -> {out_path}")


def main() -> None:
	C.EXTERNAL_JS_DIR.mkdir(parents=True, exist_ok=True)

	lines = C.EXTERNAL_FILELIST.read_text(encoding="utf-8").splitlines()
	urls = [
		line.strip()
		for line in lines
		if line.strip() and not line.lstrip().startswith("#")
	]

	for url in urls:
		download(url)


if __name__ == "__main__":
	main()

