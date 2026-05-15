---
title: Regex from Zero to Pro - 30 Essential Patterns + Debugging Tips
description: Master regular expressions with this complete guide - core syntax, 30 real-world patterns (email, URL, IP, password, etc.), common pitfalls, and debugging techniques.
keywords: regex, regular expression, regex tutorial, regex patterns, email regex, URL regex, regex cheatsheet
date: 2026-05-09
readtime: 14 min read
---

Regular expressions are an essential skill — and a notorious headache. This guide covers it all in one shot:

1. Core syntax in 7 minutes
2. 30 most-used real-world patterns
3. 6 common pitfalls
4. Debugging and performance tips

By the end, you'll write 90% of the regex you need at work.

## 1. Core Syntax in 7 Minutes

### Character classes

| Pattern | Meaning |
|---|---|
| `.` | Any char (except newline) |
| `\d` | Digit (0-9) |
| `\D` | Non-digit |
| `\w` | Word char (letters/digits/_) |
| `\W` | Non-word char |
| `\s` | Whitespace (space, tab, newline) |
| `\S` | Non-whitespace |
| `[abc]` | a or b or c |
| `[^abc]` | Not a/b/c |
| `[a-z]` | a through z |
| `[a-zA-Z0-9]` | Any letter or digit |

### Quantifiers

| Pattern | Meaning |
|---|---|
| `*` | 0 or more |
| `+` | 1 or more |
| `?` | 0 or 1 |
| `{n}` | Exactly n |
| `{n,}` | At least n |
| `{n,m}` | n to m |

**Greedy vs lazy**: default is greedy (match as much as possible). Add `?` after quantifier to be lazy:

```
"abc<1><2>"   <.+>   matches <1><2>   (greedy)
"abc<1><2>"   <.+?>  matches <1>      (lazy)
```

### Anchors

| Pattern | Meaning |
|---|---|
| `^` | Start of string |
| `$` | End of string |
| `\b` | Word boundary |
| `\B` | Non-word boundary |

### Groups & capture

| Pattern | Meaning |
|---|---|
| `(abc)` | Capture group |
| `(?:abc)` | Non-capture group |
| `(?<name>abc)` | Named capture |
| `\1`, `\2` | Backreference |
| `(a\|b)` | OR |

### Lookaround

| Pattern | Meaning |
|---|---|
| `(?=...)` | Lookahead — must be followed by |
| `(?!...)` | Negative lookahead |
| `(?<=...)` | Lookbehind |
| `(?<!...)` | Negative lookbehind |

Example: match digits followed by "px" (without consuming "px"):

```
\d+(?=px)        matches "12" in "12px"
```

### Flags

| Flag | Meaning |
|---|---|
| `i` | Case-insensitive |
| `g` | Global (don't stop at first match) |
| `m` | Multiline (`^`/`$` match each line) |
| `s` | Dotall (`.` matches newlines) |
| `u` | Unicode mode |

## 2. 30 Essential Patterns

### Validation

```
Email (basic)         ^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$
Email (stricter)      ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
URL                   ^https?:\/\/[\w.-]+(\:\d+)?(\/[\w./?=#&-]*)?$
IPv4                  ^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$
IPv6 (simple)         ^[0-9a-fA-F:]+$
US phone              ^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$
Strong password (8+)  ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w]).{8,}$
Date YYYY-MM-DD       ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
Time HH:MM:SS         ^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$
Credit card (Visa)    ^4\d{12}(\d{3})?$
UUID                  ^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
Hex color             ^#(?:[0-9a-fA-F]{3}){1,2}$
US ZIP                ^\d{5}(-\d{4})?$
```

### Extraction

```
Domain from URL       https?:\/\/([^\/]+)
JSON string value     "(\\.|[^"])*"
HTML tag              <\/?(\w+)[^>]*>
CSS hex color         #(?:[0-9a-fA-F]{3}){1,2}\b
Email (extract)       [\w.-]+@[\w.-]+\.[a-zA-Z]{2,}
Chinese chars         [\u4e00-\u9fa5]+
Emoji                 [\u{1F600}-\u{1F64F}]   (needs u flag)
URL query params      [?&]([^=&]+)=([^&]*)
Markdown code block   ```[\s\S]*?```
```

### Substitution

```
Collapse whitespace      \s+               →  " "
camelCase → snake_case   ([A-Z])           →  _$1   then lower
snake_case → camelCase   _([a-z])          →  $1.toUpperCase()
Thousands separator      (\d)(?=(\d{3})+$) →  $1,
Strip HTML tags          <[^>]+>           →  ""
Trim                     ^\s+|\s+$         →  ""
Strip C-style comments   \/\*[\s\S]*?\*\/  →  ""
Strip line comments      \/\/.*$           →  ""  (m flag)
Collapse repeated chars  (.)\1+            →  "$1"
```

## 3. 6 Common Pitfalls

### Pitfall 1: `.` doesn't match newlines

```
"line1\nline2"   line1.line2     ❌ no match
                 line1[\s\S]line2  ✅
                 or use s flag: /line1.line2/s  ✅
```

### Pitfall 2: Forgetting to escape

`.` `*` `+` `?` `(` `)` `[` `]` `{` `}` `\` `|` `^` `$` need escaping:

```
Match "1.0":   ❌ 1.0       (matches "1x0" too)
               ✅ 1\.0
```

### Pitfall 3: Greedy backtracking explosion

```
"<a href='1'><a href='2'>"
<a href='.*'>   ❌ matches whole string (greedy)
<a href='.*?'>  ✅ matches first
```

### Pitfall 4: `^` and `$` differ in multiline

```
"line1\nline2"
/^line2/        ❌ no match (^ is start of string)
/^line2/m       ✅ matches (multiline: ^ is start of line)
```

### Pitfall 5: Parsing HTML with regex

**Don't.** HTML isn't a regular language — nesting can't be expressed in regex. Use a DOM parser (cheerio, BeautifulSoup, etc.).

The famous [Stack Overflow answer](https://stackoverflow.com/a/1732454) on this is required reading.

### Pitfall 6: Catastrophic backtracking (ReDoS)

```
Regex (a+)+$  on "aaaaaaaaaaaaaaab" → seconds, sometimes hangs
```

Avoid **nested quantifiers**. Known-vulnerable libraries (older `validator.js`) have CVEs.

## 4. Debugging and Performance

### 1. Use visualizers

- [regex101.com](https://regex101.com): live highlighting, token explanations
- [regexper.com](https://regexper.com): railroad diagram of your regex
- [debuggex.com](https://www.debuggex.com): visualize matching steps

👉 Or [AI Toolbox Regex Tester](/en/tools/regex-tester.html): runs locally, no upload.

### 2. Verbose / extended mode

Python's `re.X` flag allows multiline regex with comments:

```python
re.compile(r"""
    ^
    [\w.-]+        # username
    @
    [\w.-]+        # domain
    \.
    [a-zA-Z]{2,}   # TLD
    $
""", re.X)
```

### 3. Performance testing

If your regex is slow on long strings, suspect backtracking. Try:
- Greedy → lazy
- `.*` → more specific char class
- **Atomic groups** `(?>...)` (where supported)
- Switch to a parser or multi-step processing

## 5. Language Differences

| Feature | JS | Python | Java | Go (RE2) |
|---|---|---|---|---|
| Backreferences | ✅ | ✅ | ✅ | ❌ |
| Lookbehind | ✅ (fixed and variable) | ✅ (3.7+ variable) | ✅ | ❌ |
| Verbose mode | ❌ | ✅ | ❌ | ❌ |
| Unicode default | needs `u` flag | ✅ | ✅ | ✅ |
| Named capture | `(?<name>)` | `(?P<name>)` | `(?<name>)` | `(?P<name>)` |
| ReDoS-immune | ❌ | ❌ | ❌ | ✅ (linear time) |

**Go uses RE2, no backreferences or lookaround, but linear-time guaranteed**. To avoid ReDoS, consider RE2 (also has a [Node.js binding](https://github.com/uhop/node-re2)).

## 6. Learning Path

1. **Start by building**: [AI Toolbox Regex Tester](/en/tools/regex-tester.html)
2. **Deep book**: *Mastering Regular Expressions* by Jeffrey Friedl
3. **Build a snippet library**: save the 30 patterns above for reuse

## TL;DR

- Core: **char classes + quantifiers + anchors + groups**
- 30 patterns cover 90% of cases
- 6 pitfalls: `.` not newline, no escape, greedy backtrack, `^$` modes, don't parse HTML, ReDoS
- Use visualizers, use RE2 to prevent ReDoS

**Practice now**: [AI Toolbox Regex Tester](/en/tools/regex-tester.html)
