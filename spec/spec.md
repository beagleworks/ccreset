# ccreset - 仕様書

## 概要

Claude Codeの使用量リセット時間と使用率を表示するCLIツール。
statuslineでの表示を想定。

## 実行環境

- Node.js 18+ または Bun
- npm / pnpm / bunx いずれの実行方法でも利用可能

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

すべてのエラー発生時は、フォールバック出力を表示する：

```
5h:--(-%) | 7d:--(-%)
```

### 設計思想

statusline用途のため、エラー時も一貫した形式で出力する。
これにより、UIの乱れを防ぎ、ユーザー体験を損なわない。

### 対象エラー

- 認証ファイルが見つからない
- アクセストークンが取得できない
- API呼び出し失敗（401, 5xx等）
- ネットワークエラー
- タイムアウト（2秒）
- `resets_at` が `null` 以外で、ISO 8601として解釈不能な値

---

## 使用方法

### 事前ビルド（ローカル実行時）

```bash
npm run build
```

### ローカル実行

```bash
node dist/index.js
```

### bunx 実行

```bash
bunx ccreset
```

### npx 実行

```bash
npx ccreset
```

### pnpm 実行

```bash
pnpm dlx ccreset
```

### statusline 設定

`~/.claude/settings.json`:

#### Bun を使う場合

```json
{
  "statusLine": {
    "type": "command",
    "command": "bunx ccreset"
  }
}
```

#### Node.js のみで使う場合

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx ccreset"
  }
}
```

---

## ランディングページ（GitHub Pages）

### 概要

`docs/` ディレクトリが GitHub Pages のランディングページとして公開されている。

### 公開URL

```
https://beagleworks.github.io/ccreset/
```

### 構成ファイル

| ファイル | 役割 |
|----------|------|
| `docs/index.html` | LP本体（単一HTMLファイル） |
| `docs/style.css` | スタイルシート |
| `docs/assets/inaction.png` | スクリーンショット画像 |

### 機能

- **多言語対応**: EN / JA の切り替えボタン（`data-i18n` 属性 + JavaScript で翻訳を切り替え、`localStorage` で保持）
- **テーマ切り替え**: ダーク / ライトモード（CSS変数 + `data-theme` 属性、`localStorage` で保持）
- **コピーボタン**: インストールコマンドや設定JSONをワンクリックでコピー

### デプロイ

- `.github/workflows/pages.yml` による自動デプロイ
- トリガー: `main` ブランチへの push（`docs/**` または workflow ファイル自体の変更時）
- 手動実行（`workflow_dispatch`）も可能

---

## npm公開CI仕様（GitHub Actions）

### 対象workflow

- `.github/workflows/npm-publish.yml`

### 実行トリガー

- `v*.*.*` 形式のGitタグpush時のみ実行
- 例: `v1.2.3`

### 実行手順

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. タグ版数（`vX.Y.Z`）と `package.json` の `version` 一致チェック
5. `npm publish --provenance --access public`

### 認証・セキュリティ要件

- npm Trusted Publishing（OIDC）を使用
- npmパッケージ設定で Trusted Publisher（Provider: GitHub Actions）を構成済みであること
- GitHub Actions の `NPM_TOKEN` シークレットは使用しない
- workflow permissions は `id-token: write` を含むこと

### 失敗条件

- タグ版数と `package.json` の `version` が不一致
- Trusted Publisher 未設定または権限不足
