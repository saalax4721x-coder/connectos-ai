# ConnectOS AI — V1 release gates

Status: **NOT RELEASE READY** (2026-10-16). This is an evidence-based checklist, not a declaration of completion.

## Verified on research branch

- Commit `20733e1554e6438e29e233606ee27dc67ad3c791`: seven GitHub Actions workflows passed: Research, Context, Intent, Memory, Agents, Workflow, Autopilot.
- Research PR #10 is open and targets `feature/context-intelligence`, not `main`.
- The current web entry point is `src/main.tsx` -> `NexusCommandCenter`, a goal-planning screen. A working NEXUS planning UI does not prove a complete customer product.

## Blocking release gates

- [ ] Review and integrate the stacked PRs #1–#10 into a single V1 release candidate, with explicit approval before any merge. Check base branches and integration conflicts.
- [ ] Verify real end-to-end flows across Intent -> Context -> Research -> Opportunity -> Graph -> Agents -> Workflow -> Memory -> Autopilot -> NEXUS; isolated tests are not sufficient.
- [ ] Implement and verify real user authentication, sessions, authorization and user-data isolation. The README lists authentication as roadmap work; do not infer it exists from types or stubs.
- [ ] Audit persistence for every user-visible stateful feature; prove restart and concurrency behavior. In-memory boundaries alone do not meet V1 durability requirements.
- [ ] Wire actual providers and enforce consent, approval, rate limits, audit trails and idempotency for external side effects. Never show mock search results as real.
- [ ] Deliver usable onboarding, dashboard, error/empty/loading states, accessibility and mobile browser journeys.
- [ ] Configure production environment, secrets, deployment, monitoring, backup/restore and incident recovery; verify on a staging deployment.
- [ ] Add automated browser E2E and cross-department integration tests and make them required in CI, alongside tests, typecheck and build.
- [ ] Pin/review dependency versions, run security and privacy review, verify data deletion/export and document operational runbooks.
- [ ] Run a release-candidate smoke test against the deployed artifact and record pass/fail evidence.

## Release policy

No PR merges, production deploys, or V1-ready claims without explicit approval and verified evidence. NEXUS remains canonical; avoid duplicate orchestration layers. Distinguish documented interfaces and placeholder contracts from working integrations.
