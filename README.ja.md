# ccreset

[English README](./README.md)

Claude Code の使用量リセット時間を表示する CLI ツール。statusline での表示に最適。[ccstatusline](https://github.com/sirmalloc/ccstatusline) の表示パーツとしても利用可能。

![ccstatusline と併用した ccreset の表示例](./inaction.png)

*赤丸部分が ccreset の出力。[ccstatusline](https://github.com/sirmalloc/ccstatusline) と併用した例*

## インストール

```bash
# 推奨: グローバルインストールせず実行
bunx ccreset

# または npx
npx ccreset

# または pnpm
pnpm dlx ccreset
```

### 任意: グローバルインストール

```bash
bun add -g ccreset
# または
npm install -g ccreset
```

## 使い方

### パッケージ実行

```bash
bunx ccreset
# または
npx ccreset
# または
pnpm dlx ccreset
```

### ローカル実行（ソースから）

```bash
npm install
npm run build
node dist/index.js
```

### 出力例

```
5h:2h30m(16%) | 7d:3d12h(7%)
```

| 項目 | 説明 |
|------|------|
| `5h:` | 5時間リセット枠 |
| `2h30m` | リセットまでの残り時間 |
| `(16%)` | 使用量 |
| `7d:` | 7日間（週間）リセット枠 |
| `3d12h` | リセットまでの残り時間 |
| `(7%)` | 使用量 |

## Claude Code Statusline

`~/.claude/settings.json` に以下を追加。

### Bun ランタイム

```json
{
  "statusLine": {
    "type": "command",
    "command": "bunx ccreset"
  }
}
```

### Node.js のみで使う場合

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx ccreset"
  }
}
```

## 必要条件

- Node.js 18+ または [Bun](https://bun.sh/) ランタイム
- Claude Code にログイン済み（`~/.claude/.credentials.json` が必要）

## 仕組み

Claude Code の OAuth 認証情報を使用して Anthropic API から使用量情報を取得します。

## npm 自動公開（GitHub Actions）

このリポジトリには、`v1.2.3` のようなタグを push すると npm に自動公開する CI（`.github/workflows/npm-publish.yml`）が含まれます。

事前設定:

1. npm のパッケージ設定で Trusted Publisher を追加する
2. Provider に `GitHub Actions` を選び、このリポジトリと workflow（`.github/workflows/npm-publish.yml`）を紐づける
3. GitHub 側の `NPM_TOKEN` シークレットは不要（使いません）

公開手順:

```bash
# 例: 1.1.1 を公開する場合
npm version 1.1.1
git push origin main --follow-tags
```

タグ（`v1.1.1`）と `package.json` の `version` が一致しない場合、CI は失敗して公開しません。

## ライセンス

MIT

## GitHub Pages

ランディングページ（`docs/`）は `.github/workflows/pages.yml` でデプロイします。GitHub の `Settings > Pages` の Source は `GitHub Actions` を選択してください。
