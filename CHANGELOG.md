# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-03-17

### Added

- Added a persistent usage cache with a 60-second fresh TTL to reduce API calls from statusline polling
- Added 30-minute stale-cache reuse for non-429 API and network failures

### Changed

- Rate limiting now displays `[429 error]` instead of the generic fallback output
- HTTP 429 responses now trigger a 5-minute backoff window before retrying the usage API

## [1.2.1] - 2026-03-08

### Fixed

- Restored `bunx ccreset` output by moving execution into a dedicated CLI entrypoint

### Added

- Added a CLI bootstrap test that verifies direct execution prints the fallback output shape

## [1.2.0] - 2026-03-08

### Added

- Added Node.js standard-library tests for formatter, credentials, API, and CLI execution paths

### Changed

- Added `npm test` and wired npm publish CI to run tests before publishing
- Declared Node.js `>=18` in package metadata

### Fixed

- Made README screenshots resolve correctly in published package contexts
- Fixed GitHub Pages landing page logo navigation for the project-site path

## [1.1.1] - 2026-02-11

### Fixed

- Corrected `bin` path format for npm publish compatibility

## [1.1.0] - 2026-02-11

### Changed

- Reworked runtime compatibility to support Node.js and Bun
- Switched package bin target to compiled `dist/index.js` for npm/pnpm execution

### Fixed

- Invalid `resets_at` values now trigger full fallback output (`5h:--(-%) | 7d:--(-%)`)
- Trimmed OAuth access token value from credentials before API requests

## [1.0.3] - 2026-01-28

### Fixed

- Add 2-second timeout to API calls to prevent `[Timeout]` display in Claude Code statusline

## [1.0.2] - 2026-01-27

### Changed

- Error handling now outputs fallback display (`5h:--(-%) | 7d:--(-%)`) instead of `[Exit: 1]`
- Exit code is always 0 (no more non-zero exit on API errors)

## [1.0.1] - 2026-01-14

### Changed

- README now available in English (default) and Japanese
- Added installation instructions for npx and pnpm dlx

### Added

- Japanese README (README.ja.md)
- Link to ccstatusline in README

## [1.0.0] - 2026-01-14

### Added

- Initial release
- Display 5-hour and 7-day usage reset time
- Show usage percentage
- Support for Claude Code statusline integration
