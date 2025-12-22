#!/usr/bin/env python3
"""   """
# pylint: disable=bad-indentation,line-too-long,invalid-name

from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen

import common as C


def download(url: str) -> None:
	parsed = urlparse(url)
	filename = Path(parsed.path).name or "index.js"
	out_path = C.EXTERNAL_JS_DIR / filename

	with urlopen(url) as response:
		data = response.read()

	out_path.write_bytes(data)
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

