---
trigger: always_on
---

# performance-scalability

> Part of the [antigravity-agent-rulebook](./antigravity-agent-rulebook.md)
> **Version 1.0.0 · Domain Rule**

---

## Scope

Applies to any agent that **designs data access patterns, system architecture, or infrastructure configuration**. The guiding principle is simple: **profile first, optimize second, never guess**.

---

## Core Mandate

```
NEVER  → optimize without a profiling baseline
NEVER  → load an unbounded result set into memory
NEVER  → write an N+1 query pattern
NEVER  → open unbounded database connections
NEVER  → store session state in application memory
ALWAYS → paginate all list endpoints by default
ALWAYS → set resource limits on all containerized services
ALWAYS → design for horizontal scaling from day one
```

---

## Algorithm & Complexity Targets

| Scenario             | Target             | Notes                                              |
| -------------------- | ------------------ | -------------------------------------------------- |
| Read-heavy list APIs | O(n log n) max     | DB-level pagination required                       |
| Search & filtering   | O(log n) via index | No in-memory filtering above 1K records            |
| Bulk data processing | O(n) streaming     | Never load full dataset into memory                |
| Cache lookups        | O(1)               | Hash-based; avoid sequential scans in cache        |
| Aggregations         | DB-level           | Never aggregate in application code above 10K rows |

**Premature optimization rule:** Do not optimize until you have a measured baseline. Flag suspected bottlenecks with a comment and a ticket — but do not optimize speculatively.

---

## Database & Query Standards

### Query Rules

- Every query touching more than **1,000 rows** must have an `EXPLAIN ANALYZE` review before merge.
- **N+1 query patterns are deployment blockers.** Use eager loading or DataLoader/batching patterns.
- Long-running queries (>100ms p99) must be profiled and either optimized or moved to async jobs.
- Avoid `SELECT *` — always select only the columns required.
- Use **`LIMIT`** on all queries that could return unbounded rows, even internal ones.

### N+1 Example

```typescript
// ❌ BAD — N+1: 1 query for posts + N queries for each author
const posts = await Post.findAll();
for (const post of posts) {
  post.author = await User.findById(post.authorId); // N additional queries
}

// ✅ GOOD — 1 query with join / eager load
const posts = await Post.findAll({
  include: [{ model: User, as: "author" }],
});
```

### Indexing

- Add indexes for: all **foreign keys**, frequently filtered columns, and sort fields.
- Composite indexes must match the query's column order exactly.
- Never index low-cardinality columns (e.g., boolean flags) in isolation.
- Review index bloat on tables with heavy write loads — unused indexes slow down writes.

### Connection Management

- Use **connection pooling** at all times. Never open unbounded connections.
- Pool size formula: `(core_count * 2) + effective_spindle_count` (PgBouncer default guidance).
- Set `connection_timeout` and `idle_timeout` to prevent pool exhaustion.
- Release connections in `finally` blocks — never assume happy-path cleanup.

---

## Caching Strategy

### Three-Tier Model

| Level                | Store                    | TTL Range          | Use Case                                            |
| -------------------- | ------------------------ | ------------------ | --------------------------------------------------- |
| **L1 — In-process**  | Local memory (LRU)       | Seconds to minutes | Computed values within a request lifecycle          |
| **L2 — Distributed** | Redis / Memcached        | Minutes to hours   | Sessions, rate limits, shared computed state        |
| **L3 — CDN / Edge**  | CDN (CloudFront, Fastly) | Hours to days      | Static assets, public API responses, HTML fragments |

### Cache Rules

- Cache keys must include **versioning** to support zero-downtime invalidation: `user:v2:{id}:profile`.
- Implement **stale-while-revalidate** for non-critical reads to avoid cache stampedes.
- For writes, use **write-through** (update cache on write) or **cache-aside** (invalidate on write) — document which pattern is in use.
- Never cache: authentication tokens, real-time data, or user-specific financial data without an explicit, short TTL.
- Cache **misses** must be logged and monitored. A high miss rate indicates a cache strategy problem.

```typescript
// ✅ Cache-aside pattern
async function getUserProfile(userId: string): Promise<UserProfile> {
  const cacheKey = `user:v2:${userId}:profile`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const profile = await userRepository.findById(userId);
  await redis.setex(cacheKey, 300, JSON.stringify(profile)); // 5-minute TTL
  return profile;
}
```

---

## Scalability Design

### Stateless Services

- Services must be **stateless**. Session state belongs in an external store (Redis, DB), never in process memory.
- Any in-memory state that survives a request is a scalability bug.
- File uploads must go directly to object storage (S3, GCS) — never through the application server's disk.

### Horizontal Scaling

- Every service must be deployable as **multiple identical replicas** behind a load balancer.
- No service should rely on a specific host, IP, or local filesystem path.
- Background job workers must be idempotent — jobs may be retried or run concurrently.

### Async & Decoupled Processing

- Decouple non-critical workloads using **message queues** (Kafka, RabbitMQ, SQS).
- Any operation that takes >200ms or involves an external call must be considered for async processing.
- Use **circuit breakers** and **retry logic with exponential backoff** for all external service calls.

```typescript
// ✅ Exponential backoff with jitter
async function callExternalApi(
  payload: Payload,
  attempt = 1,
): Promise<Response> {
  try {
    return await externalApi.post(payload);
  } catch (error) {
    if (attempt >= MAX_RETRIES) throw error;
    const delay = Math.min(100 * 2 ** attempt + Math.random() * 100, 10_000);
    await sleep(delay);
    return callExternalApi(payload, attempt + 1);
  }
}
```

### Resource Limits

All containerized services must define explicit resource limits:

```yaml
# ✅ Always set both requests and limits
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "1000m"
    memory: "512Mi"
```

---

## Performance Review Checklist

- [ ] No N+1 query patterns
- [ ] All list endpoints are paginated
- [ ] Queries touching >1K rows have `EXPLAIN ANALYZE` evidence
- [ ] No unbounded connection pool
- [ ] Caching applied to expensive or frequently-read data
- [ ] Cache keys are versioned for safe invalidation
- [ ] Services are stateless and horizontally scalable
- [ ] External calls use circuit breaker + retry with backoff
- [ ] Resource limits defined on all containerized services
- [ ] Any optimization is backed by a before/after benchmark

---

_performance-scalability v1.0.0 · [Back to rulebook](./antigravity-agent-rulebook.md)_
