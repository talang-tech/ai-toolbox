---
title: Complete JSONPath Guide: From Beginner to Pro
slug: jsonpath-complete-guide
date: 2026-05-15
category: dev
lang: en
description: JSONPath is the XPath for JSON. This guide covers syntax to advanced usage with examples, teaching you to extract data from complex JSON quickly.
keywords: jsonpath tutorial,jsonpath syntax,json extract data,jsonpath examples,online jsonpath
---

# Complete JSONPath Guide: From Beginner to Pro

JSONPath is a query language for extracting data from JSON documents — the equivalent of XPath for XML. If you're a backend developer, test engineer, data analyst, or frequently work with API responses, JSONPath can save you hours of manual parsing.

## Why JSONPath?

Suppose you have this API response:

```json
{
  "store": {
    "book": [
      {
        "category": "programming",
        "author": "Zhang San",
        "title": "Python Intro Tutorial",
        "price": 89.99
      },
      {
        "category": "programming",
        "author": "Li Si",
        "title": "Go in Action",
        "price": 99.00
      },
      {
        "category": "fiction",
        "author": "Wang Wu",
        "title": "Sea of Life",
        "price": 45.00
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 299.00
    }
  }
}
```

**Question: How to extract all book titles with price < 90?**

Writing loops in Python takes 5 lines. With JSONPath, it takes one line:

```
$.store.book[?(@.price < 90)].title
```

That's the power of JSONPath — concise path expressions to precisely extract data from complex nested structures.

---

## JSONPath Syntax Cheat Sheet

### Core Operators

| Syntax | Meaning | Example |
|---|---|---|
| `$` | Root Object | `$` - The entire JSON object |
| `@` | Current Object | `@.price` - price field of current object |
| `.key` | Child Field (Dot Notation) | `$.store` - Value of store field |
| `['key']` | Child Field (Bracket Notation) | `$['store']` - Same as above, for special char keys |
| `..key` | Recursive Descent | `$..price` - All price fields at any depth |
| `[index]` | Array Index | `$.store.book[0]` - First book |
| `[start:end]` | Array Slice | `$.store.book[0:2]` - First two books |
| `[*]` | All Elements (Wildcard) | `$.store.book[*]` - All books |
| `[?(condition)]` | Filter Expression | `$.[?(@.price > 50)]` - All items with price > 50 |

---

## Common Scenarios Explained

### Scenario 1: Extract Nested Field

**Problem: Get the bicycle color**

```json
JSONPath: $.store.bicycle.color
Result: "red"
```

### Scenario 2: Extract Field from All Array Elements

**Problem: Get all author names**

```json
JSONPath: $..author
Result: ["Zhang San", "Li Si", "Wang Wu"]
```

`..` searches recursively at all levels, extremely useful.

### Scenario 3: Array Index Access

**Problem: Get first book full info**

```json
JSONPath: $.store.book[0]
Result: {"category": "programming", "author": "Zhang San", ...}
```

### Scenario 4: Filter by Condition

**Problem: Find all programming books**

```json
JSONPath: $.store.book[?(@.category == 'programming')]
Result: First two book objects
```

---

## Online Tool Recommendation

Use our [**JSONPath Online Extractor Tool**](/en/tools/jsonpath) to input JSON and path expressions in real-time and see results immediately.

---

## Summary

JSONPath is a simple but powerful tool. Mastering it can make your JSON processing several times more efficient.

**Related Tools:**
- [JSON Formatter](/en/tools/json-formatter) - Beautify and validate JSON
- [JSON ↔ CSV Converter](/en/tools/json-csv) - JSON to CSV and back
- [JWT Decoder](/en/tools/jwt-decoder) - Parse JWT Tokens
