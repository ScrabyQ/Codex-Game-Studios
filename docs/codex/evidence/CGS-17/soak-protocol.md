# 30-minute soak protocol — fixture only

**Status: NOT ASSESSED — protocol only; no soak was run.**

Target: a user-selected runnable build and actual observer, both still PENDING. Capture real memory and frame-time metrics at each checkpoint and record build/version and test conditions.

| Checkpoint | Required observation | Actual |
|---|---|---|
| T+0 | Baseline memory and frame time | NOT RUN |
| T+10 | Repeat metrics and note stability | NOT RUN |
| T+20 | Repeat metrics and note stability | NOT RUN |
| T+30 | Final metrics and compare against baseline | NOT RUN |

A run that ends before its requested duration does not establish stability. Missing instrumentation is NOT ASSESSED. A genuinely observed crash or breach remains a failure; it is not downgraded because the soak was short.
