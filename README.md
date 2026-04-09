# Uscornie

Uscornie is a full-stack web application that allows couples to create private, shared digital "Spaces". Users can easily log in with their Google accounts, create a dedicated space, and invite their partner to join them securely using a unique invitation link.

## ✨ Features

- **Google Authentication:** Seamless and secure sign-in using Google accounts.
- **Space Management:** Create a private digital space tailored specifically for two people.
- **Invitation System:** Generate secure, single-use invite links to add a partner to your Space.
- **Couple Limit:** Automatically enforces a maximum of two members per Space, ensuring it remains an exclusive environment.

## 🛠️ Tech Stack

This project is structured as a modern full-stack application and relies on the following technologies:

- **Frontend:** [Vue 3](https://vuejs.org/) (Composition API), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), Vue Router, and Axios.
- **Backend:** Python 3, [FastAPI](https://fastapi.tiangolo.com/), SQLAlchemy (ORM).
- **Database:** [PostgreSQL](https://www.postgresql.org/) for robust data persistence.
- **Infrastructure:** Docker and Docker Compose to containerize and spin up the complete environment easily.

## 🚀 Getting Started

The easiest way to run the entire application stack (Frontend, Backend, and Database) locally is by using Docker Compose.

### Requirements
- Docker and Docker Compose installed on your machine.
- Google OAuth credentials (set up in a `.env` file).

### Running Locally

1. **Configure Environment Variables:**
   Make sure your `.env` file at the root of the project contains the necessary configuration for the database and Google Auth (e.g., `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).

2. **Start the containers:**
   Open your terminal in the project's root directory and run:
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend UI:** Open your browser and navigate to `http://localhost:5173`.
   - **Backend API Docs:** Explore the Swagger API documentation at `http://localhost:8000/docs`.

## 📂 Project Structure

- `/frontend` - Contains the Vue.js SPA application.
  - `src/HomePage.vue` - Main dashboard and entry point.
  - `src/JoinPage.vue` - Handles onboarding for users joining via an invitation link.
- `/backend` - Contains the FastAPI backend application.
  - `main.py` - Core REST endpoint definitions.
  - `models.py` - Database schema models.
  - `auth_utils.py` - Handling of JWT generation and Google token validation.
- `docker-compose.yml` - Orchestration configuration to run Postgres, the backend API, and the frontend server.
