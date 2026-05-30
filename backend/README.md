# Backend Service

A high-performance FastAPI backend service built with Python 3.12+, SQLAlchemy 2.0, and managed using `uv`.

## Codebase Directory Index

The backend follows a domain-driven feature folder layout:

*   [auth/](file:///Users/khoanguyen/work/uscornie/backend/auth/) - Authentication, user session management, and the `User` ORM model.
*   [spaces/](file:///Users/khoanguyen/work/uscornie/backend/spaces/) - Shared and personal workspaces, membership management, and workspace ORM models.
*   [invites/](file:///Users/khoanguyen/work/uscornie/backend/invites/) - Workspace invitation token generation, validation, and invitation ORM models.
*   [models/](file:///Users/khoanguyen/work/uscornie/backend/models/) - Unified database registry index for re-exporting ORM models to prevent circular imports.
*   [migrations/](file:///Users/khoanguyen/work/uscornie/backend/migrations/) - Alembic database migration scripts.
*   [kit/](file:///Users/khoanguyen/work/uscornie/backend/kit/) - Shared core infrastructure (database session generator, UUID/time helpers, global exception handling).
*   [tests/](file:///Users/khoanguyen/work/uscornie/backend/tests/) - Comprehensive integration and service-level test suites.

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
