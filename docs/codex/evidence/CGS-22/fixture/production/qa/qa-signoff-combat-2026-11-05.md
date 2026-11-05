# QA Sign-Off Report: feature combat
**Date**: 2026-11-05
Mechanism: sequential in-session qa-lead reply; not independent review. Coordinator captures this text under the existing fixture-write authorization.

| Story | Type | Auto Test | Manual QA | Result |
|---|---|---|---|---|
| story-001 Damage normalization | Logic | FAIL, actual Node exit1 | Not required | FAIL, actual 15 vs expected 10 |
| story-002 Combat HUD | UI | Not applicable | UNEXECUTED, no build/tester/screenshot | BLOCKED, no executed evidence |

Open bugs: BUG-0003, story-001, S2-High, Open. BUG-0002 is Closed and excluded.
### Verdict: NOT APPROVED
A known unmitigated Logic failure and open S2-High bug require this verdict. The missing UI evidence remains named; it cannot demote a known failure to NOT ASSESSED. Smoke PASS is supplied scenario input, not measured build evidence.
Next: gameplay-programmer fixes BUG-0003 when implementation is authorized, QA reruns tests, UI receives actual screenshot/manual evidence, then re-run $team-qa before advancement. Neither story is marked Done.

Coordinator comparison: reply agrees with the supplied verdict rules. No verdict substituted. This bounded scenario is complete; a full game QA cycle is not claimed.
