# Node transport for the existing run API

`createNodeApiListener` mounts the existing `createSliceHttpHandler` Request/Response handler in a Node HTTP server. It adds no planner, engine, authentication system or dependency.

Inside the configured server-side host:

```ts
import {createServer} from 'node:http';
import {createNodeApiListener} from './src/integration/node-http';

// handler is the existing createSliceHttpHandler(slice, host) instance.
const server=createServer({requestTimeout:15000,headersTimeout:10000},
  createNodeApiListener({publicOrigin:'https://workspace.example',handler}));
server.listen(3000,'127.0.0.1');
```

Terminate HTTPS at the existing application proxy and route `/api/` to this private listener. Preserve the configured public Host, Origin, cookies and CSRF headers. The listener pins the Fetch request URL to `publicOrigin`; it does not trust forwarded host/protocol headers. Unexpected/duplicate hosts and absolute or cross-origin request targets are rejected before invoking the application. Non-loopback deployment origins must use HTTPS. This adapter does not create TLS certificates or expose a development fixture as a production server.

Request bodies are buffered up to **256 KiB** by default, enough for the existing API's bounded goal, message and target fields. Both declared lengths and actual chunked byte counts are enforced; limits count UTF-8 bytes. A host may configure `maxRequestBytes` from 1 byte to 16 MiB. Oversized requests return 413, compressed bodies return 415, and malformed transport requests return 400. Configure request/header timeouts on the owning Node server as shown above.

Responses retain their status, headers and separate Set-Cookie values. Response bodies stream through Node's pipeline with backpressure; HEAD responses omit the body. A client disconnect aborts the Fetch request signal. This informs cooperative handlers; it does not promise rollback of an external action that already ran. Unexpected failures return a sanitized 500 before headers are sent, or close an already-started response. The transport never retries a request.

The browser test host uses this same listener for API requests, while keeping test session/research/delivery fixtures separate. Transport tests use real loopback HTTP to verify size limits, authority checks, UTF-8, streaming/binary responses, cookies, HEAD, session/CSRF behavior, sanitized failures and disconnect cancellation.

This increment is only the Node API transport. Production process deployment, static/authenticated HTML hosting and CSRF injection, session issuance, live providers, durable approvals and restart recovery remain separate increments.

Verification: the standard release gate passed typecheck, **148 tests across 19 files**, production build and **11 Chromium cases** with the adapter mounted. No dependencies changed.
