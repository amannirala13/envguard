# Repository Guidelines

## Project Structure & Module Organization

- `cmd/` hosts CLI entry points; each subfolder targets a runnable binary.
- `pkg/` contains shared packages for configuration, sensors, and platform adapters.
- `internal/` stores private helpers that shouldn’t be imported by external modules.
- `test/` aggregates integration fixtures and end-to-end scenarios.
- `assets/` includes sample policies, mock secrets, and agent templates.

## Build, Test, and Development Commands

- `make build` compiles all binaries into `bin/`; adds version metadata from `git describe`.
- `make test` runs unit and integration suites via Go’s testing framework with race detection.
- `make lint` executes `golangci-lint` using repository defaults.
- `go run ./cmd/envguard` launches the local agent pointing at the sample config in `configs/dev.yaml`.

## Coding Style & Naming Conventions

- Use Go 1.22 defaults: tabs for indentation, `gofmt` before commit.
- Exported types follow PascalCase; private helpers use lowerCamelCase; constants are UPPER_SNAKE.
- Interface files live beside their implementations and end in `_iface.go`.
- Keep package names singular and short (`sensor`, `policy`).

## Testing Guidelines

- Unit tests mirror package names with `_test.go`; function tests use `TestFunctionName`.
- Integration tests live under `test/integration` and are tagged with `//go:build integration`.
- Ensure new packages reach ≥80% coverage (`go test ./... -cover`).
- Snapshot fixtures belong in `testdata/` within each package.

## Commit & Pull Request Guidelines

- Prefer conventional commits (`feat:`, `fix:`, `docs:`); keep subject lines ≤72 characters.
- Reference issues with `Fixes #123` or `Refs #123` in commit or PR descriptions.
- Pull requests require: summary of changes, validation steps (commands run), screenshots for UI/CLI diffs.

## Security & Configuration Tips

- Store secrets in `.envguard/` with SOPS; never commit decrypted files.
- Run `make audit` before release to scan dependencies for known CVEs.
