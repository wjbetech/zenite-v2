## PR Description Guideline

Purpose
-------
This document defines a small, strict guideline for writing pull request (PR) descriptions in this repository.

Rule (short)
--------------
PR descriptions should only describe what the PR is adding, updating, or removing. They must be pure description — no questions, no commentary to reviewers, and no "breaking the 4th wall" statements (for example: "Hey reviewer, can you check...", "I'm not sure about...", or "Why is this failing?").

What to include
----------------
- A concise summary of the change (what was added/changed/removed).
- The intent or motivation behind the change (one sentence maximum).
- Any small implementation notes that help reviewers understand the code (e.g., changed an API signature, introduced a new helper, changed a CSS approach). Keep these objective and descriptive.
- Validation steps (how to verify in the app) — short bullet list.

What not to include
--------------------
- Questions directed at reviewers ("Can someone check X?").
- Meta-comments about the PR author, process, or branch management ("I'll fix this later", "This is WIP").
- Conversational or directive language addressing specific people.
- Debugging commentary or logs that don't explain the change (these belong in issue threads or a linked ticket).

Good examples
--------------
- "feat: add project list scroll container so header and navbar remain fixed. Adds a scroll wrapper with `flex-1 min-h-0 overflow-y-auto` and moves list padding into the wrapper. Validated locally by opening /projects and confirming only the card list scrolls."
- "fix: tighten vertical spacing in Dailies view. Reduced top/bottom paddings and lowered inter-item spacing to improve density while preserving drag-and-drop behavior."

Bad examples (what to avoid)
---------------------------
- "Hey @alice can you look at this? I'm not sure about the alignment."  — contains a direct question to a reviewer.
- "This is a WIP, will finish later." — process commentary, not a description of the change.
- "I had to do some ugly hacks because X was broken." — subjective and conversational; explain objectively what changed and why.

Checklist (short)
------------------
Before creating a PR description in this repo, ensure:

1. The description states what the PR changes (adds/updates/removes).
2. The description contains at most one short sentence about motivation/intent.
3. No questions, reviewer calls, or conversational phrases are included.
4. Validation steps are present (1–3 short bullets) or a linked issue/PR that contains them.

How this agent will use the guideline
-------------------------------------
When composing or suggesting PR descriptions for this repository, this guideline will be read first and the resulting PR description will follow the rules strictly. The generated PR description will not include reviewer questions, process notes, or conversational asides.

Location and updates
---------------------
This file lives at `docs/PR_DESCRIPTION_GUIDELINES.md`. If this guideline needs to be changed, update this file with the new wording and rationale.

Contact and exceptions
----------------------
If an exception is required (for example a PR that is intentionally a draft and needs contextual notes), the exception should be explained in the linked issue body rather than inside the PR description itself.

---
Last updated: 2025-11-03
