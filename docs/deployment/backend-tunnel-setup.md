# Backend & Cloudflare Tunnel Configuration

Instructions for securely connecting the Backend in a K8s cluster (Homelab) to the Internet.

## 1. Cloudflare Tunnel (Remotely Managed)

Using a dashboard-managed tunnel simplifies configuration.

### Steps on Cloudflare One Dashboard:
1.  **Networks > Tunnels**: Create a new tunnel named `uscornie-api`.
2.  **Public Hostname**:
    - Hostname: `api.uscornie.com`
    - Service: `http://uscornie-backend.uscornie.svc.cluster.local:8000` (Use K8s Internal DNS).
3.  **Get Token**: Copy the `TUNNEL_TOKEN` for K8s configuration.

## 2. Deployment in K8s (Homelab)

### Create Secret
```bash
kubectl create namespace cloudflared
kubectl -n cloudflared create secret generic tunnel-token --from-literal=token=<YOUR_TOKEN>
```

### Helm Chart (`cloudflared`)
The deployment uses the `cloudflare/cloudflared` image and runs the `tunnel run` command with the provided token.

## 3. Backend Configuration (CORS)

In `backend/main.py`, update CORS to accept requests from the frontend domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://uscornie.com",
        "https://www.uscornie.com",
        "http://localhost:5173", # Allow local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> [!TIP]
> Use an environment variable like `CORS_ORIGINS` for better flexibility when changing domains.
