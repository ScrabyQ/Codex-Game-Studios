---
name: brainstorm
description: "Guides the user through finding and choosing a game concept. Use when the user wants game ideas, a new concept, a game jam idea, or to explore other directions, including dropping the current idea and starting over."
---

## Codex execution contract

**CGS-11 design and consent contract:** Treat source task APIs and automatic hooks as optional; if unavailable, keep a transparent in-session checklist and do not claim task creation or hook execution. Use available file tools and preserve their permission limits. For minimal workflow, propose two or three concepts, wait for the user choice, and create the substantive one-page brief only after authorization for that exact write. Keep the brief to the required fields and at most seven MVP items; do not create a full GDD or discovery gates. Treat scripted fixture answers only as authorization inside that fixture.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, WebSearch, Agent, user-question facility, Bash(bash "*/.agents/skills/brainstorm/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[genre or theme hint, or 'open'] [--review full|lean|solo]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,docs.density,workflow`. If unavailable, report the missing dependency and do not invent results.

Resolved above; use as-is. No block → the defaults in `.agents/docs/config-resolution.md`
(`workflow: minimal`, `review_mode: solo`, `automation: collaborative`, `docs.density: terse`), and
say that the settings were not read.

# Brainstorm

Turns no idea, or a rough one, into a written design the next step builds from. How much it writes
depends on `workflow`:

- **`minimal`:** the Lean Brief flow below: a one-page `design/game-brief.md`, then stop. No
  discovery questions, pillars, director gates or `game-concept.md`, and do not load
  `references/full-concept.md`.
- **`standard` or `full`:** read `references/full-concept.md` and follow it. It writes
  `design/gdd/game-concept.md` from `.agents/docs/templates/game-concept.md`. Its gates follow
  `.agents/docs/director-gates.md`; each director agent is given its own gate file,
  `.agents/docs/director-gates/<gate-id in lower case>.md` (`cd-pillars.md`,
  `ad-concept-visual.md`, `td-feasibility.md`, `pr-scope.md`), and you do not read those files
  yourself.

`--review` in the text typed after the skill name overrides `review_mode` for this run.
`docs.density` sets each section's depth: `terse` = bullets; `balanced` = with brief rationale;
`thorough` = rationale and alternatives. Questions follow `.agents/docs/automation-modes.md`
(collaborative asks, guided asks only for major decisions, autonomous logs and proceeds; the
always-ask categories always ask).

Ask with the question tool. Without one, list the options numbered and end your turn to wait. The
question is the last thing in the reply: no advice or lean after it. A skipped or dismissed
question is not an answer: ask again in plain text.

## Lean Brief flow (`workflow: minimal`)

A few exchanges, not fifteen: capture the thinking that carries the game on one page, then get to
code. Write from the template `.agents/docs/templates/game-brief.md` (six required fields, three
one-liners). If `design/game-brief.md` exists, read it and refine it instead of starting over.

1. **Concept.** From the hint typed after the skill name (or one quick open question if there is
   none), propose **2 or 3 one-line concepts** (verb-first or a mashup of genre and theme), not
   full concept cards. Ask the user to pick or combine them. This is the one creative question
   every run asks.
2. **Fill the brief** in conversation, several fields per exchange:
   - **Working title:** the brief's title line. Offer one from the chosen concept and let the user
     change it; `$create-stories` names the epic folder after it.
   - **Pitch:** the excited one-liner.
   - **Core loop:** the 2 to 4 steps the player repeats.
   - **Player goal & fail state**: what the player tries to do, and how they lose.
     `$create-stories` turns it into acceptance criteria.
   - **MVP:** the short list that makes it the game; each item becomes a story. **More than 7
     items: push back.** Say it is too long for an MVP, propose which items to cut (the ones the
     core loop works without), and keep the brief to 7 or fewer.
   - **Out of scope:** what they are deliberately not building (the cut items go here).
   - **Build order:** the riskiest or least proven part first.
   - **Who it's for and what they feel**, **Art & audio direction**, **Reference game** (the
     closest shipped game, and the part of it the MVP keeps): one line each; offer, don't force.
3. **Show the filled brief in full.** Then ask, as its own question: "Brief is ready. May I write it
   to `design/game-brief.md`?" `Yes — write it` / `Revise a field first`. Write only on an explicit
   yes to this question; agreeing to a cut or saying "go on" is not a yes to the write. On a
   revision, change the named field, show it before and after, and ask again. Then write
   `design/game-brief.md`, creating folders as needed. Never write `design/gdd/game-concept.md`
   at this tier.
4. **Next steps.** Read `engine.name` in `project.yaml`:
   1. `$setup-engine`: configure the engine. List it **only** when `engine.name` is absent or
      empty: on the minimal path it usually ran before this skill.
   2. `$create-stories`: turn the MVP list into stories. At `minimal` there is no separate
      `$create-epics` or `$sprint-plan`; the build order is the plan.
   3. `$dev-story`: the first line of game code.

   Then one summary line: the pitch, the number of MVP items, and `design/game-brief.md`. End with
   the line `Verdict: COMPLETE — game brief written; next stop is code.`

If the user stops before the write, say the brief was not written, so it lives only in this
conversation.
