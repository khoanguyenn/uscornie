
- **[infra]** enable CiliumNetworkPolicy by default in Helm chart
- **[backend]** upgrade join space logic and resolve type checking diagnostics in test suites
- **[backend]** refactor get_invite_status and join_space to reduce McCabe complexity and remove C901 ignores
- **[frontend]** clean up redundant services and store actions
- **[backend]** Upgrade user agent parsing to user-agents library, store device info as JSON, and recover client IP via Cloudflare Tunnel headers
- **[backend]** remove quick add bulk import endpoint and repository service
- **[backend]** secure container and restrict network egress using multi-stage builds and CiliumNetworkPolicy
- **[frontend]** add build-time environment variable validation in next.config.ts
- **[frontend]** Refactor Zustand stores to client-side only RAM state and resolve react-doctor warnings
- **[frontend]** Split long frontend files (mock data, Ghibli SVG icons, NavBar dropdowns, and page sub-components) into modular files.
- **[frontend]** Refactor frontend to fix authentication access token issue, standardize URL search params retrieval, align state with architecture guidelines, and optimize performance.
- **[frontend]** remove quick add bulk import UI component and validations
- **[test]** implement parallel E2E testing framework, authenticated CRUD items flows, and multi-user collaboration validation using Playwright and Testcontainers Docker Compose

- **[ci]** add google client id to frontend build in release workflow

- **[frontend]** implement TanStack Query sync for Save page items with backend database
- **[infra]** add changie fragment validation to pre-push git hook
- **[infra]** allow release-tag.yml to use GH_PAT to trigger deploy workflow
- **[tooling]** enforce minimum react-doctor score threshold in pre-commit git hooks
- **[tooling]** add local Antigravity settings and permission restrictions
- **[docs]** translate release diagram in contributing guide to english
- **[infra]** add versionExt configuration to changie config
- **[infra]** fix frontend build path in release workflow
- **[infra]** restore versions in package files and seed changie v0.1.7 history
- **[infra]** add versionExt configuration to changie config
- **[backend]** release version v0.1.7
