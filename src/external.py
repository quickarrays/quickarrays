#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

import re

import common as C


def _apply_patch(text: str, patch_text: str) -> str:
	"""Apply a unified diff patch to text. Raises ValueError if a hunk doesn't match."""
	lines = text.splitlines(keepends=True)
	offset = 0

	hunk_start: int | None = None
	hunk_diff_lines: list[str] = []

	def flush_hunk() -> None:
		nonlocal offset
		if hunk_start is None:
			return

		old_start = hunk_start - 1 + offset  # convert to 0-indexed
		old_block: list[str] = []
		new_block: list[str] = []

		for dl in hunk_diff_lines:
			# A bare newline is a blank context line written without the leading space.
			if dl == '\n' or (dl and dl[0] == ' '):
				content = dl[1:] if dl and dl[0] == ' ' else dl
				old_block.append(content)
				new_block.append(content)
			elif dl and dl[0] == '-':
				old_block.append(dl[1:])
			elif dl and dl[0] == '+':
				new_block.append(dl[1:])
			# '\' (no newline at end of file) and anything else: skip

		actual = lines[old_start : old_start + len(old_block)]
		if actual != old_block:
			raise ValueError(f"Patch hunk at line {hunk_start} does not match file content")

		lines[old_start : old_start + len(old_block)] = new_block
		offset += len(new_block) - len(old_block)

	for raw_line in patch_text.splitlines(keepends=True):
		if raw_line.startswith(('--- ', '+++ ')):
			continue
		if raw_line.startswith('@@ '):
			flush_hunk()
			hunk_diff_lines = []
			m = re.match(r'@@ -(\d+)', raw_line)
			hunk_start = int(m.group(1))  # type: ignore[union-attr]
		elif hunk_start is not None:
			hunk_diff_lines.append(raw_line)

	flush_hunk()
	return ''.join(lines)


def _build_header_comment(stem: str) -> str:
	"""Build a JS block comment with license, source, and (if present) patch info."""
	parts = []

	lic_file = C.EXTERNAL_ASSETS_DIR / (stem + '.LICENSE')
	if lic_file.exists():
		parts.append(f"=== {lic_file.name} ===\n{lic_file.read_text(encoding='utf-8').rstrip()}")

	src_file = C.EXTERNAL_ASSETS_DIR / (stem + '.SOURCE')
	if src_file.exists():
		parts.append(f"=== {src_file.name} ===\n{src_file.read_text(encoding='utf-8').rstrip()}")

	patch_file = C.EXTERNAL_ASSETS_DIR / (stem + '.patch')
	if patch_file.exists():
		parts.append(f"=== {patch_file.name} ===\n{patch_file.read_text(encoding='utf-8').rstrip()}")

	if not parts:
		return ''

	body = '\n\n'.join(parts).replace('*/', '* /')
	return f'/*!\n{body}\n*/\n\n'


def main() -> None:
	C.EXTERNAL_JS_DIR.mkdir(parents=True, exist_ok=True)

	for src in sorted(C.EXTERNAL_ASSETS_DIR.glob('*.js')):
		text = src.read_text(encoding='utf-8')
		dest = C.EXTERNAL_JS_DIR / src.name

		patch_file = C.EXTERNAL_ASSETS_DIR / (src.stem + '.patch')
		if patch_file.exists():
			text = _apply_patch(text, patch_file.read_text(encoding='utf-8'))
			print(f"Patched {src.name}")

		header = _build_header_comment(src.stem)
		dest.write_text(header + text, encoding='utf-8')
		print(f"Copied {src} -> {dest}")


if __name__ == "__main__":
	main()
