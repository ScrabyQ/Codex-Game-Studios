# $setup-engine — Section 12: Output Summary

Report the actual project settings, pinned references, scaffold and verification results. Name unperformed checks as NOT ASSESSED and recommend, but do not invoke, the next skill.


> Part of `$setup-engine`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## 12. Output Summary

After setup is complete, output:

```
Engine Setup Complete
=====================
Engine:          [name] [version]
Language:        [GDScript | C# | GDScript + C# | C# | C++ + Blueprint | Blueprint + C++]
Knowledge Risk:  [LOW/MEDIUM/HIGH]
Reference Docs:  [created/skipped]
Selected reference: [verified/not checked]
Legacy fallback: [checked/not applicable/not checked]
project.yaml:    [created/updated]
Specialist routing: [verified/not assessed]

Next Steps:
1. Review docs/engine-reference/<engine>/VERSION.md
```

Then print **one** Next-Steps list, matching the resolved `workflow` tier:

**`minimal` — the lean 4-step floor (you are on step 1):**
```
2. Run $brainstorm to produce your one-page design/game-brief.md (the lean-tier design artifact)
3. Run $create-stories to turn the brief's MVP list into stories
4. Run $dev-story — first line of game code
```
(No `$map-systems`, `$design-system`, `$prototype`, or `$sprint-plan` at
`minimal` — the brief replaces the GDDs and its build order is the plan.)

**`standard` / `full` — the full pipeline:**
```
2. [If from $brainstorm] Run $map-systems to decompose your concept into individual systems
3. [If from $brainstorm] Run $design-system to author per-system GDDs (guided, section-by-section)
4. [If from $brainstorm] Run $prototype [core-mechanic] to validate the core idea before writing GDDs
5. [If fresh start] Run $brainstorm to discover your game concept
6. Create your first milestone: $sprint-plan new
```

---

Verdict: **COMPLETE** only when required configuration and reference work actually completed; otherwise report BLOCKED or NOT ASSESSED with the missing checks.
