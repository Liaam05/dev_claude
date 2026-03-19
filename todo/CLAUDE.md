# CLAUDE.md — Todo App

## プロジェクト概要

バニラJS/HTML/CSS のみで構成したシンプルなTodoアプリ。外部ライブラリ・ビルドツール不使用。

## アーキテクチャ

### 状態管理（script.js）

単一の `state` オブジェクトで管理し、変更は必ず `dispatch(action, payload)` を通す。

```
state = { todos, filter, sort, theme, editingId }
```

- `todos` は配列。各要素に `id`, `text`, `completed`, `priority`, `dueDate`, `createdAt`, `order` を持つ。
- `dispatch` → `persist()` → `render()` の順で実行される。
- `localStorage` への保存キーは `todos-v1`（データ）と `todos-prefs-v1`（設定）。

### レンダリング

`render()` は毎回フルレンダリングする（差分なし）。`renderList()` のみアニメーション用に前回IDセットを保持する。

### CSS

CSS カスタムプロパティでライト/ダークテーマを管理。`[data-theme="dark"]` 属性をルート要素に付与して切り替える。

## 注意事項

- フレームワーク・ビルドツールを導入しない。バニラJSのまま維持する。
- `localStorage` のキー（`todos-v1`, `todos-prefs-v1`）は変えない（既存データが失われる）。
- `escapeHtml()` を使わずに `innerHTML` へユーザー入力を直接埋め込まない。
