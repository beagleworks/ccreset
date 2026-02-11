# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-11

### Changed

- Reworked runtime compatibility to support Node.js and Bun
- Switched package bin target to compiled `dist/index.js` for npm/pnpm execution

### Fixed

- Invalid `resets_at` values now trigger full fallback output (`5h:--(-%) | 7d:--(-%)`)
- Trimmed OAuth access token value from credentials before API requests

## [1.0.3] - 2025-01-28

### Fixed

- Add 2-second timeout to API calls to prevent `[Timeout]` display in Claude Code statusline

## [1.0.2] - 2025-01-27

### Changed

- Error handling now outputs fallback display (`5h:--(-%) | 7d:--(-%)`) instead of `[Exit: 1]`
- Exit code is always 0 (no more non-zero exit on API errors)

## [1.0.1] - 2025-01-14

### Changed

- README now available in English (default) and Japanese
- Added installation instructions for npx and pnpm dlx

### Added

- Japanese README (README.ja.md)
- Link to ccstatusline in README

## [1.0.0] - 2025-01-14

### Added

- Initial release
- Display 5-hour and 7-day usage reset time
- Show usage percentage
- Support for Claude Code statusline integration
