---
trigger: always_on
---

# agentic-behavior

> Part of the [antigravity-agent-rulebook](./antigravity-agent-rulebook.md)
> **Version 1.0.0 · Domain Rule**

---

## Scope

Applies to **all agents, all tasks, always**. This rule governs how agents think, plan, communicate, and manage their own execution — regardless of their specialization. Load this file second, immediately after the root rulebook.

---

## The Planning Loop

Every task must follow this six-phase cycle. **No code is produced before Phase 3 completes.**

```
┌─────────────────────────────────────────────────────────────┐
│  1. UNDERSTAND → 2. DECOMPOSE → 3. PLAN                     │
│                                      ↓                      │
│  6. REFINE   ← 5. VALIDATE  ← 4. EXECUTE                   │
└─────────────────────────────────────────────────────────────┘
```

| Phase             | What the Agent Does                                                                                       | Output Required                            |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **1. Understand** | Restate the goal in your own words. List all inputs, outputs, constraints, and assumptions.               | Confirmed goal statement + assumption list |
| **2. Decompose**  | Break the task into atomic, independently testable sub-tasks. Each must have a measurable done condition. | Ordered sub-task list with done conditions |
| **3. Plan**       | Sequence sub-tasks. Identify dependencies, parallelization opportunities, and risk points.                | Dependency map + risk register             |
| **4. Execute**    | Implement one sub-task at a time. Do not start the next until the current is validated.                   | Artifact per sub-task                      |
| **5. Validate**   | Check output against the original goal. Run tests. Review for security and performance violations.        | Validation report                          |
| **6. Refine**     | Address findings from validation. Re-validate. Only mark `done` when all acceptance criteria pass.        | Updated artifact + re-validation result    |

---

## Ambiguity Handling Protocol

**Rule: Stop. Do not guess.**

When a requirement is ambiguous, contradictory, or incomplete:

1. **Stop immediately.** Do not produce any output based on the ambiguous requirement.
2. **List the ambiguities** as numbered questions. For each, show what the two (or more) interpretations would produce.
3. **Propose a default** — the most conservative, reversible interpretation — and state your reasoning.
4. **Await explicit confirmation** before proceeding. Approval must be on record.

```yaml
# Example ambiguity report
ambiguity_report:
  task_id: "task-003"
  questions:
    - id: 1
      question: "Should deleted users be permanently removed or soft-deleted?"
      interpretation_a: "Hard delete — removes row from DB. Not reversible."
      interpretation_b: "Soft delete — sets deleted_at timestamp. Reversible."
      proposed_default: "Soft delete (B) — safer, reversible, aligns with audit requirements"
    - id: 2
      question: "What is the maximum file upload size?"
      interpretation_a: "No limit specified — default to server max (e.g., 100MB)"
      interpretation_b: "Match the existing avatar upload limit (5MB)"
      proposed_default: "5MB (B) — consistent with existing limits, prevents abuse"
  status: "BLOCKED — awaiting clarification"
```

**Exception:** Low-risk, easily reversible stylistic decisions (variable naming, log message wording) may proceed with the choice **explicitly logged** in the output.

---

## State Awareness

Agents must maintain explicit task state throughout every execution cycle.

### State Lifecycle

```
pending → in_progress → blocked → done
                    ↘          ↗
                      failed
```

### State Object (required in all agent outputs)

```yaml
task_state:
  task_id: "uuid-v4"
  status: "pending | in_progress | blocked | done | failed"
  completed_sub_tasks:
    - id: "task-001"
      summary: "one-line summary of what was done"
      validated: true
  current_sub_task: "task-002"
  remaining_sub_tasks: ["task-003", "task-004"]
  open_flags:
    ambiguities: []
    blockers: []
    risks: []
```

### Rules

- Before starting a new sub-task, **summarize completed state** in one sentence per completed task.
- Never assume prior context is intact across session boundaries. Re-establish state from the source of truth.
- If a sub-task fails, update state to `blocked` and surface the failure before proceeding.
- State transitions must be **explicit** — never inferred or implicit.

---

## Context & Token Efficiency

### Summarization Triggers

| Condition                                 | Action                                               |
| ----------------------------------------- | ---------------------------------------------------- |
| Context exceeds 50% of token budget       | Produce a structured state summary before continuing |
| Switching between sub-tasks               | One-line summary of the completed task               |
| Returning to a task after a context break | Re-establish full state from the task object         |
| Consumer of output is another agent       | Use structured data (JSON/YAML), not prose           |

### Efficiency Rules

- **Summarize, do not repeat.** Prior context is referenced, not copy-pasted.
- Omit boilerplate explanations when the consumer is an agent or an engineer.
- Prefer structured output (JSON, YAML, tables) over verbose prose for machine-consumed data.
- Flag when a task would exceed token budget and propose a **chunking strategy** before starting.
- Intermediate outputs must be self-contained — another agent must be able to resume from them without the prior conversation.

### Summary Format (use when approaching token limit)

```yaml
context_summary:
  task_id: "uuid-v4"
  goal: "one sentence"
  completed:
    - "task-001: created User domain model with validation"
    - "task-002: implemented userRepository with CRUD operations"
  current: "task-003: writing unit tests for userRepository"
  remaining: ["task-004", "task-005"]
  key_decisions:
    - "Using soft deletes for User model (per clarification #1)"
    - "PostgreSQL uuid_generate_v4() for primary keys"
  open_flags: []
```

---

## Output Integrity

Every agent output — before delivery — must self-validate against these questions:

- [ ] Does the output satisfy the task's stated done condition?
- [ ] Are all assumptions explicitly listed and flagged?
- [ ] Are all uncertainties labeled — no silent guesses?
- [ ] Is the output reproducible from the stated inputs and state?
- [ ] Would another agent be able to resume from this output without prior context?

---

## Inter-Agent Communication Contract

All messages between agents must follow this schema:

```json
{
  "task_id": "uuid-v4",
  "from": "planner | executor | reviewer | optimizer",
  "to": "planner | executor | reviewer | optimizer",
  "status": "pending | in_progress | blocked | done | failed",
  "payload": {},
  "flags": {
    "ambiguities": [],
    "risks": [],
    "blockers": []
  },
  "timestamp": "ISO-8601"
}
```

**Rules:**

- Every message must include a `task_id` that traces back to the original Planner task graph.
- `flags` must never be empty objects when there are known issues — silence is not acceptable.
- Agents must not modify another agent's output without producing a new message with their own `from` field.

---

_agentic-behavior v1.0.0 · [Back to rulebook](./antigravity-agent-rulebook.md)_
