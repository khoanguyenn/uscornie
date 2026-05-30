# Uscornie

Uscornie is a full-stack web application that gives couples a private, shared digital "Space". Sign in with Google, create your Space, and invite your partner with a unique, single-use link.

## ✨ Features

- **Google Authentication** — Secure one-click sign-in via Google accounts.
- **Space Management** — Create a private digital space tailored for two people.
- **Invitation System** — Generate secure, single-use invite links to bring a partner in.
- **Couple Limit** — Automatically enforces a maximum of two members per Space.
- **Scrapbook & Wishlist** — Save places, books, movies, gifts, and memories together.
- **Date Planner** — Browse curated date ideas filtered by mood and time slot.
- **Gift Suggester** — Random gift ideas or picks directly from your shared wishlist.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [TanStack Query](https://tanstack.com/query), [Zustand](https://zustand-demo.pmnd.rs/) |
| **Backend** | Python 3.12, [FastAPI](https://fastapi.tiangolo.com/), SQLAlchemy (ORM), `uv` for dependency management |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) |
| **Tooling** | [Biome](https://biomejs.dev/) (lint + format), [Ruff](https://docs.astral.sh/ruff/) + [ty](https://github.com/astral-sh/ty) (Python), [Lefthook](https://github.com/evilmartians/lefthook) (git hooks), [Gitleaks](https://github.com/gitleaks/gitleaks) (secret scanning) |
| **Infrastructure** | Docker + Docker Compose, [Cloudflare Pages](https://pages.cloudflare.com/) (frontend), GitHub Container Registry (backend image) |

## 🚀 Getting Started

The easiest way to run the entire stack locally is Docker Compose.

### Requirements

- Docker & Docker Compose
- Google OAuth credentials
- A populated `.env` (copy from `.env.example`)

### One-Time Setup

```bash
brew bundle install   # installs uv, lefthook, gitleaks
lefthook install      # activates git hooks
cp .env.example .env  # then fill in real values
```

### Running Locally

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API docs | http://localhost:8000/docs |

## 🤝 Contributing

### Local Quality Gates

`pre-commit` (runs in parallel):
- Scan staged files for secrets with `gitleaks`
- Block files larger than 2 MiB
- Backend: Ruff lint + format check on staged `.py` files
- Frontend: Biome lint + format on staged `.ts/.tsx/.json` files

`pre-push` (runs in parallel):
- Full repository secret scan with `gitleaks`
- Backend: `ty` type check + `pytest`
- Frontend: `next build` (compile + type check)

If you need to bypass hooks for an emergency commit, use `git --no-verify`. CI reruns all important checks on every push and pull request.

### Secrets and Environment Files

- **Never** commit a populated `.env` file.
- Use `.env.example` as the public contract for required variables.
- Keep OAuth credentials, JWT secrets, and database passwords out of the repository.

## 📂 Project Structure

```
uscornie/
├── frontend/                  # Next.js 16 App Router SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── (main)/        # Authenticated route group
│   │   │   │   ├── page.tsx   # Home / dashboard
│   │   │   │   ├── calendar/  # Anniversary & birthday countdown
│   │   │   │   ├── date/      # Date idea planner
│   │   │   │   ├── gift/      # Gift suggester
│   │   │   │   └── save/      # Scrapbook / wishlist manager
│   │   │   └── join/          # Partner onboarding via invite link
│   │   ├── components/        # Reusable React components
│   │   ├── services/          # Axios API service layer
│   │   ├── stores/            # Zustand global state
│   │   ├── types/             # Shared TypeScript type definitions
│   │   └── utils/             # Helpers (e.g. cn() class merger)
│   ├── biome.json             # Lint + format config
│   └── tsconfig.json          # Strict TypeScript config
│
├── backend/                   # FastAPI application (Polar domain-driven structure)
│   ├── kit/                   # Shared database config & base exception handlers
│   ├── models/                # Centralized SQLAlchemy database models
│   ├── auth/                  # Authentication domain (endpoints, service, schemas)
│   ├── spaces/                # Space domain (endpoints, service, schemas)
│   ├── invites/               # Invite domain (endpoints, service)
│   ├── main.py                # Main entry point & app configuration
│   └── pyproject.toml         # Ruff, ty, pytest, and dependency config
│
├── .github/workflows/
│   ├── ci.yml                 # Lint, type check, and tests on every PR/push
│   ├── deploy-frontend.yml    # Build + deploy to Cloudflare Pages on main
│   └── release.yml            # Build + push backend Docker image on tags
│
├── docker-compose.yml         # Local dev orchestration (Postgres + backend + frontend)
├── lefthook.yml               # Git hook definitions
└── Brewfile                   # macOS tool dependencies (uv, lefthook, gitleaks)
```
