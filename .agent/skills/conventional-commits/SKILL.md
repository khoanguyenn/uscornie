---
name: conventional-commits
description: >
  Formats git commit messages using Conventional Commits v1.0.0.
  Use when writing, reviewing, or suggesting commit messages for uscornie.
  Covers type selection, repo-specific scopes, breaking changes, and footer tokens.
  Do not use for general coding tasks unrelated to git history.
compatibility: Requires git
allowed-tools: Bash(git:*)
---

# Conventional Commits

## Commit message template

```
<type>[(<scope>)][!]: <description>

- <why this change was made>
- <additional context if needed>

[footer(s)]
```

Rules: imperative mood · lowercase first letter · no trailing period · blank line before body and footer · one logical change per commit.

## How to choose a type

1. Does it add something the user can see or use? → `feat`
2. Does it fix broken behaviour? → `fix`
3. Does it only restructure code with no behaviour change? → `refactor`
4. Does it only touch test files? → `test`
5. Does it only touch docs, comments, or docstrings? → `docs`
6. Does it only touch Dockerfiles, `pyproject.toml`, `package.json`, or lockfiles? → `build`
7. Does it only touch `.github/workflows/`? → `ci`
8. Does it only touch tooling config (`lefthook.yml`, `Brewfile`, `.mise.toml`, scripts)? → `chore`
9. Does it improve speed with no behaviour change? → `perf`
10. Everything else that makes code cleaner without changing behaviour → `refactor`

> **Ambiguous cases:** If a PR fixes a bug *and* refactors the call site, split into two commits: one `fix`, one `refactor`.

## How to choose a scope

Default to the layer that owns the change:

| Changed path | Default scope |
|---|---|
| `backend/auth_utils.py` | `auth` |
| `backend/main.py` (endpoints) | `api` |
| `backend/models.py`, `database.py` | `db` |
| `backend/` (general) | `backend` |
| `frontend/src/` | `frontend` |
| `docker-compose.yml`, `Dockerfile` | `docker` |
| `.github/workflows/` | `ci` |
| `lefthook.yml`, `scripts/` | `hooks` |
| `pyproject.toml`, `package.json`, lockfiles | `deps` |
| `.mise.toml`, `.env.example` | `config` |
| `backend/tests/`, `frontend/**/*.test.*` | `tests` |

Omit scope only when the change genuinely spans two or more unrelated layers.

## Breaking changes

Append `!` to type/scope **and** a `BREAKING CHANGE:` footer:

```
feat(api)!: remove /invite/accept endpoint

BREAKING CHANGE: replaced by POST /spaces/{id}/join
```

## Footer tokens

- `BREAKING CHANGE: <desc>` — triggers MAJOR SemVer bump
- `Closes #<N>` — auto-closes GitHub issue on merge
- `Refs #<N>` — references without closing

## Output format

When producing a commit message:
- Header only when the diff is self-evident
- Add a body when the *why* isn't obvious from the diff
- Add `Closes #N` footer whenever a commit resolves a tracked issue

```
feat(spaces): add single-use invite link generation
```

```
fix(auth): validate JWT expiry on every protected request

- token expiry was only checked at login
- middleware now validates `exp` on every protected request

Closes #42
```

## Gotchas

- `build` is for dependency and build-system files only (`pyproject.toml`, `Dockerfile`, lockfiles). Do **not** use `chore` for dependency bumps.
- The `spaces` scope covers invite logic, membership limits, and space CRUD — it maps to `main.py` routes that handle spaces, not a separate file.
- Pre-commit hooks run `ruff check` and `ruff format --check` on staged Python files. If either fails, the commit is blocked — fix lint before committing, not after.
