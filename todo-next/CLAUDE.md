# CLAUDE.md

このファイルは Claude Code がこのリポジトリで作業する際のガイドラインです。

## プロジェクト概要

Next.js 15 + App Router + TypeScript + Tailwind CSS 4 で構築したシンプルな Todo アプリ。
バックエンドなし・localStorage のみでデータを永続化するクライアントサイドアプリ。

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # プロダクションビルド
npm run lint     # ESLint 実行
```

## アーキテクチャ

### データフロー

```
page.tsx → TodoApp.tsx → useTodos.ts (hook)
                       ↘ TodoInput.tsx
                       ↘ TodoItem.tsx
                       ↘ TodoFilter.tsx
```

- `useTodos.ts` がすべての状態とビジネスロジックを管理する
- コンポーネントは props 経由でコールバックを受け取るだけ（状態を持たない）
- localStorage の読み書きは `useTodos` 内の `useEffect` で完結

### 型定義 (`src/types/todo.ts`)

```ts
interface Todo {
  id: string;        // タイムスタンプ + ランダム文字列
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
  updatedAt: number;
}
```

## コーディング規約

- **"use client"** — localStorage / イベントハンドラを使うコンポーネントには必須
- **状態はフックに集約** — コンポーネントにローカル状態を増やさない
- **型安全** — `any` は使わない。型推論で解決できない場合は明示的に型を付ける
- **Tailwind のみ** — カスタム CSS は `globals.css` 以外に追加しない

## 機能拡張の指針

新機能を追加する場合の推奨手順:

1. `src/types/todo.ts` に必要な型を追加
2. `src/hooks/useTodos.ts` にロジックを追加
3. コンポーネントを新規作成 or 既存コンポーネントを編集
4. `TodoApp.tsx` でコンポーネントを組み合わせる

### よくある拡張例

| 機能 | 変更ファイル |
|------|------------|
| 期限日の追加 | `todo.ts` → `useTodos.ts` → `TodoInput.tsx` / `TodoItem.tsx` |
| タグ・カテゴリ | `todo.ts` → `useTodos.ts` → 新規 `TodoTag.tsx` |
| ドラッグ&ドロップ並び替え | `useTodos.ts` (reorder 関数) → `TodoApp.tsx` |
| サーバー同期 | `useTodos.ts` の localStorage 部分を API 呼び出しに置換 |

## 注意事項

- **ハイドレーション** — localStorage はサーバーで読めないため、`initialized` フラグで初回レンダリングをスキップしている (`useTodos.ts`)
- **ID 生成** — `Date.now() + Math.random()` で簡易生成。本格運用には `crypto.randomUUID()` を推奨
