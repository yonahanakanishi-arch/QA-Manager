# QA-Manager — Sprint 7.1（反映確認版）

このパッケージには、画面左上に **Sprint 7.1** と表示されます。
この表示が見えない場合、修正版ではない別のフォルダ・別のNetlifyサイトを開いています。

## 必ず行うこと

1. ZIPを解凍します。
2. 解凍したフォルダ内の内容を、GitHub DesktopでCloneした **QA-Manager** フォルダへ上書きコピーします。
3. GitHub Desktopで変更をCommitし、**Push origin** を押します。
4. Netlify利用時はデプロイ完了後、ブラウザで `Ctrl + F5` を押して再読込します。

## 確認ポイント

- 左上に `Sprint 7.1` がある。
- 「未完了」を押すと、状態が「完了」の行が消える。
- 案件行をクリックした詳細画面の下部左側に、赤い **この案件を削除** ボタンがある。

## Apps Script

削除機能を動かすには `gas/Code.gs` の全置換とWebアプリの再デプロイも必要です。ボタン自体は、Apps Scriptの更新前でも表示されます。

## Commit message

`Ensure Sprint 7 fixes are deployed`
