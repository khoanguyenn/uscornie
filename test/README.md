# Uscornie E2E & Integration Testing Suite

This directory contains integration and end-to-end (E2E) testing scenarios for the Uscornie application using **Python + Playwright** for browser automation, and **Testcontainers** for programmatic Docker Compose orchestration.

## 📐 Architecture & Test Lifecycle Flow

```mermaid
sequenceDiagram
    participant TestRunner as Pytest Runner
    participant DB as Test Postgres Container
    participant UI as Playwright Browser
    participant API as Backend Service (Uvicorn)

    TestRunner->>DB: 1. Setup Testcontainers Docker Compose
    TestRunner->>DB: 2. Create tables & Truncate tables (Clean slate)
    TestRunner->>TestRunner: 3. Seed test User & Space
    TestRunner->>TestRunner: 4. Generate JWT Token
    TestRunner->>UI: 5. Open page & inject token to localStorage
    UI->>API: 6. Request API with Auth header
    API->>DB: 7. CRUD operations
    TestRunner->>DB: 8. Direct database SQL assertions
```

## 🛠️ Setup & Execution Guide

### 1. Prerequisites

Ensure that the Docker daemon (Docker Desktop or Colima) is running and your root-level `.env` file exists (based on `.env.example`).

### 2. Configure Virtual Environment

```bash
cd test
uv venv
source .venv/bin/activate
uv pip install -e .
uv run playwright install --with-deps chromium
```

### 3. Run Tests

* **Run all tests in headless mode:**

  ```bash
  uv run pytest
  ```

* **Run in headed mode (shows the browser UI - useful for debugging):**

  ```bash
  uv run pytest --headed --slowmo 1000
  ```

* **Run tests in parallel (using pytest-xdist):**

  ```bash
  uv run pytest -n 3
  ```

  *Note: The master process coordinates starting the Docker Compose environment exactly once, while worker processes run the tests in isolation using dynamic unique user scopes to prevent database record collisions.*
