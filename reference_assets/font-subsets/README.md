# UI Font Subsets

The app serves three variable WOFF2 subsets, not complete CJK font families.
Latin and Hangul use Noto Sans KR; Japanese uses Noto Sans JP. Sources and
licenses are recorded in `assets/fonts/`.

After adding names or translations, install `fonttools[woff]` and run:

```sh
python build.py --kr /path/to/NotoSansKR-VF.ttf --jp /path/to/NotoSansJP-VF.ttf
```

This reads the current UI/data text and replaces the three WOFF2 files in
`assets/fonts/`. All weights remain available. Keep the original OFL files
alongside the generated assets. Full source fonts are not deployed.
