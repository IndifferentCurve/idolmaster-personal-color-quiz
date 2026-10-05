<p align="center">
  <a href="README.ko.md">한국어</a> · <a href="README.ja.md">日本語</a> · <strong>English</strong>
</p>

# THE IDOLM@STER Image Color Quiz

Look at an idol's illustration and guess their image color.
There are 332 idols from six series, and you can play in English, Japanese or Korean.

Try it: [GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![Home screen](docs/screenshots/home.png)

## How to play

Pick the series you want, choose how many questions and how hard, and hit start.
If you only want your favorites, the Custom option lets you pick idols one by one.

Each question shows an illustration next to a handful of colors. Pick the one you think is their image color.
Once you answer, the real color glows up behind the illustration, so even when you miss you can see what it should have been.

## Difficulty

The harder it gets, the closer the wrong colors are to the right one, and the less time you have.
From Normal up, one of the wrong colors is close to the idol's hair color, so watch out for that. On Very Hard you'll also see other idols' actual image colors.

| Level | Choices | Time limit | Max score |
| --- | ---: | ---: | ---: |
| Easy | 5 | 30 s | 500 |
| Normal | 6 | 25 s | 1000 |
| Hard | 6 | 20 s | 1500 |
| Very Hard | 6 | 15 s | 2000 |

Your score only depends on how many you get right. Answering fast doesn't earn extra, and running out of time counts as a miss.

## After the game

The results screen sums up your score and every color that came up, and you can save it as an image or share it.
Anything you missed goes into the missed colors list. Tap a card there to see that idol's illustration and color up close.

## Color guide

This page is for when you just want to look colors up instead of playing.
It lists the image colors of all 332 idols by series, and tapping a HEX code copies it.

## Handy bits

- Keys 1 to 6 pick a color. After answering, Enter takes you to the next question.
- Search works with English, Japanese or Korean names and romaji. `haruka` and `はるか` both find Haruka.
- Use `+` to combine terms (`765 + princess`) or `or` to look for several idols at once (`chihaya or miki`). HEX codes work too.
- Tap any of the color chips drifting across the home screen to see that idol.
- There's a light and a dark theme, and it works on phones.

## Who's in it

| Series | Idols |
| --- | ---: |
| 765PRO ALLSTARS | 13 |
| Million Stars | 39 |
| Cinderella Girls | 190 |
| Shiny Colors | 28 |
| Gakuen Idolmaster | 13 |
| SideM | 49 |
| Total | 332 |

## Running it yourself

It's a static site with no build step, so all you need is a file server in the repo folder:

```bash
python -m http.server 8765
```

Then open `http://localhost:8765/`.

It's deployed in two places. GitHub Pages serves the `main` branch as is, and Render reads [`render.yaml`](render.yaml) and uploads only the files the site actually needs.

### Folder layout

```
index.html            The page
css/style.css         Styles
js/lang.js            English, Japanese and Korean text
js/color.js           Color math
js/search.js          Search
js/choices.js         Making the color choices
js/app.js             The game itself
js/guide.js           Color guide
js/result-report.js   Results screen and share image
js/ui.js              Home color chips, number keys
data/series/*.js      Idol data, one file per series
data/quiz-data.js     Puts the series data together
assets/               Illustrations, faces, fonts, icons
reference_assets/     Source material (not deployed)
docs/screenshots/     Images for this README
```

The scripts aren't modules. They load in the order they're listed in `index.html`, so keep that order in mind when you add a file.

### Fonts

The fonts are cut-down versions of Noto Sans KR and JP that only keep the characters the site uses.
If you add a new name or line of text and those characters show up in a different font, rebuild them like this:

```bash
pip install fonttools brotli
python reference_assets/font-subsets/build.py --kr NotoSansKR-VariableFont_wght.ttf --jp NotoSansJP-VariableFont_wght.ttf
```

## Credits

| What | Where from |
| --- | --- |
| Image color HEX values | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS and Million Stars images | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| Cinderella Girls images | [IDOLM@STER Portal](https://idolmaster-official.jp/cinderellagirls) |
| Shiny Colors images | [Official site](https://shinycolors.idolmaster.jp/) |
| Gakuen Idolmaster images | [Official site](https://gakuen.idolmaster-official.jp/) |
| SideM images | [IDOLM@STER Portal](https://idolmaster-official.jp/sidem/) |
| Cinderella Girls English names | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |
| Fonts | [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR), [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) (SIL OFL 1.1) |

Where each file came from and how it was edited is written down in the README and manifest files inside [`assets`](assets/).

---

This is an unofficial fan-made quiz. THE IDOLM@STER and its related series belong to their respective rights holders.
