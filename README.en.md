<p align="center">
  <a href="README.ko.md">한국어</a> · <a href="README.ja.md">日本語</a> · <strong>English</strong>
</p>

# THE IDOLM@STER Image Color Quiz

A fan-made quiz: look at an idol's illustration and guess their image color. 332 idols from six series, in English, Japanese and Korean.

[GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![Home screen](docs/screenshots/home.png)

## Features

- Play by series, or pick idols yourself in custom mode
- Four difficulty levels and a choice of question count
- Save or share your results as an image; review missed answers
- Color guide with every idol's image color
- Light/dark themes, mobile support, number keys (1–6) to answer

## Difficulty

| Level | Choices | Time limit | Max score |
| --- | ---: | ---: | ---: |
| Easy | 5 | 30 s | 500 |
| Normal | 6 | 25 s | 1000 |
| Hard | 6 | 20 s | 1500 |
| Very Hard | 6 | 15 s | 2000 |

Score depends only on correct answers. Running out of time counts as wrong.

## Series

| Series | Idols |
| --- | ---: |
| 765PRO ALLSTARS | 13 |
| Million Stars | 39 |
| Cinderella Girls | 190 |
| Shiny Colors | 28 |
| Gakuen Idolmaster | 13 |
| SideM | 49 |

## Run locally

```bash
python -m http.server 8765
```

Open `http://localhost:8765/`.

## Credits

- Image color HEX values: [imas-db](https://imas-db.jp/misc/color.html)
- Images: [MLTD Database](https://imas.gamedbs.jp/mlth/), [Cinderella Girls](https://idolmaster-official.jp/cinderellagirls), [Shiny Colors](https://shinycolors.idolmaster.jp/), [Gakuen Idolmaster](https://gakuen.idolmaster-official.jp/), [SideM](https://idolmaster-official.jp/sidem/)
- Cinderella Girls English names: [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters)
- Fonts: Noto Sans KR / JP (SIL OFL 1.1)

Unofficial fan project. All THE IDOLM@STER rights belong to their respective owners.
