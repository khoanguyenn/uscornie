# Frontend Configuration on Cloudflare Pages

This document provides instructions on how to set up the Vue.js Frontend to run optimally on Cloudflare Pages.

## 1. Cloudflare Dashboard Setup

1.  **Create a project**: Connect your GitHub repo `khoanguyenn/uscornie`.
2.  **Build Settings**:
    - **Framework preset**: `Vue (Vite)`
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
    - **Root directory**: `frontend`
3.  **Environment Variables**:
    - Add `VITE_API_URL=https://api.uscornie.com` (Use the `VITE_` prefix so Vite can access it).
    - Add `VITE_GOOGLE_CLIENT_ID` (If you need to override the default value).
4.  **Custom Domains**: Add `uscornie.com` and `www.uscornie.com`.

## 2. Source Code Configuration (Vite)

### SPA Routing Fallback
To prevent 404 errors when users refresh the page on sub-URLs (e.g., `/join`), the file `frontend/public/_redirects` is required:
```text
/*    /index.html   200
```

### Centralized API Client
Create `frontend/src/api.js` to automatically switch URLs between Dev and Prod environments:
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export default api;
```

## 3. Deployment via CLI (Wrangler)
To initialize quickly via command line:
```bash
npx wrangler pages project create uscornie --production-branch main
```
