# Requirements Traceability

Scope: health and save requirements in this synthetic fixture. Registry mutation explicitly authorized in fixture-inputs.json. Existing health IDs are preserved; retired TR-health-002 remains retired. TR-save-001 was the next helper-observed save ID, promoted from the architecture's provisional ID.

| Requirement | GDD source | Governing ADR | Coverage | Story/test evidence |
|---|---|---|---|---|
| TR-health-001 | design/gdd/health.md | ADR-0001 Accepted | Covered | No test execution supplied; implementation verification NOT ASSESSED |
| TR-save-001 | design/gdd/save.md | ADR-0003 Accepted | Covered | story-001 still cites superseded ADR-0002: blocked, not end-to-end covered; no test exists |
| TR-health-002 | registry historical requirement | None current | Deprecated; excluded from active denominator | Retained for history |

Active denominator: 2 explicit requirements, both linked to Accepted ADRs. This is design coverage, not proof of implementation. At the earlier Proposed snapshot TR-save-001 was Covered (Proposed), not Accepted coverage. Missing tests are unknown execution, never passing tests.
