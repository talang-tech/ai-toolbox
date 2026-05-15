---
title: Programmer's Guide to Number Bases: Binary, Octal, Decimal, Hex
slug: number-base-conversion
date: 2026-05-14
category: dev
lang: en
description: Why do computers use binary? Why is hex the programmer's best friend? How to convert between bases? This guide explains the principles and tricks.
keywords: base conversion,binary,hexadecimal,octal,programmer
---

# Programmer's Guide to Number Bases: Binary, Octal, Decimal, Hex

As programmers, we work with number bases every day, but few truly understand the principles behind them.

## Why Do Computers Use Binary?

Computers are made of digital circuits, which only have two states: ON and OFF — corresponding to 0 and 1.

This is the fundamental reason binary is the base language of computers: **simplest physical implementation**.

## Number Base Basics

### What is a base?

A base is a counting system. Base N means "count N, then carry over."

| Base | Radix | Symbols | Prefix Notation | Typical Use Case |
|---|---|---|---|---|
| Binary | 2 | 0, 1 | `0b` | Machine code, bit ops, flags |
| Octal | 8 | 0-7 | `0` / `0o` | Linux file permissions |
| Decimal | 10 | 0-9 | (none) | Human everyday calculation |
| Hexadecimal | 16 | 0-9, A-F | `0x` | Memory addresses, colors, hashes |

## Why Programmers Love Hexadecimal

**Reason 1: Binary ↔ Hex conversion is trivial**

4 binary digits = exactly 1 hex digit, perfect alignment:

```
Binary    Hex
0000  →  0
0001  →  1
...
1110  →  E
1111  →  F
```

So a 32-bit binary number can be neatly represented in just 8 hex characters.

**Reason 2: Readability**

- `0b11111010011010110010110001000000` = 4294967040 ❌ Unreadable at a glance
- `0xFACEB000` ✅ A programmer instantly recognizes it

This is why memory addresses, color values, and hashes all use hexadecimal.

## Conversion Methods Between Bases

### Decimal → Binary: Divide by 2, collect remainders

Using 42 as example:

```
42 ÷ 2 = 21  remainder 0
21 ÷ 2 = 10  remainder 1
10 ÷ 2 = 5   remainder 0
 5 ÷ 2 = 2   remainder 1
 2 ÷ 2 = 1   remainder 0
 1 ÷ 2 = 0   remainder 1
```

Read remainders **bottom-up**: `101010`

✅ Verify: `32 + 8 + 2 = 42`

### Binary → Decimal: Expand by place value

`101010₂` = 1×2⁵ + 0×2⁴ + 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 32 + 8 + 2 = 42₁₀

### Binary ↔ Hex: 4-bit grouping

Binary → Hex: Group from right into 4-bit chunks, convert each

```
101010 = 0010 1010
         ↓    ↓
         2    A
```

Result = `0x2A`

Hex → Binary: Expand each digit to 4 bits

```
0xFACE = 1111 1010 1100 1110
```

### Fast Conversion Tricks

**Memorize powers of 2**

```
2⁰ = 1      2⁵ = 32     2¹⁰ = 1024
2¹ = 2      2⁶ = 64     2¹⁶ = 65536
2² = 4      2⁷ = 128    2²⁰ = 1048576
2³ = 8      2⁸ = 256    2³² = 4294967296
2⁴ = 16     2⁹ = 512
```

With these memorized, you can compute binary numbers instantly.

## Programmer's Daily Base Usage

### Scenario 1: Color Values

Hex colors in CSS:

```
#FF0000  = Red (R=255, G=0, B=0)
#00FF00  = Green
#0000FF  = Blue
#FFFFFF  = White
#808080  = Gray
```

Each pair corresponds to a color channel (00=0, FF=255).

### Scenario 2: Linux File Permissions

```
rwx r-x r--  =  7 5 4  (octal)
```

3 binary bits = 1 octal digit:
- r (read) = 4 = 100
- w (write) = 2 = 010
- x (execute) = 1 = 001

That's why `chmod 755` is typed by programmers every day.

### Scenario 3: Bitwise Operations

```python
flags = 0b1010  # Bits 1, 3 are 1
flags |= 0b0100  # Set bit 2
flags &= ~0b1000 # Clear bit 3
```

Bitwise operations are used daily in low-level development and performance optimization.

### Scenario 4: Memory Addresses

```
0x7ffee6b8c8a0  # Typical 64-bit memory address
```

Hex lets 64-bit addresses be represented in just 16 characters.

## Common Misconceptions

**Myth 1: Hex is "programmer-only", not worth learning**

❌ Wrong. Hex is the programmer's native language. Without it, you can't understand low-level code.

**Myth 2: Tools do conversion, no need to calculate yourself**

✅ Tools are fine, but **understanding the principle lets you estimate instantly**. When you see `0x1000` you should immediately know it's 4096, not wait for a tool.

**Myth 3: Octal is obsolete**

❌ Not yet. `chmod 755` file permissions are used every day.

## Quick Mental Math Exercises

How fast can you get these answers?

1. `0xFF` = ?
2. `0x1000` = ?
3. `64` = 2 to what power?
4. `0b1111` = ?
5. What color is `#00FFFF`?

<details>
<summary>Click for answers</summary>

1. 255
2. 4096
3. Power of 6
4. 15
5. Cyan
</details>

## Online Tool

Use our [Base Converter tool](/tools/base-converter) for conversion between binary, octal, decimal, and hexadecimal.

## Summary

Number bases are fundamental programmer literacy:

- ✅ **Binary**: Understand how machines work
- ✅ **Hexadecimal**: The daily language of programming
- ✅ **Octal**: File permissions only
- ✅ **Decimal**: For humans to read

Understanding bases makes the computer's world clearer.

---

Next time you see `0xDEADBEEF` or `0xC0FFEE`, you'll know it's not garbage — it's programmer humor!
