---
title: UUID v4 vs UUID v7 - Which Should You Use in 2026?
description: Deep comparison of UUID v4 (random) and v7 (time-ordered) - performance benchmarks, database index impact, migration tips, and 6 real scenarios.
keywords: UUID v4, UUID v7, UUID comparison, UUID database performance, Snowflake ID, primary key design, distributed ID
date: 2026-05-10
readtime: 11 min read
---

If you haven't followed UUID news in the past year, you might be behind. **RFC 9562** (May 2024) standardized UUID v6/v7/v8, and **UUID v7** is rapidly becoming the new default for new projects.

Here's why.

## 1. What Is UUID v4?

UUID v4 = 122 bits of random + 6 bits of version. Looks like:

```
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

Collision probability: generating a billion UUIDs has only ~50% chance of one duplicate. Practically never collides.

**Pros:**
- Fully random — leaks nothing
- No central coordination needed
- Most common, supported everywhere

**Cons (why v7 was created):**
- No time ordering → DB B-Tree inserts scatter randomly
- Can't sort by creation time
- **Performance killer** in large tables (page splits, cache thrash)

## 2. What Is UUID v7?

UUID v7 = **48-bit Unix millisecond timestamp** + 74 bits random + 6 bits version. Looks like:

```
01928a3f-1234-7567-89ab-0123456789ab
└timestamp┘└rand┘└ver└──random───┘
```

**First 48 bits = time**, rest random. So:

- Still globally unique (74 bits random ≈ 1.8 × 10^22 combos)
- **Naturally sorted by creation time**
- DB insert = **sequential append**, no page splits

## 3. Performance: 10M Row Insert

PostgreSQL 16, single table, 10M rows:

| PK type | Insert time | Table size | Index size |
|---|---|---|---|
| BIGSERIAL | 32s | 850 MB | 215 MB |
| **UUID v7** | 41s | 1.0 GB | 280 MB |
| UUID v4 | 138s | 1.0 GB | 540 MB |

**Key findings:**

1. UUID v7 is **3.4× faster** than v4
2. v7 index is **48% smaller** than v4 (sequential writes pack pages tightly)
3. v7 nears BIGSERIAL performance with all UUID benefits

Source: [uuid7 PostgreSQL benchmark](https://github.com/uuid7/postgres-benchmark)

## 4. Which to Pick? 6 Scenarios

| Scenario | Pick | Why |
|---|---|---|
| DB primary key (new project) | **v7** | Sequential writes, index-friendly |
| Distributed system ID | **v7** | Naturally time-ordered across nodes |
| Session ID / temp token | v4 | No time, pure random more secure |
| Crypto nonce / API key | v4 | Must be unpredictable |
| Filename (anti-guess) | v4 | Timestamps leak upload time |
| Log correlation ID | **v7** | Time-archive friendly |

## 5. FAQ

### Q: Does v7 leaking creation time cause security issues?

In specific scenarios, yes. If your app needs unpredictable IDs (coupons, temp share links), **stick with v4**. For everyday DB keys, v7's gains beat the risk.

### Q: Can I migrate v4 to v7?

You don't have to migrate everything. Both are valid UUIDs (128 bits) — **new data v7, old data v4** coexist fine. But existing physical row order won't reorganize unless you `CLUSTER`.

### Q: How does it compare to Snowflake, Sonyflake, Nano ID?

| ID type | Size | Time-ordered | Centralized | Best for |
|---|---|---|---|---|
| BIGSERIAL | 8 bytes | ✅ | ⚠️ Single DB | Small projects |
| **UUID v7** | 16 bytes | ✅ | ❌ | Most cases |
| Snowflake | 8 bytes | ✅ | ❌ (node ID) | Hyperscale w/ node mgmt |
| Nano ID | 21 chars | ❌ | ❌ | Short URLs, API keys |
| ULID | 26 chars | ✅ | ❌ | Like v7 but base32 string |

**2026 default**: unless you have special needs, use **UUID v7** for new project primary keys.

### Q: How to generate v7 in each language?

| Language | Library |
|---|---|
| JavaScript | `uuidv7` package, or check `crypto.randomUUID()` for v7 support |
| Python | `uuid6` package: `uuid6.uuid7()` |
| Go | `github.com/google/uuid` v1.6+ |
| Rust | `uuid` crate v1.5+ |
| Java | `com.fasterxml.uuid:java-uuid-generator` v5+ |
| PostgreSQL | `uuidv7()` function (pg_uuidv7 ext) or built-in in v17 |

## 6. UUID v7 Implementation (30 lines of JS)

```js
function uuidv7() {
  const ts = Date.now();              // 48-bit ms timestamp
  const tsHex = ts.toString(16).padStart(12, '0');
  const rand = crypto.getRandomValues(new Uint8Array(10));
  let randHex = Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('');
  // Set version 7 and RFC 9562 variant bits
  randHex = '7' + randHex.slice(1, 4) + ((parseInt(randHex[4], 16) & 0x3) | 0x8).toString(16) + randHex.slice(5);
  return `${tsHex.slice(0,8)}-${tsHex.slice(8,12)}-${randHex.slice(0,4)}-${randHex.slice(4,8)}-${randHex.slice(8,20)}`;
}
```

Full production code: [uuid lib](https://github.com/uuidjs/uuid).

## 7. Try It

👉 [AI Toolbox UUID Generator](/en/tools/uuid-generator.html):

- UUID v4 (random)
- UUID v7 (time-ordered)
- Bulk generate 1-1000 at once
- One-click copy
- **Fully local** — nothing sent

## TL;DR

- **DB primary keys → UUID v7** (unless unpredictability matters)
- **Tokens / nonces / filenames → UUID v4**
- v7 is ~3× faster than v4 in DB inserts, half the index size
- Standard officially published (RFC 9562, 2024)

**Generate now**: [AI Toolbox UUID Generator](/en/tools/uuid-generator.html)
