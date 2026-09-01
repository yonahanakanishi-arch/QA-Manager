# QA-Manager — Sprint 6

## 追加機能

- 現在の検索・絞り込み結果をCSVで出力
- `QA案件` の全26項目を出力
- Excelで開いたときに日本語が文字化けしない UTF-8 BOM 形式

## 使い方

1. 必要に応じて状態・担当者・キーワードなどで絞り込みます。
2. 「CSV出力」を押します。
3. `QA案件一覧_YYYYMMDD.csv` がダウンロードされます。

空の検索結果ではCSVを作成しません。

## 適用するファイル

- `index.html`
- `js/app.js`

## Commit message

`Add filtered CSV export`
