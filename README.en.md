<p align="center">
  <a href="README.ko.md">한국어</a> · <a href="README.ja.md">日本語</a> · <strong>English</strong>
</p>

# THE IDOLM@STER Image Color Quiz

A fan-made browser quiz: look at an idol's illustration and pick that idol's image color.
It covers 332 idols from six series and is available in Korean, Japanese and English.

**Play:** [GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![Home screen](docs/screenshots/home.png)

## Features

- **Choose the pool** — every idol, one or more series, or a custom pool picked idol by idol.
- **Question count** — 10, 20, all, or any number you type.
- **Four difficulty levels** — how close the wrong choices sit to the answer changes per level (see the table below).
- **Answer reveal** — once you answer, the true image color lights up behind the illustration, and streaks show as a combo.
- **Color report** — score, correct count, average answer time, the colors you played and the idol lineup on one card. Save or share it as a PNG.
- **Missed colors** — compare your pick with the answer for every miss; tap a card for the idol's details.
- **Color guide** — browse and search the image colors of all 332 idols by series, copy HEX codes and view full illustrations.
- **Comfort** — light and dark themes, mobile layouts and number-key picks. Tapping a chip in the home screen's color strip opens that idol's details.

## Difficulty and scoring

| Level | Choices | Time limit | Max score | Wrong choices |
| --- | ---: | ---: | ---: | --- |
| Easy | 5 | 30 s | 500 | Colors far around the color wheel |
| Normal | 6 | 25 s | 1000 | Colors from a similar family + a hair-color trap |
| Hard | 6 | 20 s | 1500 | Close hue and tone + a hair-color trap |
| Very Hard | 6 | 15 s | 2000 | Very close colors + other idols' real colors + a hair-color trap |

- Each correct answer is worth `max score ÷ question count`, however fast you answer.
- Running out of time counts as a wrong answer.
- Wrong choices are kept a minimum CIELAB color distance away from the answer and from each other.

## Controls

| Key | Action |
| --- | --- |
| `1`–`6` | Pick that choice |
| `Enter` | Next question (the confirm button is focused after you answer) |
| `Esc` | Close the open window |

## Search

The search boxes in custom mode and the color guide match names (Korean, Japanese, English), kana, romaji, units, attributes and HEX codes.

| Query | Meaning |
| --- | --- |
| `haruka`, `はるか`, `ハルカ` | Different spellings, same idol |
| `#e22b30` | Find by HEX code |
| `765 + princess` | Match every term (`+`) |
| `chihaya or miki` | Match any alternative (`or`) |

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

This is a static site with no build step. Start a static file server in the repository folder:

```bash
python -m http.server 8765
```

Then open `http://localhost:8765/` in your browser.

## Deployment

- **GitHub Pages** — serves the root of the `main` branch as is. Pushing to `main` updates it.
- **Render** — load the repository's [`render.yaml`](render.yaml) as a Blueprint to deploy it as a Static Site. Only the files the site needs are copied into `dist/`; `reference_assets/` is left out.

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
docs/screenshots/     README images
```

Scripts are plain (non-module) scripts loaded in the order listed in `index.html`. Keep that order when adding files.

### Font subsets

The fonts in `assets/fonts/` are Noto Sans KR and JP subsets that keep only the characters the site uses. Rebuild them after adding new names or strings:

```bash
pip install fonttools brotli
python reference_assets/font-subsets/build.py --kr NotoSansKR-VariableFont_wght.ttf --jp NotoSansJP-VariableFont_wght.ttf
```

## Sources

| Item | Source |
| --- | --- |
| Image color HEX values | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS and Million Stars images | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| Cinderella Girls images | [IDOLM@STER Portal](https://idolmaster-official.jp/cinderellagirls) |
| Shiny Colors images | [Official site](https://shinycolors.idolmaster.jp/) |
| Gakuen Idolmaster images | [Official site](https://gakuen.idolmaster-official.jp/) |
| SideM images | [IDOLM@STER Portal](https://idolmaster-official.jp/sidem/) |
| Cinderella Girls English names | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |
| Fonts | [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) · [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) (SIL OFL 1.1) |

Per-file sources and processing notes live in the README and manifest files under [`assets`](assets/).

## Notice

This is an unofficial fan-made quiz. THE IDOLM@STER and its related series belong to their respective rights holders.
