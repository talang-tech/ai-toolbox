---
title: HTML Stripper and JSON to CSV: Two New Data Cleaning Tools
description: Two new privacy-first tools added to AI Toolbox: HTML Tag Stripper with 3 modes and JSON to CSV with nested object flattening. All processing happens locally.
keywords: html tag stripper, json to csv, html to plain text, data cleaning, browser local processing, new tools
date: 2026-06-24
readtime: 4 min read
---

AI Toolbox just shipped two new high-demand utilities: **HTML Tag Stripper** and **JSON to CSV Converter**. Both are common data cleaning tasks that benefit from browser-local processing.

## 🧹 HTML Tag Stripper

Copying content from a web page often brings along markup fragments. Manually removing `<div>`s, `<span>`s, inline styles, and comment blocks is tedious and error-prone.

[HTML Tag Stripper](/en/tools/html-stripper) lets you paste HTML and extract clean text in one click.

### Three Processing Modes

1. **Strip tags (keep content)**: Removes tags like `<div>`, `<span>`, `<p>` while preserving their inner text. Perfect for cleaning content copied from rich editors.
2. **Strip tags & content**: Also removes `<script>`, `<style>`, `<svg>`, `<noscript>`, `<template>` and their contents. Useful for extracting body text while discarding tracking and styling.
3. **Decode entities only**: Converts `&amp;` to `&`, `&lt;` to `<`, `&nbsp;` to space, without touching any tags.

### Options

- **Preserve line breaks**: Block-level tags become newlines, preserving paragraph structure
- **Collapse spaces**: Compress consecutive spaces into one for cleaner output

### Live Statistics

The tool shows before/after character counts and compression ratio in real-time — so you know exactly how much markup you've stripped.

## 📊 JSON to CSV Converter

JSON is great for machines; CSV is great for humans (and Excel). [JSON to CSV Converter](/en/tools/json-to-csv) bridges the gap.

### Key Features

- **Arrays & single objects**: Arrays become multiple rows; single objects become one row
- **Auto-detect columns**: All unique keys across objects become CSV headers
- **Two formats**:
  - **Flat mode**: One row per object, all keys as columns
  - **Nested flatten**: Dot-path column names like `user.address.city`
- **Simple value arrays**: `["a", "b"]` becomes one value per row

### Delimiter Options

| Delimiter | Best For |
|-----------|----------|
| Comma `,` | Excel/WPS — universal |
| Tab `\t` | Data containing commas |
| Semicolon `;` | Regional Excel CSV defaults |
| Pipe `|` | Logs and CLI tools |

### Use Cases

- Export API JSON responses to Excel for non-technical teams
- Convert database query results to CSV for analysis
- Visualize nested config fields — flatten to see all available paths
- Prepare test data in table format for QA

## Privacy

Both tools are 100% browser-local. Your HTML and JSON data never leave your device. No registration, no uploads, no server round-trips.

## Related Tools

- [CSV to JSON Converter](/en/tools/csv-to-json) — the reverse direction
- [JSON Formatter](/en/tools/json-formatter) — validate and beautify JSON
- [HTML Entity Encoder/Decoder](/en/tools/html-entity) — encode/decode HTML entities
- [HTML Table Extractor](/en/tools/html-table-extractor) — extract `<table>` data to CSV/JSON/Markdown
- [CSV Viewer](/en/tools/csv-viewer) — display CSV as a table in-browser