# Authenticated command-center document

`createAuthenticatedDocumentHandler` serves the trusted built application's root HTML using the same opaque session backend as the API. It adds no login service, session database or execution engine. `createSessionResolver` now holds the shared origin, cookie, expiry, revocation and token validation; `createSessionAuthenticator` retains the API's existing Fetch Metadata, Origin, JSON and synchronizer-token checks.

```ts
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {createAuthenticatedDocumentHandler} from './src/integration/authenticated-document';
import {createNodeApiListener} from './src/integration/node-http';

// sessionOptions is the same host-owned origin/lookupSession configuration used by the API.
const document=createAuthenticatedDocumentHandler({
  ...sessionOptions,html:await readFile('dist/index.html','utf8'),
});
// api is the existing createSliceHttpHandler instance with authorized domain services.
const handler=(request:Request)=>new URL(request.url).pathname.startsWith('/api/')?
  api(request):document(request);
createServer({requestTimeout:15000,headersTimeout:10000},
  createNodeApiListener({publicOrigin:sessionOptions.origin,handler})).listen(3000,'127.0.0.1');
```

The built `index.html` must contain exactly one `<!-- connectos:csrf -->` slot. The handler replaces it with the current validated session's CSRF meta tag for each response. It never caches a rendered document or takes identity/token values from URL parameters. Only the synchronizer token goes into HTML; the raw cookie token, actor ID and session record stay on the server. Tokens are restricted to base64url before insertion into a quoted attribute. Templates are trusted application code, never user uploads.

Only GET and HEAD at `/` are served; query parameters such as an existing run ID remain usable by the browser. HEAD has no body. Missing/invalid/expired/revoked sessions return 401 without the application HTML; sign in through the host's login service, then reload. Origin mismatch returns 403 and backend outages return a sanitized 503. Unsupported methods return 405 and other document paths return 404. Every response is private and `no-store`, varies on Cookie, and includes MIME, referrer and frame-embedding protections. These headers do not constitute a full script CSP or a deployment security policy.

Top-level browser navigation may arrive with `Sec-Fetch-Site: none` or `cross-site`, so this read-only document endpoint permits those values. Cookie SameSite policy and browser same-origin isolation still apply. API requests continue to require same-origin Fetch Metadata when present; mutations additionally require matching Origin, JSON and CSRF. The shared resolver only resolves a session and must not be used alone to authorize mutations.

Route `/` to this handler and `/api/` to the existing API on the same configured origin. Serve only the public built `/assets/` files through the host's static server. Disable SPA/index fallback for `/index.html`, unknown paths and `/api/`; otherwise the static server can bypass the authenticated document route. Do not publicly serve a rendered HTML response, source tree, session store or test host. Login/session issuance, TLS/proxy deployment and tenant-authorized repositories remain host responsibilities.

The browser fixture mounts this adapter through the real Node listener, using separate per-actor CSRF tokens. Tests verify document/API token handoff, non-cacheable session isolation, safe navigation, invalid sessions, unsupported routing/methods, HEAD and sanitized failures alongside the complete approval flow. Fixtures do not send live messages.

Remaining production work: login/session issuance and deployed hosting, live research/delivery providers, persistent approvals and distributed recovery, policy calibration, operations and required release checks. This increment does not claim a deployed service or restart-safe execution.
