<p align="center">
  <a href="README.ko.md">한국어</a> · <a href="README.ja.md">日本語</a> · <strong>English</strong>
</p>

# THE IDOLM@STER Image Color Quiz

A fan-made browser quiz for matching idol illustrations to their image colors. It covers 332 idols from six series and supports Korean, Japanese, and English.

## [Play the quiz](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/)

## Series

| Series | Idols |
| --- | ---: |
| 765PRO ALLSTARS | 13 |
| Million Stars | 39 |
| Cinderella Girls | 190 |
| Shiny Colors | 28 |
| Gakuen Idolmaster | 13 |
| SideM | 49 |
| **Total** | **332** |

## Run locally

No build step is required. Start a static file server:

```bash
python -m http.server 8765
```

Open `http://localhost:8765/` in your browser.

## Project structure

```
index.html            Page markup
css/style.css         Design tokens, layout, themes
js/lang.js            Korean, Japanese and English strings
js/color.js           Color conversion, perceptual distance (CIELAB)
js/search.js          Name, kana and romaji search
js/choices.js         Choice colors per difficulty
js/app.js             Game flow, screens, scoring
js/guide.js           Color guide, illustration details
js/result-report.js   Result report, share image
js/ui.js              Home color strip, number-key picks
data/series/*.js      Idol data per series
data/quiz-data.js     Combines the series data
assets/               Illustrations, faces, fonts, icons
reference_assets/     Source and processing files (not deployed)
```

Scripts are plain (non-module) scripts loaded in the order listed in `index.html`, with no build step. Keep that order when adding files.

## Sources

| Material | Source |
| --- | --- |
| Image color HEX values | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS and Million Stars artwork | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| Cinderella Girls artwork | [THE IDOLM@STER Portal](https://idolmaster-official.jp/cinderellagirls) |
| Shiny Colors artwork | [Official site](https://shinycolors.idolmaster.jp/) |
| Gakuen Idolmaster artwork | [Official site](https://gakuen.idolmaster-official.jp/) |
| SideM artwork | [THE IDOLM@STER Portal](https://idolmaster-official.jp/sidem/) |
| Cinderella Girls English names | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |

Per-file source and processing records are documented in the README and manifest files under [`assets`](assets/).

## Notice

This is an unofficial fan-made quiz. THE IDOLM@STER and related properties belong to their respective rights holders.
