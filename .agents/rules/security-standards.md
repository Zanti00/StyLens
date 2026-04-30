---
trigger: always_on
---

# security-standards

> Part of the [antigravity-agent-rulebook](./antigravity-agent-rulebook.md)
> **Version 1.0.0 · Domain Rule**

---

## Scope

Applies to any agent that **touches data, APIs, authentication, or system configuration**. Security failures are **deployment blockers** — no exceptions, no deferring to the next sprint.

---

## Non-Negotiable Absolutes

```
NEVER  → log passwords, tokens, PII, or full request bodies in production
NEVER  → use MD5 or SHA1 for password hashing
NEVER  → disable SSL certificate verification, even in test environments
NEVER  → commit .env files, private keys, or secrets to version control
NEVER  → concatenate user input into SQL, shell commands, or HTML strings
NEVER  → return stack traces or internal error details to the client
ALWAYS → validate and sanitize inputs at every trust boundary
ALWAYS → run dependency audits before every release (npm audit, pip audit)
ALWAYS → enforce HTTPS-only in production with HSTS headers
ALWAYS → apply rate limiting on all public-facing endpoints
```

---

## Input Validation & Output Encoding

**The rule:** Never trust any data that crosses a trust boundary — users, external APIs, message queues, and even internal services.

| Requirement                      | Enforcement                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Validate at all trust boundaries | Schema validation required before processing any external input                     |
| Sanitize before persistence      | Strip or escape HTML, SQL-special chars, and null bytes                             |
| Encode on output                 | Context-aware: HTML-encode for DOM, parameterize for SQL, escape for shell          |
| Schema validation mandatory      | Use Zod, Pydantic, Joi, or equivalent. Raw `req.body` is forbidden in production    |
| Reject unknown fields            | API schemas must use strict mode — unknown keys are stripped, not silently accepted |

```typescript
// ❌ BAD — raw body access, no validation
app.post("/users", (req, res) => {
  db.query(`INSERT INTO users VALUES ('${req.body.email}')`);
});

// ✅ GOOD — schema validated, parameterized query
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

app.post("/users", async (req, res) => {
  const payload = CreateUserSchema.parse(req.body); // throws on invalid input
  await userRepository.create(payload); // parameterized internally
});
```

---

## Authentication & Authorization

### Authentication

- Session tokens must be **short-lived**, rotated on privilege escalation, and invalidated on logout.
- Use **bcrypt** (cost ≥12), **argon2id**, or **scrypt** for password hashing. Never SHA/MD5.
- Implement **account lockout** after repeated failed login attempts (e.g., 5 attempts → 15-minute lockout).
- Multi-factor authentication must be enforced for all privileged operations.
- JWTs must use asymmetric signing (RS256/ES256). Never `alg: none`.

### Authorization

- Enforce **least-privilege access control**. Never request or grant permissions broader than required.
- Implement RBAC or ABAC at the **service boundary**, not the UI layer.
- **Ownership checks** are required at every data access point — not just at the route level.
- Re-verify permissions on every sensitive operation, not just on session creation.

```typescript
// ❌ BAD — authorization only at route level
router.delete("/documents/:id", isAuthenticated, async (req, res) => {
  await documentService.delete(req.params.id); // no ownership check
});

// ✅ GOOD — ownership verified at the service boundary
async function deleteDocument(
  documentId: string,
  requestingUserId: string,
): Promise<void> {
  const document = await documentRepository.findById(documentId);
  if (!document) throw new NotFoundError("Document not found");
  if (document.ownerId !== requestingUserId)
    throw new ForbiddenError("Access denied");
  await documentRepository.delete(documentId);
}
```

---

## Secrets Management

- **Never hardcode** credentials, API keys, tokens, or connection strings.
- All secrets must be **rotatable without code changes**.
- Use environment variables for local development; use a secrets manager (Vault, AWS Secrets Manager, GCP Secret Manager) for production.
- Secrets must never appear in logs, error messages, or API responses.
- `.env` files must be in `.gitignore` and a `.env.example` with placeholder values must exist.

```bash
# ❌ BAD — hardcoded in source
DATABASE_URL = "postgresql://admin:s3cr3t@prod-db:5432/app"

# ✅ GOOD — externalized
DATABASE_URL = os.environ["DATABASE_URL"]  # required; will throw on missing
```

---

## OWASP Top 10 Mitigation

| Attack Vector                       | Required Mitigation                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| **Injection (SQL, NoSQL, command)** | Parameterized queries or ORM — string concatenation is forbidden                       |
| **Broken Authentication**           | Short-lived tokens · account lockout · MFA for privileged ops                          |
| **XSS**                             | Sanitize input + encode output + strict Content Security Policy headers                |
| **CSRF**                            | `SameSite=Strict` cookies + CSRF tokens on all state-changing requests                 |
| **Insecure Deserialization**        | Validate schema before deserializing; never deserialize from untrusted input           |
| **Broken Access Control**           | Ownership checks at every data access point, not just route guards                     |
| **Security Misconfiguration**       | Disable debug mode, stack traces, and directory listing in production                  |
| **Sensitive Data Exposure**         | Encrypt PII at rest and in transit; mask in logs; never return in errors               |
| **Vulnerable Dependencies**         | Automated audit in CI pipeline; zero critical CVEs in production                       |
| **SSRF**                            | Whitelist outbound HTTP destinations; block internal IP ranges from user-supplied URLs |

---

## Secure Headers

All HTTP responses from production services must include:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Security Review Checklist

- [ ] All inputs validated with a schema library at every trust boundary
- [ ] No raw string concatenation in SQL, HTML, or shell commands
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] Authorization enforced at the service/data layer, not just the route
- [ ] Passwords hashed with bcrypt (≥12), argon2id, or scrypt
- [ ] All outbound HTTP calls use HTTPS with valid certificates
- [ ] Rate limiting applied to all public endpoints
- [ ] Secure headers present on all HTTP responses
- [ ] Dependency audit passes with zero critical CVEs
- [ ] Error responses do not expose stack traces or internal details

---

_security-standards v1.0.0 · [Back to rulebook](./antigravity-agent-rulebook.md)_
