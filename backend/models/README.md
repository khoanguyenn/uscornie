# Database Models Registry

This directory serves as the centralized index and registration entrypoint for all SQLAlchemy ORM models in the backend.

## Why this exists

To maintain a clean domain-driven structure, all database models are colocated within their respective feature folders. However, to prevent **circular imports** during relational mapping definitions and to expose a unified `metadata` registry for **Alembic database migrations**, we re-export them from this package's `__init__.py`.

Do not define models directly in this directory. Define them in their respective feature folders and register them in `__init__.py`.

## Model Index

| Model | Table Name | Source Location | Feature Domain |
| :--- | :--- | :--- | :--- |
| `User` | `users` | [auth/model.py](file:///Users/khoanguyen/work/uscornie/backend/auth/model.py) | Authentication & User Profiles |
| `Space` | `spaces` | [spaces/model.py](file:///Users/khoanguyen/work/uscornie/backend/spaces/model.py) | Team/Collab Workspaces |
| `SpaceMember` | `space_members` | [spaces/model.py](file:///Users/khoanguyen/work/uscornie/backend/spaces/model.py) | Workspace Memberships |
| `Invitation` | `invitations` | [invites/model.py](file:///Users/khoanguyen/work/uscornie/backend/invites/model.py) | Workspace Invitations |
