---
title: CSV Column Filter + JSON to TOML: New Data Format Tools
slug: csv-column-filter-json-to-toml-launch
date: 2026-08-11
category: data
lang: en
description: AI Toolbox adds two new tools — CSV Column Filter for column selection and JSON to TOML for config format conversion.
keywords: csv column filter, json to toml, csv column operations, config format, data conversion tools, online tools, csv tools, toml tools
---

# CSV Column Filter + JSON to TOML: New Data Format Tools

This update brings two new tools addressing common data processing pain points: CSV column operations and configuration file format conversion.

## CSV Column Filter

When working with CSV data, you often need only a subset of columns. Instead of using Excel or writing scripts, **CSV Column Filter** lets you do it directly in the browser:

- **Check columns to keep** — visual interface, click to select
- **Drag to reorder** — rearrange columns by dragging
- **Rename columns** — modify column names before export
- **Custom delimiter** — supports comma, tab, semicolon, etc.

All processing is done locally in your browser with zero data upload.

## JSON to TOML

TOML is an increasingly popular configuration format, widely used in Cargo.toml, pyproject.toml, and many other tools. If you need to convert JSON data from APIs to TOML configuration, this tool saves you time.

**JSON to TOML** supports:

- Automatic nested object to TOML section conversion
- Smart array type detection: value arrays become inline arrays, object arrays become table arrays (`[[array]]`)
- Full TOML v1.0 spec output
- One-click copy

## Use Cases

- **Data processing**: Extract key columns from CSV reports, reorder then export
- **Config migration**: Convert JSON configs to TOML for Rust or Python projects
- **Data cleaning**: Use Column Filter first to extract relevant columns, then use CSV Cleaner for quality issues

## Privacy First

All tools run entirely in the browser. No data is uploaded to any server. Feel free to process sensitive data with confidence.

## Try It Online

- [CSV Column Filter](/en/tools/csv-column-filter)
- [JSON to TOML](/en/tools/json-to-toml)
- [All Tools](/en/tools/)