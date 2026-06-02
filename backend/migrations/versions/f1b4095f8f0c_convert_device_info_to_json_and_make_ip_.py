"""convert device_info to json and make ip_address nullable

Revision ID: f1b4095f8f0c
Revises: 7b4a38041449
Create Date: 2026-06-03 00:30:45.503580

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f1b4095f8f0c"
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
        op.execute("ALTER TABLE user_sessions ALTER COLUMN ip_address DROP NOT NULL")
    else:
        with op.batch_alter_table("user_sessions") as batch_op:
            batch_op.alter_column(
                "device_info",
                existing_type=sa.VARCHAR(),
                type_=sa.JSON(),
                existing_nullable=False,
            )
            batch_op.alter_column(
                "ip_address", existing_type=sa.VARCHAR(), nullable=True
            )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TABLE user_sessions ALTER COLUMN ip_address SET NOT NULL")
        op.execute(
            "ALTER TABLE user_sessions ALTER COLUMN device_info TYPE VARCHAR USING device_info::text"
        )
    else:
        with op.batch_alter_table("user_sessions") as batch_op:
            batch_op.alter_column(
                "ip_address", existing_type=sa.VARCHAR(), nullable=False
            )
            batch_op.alter_column(
                "device_info",
                existing_type=sa.JSON(),
                type_=sa.VARCHAR(),
                existing_nullable=False,
            )
