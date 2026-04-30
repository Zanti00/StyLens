---
trigger: always_on
---

# code-quality

> Part of the [antigravity-agent-rulebook](./antigravity-agent-rulebook.md)
> **Version 1.0.0 · Domain Rule**

---

## Scope

Applies to any agent that **writes, modifies, or reviews code**. These rules define the baseline quality bar that all generated code must meet before it can leave the Executor.

---

## Naming Conventions

| Scope                       | Convention                | Example                             |
| --------------------------- | ------------------------- | ----------------------------------- |
| Variables & functions       | `camelCase`               | `getUserProfile`                    |
| Classes & types             | `PascalCase`              | `UserProfileService`                |
| Constants                   | `SCREAMING_SNAKE_CASE`    | `MAX_RETRY_COUNT`                   |
| Database columns & env vars | `snake_case`              | `user_id`, `DATABASE_URL`           |
| Files (modules)             | `kebab-case`              | `user-profile.service.ts`           |
| Boolean variables           | `is`, `has`, `can` prefix | `isActive`, `hasPermission`         |
| Event handlers              | `handle` prefix           | `handleSubmit`, `handleUserCreated` |

**Rules:**

- Names must be **intention-revealing**. If it needs a comment to explain it, the name is wrong.
- Abbreviations are forbidden unless universally known (`id`, `url`, `api`, `db`).
- Generic names (`data`, `info`, `temp`, `obj`, `val`) are not acceptable in production code.
- Names must be consistent across the codebase — pick one term per concept and stick to it.

---

## Function & Module Design

### Size Limits

| Metric                  | Limit     | Action if Exceeded              |
| ----------------------- | --------- | ------------------------------- |
| Function length         | 40 lines  | Document justification or split |
| Cyclomatic complexity   | 10        | Refactor into smaller functions |
| File length             | 300 lines | Split into cohesive modules     |
| Parameters per function | 4         | Use an options object/struct    |
| Nesting depth           | 3 levels  | Extract into named functions    |

### Design Rules

- Every function must do **exactly one thing**. If the name needs "and", split it.
- All public functions must have explicit **input/output type annotations**.
- Side effects must be **isolated and documented** at the function boundary.
- **Pure functions** are preferred. Functions with side effects must be clearly named as such.
- Default parameter values must not be mutable objects (e.g., `[]` or `{}` in Python).

### Good vs. Bad Examples

```typescript
// ❌ BAD — does multiple things, name is vague
function processData(data: any) {
  const validated = validate(data);
  db.save(validated);
  emailService.notify(validated.userId);
  return validated;
}

// ✅ GOOD — single responsibility, typed, named clearly
function validateUserPayload(payload: unknown): UserPayload {
  return UserPayloadSchema.parse(payload);
}

async function createUser(payload: UserPayload): Promise<User> {
  const user = await userRepository.save(payload);
  await notificationService.sendWelcomeEmail(user.id);
  return user;
}
```

---

## Project Structure

Enforce a consistent directory layout across all services:

```
src/
  domain/          ← pure business logic, zero external dependencies
  application/     ← use-cases, orchestration, service interfaces
  infrastructure/  ← DB, HTTP, cache, external APIs
  interface/       ← controllers, CLI, event handlers
  shared/          ← utilities, constants, error types
tests/
  unit/            ← isolated domain logic
  integration/     ← service + infra together
  e2e/             ← full system flows
```

**Rules:**

- `domain/` must have **zero imports** from `infrastructure/` or `interface/`.
- Dependencies flow inward: `interface → application → domain`. Never outward.
- Circular imports between modules are a hard blocker.
- Each module must have a single index/barrel file as its public API.

---

## Comments & Documentation

**The rule:** Comments explain **WHY**, never **WHAT**. The code explains what.

```typescript
// ❌ BAD — explains what the code obviously does
// Increment the retry count
retryCount++;

// ✅ GOOD — explains a non-obvious decision
// Cap at 5 to avoid thundering herd against the payments API during outages
const MAX_RETRIES = 5;
```

**JSDoc/Docstring requirements for all public APIs:**

```typescript
/**
 * Calculates the pro-rated refund amount for a cancelled subscription.
 * Uses calendar days, not billing cycle days, per the Terms of Service (§4.2).
 *
 * @param subscription - The active subscription to cancel
 * @param cancellationDate - The effective date of cancellation
 * @returns Refund amount in the subscription's currency, rounded to 2 decimal places
 * @throws {InvalidSubscriptionError} If the subscription is already cancelled
 */
function calculateRefund(subscription: Subscription, cancellationDate: Date): Money { ... }
```

**Rules:**

- All public functions, classes, and modules require a docstring.
- TODOs must reference a ticket: `// TODO(JIRA-123): remove after migration`
- Complex algorithms must cite the source paper or decision record.
- Commented-out code must not be merged — use version control instead.

---

## Error Handling

- **Never swallow errors silently.** All exceptions must be handled or explicitly propagated.
- Use **typed error classes**, not raw strings.
- Error messages must be actionable — tell the caller what went wrong and what to fix.
- Log errors at the boundary where they are handled, not where they are thrown.

```typescript
// ❌ BAD
try {
  await db.save(user);
} catch (e) {
  console.log("error"); // swallowed, no context
}

// ✅ GOOD
try {
  await userRepository.save(user);
} catch (error) {
  if (error instanceof UniqueConstraintError) {
    throw new ConflictError(`User with email ${user.email} already exists`);
  }
  throw new DatabaseError("Failed to persist user", { cause: error });
}
```

---

## Linting & Formatting

- All repositories must have an **auto-formatter** configured in CI (Prettier, Black, gofmt).
- **Linting** (ESLint, Ruff, golangci-lint) must run on every pull request.
- Zero tolerance for linting errors in `main`. Warnings must be addressed within the same sprint.
- `EditorConfig` must be present to normalize whitespace across all editors.

**Minimum ESLint/Ruff rules to enforce:**

- No unused variables or imports
- No implicit `any` (TypeScript)
- No `console.log` in production code — use a structured logger
- Enforced import ordering

---

## Pre-Merge Checklist

- [ ] Every function/class has a single, well-named responsibility
- [ ] All edge cases handled: null, empty, overflow, concurrent access
- [ ] No `TODO`s without an associated ticket reference
- [ ] No commented-out code
- [ ] No linting violations introduced
- [ ] All public APIs have type annotations and docstrings
- [ ] A new engineer could understand this code without asking the author

---

_code-quality v1.0.0 · [Back to rulebook](./antigravity-agent-rulebook.md)_
