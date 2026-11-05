# Clean-install guard regression

The first real remote clone of documentation commit `1229523688c31643d38fc403daf55b8ecded5518` exposed an adapter false positive: the exact README command `git remote set-url --push upstream DISABLED` was classified as an upstream push. The blocked command was not executed. Its failure remains in the clean-install receipt.

The correction exempts only this complete remote-configuration command (including exact quoted `DISABLED` arguments) from the two push classifiers. It grants no general shell exemption. Secret, binary-asset, destructive-command and force-push checks remain in effect. A chain containing a real upstream push and a configuration assigning the actual Donchitos URL are still denied.

Actual Windows checks: `node scripts/codex/tests/policy.mjs` exit 0; `node scripts/codex/hook-tests.mjs` exit 0, all 18 cases PASS, adapter SHA256 `4debea0208e2c02558bf630f3e4685554184030f85cce80d71f5c2f59511975e`. The existing staged-JSON/push fixture now checks the exact safe configuration with real origin/upstream remotes and separately denies a chained push. Only init, add and remote configuration are executed in that fixture; no commit or push is executed. The updated [hook report](../CGS-24/checks.json) and [declaration mapping](../CGS-24/parity.json) retain actual results. Native hook activation remains PENDING.

A fresh published-clone retry of the README step is still required before CGS-30 acceptance; its receipt will identify the corrected commit.
