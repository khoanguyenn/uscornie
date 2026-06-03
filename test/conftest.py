import contextlib
import json
import logging
import os
import time
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from testcontainers.compose import DockerCompose

ROOT_DIR = Path(__file__).resolve().parents[1]

COMPOSE_INFO_FILE = Path(__file__).resolve().parent / ".compose_info.json"
_compose_instance = None

logger = logging.getLogger(__name__)


def get_service_url(compose, service, port, protocol="http"):
    host = compose.get_service_host(service, port)
    if host == "0.0.0.0":
        host = "localhost"
    mapped_port = compose.get_service_port(service, port)
    return f"{protocol}://{host}:{mapped_port}"


def pytest_sessionstart(session):
    # Only run on the master process (or when xdist is not active)
    if not hasattr(session.config, "workerinput"):
        logger.info("\n[Master] Starting Docker Compose...")
        global _compose_instance
        _compose_instance = DockerCompose(
            str(ROOT_DIR), compose_file_name="docker-compose.yml"
        )

        # Retry up to 3 times with a delay to handle transient Docker resource conflicts
        for attempt in range(3):
            try:
                _compose_instance.start()
                break
            except Exception as e:
                logger.error(
                    "\n[Master] Attempt %d to start Docker Compose failed: %s",
                    attempt + 1,
                    e,
                )
                if attempt < 2:
                    logger.info("Waiting 3 seconds before retrying...")
                    time.sleep(3)
                else:
                    raise e

        # Wait for the backend and frontend services to be ready
        _compose_instance.wait_for("http://localhost:8000/docs")
        _compose_instance.wait_for("http://localhost:5173")

        frontend_url = get_service_url(_compose_instance, "frontend", 5173)
        backend_url = get_service_url(_compose_instance, "backend", 8000)

        # Database configuration
        db_host = _compose_instance.get_service_host("db", 5432)
        if db_host == "0.0.0.0":
            db_host = "localhost"
        db_port = _compose_instance.get_service_port("db", 5432)
        db_user = os.environ.get("POSTGRES_USER", "postgres")
        db_password = os.environ.get("POSTGRES_PASSWORD", "postgres")
        db_name = os.environ.get("POSTGRES_DB", "uscornie")
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

        info = {
            "FRONTEND_URL": frontend_url,
            "BACKEND_URL": backend_url,
            "TEST_DATABASE_URL": db_url,
        }

        # Import models package to register all schema metadata dynamically
        import models

        engine = create_engine(db_url)
        models.Base.metadata.create_all(bind=engine)

        with COMPOSE_INFO_FILE.open("w") as f:
            json.dump(info, f)

        # Brief sleep to make sure everything settles
        time.sleep(2)
        logger.info("[Master] Docker Compose started. Environment: %s", info)


def pytest_sessionfinish(session, exitstatus):
    # Only run on the master process (or when xdist is not active)
    if not hasattr(session.config, "workerinput"):
        logger.info("\n[Master] Stopping Docker Compose...")
        global _compose_instance
        if _compose_instance:
            # Only dump container logs to stdout if the test suite failed
            if exitstatus != 0:
                with contextlib.suppress(Exception):
                    stdout, stderr = _compose_instance.get_logs()
                    logger.info("\n=== DOCKER COMPOSE LOGS STDOUT ===")
                    logger.info(stdout)
                    logger.info("\n=== DOCKER COMPOSE LOGS STDERR ===")
                    logger.info(stderr)
            _compose_instance.stop()

        if COMPOSE_INFO_FILE.exists():
            with contextlib.suppress(OSError):
                COMPOSE_INFO_FILE.unlink()


@pytest.fixture(scope="session", autouse=True)
def compose_env():
    # Wait for the file to be written by master process (up to 30 seconds)
    for _ in range(30):
        if COMPOSE_INFO_FILE.exists():
            break
        time.sleep(1)

    if not COMPOSE_INFO_FILE.exists():
        raise RuntimeError(
            "Docker Compose configuration not found. Master session might have failed to start."
        )

    with COMPOSE_INFO_FILE.open() as f:
        info = json.load(f)

    os.environ["FRONTEND_URL"] = info["FRONTEND_URL"]
    os.environ["BACKEND_URL"] = info["BACKEND_URL"]
    os.environ["TEST_DATABASE_URL"] = info["TEST_DATABASE_URL"]

    return info


@pytest.fixture
def db_session(compose_env):
    db_url = os.environ["TEST_DATABASE_URL"]
    engine = create_engine(db_url)

    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
