"""Build the language subsets used by the Quiz Sans CSS family."""

import argparse
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kr", type=Path, required=True, help="Noto Sans KR variable TTF")
    parser.add_argument("--jp", type=Path, required=True, help="Noto Sans JP variable TTF")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    sources = [*(root / "js").glob("*.js"), *(root / "data").rglob("*.js"), root / "index.html"]
    characters = {ord(char) for file in sources for char in file.read_text(encoding="utf-8")}
    groups = [
        ("latin", args.kr, [(0x20, 0x24F), (0x2000, 0x206F), (0x20A0, 0x20CF)]),
        ("korean", args.kr, [(0x1100, 0x11FF), (0x3130, 0x318F), (0xAC00, 0xD7A3)]),
        ("japanese", args.jp, [(0x3000, 0x30FF), (0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0xFF00, 0xFFEF)]),
    ]
    out = root / "assets" / "fonts"
    out.mkdir(parents=True, exist_ok=True)

    for name, source, ranges in groups:
        wanted = {code for code in characters if any(start <= code <= end for start, end in ranges)}
        if name == "latin":
            wanted.update(range(0x20, 0x7F))
        if name == "japanese":
            wanted.update(range(0x3040, 0x3100))
        options = subset.Options()
        options.flavor = "woff2"
        options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
        with TTFont(source) as font:
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=wanted)
            subsetter.subset(font)
            font.flavor = "woff2"
            target = out / f"quiz-{name}.woff2"
            font.save(target)
        print(f"{name}: {target.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
