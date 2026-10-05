<p align="center">
  <a href="README.ko.md">한국어</a> · <strong>日本語</strong> · <a href="README.en.md">English</a>
</p>

# アイドルマスター イメージカラークイズ

イラストを見て、そのアイドルのイメージカラーを当てるクイズです。
6シリーズ、332人を収録しています。日本語・韓国語・英語で遊べます。

遊んでみる: [GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![メイン画面](docs/screenshots/home.png)

## 遊び方

シリーズを選んで、出題数と難易度を決めたらスタートです。
好きなアイドルだけで遊びたいときは、「カスタム」から1人ずつ選べます。

問題ごとにイラストの横にいくつか色が並ぶので、その中からイメージカラーを選んでください。
答えると正解の色がイラストの後ろにふんわり広がるので、外しても本当は何色だったのかすぐにわかります。

## 難易度

難しくなるほど、ハズレの色が正解に近づいて、時間も短くなります。
Normal からは髪の色に似た色がひとつ混ざるので気をつけてください。Very Hard では、ほかのアイドルの本物のイメージカラーまで出てきます。

| 難易度 | 選択肢 | 制限時間 | 満点 |
| --- | ---: | ---: | ---: |
| Easy | 5 | 30秒 | 500 |
| Normal | 6 | 25秒 | 1000 |
| Hard | 6 | 20秒 | 1500 |
| Very Hard | 6 | 15秒 | 2000 |

スコアは正解数だけで決まります。早く答えてもボーナスはなく、時間切れは不正解になります。

## ゲームが終わったら

結果画面では、スコアと今回出てきた色をまとめて見られます。画像として保存したり、シェアしたりもできます。
間違えた問題はミスノートにたまっていて、カードを押すとそのアイドルのイラストとカラーを大きく表示します。

## カラーガイド

クイズとは別に、色をただ眺めたり調べたりしたいとき用のページです。
332人全員のイメージカラーをシリーズごとに見られて、HEXコードは押すとコピーされます。

## ちょっとした使い方

- キーボードの1〜6で選択肢を選べます。答えたあとは Enter で次の問題へ進みます。
- 検索は日本語・韓国語・ローマ字のどれでも大丈夫です。`haruka` でも `はるか` でも春香が出てきます。
- `765 + princess` のように `+` で条件を重ねたり、`chihaya or miki` のように `or` で何人かまとめて探したりもできます。HEXコードでも検索できます。
- メイン画面で流れている色のチップを押すと、そのアイドルの情報が開きます。
- ライト/ダークモードとスマホ表示にも対応しています。

## 収録アイドル

| シリーズ | 人数 |
| --- | ---: |
| 765PRO ALLSTARS | 13人 |
| ミリオンスターズ | 39人 |
| シンデレラガールズ | 190人 |
| シャイニーカラーズ | 28人 |
| 学園アイドルマスター | 13人 |
| SideM | 49人 |
| 合計 | 332人 |

## 手元で動かす

ビルドのいらない静的サイトなので、リポジトリのフォルダでサーバーを立てるだけで動きます。

```bash
python -m http.server 8765
```

あとは `http://localhost:8765/` を開いてください。

公開は2か所でしています。GitHub Pages は `main` ブランチをそのまま公開していて、Render は [`render.yaml`](render.yaml) を読んで、サイトに必要なファイルだけをまとめて公開しています。

### フォルダ構成

```
index.html            画面
css/style.css         スタイル
js/lang.js            日本語・韓国語・英語の文言
js/color.js           色の計算
js/search.js          検索
js/choices.js         選択肢の色づくり
js/app.js             ゲームの進行
js/guide.js           カラーガイド
js/result-report.js   結果画面と共有画像
js/ui.js              メインの色チップ、数字キー
data/series/*.js      シリーズごとのアイドルデータ
data/quiz-data.js     上のデータをひとつにまとめるファイル
assets/               イラスト、顔、フォント、アイコン
reference_assets/     元素材（公開には含めません）
docs/screenshots/     README用の画像
```

スクリプトはモジュールを使わず、`index.html` に書いた順番で読み込んでいます。ファイルを追加するときは順番だけ気にしてください。

### フォント

フォントは Noto Sans KR と JP から、実際に使う文字だけを切り出したものです。
新しい名前や文言を入れて、その文字だけ別のフォントで表示されるようなら、次のコマンドで作り直してください。

```bash
pip install fonttools brotli
python reference_assets/font-subsets/build.py --kr NotoSansKR-VariableFont_wght.ttf --jp NotoSansJP-VariableFont_wght.ttf
```

## 出典

| 素材 | 出典 |
| --- | --- |
| イメージカラーのHEX | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS、ミリオンスターズの画像 | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| シンデレラガールズの画像 | [アイドルマスター ポータル](https://idolmaster-official.jp/cinderellagirls) |
| シャイニーカラーズの画像 | [公式サイト](https://shinycolors.idolmaster.jp/) |
| 学園アイドルマスターの画像 | [公式サイト](https://gakuen.idolmaster-official.jp/) |
| SideMの画像 | [アイドルマスター ポータル](https://idolmaster-official.jp/sidem/) |
| シンデレラガールズの英語名 | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |
| フォント | [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR)、[Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)（SIL OFL 1.1） |

ファイルごとの入手先や加工の記録は、[`assets`](assets/) の中の README と manifest に書いてあります。

---

非公式のファンメイドクイズです。THE IDOLM@STER および関連シリーズの権利は、それぞれの権利者に帰属します。
