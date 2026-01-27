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

```bash
ccreset
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

Add the following to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bunx ccreset"
  }
}
```

## Requirements

- [Bun](https://bun.sh/) runtime (recommended) or Node.js
- Logged into Claude Code (`~/.claude/.credentials.json` required)

## How it works

Uses Claude Code's OAuth credentials to fetch usage information from the Anthropic API.

## License

MIT
