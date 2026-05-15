---
title: Complete Cron Expression Guide: From Beginner to Pro
slug: cron-expression-guide
date: 2026-05-14
category: dev
lang: en
description: Cron expressions are the language of scheduled tasks. This guide explains 5/6/7 field syntax with examples covering 99% of use cases.
keywords: cron expression,cron tutorial,scheduled tasks,cron syntax,crontab
---

# Complete Cron Expression Guide: From Beginner to Pro

Cron expressions are the universal language of scheduled tasks. From Linux crontab to Kubernetes CronJob, from GitHub Actions to AWS CloudWatch Events, nearly every scheduling system uses Cron syntax.

## Cron Field Structure

The most common is the **5-field** format:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, 0=Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Some systems (Quartz, AWS) use **6 fields** (adding seconds) or **7 fields** (adding year). This guide focuses on the universal 5-field format.

## Special Character Meanings

| Character | Meaning | Example |
|---|---|---|
| `*` | Any value | `* * * * *` = Every minute |
| `,` | List multiple values | `0,30 * * * *` = At minute 0 and 30 of every hour |
| `-` | Range | `0 9-18 * * *` = Hourly from 9 AM to 6 PM |
| `/` | Step | `*/5 * * * *` = Every 5 minutes |

## Common Scenario Examples

### Minute-level Tasks

```
* * * * *          # Every minute
*/5 * * * *        # Every 5 minutes
0,30 * * * *       # Every half hour (at 0 and 30 min)
15,45 * * * *      # At 15 and 45 min past every hour
```

### Hour-level Tasks

```
0 * * * *          # Every hour on the hour
0 */6 * * *        # Every 6 hours (0, 6, 12, 18)
0 9-18 * * *       # Hourly from 9 AM to 6 PM
30 2 * * *         # 2:30 AM daily
```

### Daily Tasks

```
0 2 * * *          # 2 AM daily
0 2 * * 1-5        # 2 AM on weekdays (Mon-Fri)
0 2 * * 0,6        # 2 AM on weekends (Sat-Sun)
0 2,14 * * *       # 2 AM and 2 PM daily
```

### Weekly Tasks

```
0 3 * * 1          # 3 AM every Monday
0 3 * * 5          # 3 AM every Friday
0 9 * * 1,3,5      # 9 AM Monday, Wednesday, Friday
```

### Monthly Tasks

```
0 4 1 * *          # 4 AM on the 1st of every month
0 4 1,15 * *       # 4 AM on the 1st and 15th
30 4 L * *         # 4:30 AM on the last day of month (L syntax required)
```

### Complex Combinations

```
0 */2 1-10 * *     # Every 2 hours on days 1-10 of month
*/30 9-17 * * 1-5  # Every 30 min from 9 AM-5 PM on weekdays
0 2 * * 1#2        # 2 AM on the 2nd Monday of month (# syntax required)
```

## Classic Cron Pitfalls

**Pitfall 1: Day of month and day of week are OR**

```
0 2 15 * 5    # ❗ NOT "15th AND Friday" — it's "15th OR Friday"!
```

This is the most common Cron mistake. When you specify both day of month and day of week, the condition is **OR** (either satisfies), not AND.

For "15th AND Friday only", add additional checking in your script.

**Pitfall 2: Timezone issues**

Cron uses the system local timezone. Your server might NOT be in your local timezone!

```bash
date  # Check system timezone
```

Be especially careful with timezone in container environments.

**Pitfall 3: Step doesn't necessarily start at 0**

```
*/5 * * * *    # 0,5,10,15,...55 minutes ✅
1-59/5 * * * * # 1,6,11,...56 minutes ❗
```

**Pitfall 4: Month day count variations**

```
0 2 */15 * *   # Every 15 days, but February only has 28 days
                 # Day 30/31 might not exist in the following month
```

**Pitfall 5: Output and logging**

Cron task stdout/stderr default to email, but many systems don't have mail configured.

✅ Best practice: Redirect output to logs

```
0 2 * * * /path/to/script.sh >> /var/log/cron/script.log 2>&1
```

## Debugging Techniques

### Verify Expressions

Use our [Cron Parser tool](/tools/cron-parser) — enter an expression and immediately see the next 5 execution times to quickly verify correctness.

### Test Scripts

Add timestamp logging at the beginning of scripts:

```bash
echo "$(date): Script started" >> /tmp/test.log
```

### Environment Variable Issues

Cron has a very limited PATH during execution. Common issue:

❌ Error: `command not found`
✅ Solution: Set complete PATH at script beginning, or use absolute paths

```bash
#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin"
```

## Implementation Differences

| Implementation | Fields | Special Syntax |
|---|---|---|
| Linux crontab | 5 | Basic syntax |
| Vixie Cron | 5 | @reboot, @yearly, etc. |
| Quartz | 6-7 | L, W, # |
| Kubernetes CronJob | 5 | Basic syntax |
| GitHub Actions | 5 | Standard POSIX |
| AWS CloudWatch | 6 | L, W, # |

## Common Shortcuts

```
@reboot    # Run once at startup
@yearly    # Once a year (0 0 1 1 *)
@monthly   # Once a month (0 0 1 * *)
@weekly    # Once a week (0 0 * * 0)
@daily     # Once a day (0 0 * * *)
@hourly    # Once an hour (0 * * * *)
```

## Online Tool

Use our [Cron Parser tool](/tools/cron-parser) to see the next 5 execution times instantly — the perfect tool for debugging Cron.

---

Master cron expressions, and you master the core language of automation!
