<p align="center">
  <a href="README.ko.md">한국어</a> · <strong>日本語</strong> · <a href="README.en.md">English</a>
</p>

# アイドルマスター イメージカラークイズ

アイドルのイラストを見て、それぞれのイメージカラーを選ぶファンメイドのWebクイズです。6シリーズ・332名を収録し、韓国語・日本語・英語に対応しています。

## [クイズをプレイ](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/)

## 収録シリーズ

| シリーズ | 人数 |
| --- | ---: |
| 765PRO ALLSTARS | 13名 |
| ミリオンスターズ | 39名 |
| シンデレラガールズ | 190名 |
| シャイニーカラーズ | 28名 |
| 学園アイドルマスター | 13名 |
| SideM | 49名 |
| **合計** | **332名** |

## ローカルで実行

ビルドは不要です。静的ファイルサーバーを起動します。

```bash
python -m http.server 8765
```

ブラウザで `http://localhost:8765/` を開きます。

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
```

スクリプトはビルド不要の通常スクリプトで、`index.html` に書かれた順に読み込まれます。ファイルを追加するときはこの順序を守ってください。

## 出典

| 項目 | 出典 |
| --- | --- |
| イメージカラー HEX | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS・ミリオンスターズ画像 | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| シンデレラガールズ画像 | [アイドルマスターポータル](https://idolmaster-official.jp/cinderellagirls) |
| シャイニーカラーズ画像 | [公式サイト](https://shinycolors.idolmaster.jp/) |
| 学園アイドルマスター画像 | [公式サイト](https://gakuen.idolmaster-official.jp/) |
| SideM画像 | [アイドルマスターポータル](https://idolmaster-official.jp/sidem/) |
| シンデレラガールズ英語名 | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |

ファイルごとの出典と加工記録は、[`assets`](assets/) 内の README および manifest ファイルに記載しています。

## 注意

本プロジェクトは非公式のファンメイドクイズです。THE IDOLM@STER および関連シリーズの権利は、各権利者に帰属します。
