<p align="center">
  <a href="README.ko.md">한국어</a> · <strong>日本語</strong> · <a href="README.en.md">English</a>
</p>

# アイドルマスター イメージカラークイズ

イラストを見てアイドルのイメージカラーを当てるファンメイドクイズ。6シリーズ332人収録、日本語・韓国語・英語対応。

[GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![メイン画面](docs/screenshots/home.png)

## 機能

- シリーズ別の出題、アイドルを個別に選べるカスタムモード
- 4段階の難易度、出題数の選択
- 結果画像の保存・共有、ミスノート
- 全アイドルのイメージカラーを確認できるカラーガイド
- ライト/ダークモード、スマホ対応、数字キー（1〜6）での選択

## 難易度

| 難易度 | 選択肢 | 制限時間 | 満点 |
| --- | ---: | ---: | ---: |
| Easy | 5 | 30秒 | 500 |
| Normal | 6 | 25秒 | 1000 |
| Hard | 6 | 20秒 | 1500 |
| Very Hard | 6 | 15秒 | 2000 |

スコアは正解数のみで計算し、時間切れは不正解扱い。

## 収録シリーズ

| シリーズ | 人数 |
| --- | ---: |
| 765PRO ALLSTARS | 13 |
| ミリオンスターズ | 39 |
| シンデレラガールズ | 190 |
| シャイニーカラーズ | 28 |
| 学園アイドルマスター | 13 |
| SideM | 49 |

## ローカル実行

```bash
python -m http.server 8765
```

`http://localhost:8765/` を開く。

## 出典

- イメージカラーHEX: [imas-db](https://imas-db.jp/misc/color.html)
- 画像: [MLTD Database](https://imas.gamedbs.jp/mlth/)、[シンデレラガールズ](https://idolmaster-official.jp/cinderellagirls)、[シャイニーカラーズ](https://shinycolors.idolmaster.jp/)、[学園アイドルマスター](https://gakuen.idolmaster-official.jp/)、[SideM](https://idolmaster-official.jp/sidem/)
- シンデレラガールズ英語名: [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters)
- フォント: Noto Sans KR / JP（SIL OFL 1.1）

非公式のファンメイドプロジェクトです。THE IDOLM@STER に関する権利は各権利者に帰属します。
