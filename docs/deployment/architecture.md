# Deployment Architecture

This document describes the system architecture for deploying the Frontend on Cloudflare Pages and connecting to the Backend in a Homelab via Cloudflare Tunnel.

## Architecture Diagram

```mermaid
graph LR
    subgraph Cloudflare
        DNS["uscornie.com<br/>(Cloudflare DNS)"]
        CFPages["Cloudflare Pages<br/>Frontend (Vue SPA)"]
        CFEdge["api.uscornie.com<br/>(Cloudflare Edge)"]
    end

    subgraph "Talos K8s Cluster (Homelab, Private IP)"
        subgraph "ns: cloudflared"
            CFD["cloudflared Pod<br/>(homelab repo)"]
        end
        subgraph "ns: uscornie"
            SVC["Service<br/>uscornie-backend<br/>ClusterIP :8000"]
            POD["Pod<br/>uscornie-backend"]
            DB["CloudNativePG"]
        end
    end

    User -->|"uscornie.com"| DNS
    DNS --> CFPages
    CFPages -->|"fetch API"| CFEdge
    CFEdge -->|"Tunnel (outbound)"| CFD
    CFD -->|"http://uscornie-backend<br/>.uscornie.svc.cluster.local:8000"| SVC
    SVC --> POD
    POD --> DB
```

## Workflow

1.  **Frontend Access**: User accesses `uscornie.com` -> Cloudflare Pages serves the static SPA (Vue).
2.  **API Call**: Frontend calls the API at `https://api.uscornie.com/`.
3.  **Tunnel Routing**: `api.uscornie.com` is routed through **Cloudflare Tunnel** (no public ports or IPs required).
4.  **Homelab Processing**: `cloudflared` Pod receives the request -> forwards it to the **K8s Service** `uscornie-backend` (ClusterIP).
5.  **Backend Execution**: The Service load-balances to backend Pods. Backend accesses the **CloudNativePG** database.

## Responsibility Matrix

- **Repository `uscornie`**: Contains frontend/backend source code, CI/CD configuration, and K8s manifests for the application.
- **Repository `homelab`**: Contains infrastructure configuration such as Cloudflare Tunnel (`cloudflared`) and helmfile for managing releases.
