---
title: QR Code Technology Explained: From Black Squares to Data Transmission
slug: qr-code-technology
date: 2026-05-14
category: tech
lang: en
description: How does QR code store data? What are the versions? What is error correction? This article explains the technical principles of QR Code.
keywords: qr code technology,qrcode principles,qr code versions,qr code error correction
---

# QR Code Technology Explained: From Black Squares to Data Transmission

We scan QR codes every day for payments, adding friends, and following accounts — but do you know how those black and white squares actually work?

## Basic Structure of QR Code

A standard QR code consists of:

- **Position Detection Patterns**: Large squares at three corners, allowing scanners to quickly locate position and orientation
- **Timing Patterns**: Alternating black/white dotted lines, correcting perspective distortion
- **Format Information**: Stores error correction level and mask pattern
- **Version Information**: QR code size (Version 1 to Version 40)
- **Data and Error Correction Codewords**: Actual data + redundant error correction data

## QR Code Version System

QR codes have 40 sizes from Version 1 to Version 40:

| Version | Modules | Max Capacity (numeric) | Typical Use |
|---|---|---|---|
| 1 | 21×21 | 41 chars | Short URLs, phone numbers |
| 5 | 37×37 | 187 chars | Business cards, WiFi passwords |
| 10 | 57×57 | 652 chars | Complete text paragraphs |
| 20 | 97×97 | 2420 chars | Short articles, JSON configs |
| 40 | 177×177 | 7089 chars | Long text, small binary files |

Higher versions mean larger QR codes and more data storage. Payment codes we scan daily are roughly Version 5-10.

## Encoding Modes

QR codes support 4 encoding modes, automatically selecting the optimal one based on data type:

| Mode | Character Set | Bits per Character |
|---|---|---|
| Numeric | 0-9 | 3.33 bits |
| Alphanumeric | 0-9, A-Z, space + $%*+-./: | 5.5 bits |
| 8-bit Byte | ISO-8859-1 / UTF-8 | 8 bits |
| Kanji | Chinese/Japanese characters | 13 bits |

This is why **the same size QR code can store far more numbers than Chinese characters**. Each Chinese character needs 13 bits (~1.6 bytes), while a numeric digit only needs 3.33 bits.

## Error Correction: Why Damaged QR Codes Still Scan?

One of QR code's most magical features is error correction. Even if partially covered, smudged, or printed poorly, QR codes can often still be read successfully.

This is because QR codes store **redundant data**. Data is divided into blocks, and error correction codes are generated for each block using the Reed-Solomon algorithm.

Four error correction levels:

| Level | Correction Ability | Typical Use |
|---|---|---|
| L | ~7% error correction | Clear printed documents |
| M | ~15% error correction | Payment codes (default) |
| Q | ~25% error correction | Outdoor billboards |
| H | ~30% error correction | Industrial environments |

This is why many companies can put logos in the center of QR codes and they still work — the logo covers about 20% of the area, and Level H error correction can fully recover the data.

## Design Considerations

### Why square?

Square QR codes are easiest to locate and calculate. Three corner detection patterns are sufficient to determine position and rotation.

### Why black and white?

Black and white have the highest contrast, giving the best recognition rate in poor lighting or faded printing. Color QR codes look nicer but have significantly lower scan success rates.

### Why the white border around QR codes?

The quiet zone helps scanners distinguish the QR code from the background. The standard requires at least 4 module widths of quiet zone. QR codes without this have much lower scan success.

## Online Tools

Use our [QR Code Generator](/tools/qr-code) and [QR Code Decoder](/tools/qr-decode) to generate QR codes for any content, or decode QR codes from images — all processing happens locally in your browser, no data uploaded.

## The Future of QR Codes

Although QR codes were invented over 25 years ago (1994 by Denso Wave in Japan), their applications continue to expand: from payments and health passes to digital collectibles and AR entry points.

Compared to new technologies, QR codes have the advantage of **extremely low technical barrier**: receivers don't need to install any app — just a camera. Senders don't need internet to generate them. This makes QR codes the simplest bridge between the physical and digital worlds.

---

Next time you scan a QR code, you'll know the technology behind those black and white squares!
