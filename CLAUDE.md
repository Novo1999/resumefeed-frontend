@AGENTS.md

## Comments

Comment sparingly. Most code should carry none.

Write a comment only when the code cannot say it itself:

- A non-obvious constraint from outside the file (a library requirement, a
  provider's quirky behaviour, a browser rule).
- A deliberate choice that looks wrong at a glance, so the next person does not
  "fix" it.
- A security reason that is invisible in the mechanics.

Do not write:

- Doc blocks that restate the function signature or the component's name.
- Narration of what the next line does.
- Rationale for ordinary structure — layout, naming, file placement.
- Notes on why an obvious API was used.

Prefer one line over a block. Put it at the point it applies to, not in a
preamble. If a comment is needed to explain unclear code, fix the code instead.
