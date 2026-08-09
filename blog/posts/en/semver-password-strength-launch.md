---
title: "New Tools: SemVer Compare & Password Strength Checker"
date: 2026-08-10
readtime: 3 min
description: "Two new browser-local tools: Semantic Versioning comparator (validate, sort, bump) and real-time password strength analyzer (entropy, crack time estimation). Privacy-first, no data upload."
keywords: "SemVer,version compare,semantic versioning,password strength,password checker,password entropy,crack time,new tool,AI Toolbox,browser local"
---

AI Toolbox is adding two new tools today — one for developers managing versions, and one for everyone who cares about password security.

## 🔢 SemVer Compare

[SemVer Compare](/en/tools/semver-compare) is a complete semantic versioning toolkit that validates, compares, sorts, and bumps version numbers.

**Key features:**

- **Version validation** — Check if a version string follows the SemVer format (X.Y.Z or X.Y.Z-pre+build), with detailed breakdown of major, minor, patch, pre-release, and build metadata
- **Version comparison** — Compare two version strings to determine which is greater, smaller, or equal. Properly handles pre-release priority rules
- **Version sorting** — Paste multiple versions (one per line) and sort ascending or descending, with correct pre-release handling
- **Version bumping** — One-click bump for major, minor, patch, or pre-release version

**Quick example:** Type `1.2.3` and click "Patch+" to get `1.2.4`. Type `1.0.0-alpha.1`, click "Pre+" to get `1.0.0-alpha.2`.

SemVer is the standard versioning scheme used by npm, Go Modules, Rust Cargo, Python PyPI, and many other ecosystems. This tool helps you validate version formats and ensure correct increments before every release.

## 🔒 Password Strength Checker

The [Password Strength Checker](/en/tools/password-strength) gives you real-time analysis as you type — all processing happens locally in your browser. Your password never leaves your device.

**Analysis dimensions:**

- **Entropy calculation** — Computes the password's entropy in bits based on character set size and length. 80+ bits is considered very strong
- **Crack time estimation** — Shows estimated time to crack using both fast hashes (MD5/SHA1) and slow hashes (bcrypt), giving you a realistic picture of security
- **Character composition** — Visual breakdown of uppercase, lowercase, digits, and symbols
- **Weak pattern detection** — Built-in database of 100+ common weak passwords, plus detection of repeated characters, sequential patterns, keyboard patterns, date formats, and phone numbers
- **Strength levels** — Weak / Fair / Medium / Strong / Very Strong, with a visual progress bar

**Why use a password strength checker?** Most people overestimate their password security. By seeing real-time entropy feedback and crack time estimates, you can intuitively understand what makes a password truly secure — rather than relying on outdated rules like "must include uppercase and special characters."

## What both tools have in common

Like all AI Toolbox tools, they run entirely in your browser:

- ✅ 100% local processing, no data uploaded
- ✅ No registration or login required
- ✅ Free to use, no usage limits
- ✅ Responsive design for desktop and mobile

## What's next

We're continuing to expand the developer toolchain. Next up: more security-focused tools (enhanced password generator, key security assessment) and version management utilities. Have an idea? [Open an issue on GitHub](https://github.com/talang-tech/ai-toolbox/issues/new?template=tool_request.yml).