# AGENTS.md

## Setup

```bash
brew bundle install          # installs uv, lefthook, gitleaks
lefthook install             # activates git hooks
cp .env.example .env         # then fill in real values
```

## Backend (`backend/`)

- Python ≥3.12, FastAPI, SQLAlchemy, managed by `uv`
- `uv run ruff check .` — lint
- `uv run ruff format --check .` — format check
- `uv run ty check` — type check
- `uv run pytest` — tests

## Frontend (`frontend/`)

- Next.js 16, React 19, Tailwind CSS v4, Bun
- `bun run lint` — Biome linter
- `bun run format` — Biome formatter
- `bun run type-check` — tsgo type check
- `bun run test` — bun test

## Full stack

```bash
docker-compose up --build    # runs postgres + backend + frontend
```

## Code style

- Backend: ruff enforces style — double quotes, 88-char lines, Python 3.12+ idioms
- Frontend: Biome check & format enforces style
- Never commit a populated `.env` file

## Commits

- Follow Conventional Commits v1.0.0 (see `.agent/skills/conventional-commits/SKILL.md`)
- One logical change per commit
- Bullet-point body when body is needed
- `lefthook` runs pre-commit and pre-push checks automatically
