---
title: URL Query Builder and String Escaping: Practical Guide for APIs, UTM Links and Logs
description: Learn the differences between URL query strings, encodeURIComponent, JSON/JavaScript/Unicode/HTML escaping, and why sensitive text should be processed locally in the browser.
keywords: URL query builder,query string builder,string escape,JSON escape,JavaScript escape,URL encoding,UTM parameters,browser local tools
date: 2026-06-10
readtime: 8 min read
---

API debugging, campaign links and log analysis often run into two deceptively simple problems:

1. how to build URL query parameters correctly;
2. how to escape newlines, quotes, Chinese text, emoji and HTML tags in strings.

A small mistake can drop parameters, break request signatures, make logs impossible to reproduce, or leak sensitive tokens into a random online tool.

## A query string is not just string concatenation

A URL with query parameters looks like this:

```text
https://example.com/search?q=json+formatter&lang=en&tag=tool&tag=seo
```

There are several details:

- both keys and values need URL encoding;
- spaces may appear as `%20` or `+`;
- repeated keys are valid, for example `tag=tool&tag=seo`;
- the `#hash` fragment is not part of the query;
- hand-written strings often miss `?`, `&` or encoding.

For API debugging or campaign links, it is safer to use [URL Query Builder](/en/tools/url-query-builder): parse an existing URL, edit key/value rows visually, then copy either the full URL or the query string.

## UTM parameters should be templated

Common UTM parameters include:

```text
utm_source=github
utm_medium=readme
utm_campaign=ai_toolbox_launch
utm_content=json_tools
utm_term=json_formatter
```

Writing them by hand often leads to inconsistent names, unencoded spaces or messy campaign values. URL Query Builder includes a UTM template. For early sites, UTM is a low-friction way to understand source context, but it should not be confused with real ad network or affiliate code before commercial terms are confirmed.

## String escaping: JSON, JS, URL and HTML are different

People often say "escape this string" as if there were one universal rule. There is not.

### JSON string escaping

JSON needs newlines and quotes escaped:

```json
"Hello\n\"AI Toolbox\""
```

This is useful for API payloads, request logs and config snippets.

### JavaScript string escaping

JavaScript snippets may also involve single quotes, backslashes and control characters. When copying logs into code to reproduce a bug, JS string escaping is often the right target.

### URL encoding

URL parameters cannot contain raw `&`, `?`, `#` or spaces. Use `encodeURIComponent` style encoding:

```text
hello world & json → hello%20world%20%26%20json
```

### HTML entities

To display `<script>` as text instead of executing it, use HTML entities:

```html
&lt;script&gt;alert(1)&lt;/script&gt;
```

Use [String Escape / Unescape](/en/tools/string-escape) to handle JSON, JavaScript, Unicode, URL and HTML modes in one place.

## Why local processing matters

URLs and strings often include:

- API tokens, JWTs and signed parameters;
- internal domains, service names and debug flags;
- user IDs, order IDs and email addresses;
- error logs, stack traces and business fields;
- campaign links that are not public yet.

These operations do not require server-side compute. The safest default is browser-local processing. AI Toolbox tools are static pages plus frontend JavaScript; your input is not uploaded to our servers.

## Recommended workflow

- Break down an existing link: [URL Parser](/en/tools/url-parser);
- Build or edit parameters: [URL Query Builder](/en/tools/url-query-builder);
- Encode a single text fragment: [URL Encoder/Decoder](/en/tools/url-encoder);
- Escape JSON/JS/Unicode/HTML strings: [String Escape / Unescape](/en/tools/string-escape);
- Clean API responses: [JSON Formatter](/en/tools/json-formatter).

If your team frequently handles internal APIs and logs, consider deploying these tools privately to reduce the risk of pasting sensitive content into random websites. AI Toolbox also supports [private deployment and custom browser-local tools](/en/sponsor).
