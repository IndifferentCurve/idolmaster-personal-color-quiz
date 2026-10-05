<p align="center">
  <a href="README.ko.md">한국어</a> · <strong>日本語</strong> · <a href="README.en.md">English</a>
</p>

# アイドルマスター イメージカラークイズ

アイドルのイラストを見て、そのアイドルのイメージカラーを選ぶファンメイドのWebクイズです。
6シリーズ332人を収録し、韓国語・日本語・英語に対応しています。

**プレイ:** [GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![メイン画面](docs/screenshots/home.png)

## 主な機能

- **出題範囲** — すべて、シリーズ別（複数選択可）、またはアイドルを1人ずつ選ぶカスタムモード。
- **出題数** — 10問、20問、全員、または直接入力。
- **4段階の難易度** — 選択肢の色が正解にどれだけ近いかが段階ごとに変わります（下の表）。
- **正解の演出** — 回答すると本来のイメージカラーがイラストの背後に灯り、連続正解はコンボとして表示されます。
- **カラーレポート** — スコア、正解数、平均回答時間、今回のカラー、出題アイドルを1枚にまとめます。PNGで保存・共有できます。
- **ミスノート** — 間違えた問題の自分の選択と正解を比べられ、カードを押すとアイドルの詳細を表示します。
- **カラーガイド** — 332人全員のイメージカラーをシリーズ別に閲覧・検索できます。HEXコードのコピーやイラストの拡大表示も可能です。
- **その他** — ライト・ダークテーマ、モバイル対応、数字キーでの選択。メイン画面のカラーストリップのチップを押すと、そのアイドルの詳細が開きます。

## 難易度とスコア

| 難易度 | 選択肢 | 制限時間 | 満点 | 不正解の選択肢 |
| --- | ---: | ---: | ---: | --- |
| Easy | 5 | 30秒 | 500 | 色相環で離れた色 |
| Normal | 6 | 25秒 | 1000 | 近い系統の色 + 髪色トラップ |
| Hard | 6 | 20秒 | 1500 | 色相・トーンの近い色 + 髪色トラップ |
| Very Hard | 6 | 15秒 | 2000 | ごく近い色 + 他のアイドルの実際のカラー + 髪色トラップ |

- 1問正解あたりのスコアは `満点 ÷ 出題数` で、回答の速さには左右されません。
- 制限時間内に答えられなかった場合は不正解になります。
- 不正解の選択肢は、CIELAB色差で正解や他の選択肢と一定以上離れるように作られます。

## 操作

| キー | 動作 |
| --- | --- |
| `1`–`6` | その番号の選択肢を選ぶ |
| `Enter` | 次の問題へ（回答後は確認ボタンにフォーカス） |
| `Esc` | 開いているウィンドウを閉じる |

## 検索

カスタムモードとカラーガイドの検索欄は、名前（韓・日・英）、かな、ローマ字、ユニット、属性、HEXコードで検索できます。

| 入力例 | 意味 |
| --- | --- |
| `haruka`、`はるか`、`ハルカ` | 表記が違っても同じアイドル |
| `#e22b30` | HEXコードで検索 |
| `765 + princess` | すべての条件を満たす（`+`） |
| `chihaya or miki` | いずれかを満たす（`or`） |

## 収録シリーズ

| シリーズ | 人数 |
| --- | ---: |
| 765PRO ALLSTARS | 13人 |
| ミリオンスターズ | 39人 |
| シンデレラガールズ | 190人 |
| シャイニーカラーズ | 28人 |
| 学園アイドルマスター | 13人 |
| SideM | 49人 |
| **合計** | **332人** |

## ローカルで実行

ビルド不要の静的サイトです。リポジトリのフォルダで静的ファイルサーバーを起動します。

```bash
python -m http.server 8765
```

ブラウザで `http://localhost:8765/` を開きます。

## デプロイ

- **GitHub Pages** — `main` ブランチのルートをそのまま公開します。`main` にプッシュすると更新されます。
- **Render** — リポジトリの [`render.yaml`](render.yaml) をBlueprintとして読み込むと、Static Siteとしてデプロイされます。サイトに必要なファイルだけを `dist/` にまとめて公開し、`reference_assets/` は含めません。

## 構成

```
index.html            画面のマークアップ
css/style.css         デザイントークン・レイアウト・テーマ
js/lang.js            韓国語・日本語・英語の文言
js/color.js           色変換・知覚色差（CIELAB）
js/search.js          名前・かな・ローマ字検索
js/choices.js         難易度別の選択肢の色生成
js/app.js             ゲーム進行・画面遷移・スコア
js/guide.js           カラーガイド・イラスト詳細
js/result-report.js   結果レポート・共有画像
js/ui.js              メインのカラーストリップ・数字キー選択
data/series/*.js      シリーズ別アイドルデータ
data/quiz-data.js     シリーズデータの統合
assets/               イラスト・顔・フォント・アイコン
reference_assets/     元素材・加工資料（デプロイ対象外）
docs/screenshots/     README用の画像
```

スクリプトはモジュールではない通常のスクリプトで、`index.html` に書かれた順に読み込まれます。ファイルを追加するときはこの順序を守ってください。

### フォントのサブセット

`assets/fonts/` のフォントは、画面で使う文字だけを残した Noto Sans KR・JP のサブセットです。新しい名前や文言を追加した場合は作り直してください。

```bash
pip install fonttools brotli
python reference_assets/font-subsets/build.py --kr NotoSansKR-VariableFont_wght.ttf --jp NotoSansJP-VariableFont_wght.ttf
```

## 出典

| 項目 | 出典 |
| --- | --- |
| イメージカラーHEX | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS・ミリオンスターズの画像 | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| シンデレラガールズの画像 | [アイドルマスターポータル](https://idolmaster-official.jp/cinderellagirls) |
| シャイニーカラーズの画像 | [公式サイト](https://shinycolors.idolmaster.jp/) |
| 学園アイドルマスターの画像 | [公式サイト](https://gakuen.idolmaster-official.jp/) |
| SideMの画像 | [アイドルマスターポータル](https://idolmaster-official.jp/sidem/) |
| シンデレラガールズの英語名 | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |
| フォント | [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) · [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)（SIL OFL 1.1） |

ファイルごとの出典と加工記録は [`assets`](assets/) 以下のREADMEとmanifestファイルにまとめています。

## 注意

このプロジェクトは非公式のファンメイドクイズです。THE IDOLM@STERおよび関連シリーズの権利は各権利者に帰属します。
