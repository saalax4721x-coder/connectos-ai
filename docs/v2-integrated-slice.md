# ConnectOS V2: research to approved outreach

This first application slice composes the existing engines. It does not introduce another planner, graph, ranking engine, agent executor, workflow state machine, or memory store.

## Verified starting point (17 October 2026)

- Research head: `0b777c133150c5fad21dc2c65442ad04ea9708ce`.
- Main head: `51d97e5d765965e5267b1803f7d37f353ff6e66e`.
- Research was 208 commits ahead and 3 behind main. The three main commits add agent routing, policy and guarded execution. Local reconciliation preserves research's execution history/retry improvements and includes main's router; no GitHub PR has been merged.
- All eight workflow runs associated with the research head succeeded, including [Research Verification](https://github.com/saalax4721x-coder/connectos-ai/actions/runs/38940994596).
- Main's [ConnectOS Batch 500 run](https://github.com/saalax4721x-coder/connectos-ai/actions/runs/33264216577) failed in `Generate remaining batch commits`. This is a historical generation-job failure, not evidence that the integrated candidate fails typecheck or tests.
- The PR targets `feature/research-intelligence` to review the integration increment without including the entire 208-commit research history against main. Main reconciliation remains visible in the PR history.

## Application flow

1. The authenticated host resolves authorized target IDs and domain-policy signals. Clients cannot choose the acting user or supply trusted qualification scores.
2. `collectIntelligence` calls the Research engine. Source-backed findings become canonical Opportunity candidates with evidence IDs, timestamps and source provenance. Conflicts and an absence of usable findings block the run.
3. The Opportunities service ingests/deduplicates and qualifies the current run's candidates. The Graph service supplies existing access paths; the integration never invents graph relationships. Memory retrieval uses the authenticated actor's user scope and excludes forgotten items.
4. The existing NEXUS runtime receives typed adapters over this snapshot. Safe planning uses a registered agent through `AgentExecutor`. Completed planning steps and outputs survive approval resume.
5. The Workflow engine pauses before outreach. Review includes exact recipient, opportunity, message body, evidence, access path and idempotency key. The actor can approve or reject; returned views cannot mutate the stored action.
6. Approval revalidates opportunity qualification/expiry and graph consent, completes NEXUS, then invokes the registered `send-message` agent through its existing policy/executor. The external agent gets the fixed `OutreachAction` and must pass the idempotency key to its delivery provider. Uncertain delivery is not automatically retried.
7. Successful delivery produces a workflow-scoped private Memory outcome. Rejection cancels the workflow; delivery failure does not create a successful outcome. NEXUS's own outcome describes its planning steps; Workflow state describes the complete delivery flow.

The service uses process-local sessions and a per-run execution lock. Injected stores preserve their own records, but this implementation does **not** claim crash recovery, distributed locking or cross-process exactly-once delivery.

## Host integration

Import `ConnectOSSlice`, `createSliceHttpHandler` and `createHttpResearchProvider` from `src/integration` in the authenticated server. Supply the existing Graph, Opportunities, Memory, Workflow store, Agent registry and execution store. Configure a read-only planning agent with no executable tools and a separate delivery agent declaring `send-message`.

`createSliceHttpHandler(slice, host)` exposes:

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/v2/targets` | none; returns authorized contact labels without policy scores |
| POST | `/api/v2/runs` | `{ goal, body, targetIds: string[] }` |
| GET | `/api/v2/runs/:id` | none |
| POST | `/api/v2/runs/:id/decision` | `{ decision: "approve" \| "reject" }` |

The host implements `authenticate(request)`, `resolveTargets(actorId, entityIds)` and, for the command center, `listTargets(actorId)`. Authentication must enforce CSRF/session policy for mutations. Target resolution must authorize every ID and obtain qualification signals from trusted domain policy. Keep an instance per server process and mount the handler under the same authenticated application origin. Responses are private to the owner and use `Cache-Control: no-store`.

The optional HTTP research adapter calls an existing research host service with `POST /search` (`{query, limit}`) and `POST /evidence` (`{result}`). Responses are arrays matching the existing `SearchResult` and `ResearchEvidence` types. It validates payloads, evidence entity/source lineage, timestamps and bounded scores; uses an abort deadline; rejects redirects; requires HTTPS except localhost. Credential headers come from a server-side callback. This defines a transport contract, not a claim that a live vendor integration has been configured.

## Verification and release gates

Use Node 22.18+ and the package-manager version declared in `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run test:e2e
pnpm run release:gate
```

`test:e2e` covers the application/service boundary, including a real localhost HTTP research service and authenticated request handler. Real stores and engines execute; research evidence, planning-agent output and delivery receipts are controlled fixtures. `test:browser` adds Chromium coverage of the built command center against this real handler. These are not live-vendor smoke tests. The full release gate includes both test levels.

`ConnectOS Release Gate` runs frozen dependency installation, typecheck, all tests and the production build for every PR and relevant branch push. Dependencies are pinned with a committed pnpm lockfile. Repository administrators must select this check as required in branch protection before claiming a merge is technically enforced. This PR does not deploy or merge anything.

Local verification passed: typecheck, **99 tests across 16 files**, and the Vite production build. This includes 26 integration/HTTP contract cases and four new runtime/workflow regressions alongside the original 69 tests. The localhost HTTP fixture required execution outside the desktop filesystem/network sandbox. Both `main` and `feature/research-intelligence` were verified to have `protected: false`; no repository protection setting was changed.

## Remaining V1/V2 blockers

| Area | Remaining work before production release |
| --- | --- |
| V1 frontend | The command center now uses the authenticated API with browser coverage. Mount the real authenticated host under the deployed application origin; static Vite hosting alone cannot execute runs. See `docs/v2-command-center.md`. |
| V1 identity and tenancy | Supply real authentication, CSRF/session enforcement, authorized target resolution, and tenant-scoped persistent repositories. Caller-supplied actor IDs are not authentication. |
| V1 integrations | Configure live research credentials and a real delivery agent; verify provider receipts and idempotency with a controlled live smoke test. No real messages were sent during verification. |
| V1 release history | Research remains a large unmerged branch relative to main. Review its 208-commit history and replace/repair main's failed batch-generation automation before a mainline release. |
| V2 durability | Persist sessions, exact action approvals, owner bindings and audit events; use transactional claiming/distributed locking; reconcile uncertain delivery after crashes. Process-local replay protection is insufficient across restarts. |
| V2 policy and quality | Calibrate fit/value/timing signals with real datasets, validate graph freshness, establish retention/deletion and consent audit policy, and evaluate vendor/source quality. |
| V2 operations | Add production telemetry, budgets, operational recovery, provider failure monitoring and required branch-protection checks. |

These are release blockers, not hidden fallback engines. Hosts must supply the real services explicitly; the integration does not substitute fabricated production intelligence.
