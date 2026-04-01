# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Cloaser Real Estate Agent** — a self-contained TypeScript library (no server, no HTTP API) that generates real estate property exposés, extracts buyer signals from conversations, and exports context for speaking/voice agents. All data persists in an embedded SQLite database via `better-sqlite3`.

### Key commands

All standard commands are in `package.json`:

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Build (TS → JS) | `npm run build` |
| Run tests | `npm test` |
| Run demo | `npm run example` |

### Non-obvious notes

- **No lint script exists** in `package.json`. There is no ESLint or Prettier configuration in the repo. TypeScript strict mode (`tsc`) is the only static analysis.
- **`better-sqlite3` is a native C++ addon** — `npm install` requires a C/C++ build toolchain (`python3`, `make`, `g++`). The VM already has these installed.
- **No external services** are needed — no databases, APIs, Docker, or environment variables. SQLite is embedded and auto-created at runtime.
- The **test runner** is Node.js built-in `node:test` executed via `tsx` (TypeScript execution without precompilation). Tests are co-located with source files (`*.test.ts`).
- The example demo writes its SQLite database to `data/cloaser.db` (gitignored). This file is ephemeral and recreated on each run.
- This is an **ESM-only** project (`"type": "module"` in `package.json`).
