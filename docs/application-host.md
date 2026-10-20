# Same-origin Node application host

`createApplicationServer` combines the existing Node transport, authenticated document handler and authenticated Fetch API with a snapshot of the built public assets. It returns an **unbound** Node HTTP server; the owning application chooses the private listening interface, TLS proxy, deployment lifecycle and shutdown policy. No engines, login service or provider fixtures are created by this module.

```ts
import {createApplicationServer} from './src/integration/application-host';
import {createSessionAuthenticator} from './src/integration/session-auth';
import {createSliceHttpHandler} from './src/integration/http-api';

// Existing server-owned session backend and authorized domain services.
const sessionOptions={origin:'https://workspace.example',lookupSession};
const apiHandler=createSliceHttpHandler(slice,{
  authenticate:createSessionAuthenticator(sessionOptions),resolveTargets,listTargets,
});
const server=await createApplicationServer({
  ...sessionOptions,apiHandler,buildDirectory:'/srv/connectos/dist',
});
server.listen(3000,'127.0.0.1');
```

Build first with `pnpm run build`, then load that trusted build directory. Startup requires a regular `index.html` containing the existing CSRF slot and a regular `assets` directory. The loader reads flat asset files with allowed names and JavaScript, CSS, image or font extensions; hidden files, source maps, HTML, subdirectories and symbolic links are excluded. A linked asset directory is rejected. Each asset is limited to 16 MiB and the combined snapshot to 64 MiB. Build directories must be trusted, read-only deployment artifacts; do not concurrently replace files while creating the host. Restart the process to load a new build.

Requests never choose filesystem paths: they can retrieve only exact asset URLs in the startup snapshot. Assets are public, carry explicit MIME types and `nosniff`, and support GET/HEAD plus content-hash ETag revalidation. Their cache policy requires revalidation, so a changed asset does not depend on a filename heuristic. Session cookies are not consulted for public assets. The root HTML remains private/no-store and receives only the current session's validated CSRF token.

`/api/` requests always reach the supplied authenticated API, including its errors; unknown routes never fall back to HTML. `/index.html`, source files, missing assets and unknown document paths return 404. Unsupported asset methods return 405. The shared Node transport pins Host to the configured origin, limits request bytes, sanitizes failures and never retries. Request and header deadlines default to 15 and 10 seconds. Preserve the configured public Host at the TLS proxy; forwarded authority headers are not trusted. Use the same session options for the document host and API guard.

The owning application must handle listen errors, termination and in-flight delivery reconciliation. Node's `server.close()` stops accepting new requests and drains connections; choose an operational deadline before force-closing any remaining connections. Closing a socket does not undo an outreach action. Do not automatically replay uncertain mutations on restart. Session/run durability and distributed claiming are still required before claiming restart-safe execution.

The browser tests now use this host's real routing and asset snapshot instead of Vite preview. Their reset/count/consent routes and controlled providers remain isolated in the test host and are absent from the reusable application host. Real-HTTP tests also verify authority/body limits, while asset tests cover traversal-like paths, private files, linked directories, caching, HEAD, binary bytes and startup failures.

This increment supplies reusable server composition. Production login/session issuance, tenant-scoped repositories, live research/delivery providers, durable approvals, a deployed TLS/process environment and operational controls remain release blockers. It does not start a public deployment or send live messages.
