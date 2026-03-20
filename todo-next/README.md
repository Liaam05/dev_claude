# Todo App (Next.js)

シンプルで使いやすい Todo リストアプリケーションです。Next.js 15 + TypeScript + Tailwind CSS で構築されています。

## 機能

- **タスクの追加** — テキスト入力 + Enter キーまたは「追加」ボタン
- **完了切り替え** — チェックボタンをクリックで完了 / 未完了を切り替え
- **インライン編集** — タスクテキストをダブルクリックして編集（Enter で確定、Escape でキャンセル）
- **優先度管理** — 低 / 中 / 高の3段階（カラードットをクリックして変更）
- **フィルター** — すべて / 未完了 / 完了済みで絞り込み
- **一括操作** — すべて完了 / 完了済みを一括削除
- **データ永続化** — localStorage に自動保存

## 技術スタック

| 技術 | バージョン |
|------|-----------|
| Next.js | 15.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx        # ルートレイアウト（メタデータ設定）
│   ├── page.tsx          # メインページ
│   └── globals.css       # グローバルスタイル
├── components/
│   ├── TodoApp.tsx       # メインコンポーネント（状態管理ハブ）
│   ├── TodoInput.tsx     # タスク入力フォーム
│   ├── TodoItem.tsx      # タスク1件分のUI
│   └── TodoFilter.tsx    # フィルタータブ + 一括操作
├── hooks/
│   └── useTodos.ts       # Todo のビジネスロジック（localStorage 連携）
└── types/
    └── todo.ts           # 型定義（Todo, Priority, FilterType）
```

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（http://localhost:3000）
npm run dev

# プロダクションビルド
npm run build
npm start
```

## 使い方

1. 上部の優先度ボタン（低 / 中 / 高）で優先度を選択
2. テキストボックスにタスクを入力し、Enter または「追加」をクリック
3. チェックボタンでタスクを完了にする
4. タスクテキストをダブルクリックしてインライン編集
5. カラードットをクリックして優先度を変更
6. フィルタータブで表示を絞り込む
