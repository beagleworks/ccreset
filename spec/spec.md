# ccreset - 仕様書

## 概要

Claude Codeの使用量リセット時間と使用率を表示するCLIツール。
statuslineでの表示を想定。

## 実行環境

- Node.js 18+ または Bun
- npm / pnpm / bunx いずれの実行方法でも利用可能
- npm 公開パッケージのメタデータで、Node.js サポート範囲として `>=18` を宣言する

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

## キャッシュ仕様

### 概要

- API の成功レスポンスは、プロセスをまたいで再利用できる永続キャッシュに保存する
- キャッシュ対象は整形済み文字列ではなく、API の生レスポンスと取得時刻とする
- 残り時間は表示時点の現在時刻から再計算する

### 保存先

- `XDG_CACHE_HOME` が設定されている場合: `$XDG_CACHE_HOME/ccreset/cache.json`
- 未設定の場合: `~/.cache/ccreset/cache.json`

### TTL

- 成功レスポンスの fresh TTL は 60 秒
- API が 429 を返した場合は 300 秒間の再試行抑止を行う
- 直近の成功レスポンスは 30 分間 stale として保持してよい

### 利用ルール

- fresh TTL 内に有効な成功キャッシュがあれば、API を呼ばずにその値を使う
- fresh TTL 切れ後は API を再取得する
- 429 の再試行抑止中は API を呼ばず、429 用の表示を返す
- 429 以外の API エラー、ネットワークエラー、タイムアウト時は、30 分以内の stale キャッシュがあればそれを使う
- stale キャッシュがなければ通常のフォールバック出力を返す

---

## エラーハンドリング

エラー種別ごとに以下を表示する：

```
5h:--(-%) | 7d:--(-%)
```

```
[429 error]
```

### 設計思想

statusline 用途のため、通常時は一貫した形式で出力する。
一方で 429 は「利用枠ではなく API レート制限で失敗している」ことを識別できるよう、
専用の短いエラー表示を許容する。

### 対象エラー

- 認証ファイルが見つからない
- アクセストークンが取得できない
- API呼び出し失敗（401, 5xx等）
- ネットワークエラー
- タイムアウト（2秒）
- `resets_at` が `null` 以外で、ISO 8601として解釈不能な値

### エラー時の表示ルール

- API が 429 を返した場合は `[429 error]` を表示する
- 429 以外のエラー時は、30 分以内の stale キャッシュがあれば通常形式で表示する
- 利用可能な stale キャッシュがない場合は `5h:--(-%) | 7d:--(-%)` を表示する

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

### テスト実行

```bash
npm test
```

- テストは Node.js 標準の test runner を使い、追加のテストフレームワーク依存を導入しない
- `npm test` はビルド済みの `dist/` を対象に実行する

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

### 配布メタデータ

- `package.json` に `engines.node` を設定し、未サポートの Node.js バージョン利用時にパッケージマネージャが警告または拒否できるようにする

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
- **プロジェクトサイト対応**: GitHub Pages の project site (`/ccreset/`) 配下でも内部リンクが壊れないよう、サイト内リンクは相対パスを使う

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
3. `npm test`
4. `npm run build`
5. タグ版数（`vX.Y.Z`）と `package.json` の `version` 一致チェック
6. `npm publish --provenance --access public`

### 認証・セキュリティ要件

- npm Trusted Publishing（OIDC）を使用
- npmパッケージ設定で Trusted Publisher（Provider: GitHub Actions）を構成済みであること
- GitHub Actions の `NPM_TOKEN` シークレットは使用しない
- workflow permissions は `id-token: write` を含むこと
- npm に表示される README は、公開 tarball に含まれないローカル画像へ依存しないこと（公開物に含めるか、外部から到達可能な URL を使う）

### 失敗条件

- タグ版数と `package.json` の `version` が不一致
- Trusted Publisher 未設定または権限不足
