# QA to task-owner handoff
From: qa-tester. To: gameplay-programmer (story-001 named owner).
Owner files: src/damage.mjs, tests/damage.test.mjs, only on a separately authorized implementation step. Current assignment permits acknowledgment/diagnosis only.
Evidence: negative damage heals 10 to 15, assertion exits1. Expected: clamp negative damage to zero and retain positive/lethal cases. BUG-0003 remains Open.
Acceptance for future fix: targeted test passes, add boundary coverage, then QA reruns and verifies closure. QA has not edited implementation. Owner must report receipt and constraints; no external task or message is sent.
