# 勤務ナビゲーター

勤務時間とタスクを管理するためのシンプルなWebアプリケーションです。

## デプロイ先

[https://kinmu-navigator.pages.dev/](https://kinmu-navigator.pages.dev/)

## 機能

- 勤務時間の記録と管理
- タスク管理
- ローカルストレージを使用したデータ保存

## 技術スタック

- Next.js 15.3.1
- TypeScript
- Tailwind CSS
- Cloudflare Pages

## 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/kuuchan-code/kinmu-navigator.git
cd kinmu-navigator
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## 注意事項

- このアプリはブラウザのローカルストレージにデータを保存します
- データは使用しているブラウザにのみ保存され、別のブラウザや端末では共有されません
- ブラウザのキャッシュを削除するとデータが消去されます

## ライセンス

MIT
