# ccreset

[日本語版 README](./README.ja.md)

A CLI tool to display Claude Code usage reset time. Ideal for statusline display. Can also be used as a display component for [ccstatusline](https://github.com/sirmalloc/ccstatusline).

![ccreset output highlighted in red — works great with ccstatusline](./inaction.png)

*Red circle: ccreset in action. Used alongside the awesome [ccstatusline](https://github.com/sirmalloc/ccstatusline)*

## Installation

```bash
# Run directly with bunx (recommended)
bunx ccreset

# Run with npx
npx ccreset

# Run with pnpm
pnpm dlx ccreset

# Global install
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

## License

MIT
