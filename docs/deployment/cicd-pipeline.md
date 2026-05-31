# CI/CD Pipeline with GitHub Actions

Automating the deployment of Frontend and Backend.

## 1. Deploy Frontend

Create `.github/workflows/deploy-frontend.yml` to automatically build and deploy to Cloudflare Pages whenever changes are pushed to the `frontend/` directory.

### Required GitHub Secrets

- `CLOUDFLARE_API_TOKEN`: Token with "Edit Cloudflare Pages" permissions.
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID.

### Workflow Summary

1. Checkout code.
2. Install dependencies (`npm ci`).
3. Build project (`npm run build`).
4. Use `cloudflare/wrangler-action` to deploy the `dist` directory.

## 2. Deploy Backend

The backend is currently packaged as a Docker image via GitHub Actions and pushed to GitHub Container Registry (GHCR).

### Process

1. Push a version tag (e.g., `v0.1.7`).
2. Workflow automatically builds and pushes the image.
3. Update the Helm chart in the `homelab` repository (or `uscornie/infra`) for ArgoCD to automatically sync to the cluster.
