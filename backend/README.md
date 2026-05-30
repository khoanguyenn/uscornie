# Backend Service

A high-performance FastAPI backend service built with Python 3.12+, SQLAlchemy 2.0, and managed using `uv`.

## Codebase Directory Index

The backend follows a domain-driven feature folder layout:

```text
backend/
├── auth/                 # User profiles, login auth APIs & models (Folded)
├── spaces/               # Shared & personal workspace management (Sample Expanded Domain)
│   ├── model.py          # Space & SpaceMember database ORM models
│   ├── endpoints.py      # API endpoints for workspaces
│   ├── service.py        # Workspace business logic
│   ├── repository.py     # Workspace-specific query logic
│   ├── schemas.py        # Pydantic schemas for request/response validation
│   └── exceptions.py     # Custom exceptions for workspace actions
├── invites/              # Token-based workspace invitations (Folded)
├── models/               # Centralized ORM re-export registry
│   └── __init__.py       # Exposes all models to prevent circular imports
├── migrations/           # Alembic database migrations & version history
├── kit/                  # Shared core infrastructure (DB session, global exceptions)
└── tests/                # Unit and integration test suites
```

Detailed Domain Folders:

* [auth/](file:///Users/khoanguyen/work/uscornie/backend/auth/) - Authentication, user session management, and `User` model.
* [spaces/](file:///Users/khoanguyen/work/uscornie/backend/spaces/) - Shared and personal workspaces, membership management, and `Space`/`SpaceMember` models.
* [invites/](file:///Users/khoanguyen/work/uscornie/backend/invites/) - Invitation token registry and `Invitation` model.
* [models/](file:///Users/khoanguyen/work/uscornie/backend/models/) - Unified database registry index for re-exporting ORM models.
* [migrations/](file:///Users/khoanguyen/work/uscornie/backend/migrations/) - Alembic database migration scripts.
* [kit/](file:///Users/khoanguyen/work/uscornie/backend/kit/) - Shared core infrastructure (database session generator, UUID/time helpers).
* [tests/](file:///Users/khoanguyen/work/uscornie/backend/tests/) - Comprehensive integration and service-level test suites.

---

## Development Cheat Sheet

Ensure you have `uv` installed (`brew install uv`).

### Setup & Local Server

```bash
uv sync                                      # Install dependencies
uv run uvicorn main:app --reload             # Launch FastAPI dev server
```

### Static Analysis & Verification

```bash
uv run ruff check .                          # Linter (Ruff)
uv run ruff format --check .                  # Formatter Check
uv run ty check                              # Type Checking (tsgo equivalent)
uv run pytest                                # Run Pytest test suite
```

### Database Migrations (Alembic)

```bash
# Generate a new migration script
uv run alembic revision --autogenerate -m "migration_description"

# Apply all pending migrations to the database
uv run alembic upgrade head
```
