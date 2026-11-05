# Coordinating multiple agents

Use independent agents when the active host exposes delegation, the user or invoked workflow authorizes it, and separate perspectives or independent work improve the result. A role file alone does not spawn an agent. This product requires no experimental environment variable or external shared task service.

Good candidates are independent subsystems with disjoint paths, parallel specialist reviews of shared read-only inputs, or long workstreams returning bounded artifacts. Keep dependent work sequential. For a small bounded task, work directly.

Give each agent an objective, input sections, owned paths, non-goals, inherited authorization, expected output, evidence criteria and escalation conditions. Tell writers they share the repository and must preserve others' edits. Collect independent results before dependent work. Surface blocked work immediately and return a partial report when only some tasks complete.

Use the host's actual collaboration API; verify native custom-role loading separately. If delegation or a requested role is unavailable, read its TOML instructions and label an **in-session role review; not independent**. If independence is required, report PENDING. Agents inherit caller permission limits; models and modes never grant authorization.
