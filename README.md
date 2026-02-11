# ccreset

[日本語版 README](./README.ja.md)

A CLI tool to display Claude Code usage reset time. Ideal for statusline display. Can also be used as a display component for [ccstatusline](https://github.com/sirmalloc/ccstatusline).

![ccreset output highlighted in red — works great with ccstatusline](./inaction.png)

*Red circle: ccreset in action. Used alongside the awesome [ccstatusline](https://github.com/sirmalloc/ccstatusline)*

## Installation

```bash
# Recommended: run without global install
bunx ccreset

# or with npx
npx ccreset

# or with pnpm
pnpm dlx ccreset
```

### Optional: Global install

```bash
bun add -g ccreset
# or
npm install -g ccreset
```

## Usage

### Package execution

```bash
bunx ccreset
# or
npx ccreset
# or
pnpm dlx ccreset
```

### Local execution (from source)

```bash
npm install
npm run build
node dist/index.js
```

### Output

```
5h:2h30m(16%) | 7d:3d12h(7%)
```

| Field | Description |
|-------|-------------|
| `5h:` | 5-hour reset window |
| `2h30m` | Time remaining until reset |
| `(16%)` | Current usage |
| `7d:` | 7-day (weekly) reset window |
| `3d12h` | Time remaining until reset |
| `(7%)` | Current usage |

## Claude Code Statusline

Add the following to `~/.claude/settings.json`.

### Bun runtime

```json
{
  "statusLine": {
    "type": "command",
    "command": "bunx ccreset"
  }
}
```

### Node.js-only runtime

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx ccreset"
  }
}
```

## Requirements

- Node.js 18+ or [Bun](https://bun.sh/) runtime
- Logged into Claude Code (`~/.claude/.credentials.json` required)

## How it works

Uses Claude Code's OAuth credentials to fetch usage information from the Anthropic API.

## npm Auto Publish (GitHub Actions)

This repo includes CI (`.github/workflows/npm-publish.yml`) that automatically publishes to npm when you push a tag like `v1.2.3`.

Prerequisites:

1. Add a Trusted Publisher in your npm package settings
2. Select `GitHub Actions` as the provider and bind this repository and workflow (`.github/workflows/npm-publish.yml`)
3. No `NPM_TOKEN` GitHub secret is required

Release flow:

```bash
# Example: release 1.1.1
npm version 1.1.1
git push origin main --follow-tags
```

If the Git tag (for example `v1.1.1`) and `package.json` version do not match, the workflow fails and does not publish.

## License

MIT

## GitHub Pages

The landing page (`docs/`) is deployed by `.github/workflows/pages.yml`. In GitHub `Settings > Pages`, set Source to `GitHub Actions`.
