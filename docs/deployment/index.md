# Uscornie Deployment Documentation

Welcome to the Uscornie deployment guide. This system is designed to run the Frontend on Cloudflare Pages and the Backend within a Homelab infrastructure (Talos K8s) via Cloudflare Tunnel.

## Table of Contents

1.  [Architecture Overview](architecture.md) - Diagrams and data flow.
2.  [Frontend Configuration](frontend-setup.md) - Cloudflare Pages setup and Vue source code.
3.  [Backend & Tunnel Configuration](backend-tunnel-setup.md) - Connecting Homelab to the Internet via Cloudflare Tunnel.
4.  [CI/CD Pipeline](cicd-pipeline.md) - Automated deployment with GitHub Actions.

## Execution Plan (Incremental Tasks)

The deployment is divided into small, manageable steps:
- **Task 1-3**: Update Frontend code, Backend CORS, and GitHub Workflows (AI-led).
- **Task 4**: Setup Cloudflare Pages Project & GitHub Secrets (User-led).
- **Task 5**: Create Tunnel on Dashboard & K8s Secret (User-led).
- **Task 6**: Create Helm Chart for Cloudflared (AI-led).
- **Task 7**: Deploy Cloudflared to Cluster (User-led).
