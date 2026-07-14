# QA-Manager — Sprint 5

## 追加機能

- 一覧行のクリックによる案件詳細の表示
- 回答内容、状態、各日付、担当者、優先度、備考などの編集・保存
- 変更内容を `QA履歴` へ自動記録
- 履歴の時系列表示

## 適用するファイル

- `index.html`
- `css/style.css`
- `js/api.js`
- `js/app.js`
- `gas/Code.gs`

## Apps Scriptの事前確認

`QA履歴` シートの見出しは、次の6列を推奨します。

`履歴ID | 案件ID | 日時 | 種別 | 内容 | 登録者`

`gas/Code.gs` は既存コードを**全置換**してください。保存後は「Deploy → Manage deployments → Edit → New version → Deploy」でWebアプリを再デプロイします。公開URLは通常変わりません。

## 確認手順

1. 一覧の案件行をクリックする。
2. 詳細と履歴が表示されることを確認する。
3. 例として状態を「回答待ち」、回答予定日を入力し「変更を保存」を押す。
4. 一覧に変更が反映され、`QA履歴` に更新記録が追加されることを確認する。

## Commit message

`Add ticket detail editing and history`
