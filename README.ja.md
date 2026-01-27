# ccreset

[English README](./README.md)

Claude Code の使用量リセット時間を表示する CLI ツール。statusline での表示に最適。[ccstatusline](https://github.com/sirmalloc/ccstatusline) の表示パーツとしても利用可能。

![ccstatusline と併用した ccreset の表示例](./inaction.png)

*赤丸部分が ccreset の出力。[ccstatusline](https://github.com/sirmalloc/ccstatusline) と併用した例*

## インストール

```bash
# bunx で直接実行（推奨）
bunx ccreset

# npx で実行
npx ccreset

# pnpm で実行
pnpm dlx ccreset

# グローバルインストール
bun add -g ccreset
# または
npm install -g ccreset
```

## 使い方

```bash
ccreset
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

`~/.claude/settings.json` に以下を追加:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bunx ccreset"
  }
}
```

## 必要条件

- [Bun](https://bun.sh/) ランタイム（推奨）または Node.js
- Claude Code にログイン済み（`~/.claude/.credentials.json` が必要）

## 仕組み

Claude Code の OAuth 認証情報を使用して Anthropic API から使用量情報を取得します。

## ライセンス

MIT
