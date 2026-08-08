---
title: "New: JSON to Zod Schema Generator & Text Justify Tool"
date: 2026-08-08
readtime: 3 min
description: "Two new browser-local tools: Generate Zod validation schemas from JSON, and justify text to any width. Privacy-first, no upload."
keywords: "json to zod, zod schema generator, text justify, text alignment, new tools, ai toolbox, browser local, typescript validation"
---

We're adding two new tools to the AI Toolbox today:

## 🔮 JSON to Zod Schema Generator

TypeScript developers, this one's for you. [JSON to Zod](/tools/json-to-zod) automatically generates [Zod](https://zod.dev) validation schemas from your JSON data.

**Why Zod?** Zod is the most popular TypeScript-first schema validation library. It's used in Next.js, tRPC, Remix, and countless other projects. Writing schemas manually is tedious — this tool gets you 80% of the way there instantly.

**What it handles:**
- Nested objects and arrays (any depth)
- Type inference: `string`, `number`, `boolean`, `array`, `object`
- Optional field detection via `null` values
- Enum inference from string literals
- Special format detection: `.email()`, `.url()`, `.uuid()`, `.datetime()`
- Strict mode with `.strict()`

**Example:** Paste this JSON:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "age": 30,
  "role": "admin",
  "tags": ["dev", "design"]
}
```

And get:

```typescript
import { z } from 'zod';

export const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().int(),
  role: z.string(),
  tags: z.array(z.string()),
}).strict();
```

## 📐 Text Justify Tool

[Text Justify](/tools/text-justify) formats plain text to a specified width with full justification, left/right/center alignment, custom padding, indent, and paragraph spacing.

**Great for:**
- Code comment alignment
- ASCII art tables
- Email body formatting
- Plain text document layout
- Terminal output formatting

**Features:**
- Full justification with even word spacing
- Left, right, center alignment
- Custom fill character (space, dot, dash, etc.)
- First-line indent
- Paragraph spacing
- Preserve or auto-merge paragraph breaks
- Real-time line/word/char statistics

## Why both are browser-local

Like all tools in the AI Toolbox, both run entirely in your browser. Your JSON data and text never leave your device. No upload, no tracking, no signup required.

## What's next?

We're working on more JSON-related utilities (JSON to Yup, JSON to Joi) and text formatting tools. Have an idea? [Open an issue on GitHub](https://github.com/talang-tech/ai-toolbox/issues/new?template=tool_request.yml).