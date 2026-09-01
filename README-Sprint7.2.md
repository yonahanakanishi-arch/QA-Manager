# QA-Manager — Sprint 7.2（不具合修正版）

## 修正した原因

### 1. 「未完了」が空になる

`open` を特別な絞り込み値として扱った後に、通常の状態名として再比較していました。そのため全案件が除外されていました。

修正後は、**状態が「完了」ではない案件だけ**を確実に表示します。また、カードを押したときに以前の検索・絞り込み条件をクリアします。

### 2. 削除に失敗する

削除機能にはApps Script側の `delete` API が必須です。旧版のApps Scriptが公開されたままだと、画面だけ更新されていても削除は失敗します。

今回の `Code.gs` には削除APIと `health` 確認APIを含めています。**Code.gsを全置換し、新バージョンとして再デプロイしてください。**

## 必ず上書きするファイル

- `index.html`
- `js/app.js`
- `gas/Code.gs`

（他の同名ファイルもまとめて上書きして構いません。）

## Apps Script 再デプロイ手順

1. Apps Scriptで `Code.gs` を全置換して保存します。
2. **Deploy → Manage deployments → Edit** を開きます。
3. Versionで **New version** を選び、**Deploy** します。
4. 公開URLの末尾に `?action=health` を付けて開きます。
5. 次のように表示されれば成功です。

```json
{"status":"success","version":"Sprint 7.2","deleteSupported":true}
```

## ブラウザ確認

画面左上に **Sprint 7.2** と表示されることを確認してください。

## Commit message

`Fix dashboard filtering and diagnose deletion API`
