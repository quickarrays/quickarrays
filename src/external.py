#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import common as C


# Patches applied to vendored files when copying to the build directory.
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


def main() -> None:
	C.EXTERNAL_JS_DIR.mkdir(parents=True, exist_ok=True)

	for src in sorted(C.EXTERNAL_ASSETS_DIR.glob('*.js')):
		text = src.read_text(encoding='utf-8')
		for old, new in PATCHES.get(src.name, []):
			patched = text.replace(old, new)
			if patched == text:
				print(f"WARNING: patch for {src.name} did not match — skipping")
			else:
				text = patched
				print(f"Patched {src.name}")
		dest = C.EXTERNAL_JS_DIR / src.name
		dest.write_text(text, encoding='utf-8')
		print(f"Copied {src} -> {dest}")


if __name__ == "__main__":
	main()
