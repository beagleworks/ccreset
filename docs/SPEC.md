# ccreset - 仕様書

## 概要

Claude Codeの使用量リセット時間と使用率を表示するCLIツール。
statuslineでの表示を想定。

## 出力形式

```
5h:2h30m(6%) | 7d:3d12h(35%)
```

| 項目 | 説明 |
|------|------|
| `5h:` | 5時間リセット枠 |
| `2h30m` | リセットまでの残り時間 |
| `(6%)` | 使用量（%） |
| `7d:` | 7日間（週間）リセット枠 |
| `3d12h` | リセットまでの残り時間 |
| `(35%)` | 使用量（%） |

---

## API仕様

### エンドポイント

```
GET https://api.anthropic.com/api/oauth/usage
```

### リクエストヘッダー

| ヘッダー | 値 |
|----------|-----|
| `Authorization` | `Bearer {accessToken}` |
| `anthropic-beta` | `oauth-2025-04-20` |

### レスポンス

```json
{
  "five_hour": {
    "utilization": 6.0,
    "resets_at": "2025-11-04T04:59:59.943648+00:00"
  },
  "seven_day": {
    "utilization": 35.0,
    "resets_at": "2025-11-06T03:59:59.943679+00:00"
  },
  "seven_day_oauth_apps": null,
  "seven_day_opus": {
    "utilization": 0.0,
    "resets_at": null
  }
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|------------|-----|------|
| `utilization` | `number` | 使用率（%）|
| `resets_at` | `string \| null` | リセット時刻（ISO 8601形式） |

---

## 認証情報

### ファイルパス

```
~/.claude/.credentials.json
```

### 構造

```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": 1768384301294,
    "scopes": ["user:inference", "user:profile", "user:sessions:claude_code"],
    "subscriptionType": "max",
    "rateLimitTier": "default_claude_max_5x"
  }
}
```

---

## エラーハンドリング

| エラー | メッセージ |
|--------|------------|
| 認証ファイル未検出 | `Error: 認証情報ファイルが見つかりません。Claude Codeにログインしてください。` |
| トークン期限切れ | `Error: アクセストークンの有効期限が切れています。再度ログインしてください。` |
| API 401 | `Error: API呼び出しに失敗しました (401): Unauthorized` |
| API 5xx | `Error: API呼び出しに失敗しました ({status}): {message}` |
| ネットワークエラー | `Error: ネットワークエラーが発生しました。接続を確認してください。` |

---

## 使用方法

### ローカル実行

```bash
bun run src/index.ts
```

### bunx 実行

```bash
bunx ccreset
```

### statusline 設定

`~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bunx ccreset"
  }
}
```
