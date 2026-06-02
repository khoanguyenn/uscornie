"""convert device_info to json

Revision ID: 3c8db722b7c0
Revises: 7b4a38041449
Create Date: 2026-06-02 23:19:17.295449

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3c8db722b7c0"
down_revision: str | Sequence[str] | None = "7b4a38041449"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute(
            "ALTER TABLE user_sessions ALTER COLUMN device_info TYPE JSON USING device_info::json"
        )
    else:
        with op.batch_alter_table("user_sessions") as batch_op:
            batch_op.alter_column(
                "device_info",
                existing_type=sa.VARCHAR(),
                type_=sa.JSON(),
                existing_nullable=False,
            )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute(
            "ALTER TABLE user_sessions ALTER COLUMN device_info TYPE VARCHAR USING device_info::text"
        )
    else:
        with op.batch_alter_table("user_sessions") as batch_op:
            batch_op.alter_column(
                "device_info",
                existing_type=sa.JSON(),
                type_=sa.VARCHAR(),
                existing_nullable=False,
            )
