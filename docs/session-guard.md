# Host session validation and CSRF guard

This focused increment provides `createSessionAuthenticator` for the existing `SliceHttpHost.authenticate` hook. It delegates session lookup to the host's existing authentication backend; it does not implement another login engine or session database.

Configure the public HTTPS application origin and `lookupSession(tokenHash)`. The adapter reads one opaque session cookie, hashes it with SHA-256, and resolves `{ actorId, expiresAt, csrfToken, revoked? }` from the host. Every request rechecks expiry/revocation. Use a tenant-scoped server actor ID; identity never comes from request JSON or headers naming a user.

The default cookie name is `__Host-connectos-session`. The existing login service must generate cryptographically random session/CSRF tokens (for example, 32 random bytes encoded as base64url), persist the session-token digest, and issue the cookie with `Secure; HttpOnly; SameSite=Lax; Path=/` and no `Domain`. Rotate/invalidate sessions through that service. No raw session token is passed to the lookup port. Token strings must be 32–256 base64url characters. Keep provider credentials and session records out of browser responses.

For mutations, the guard requires the configured request origin, an exact matching `Origin`, JSON content type, and the session's `X-CSRF-Token`. If Fetch Metadata is present, it must indicate `same-origin`. CSRF token digests use Node's timing-safe comparison. Inject the current synchronizer token into authenticated HTML using the existing command-center meta tag. The adapter does not trust forwarded host headers; reverse proxies must construct requests using the configured public origin.

Missing, malformed, expired or revoked sessions return 401. Rejected request origin/CSRF checks return 403. Authentication-backend outages return a sanitized 503 with `Cache-Control: no-store`, without entering Research or execution. The guard is server-only and uses Node's crypto library. Loopback HTTP is allowed for development/tests; arbitrary HTTP deployment origins are rejected.

The browser test host now uses this same adapter over its controlled session fixtures. Tests cover opaque lookup, expiry/revocation, duplicate cookies, cross-origin requests, forged/missing CSRF, invalid content types, session-backend outages and a forged-token browser approval attempt. No real accounts or messages are used.

This is one part of host authentication. Production login/session issuance, tenant authorization, a mounted server, durable execution/approval storage, live providers and branch protection remain separate work.

Verified locally: the complete release gate passed typecheck, **131 unit/service tests**, production build and **11 browser tests**. This change adds no dependencies and does not alter the canonical execution engines.

The checks follow the [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) and [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
