# V2 command center: browser to approved execution

This increment builds on the application slice in PR #11. The shipped React command center now calls the existing authenticated API rather than constructing a local planning runtime. The canonical server engines remain the source of run state, research, policy and execution.

## User flow

1. Load authorized contacts from `GET /api/v2/targets`.
2. Enter a goal, select contacts by their workspace labels, and write the proposed outreach message.
3. Start research with `POST /api/v2/runs`. The browser supplies only the goal, message and target IDs; identity, authorization and qualification signals remain server-side.
4. Review findings, source references, access eligibility, exact recipient/message and workflow state.
5. Approve and send, or reject the action. No decision is automatic. Buttons lock immediately during a request, including multiple synchronous clicks.
6. Read the server's completed/cancelled/failed outcome. The run ID is retained in the page URL so a reload can retrieve an existing pending or completed run without starting it again.

The browser never retries a mutation automatically. After an interrupted decision response it disables further decisions until a successful status refresh. This handles a lost response after delivery without blindly sending again. If the run itself is failed after an uncertain provider delivery, the UI tells the user to reconcile that delivery with the workspace before creating another run.

Visible labels, native form controls, status/error announcements, keyboard approval, focus outlines and responsive layout cover the primary interaction. Missing sessions, unavailable services and absent contacts have explicit states; a static host's HTML fallback is not mistaken for a successful API result.

## Host requirements

Mount `createSliceHttpHandler` on the authenticated application origin. In addition to the existing `authenticate` and `resolveTargets` callbacks, implement `listTargets(actorId)` to return authorized domain targets. The API exposes only `{id, title, type}` to the browser; scoring policy stays on the host. A missing callback returns 503 rather than a fabricated contact list.

The browser sends same-origin session credentials. For hosts using synchronizer CSRF tokens, inject the current token into `<meta name="csrf-token" content="…">` in authenticated HTML. Mutating requests send that value as `X-CSRF-Token`. The host must still validate session and CSRF policy on every mutation. No provider secrets, actor impersonation fields or qualification scores are configured in the browser.

Static `pnpm dev` / `pnpm preview` alone has no production authentication or API backend. It will show a visible service-unavailable state. This increment supplies browser wiring and a reusable handler; it does not invent production credentials or select an identity vendor.

## Repeatable verification

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run release:gate
```

The release gate runs typecheck, Vitest's complete unit/service suite, the production build, and Chromium against that build. CI installs Chromium plus its Linux system dependencies. `vitest.config.ts` and `playwright.config.ts` keep the two test runners separate. Only esbuild's required native setup script is allowed by the package-manager build policy.

`tests/browser/server.ts` is a **test-only loopback host**, not a deployment server. It mounts the actual API handler, canonical services/stores and built UI, with controlled research and delivery fixtures. Its test session/CSRF values, reset/counter routes and delivery receipts are never imported into the application bundle. No live external messages are sent. Playwright owns this host's lifecycle.

Browser cases cover approval and Memory completion, rejection, pending/completed reload, session recovery, another actor reopening a run, unavailable service, lost decision response, duplicate clicks, consent revocation and a narrow viewport. Failure artifacts contain screenshots/traces for diagnosis; successful desktop/mobile review screenshots are also saved under the ignored `test-results` directory.

Local results: typecheck passed, **108 unit/service tests across 17 files passed**, the production build passed, and **all 10 Chromium cases passed**. The first browser runs encountered Windows resource failures; the final complete browser run exited successfully. The test-host launch now avoids an extra package-manager process, and the browser suite has an overall three-minute timeout.

## Remaining production blockers

- Mount a real authenticated host with tenant-scoped storage, CSRF enforcement and authorized contact discovery.
- Configure and smoke-test live research and delivery providers; pass the stable action idempotency key through to the delivery provider.
- Persist sessions, actor bindings and exact action approvals; implement distributed claiming, restart recovery and reconciliation of uncertain delivery.
- Calibrate domain policy and graph freshness, add operations/budgets/telemetry, and require the release check through branch protection.
- Review the research branch's outstanding history before a mainline release. Neither PR #11 nor this follow-up is authorized to merge.
