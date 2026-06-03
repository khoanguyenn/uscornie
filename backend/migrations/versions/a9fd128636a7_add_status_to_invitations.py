"""add_status_to_invitations

Revision ID: a9fd128636a7
Revises: f1b4095f8f0c
Create Date: 2026-06-04 00:04:11.372978

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a9fd128636a7"
down_revision: str | Sequence[str] | None = "f1b4095f8f0c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "invitations",
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("invitations", "status")
