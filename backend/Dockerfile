# Stage 1: Build stage
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy configuration files first
COPY pyproject.toml uv.lock* ./

# Install dependencies only (leverage BuildKit cache mount and skip project install)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-dev --frozen --no-install-project

# Copy project source code and compile project package
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-dev --frozen

# Stage 2: Runtime stage
FROM python:3.12-slim AS runner

WORKDIR /app

# Install runtime library dependencies (like libpq5 for PostgreSQL)
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for execution
RUN groupadd -g 999 appuser && \
    useradd -m -r -u 999 -g appuser appuser

# Copy the virtual environment and application code from builder stage with correct ownership
COPY --chown=appuser:appuser --from=builder /app/.venv /app/.venv
COPY --chown=appuser:appuser . .

# Set environment variables for runtime
ENV PATH="/app/.venv/bin:$PATH"
ENV UV_NO_SYNC=1
ENV UV_OFFLINE=1

USER 999

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
