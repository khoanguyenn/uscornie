# Authentication & Authorization System

This module handles multi-session authentication, token rotation, and Role-Based Access Control (RBAC).

## 1. Authentication Flow

The backend uses a hybrid architecture combining stateless JWTs (Access Tokens) for API authorization and stateful Database sessions (Refresh Tokens) stored in HttpOnly cookies for session management.

### Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Frontend (Next.js)
    participant Google as Google OAuth API
    participant Backend as Backend (FastAPI)
    participant DB as Database (SQLite/PostgreSQL)

    %% Google OAuth Login
    Note over User, Backend: 1. Google Login Flow
    User->>Client: Click "Sign in with Google"
    Client->>Google: Authenticate user
    Google-->>Client: Return Google ID Token
    Client->>Backend: POST /auth/google {"credential": "id_token"}
    Backend->>Google: Verify ID Token signature and audience
    Google-->>Backend: Token valid + User Profile (email, name, picture)

    Backend->>DB: Query/Create User & Create new UserSession
    DB-->>Backend: Session created (Session ID)
    Backend->>Backend: Generate short-lived Access Token (JWT - 15 mins)
    Backend-->>Client: Return Access Token (JSON) + Set refresh_token cookie (HttpOnly = Session ID)

    %% Protected API Call
    Note over User, Backend: 2. Regular API Request Flow
    Client->>Backend: GET /spaces (Header: Authorization: Bearer <Access Token>)
    Backend->>Backend: Verify JWT signature (Stateless, no DB query)
    Backend-->>Client: Return Spaces (200 OK)

    %% Token Refresh
    Note over User, Backend: 3. Token Refresh Flow (When Access Token Expires)
    Client->>Backend: GET /spaces (With expired Access Token)
    Backend-->>Client: Return 401 Unauthorized (Expired token)

    Client->>Backend: POST /auth/refresh (Browser attaches refresh_token cookie automatically)
    Backend->>DB: Validate Session ID & Rotate (Deactivate old, create child session)
    DB-->>Backend: Updated (New Session ID)
    Backend->>Backend: Generate new Access Token (JWT)
    Backend-->>Client: Return new Access Token (JSON) + Set new refresh_token cookie

    Client->>Backend: Retry GET /spaces (With new Access Token)
    Backend-->>Client: Return Spaces (200 OK)
```

---

## 2. Token Rotation & Replay Attack Protection

To prevent session hijacking via stolen tokens, the system implements **Refresh Token Rotation (RTR)**. Every refresh request invalidates the old token and issues a new one.

If an attacker uses an already-rotated (inactive) token, the system detects a **Replay Attack** and triggers **Family Revocation**, immediately terminating all active sessions for that user.

### Decision Flowchart

```mermaid
graph TD
    A[POST /auth/refresh with Token A] --> B{Is Token A active?}

    B -- Yes --> C[Rotate Session]
    C --> C1[Set Token A is_active = False]
    C1 --> C2[Create Token B with parent_id = Token A]
    C2 --> C3[Return Access Token + Set Token B cookie]

    B -- No --> D{Has Token A already been refreshed?}

    D -- Yes --> E[Replay Attack Detected!]
    E --> E1[Revoke all active sessions for User<br>Family Revocation]
    E1 --> E2[Return 401 SESSION_REUSED]

    D -- No --> F[Normal expired or logged out session]
    F --> F1[Return 401 SESSION_INVALID / SESSION_EXPIRED]
```

### Explanations

1. **Successful Rotation**: When a legitimate client refreshes Token A, it becomes inactive, and Token B is generated linked to Token A.
2. **Replay Attack Detection**: If Token A is submitted again, the backend checks if a descendant session (Token B) already exists. If yes, a replay attack has occurred.
3. **Family Revocation**: To protect the user, all active sessions belonging to the compromised user are deactivated in the Database. Both the legitimate user and the attacker are immediately logged out, forcing a clean re-authentication.

### Replay Attack Race Condition Scenarios

Consider a scenario where Token A is compromised (intercepted or stolen):

#### Scenario 1: The legitimate user refreshes first

```mermaid
sequenceDiagram
    autonumber
    actor User as Legitimate User
    actor Attacker
    participant Backend as Backend
    participant DB as Database

    %% User Refreshes
    User->>Backend: POST /auth/refresh (Cookie: refresh_token = Token A)
    Backend->>DB: Set Token A is_active = False, Create Token B (parent_id = A)
    DB-->>Backend: Confirmed
    Backend-->>User: Return Token B

    %% Attacker Attempts Replay
    Attacker->>Backend: POST /auth/refresh (Cookie: refresh_token = Token A)
    Backend->>DB: Check Token A status (Inactive, parent_id A exists in child B)
    Note over Backend, DB: Replay Detected!
    Backend->>DB: Deactivate all user sessions (Revokes Token B)
    DB-->>Backend: Confirmed
    Backend-->>Attacker: Return 401 SESSION_REUSED
    Note over User, Attacker: Both parties logged out!
```

#### Scenario 2: The attacker refreshes first

```mermaid
sequenceDiagram
    autonumber
    actor User as Legitimate User
    actor Attacker
    participant Backend as Backend
    participant DB as Database

    %% Attacker Refreshes First
    Attacker->>Backend: POST /auth/refresh (Cookie: refresh_token = Token A)
    Backend->>DB: Set Token A is_active = False, Create Token B (parent_id = A)
    DB-->>Backend: Confirmed
    Backend-->>Attacker: Return Token B

    %% Legitimate User Attempts Refresh
    User->>Backend: POST /auth/refresh (Cookie: refresh_token = Token A)
    Backend->>DB: Check Token A status (Inactive, parent_id A exists in child B)
    Note over Backend, DB: Replay Detected!
    Backend->>DB: Deactivate all user sessions (Revokes Token B)
    DB-->>Backend: Confirmed
    Backend-->>User: Return 401 SESSION_REUSED
    Note over User, Attacker: Both parties logged out!
```
