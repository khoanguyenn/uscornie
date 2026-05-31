# Uscornie Backend Helm Chart

This Helm chart deploys the FastAPI backend application for Uscornie alongside a CloudNativePG PostgreSQL database cluster.

## Requirements

* Kubernetes 1.22+
* Helm 3.0+
* **CloudNativePG Operator** installed in the cluster (to provision the database)
* Kubernetes secret `uscornie-secrets` containing:
  * `GOOGLE_CLIENT_ID`
  * `GOOGLE_CLIENT_SECRET`
  * `JWT_SECRET`

## Installation

### Standard Helm Deployment

To install or upgrade the chart directly:

```bash
helm upgrade --install uscornie-backend ./infra/charts/backend \
  --namespace uscornie \
  --set argoCD=false
```

### ArgoCD Deployment

If deploying via ArgoCD, configure the `argoCD` value to `true` to ensure resources and hooks align with ArgoCD sync lifecycles:

```yaml
# In your application values override
argoCD: true
```

## Values Configuration

The following table lists the configurable parameters of the chart and their default values:

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `image.repository` | Docker image repository | `ghcr.io/khoanguyenn/uscornie-backend` |
| `image.tag` | Docker image tag | `v0.1.4` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Kubernetes Service type | `ClusterIP` |
| `service.port` | Service port | `8000` |
| `postgres.instances` | CloudNativePG replica count | `1` |
| `postgres.storageSize` | Persistent storage size for database | `5Gi` |
| `migration.enabled` | Enable automatic database migrations | `true` |
| `argoCD` | Set to true when deploying with ArgoCD | `false` |
