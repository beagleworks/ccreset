# ccreset

Claude Code の使用量リセット時間を表示する CLI ツール。statusline での表示に最適。

## Installation

```bash
# bunx で直接実行（推奨）
bunx ccreset

# グローバルインストール
bun add -g ccreset
```

## Usage

```bash
ccreset
```

### Output

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

## Requirements

- [Bun](https://bun.sh/) runtime
- Claude Code にログイン済み（`~/.claude/.credentials.json` が必要）

## How it works

Claude Code の OAuth 認証情報を使用して Anthropic API から使用量情報を取得します。

## License

MIT
