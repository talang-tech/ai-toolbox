---
title: Complete JSONPath Tutorial: From Beginner to Pro
slug: jsonpath-tutorial
date: 2026-05-14
category: data
lang: en
description: JSONPath is the XPath for JSON. This guide covers syntax to advanced usage with examples, teaching you to extract data from complex JSON quickly.
keywords: jsonpath tutorial,jsonpath syntax,json extract data,jsonpath examples
---

# Complete JSONPath Tutorial: From Beginner to Pro

JSONPath is a query language for extracting data from JSON documents — the equivalent of XPath for XML. If you frequently work with API responses, JSONPath can save you hours of manual parsing.

## Why JSONPath?

Suppose you have this API response:

```json
{
  "store": {
    "book": [
      {"category": "programming", "author": "Zhang", "title": "Python Intro", "price": 89},
      {"category": "programming", "author": "Li", "title": "Go in Action", "price": 99},
      {"category": "fiction", "author": "Wang", "title": "Sea of Life", "price": 45}
    ],
    "bicycle": {"color": "red", "price": 299}
  }
}
```

Question: **How to extract all book titles with price < 90?**

Writing loops in Python takes 5 lines. With JSONPath, it takes one line:

```
$.store.book[?(@.price < 90)].title
```

## JSONPath Syntax Cheat Sheet

| Syntax | Meaning | Example |
|---|---|---|
| `$` | Root node | `$` - entire JSON object |
| `@` | Current node | `@.price` - price field of current object |
| `.key` | Child field | `$.store` - value of store field |
| `..key` | Recursive search | `$..price` - all price fields at any depth |
| `[index]` | Array index | `$.store.book[0]` - first book |
| `[start:end]` | Array slice | `$.store.book[0:2]` - first two books |
| `[*]` | All elements | `$.store.book[*]` - all books |
| `[?(condition)]` | Filter | `$.[?(@.price > 50)]` - items with price > 50 |

## Common Scenarios

### Scenario 1: Extract nested field

```
JSONPath: $.store.bicycle.color
Result: "red"
```

### Scenario 2: Extract field from all array elements

```
JSONPath: $..author
Result: ["Zhang", "Li", "Wang"]
```

### Scenario 3: Filter by condition

```
JSONPath: $.store.book[?(@.category == 'programming')].title
Result: ["Python Intro", "Go in Action"]
```

### Scenario 4: Combine conditions

```
JSONPath: $.store.book[?(@.price < 100 && @.category == 'programming')]
Result: Both programming books, full objects
```

## Common Pitfalls

**Pitfall 1: Forgetting the root node**

❌ Wrong: `store.book[0].title`  
✅ Correct: `$.store.book[0].title`

**Pitfall 2: Missing ? in filter**

❌ Wrong: `$.[@.price > 50]`  
✅ Correct: `$.[?(@.price > 50)]`

**Pitfall 3: Strings need quotes**

❌ Wrong: `?(@.category == programming)`  
✅ Correct: `?(@.category == 'programming')`

## Recommended Tool

Use our [JSONPath Extractor tool](/tools/jsonpath) to input JSON and path in real-time — perfect for learning and debugging.

## Advanced Techniques

### Multi-value selection

```
JSONPath: $.store.book[0]['author', 'title']
Result: {"author": "Zhang", "title": "Python Intro"}
```

### Negation

```
JSONPath: $.store.book[?(@.category != 'fiction')]
```

### Existence check

```
JSONPath: $.store.book[?(@.isbn)]
```

---

JSONPath is an essential skill for data engineers, backend developers, and API testers. Master it and your JSON processing efficiency will improve dramatically.
