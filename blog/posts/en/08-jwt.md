---
title: Complete JWT Guide: Principles, Use Cases, and Security Best Practices
slug: jwt-guide
date: 2026-05-14
category: dev
lang: en
description: What is JWT? What do Header, Payload, and Signature mean? How is JWT different from Cookie/Session? This article answers all.
keywords: jwt tutorial,jwt principles,json web token,jwt security,jwt explained
---

# Complete JWT Guide: Principles, Use Cases, and Security Best Practices

If you've done backend development or API integration, you're familiar with JWT. As the most popular cross-domain authentication scheme today, JWT has become standard in modern web applications. But do you really understand it?

## What is JWT?

JWT (JSON Web Token) is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object.

A JWT is a Base64-encoded string consisting of three parts separated by dots:

```
xxxxx.yyyyy.zzzzz
```

These are:
1. **Header**
2. **Payload**
3. **Signature**

## JWT Three Parts Explained

### 1. Header

The Header typically consists of two parts: the token type (typ) and the signing algorithm (alg).

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Common signing algorithms:
- **HS256** (HMAC-SHA256): Symmetric encryption, same key for signing and verification
- **RS256** (RSA-SHA256): Asymmetric encryption, sign with private key, verify with public key
- **ES256** (ECDSA-SHA256): Elliptic curve digital signature algorithm

### 2. Payload

The Payload contains claims — statements about an entity (typically the user) and additional data.

Three types of claims:

- **Registered claims**: Predefined, recommended but optional
  - `iss` (issuer): Who issued this token
  - `exp` (expiration time): When the token expires
  - `sub` (subject): The subject
  - `aud` (audience): Who the token is intended for
  - `iat` (issued at): When it was issued
- **Public claims**: Custom defined, should be registered or namespaced
- **Private claims**: Application-specific custom claims

A typical Payload:

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "role": "admin",
  "iat": 1620000000,
  "exp": 1620086400
}
```

**Important reminder:** **The Payload is just Base64 encoded,**NOT encrypted**! Anyone who gets the JWT can decode and see the Payload contents.**Never put sensitive information (passwords, credit card numbers, etc.) in the Payload.**

### 3. Signature

The Signature is created by taking the encoded Header + encoded Payload + a secret key, signed using the algorithm specified in the Header.

Using HS256 as an example:

```javascript
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

The signature's purpose:**Verify the message hasn't been tampered with**. If someone modifies the Header or Payload, the recalculated signature won't match the original.

## JWT vs Session/Cookie

| Feature | JWT | Session/Cookie |
|---|---|---|
| Storage | Client-side (LocalStorage/memory) | Server-side |
| Scalability | Good (stateless) | Poor (stateful) |
| CORS support | Native support | Limited by same-origin policy |
| CSRF protection | Naturally immune | Requires additional protection |
| Revocation | Relatively difficult | Server can delete directly |
| Data size | Larger (hundreds of bytes) | Very small (Session ID) |

**Selection guide:
- ✅ Choose JWT: Cross-origin APIs, mobile APIs, microservices
- ✅ Choose Session: Traditional web apps, financial-grade security, need immediate revocation

## Common JWT Use Cases

### Scenario 1: User Authentication

After successful login, the server issues a JWT. Subsequent requests carry the JWT, and the server verifies the signature to confirm user identity.

```
Authorization: Bearer <token>
```

### Scenario 2: Information Exchange

Securely pass information between services. For example, microservice A calls microservice B, carrying a JWT to prove identity.

### Scenario 3: One-time Tokens

Password reset links, email verification links, etc. JWT carries expiration time, server just needs to verify signature.

## JWT Security Best Practices

### 1. Never put sensitive information in Payload

Base64 is NOT encryption! Anyone can decode it.

### 2. Set reasonable expiration times

```json
{
  "exp": Math.floor(Date.now() / 1000) + 3600  // 1 hour expiry
}
```

Short-lived access token + Refresh Token is best practice.

### 3. Use HTTPS

If JWT is intercepted during transmission, attackers can use it directly. Always transmit over HTTPS.

### 4. Choose appropriate signing algorithm

- Single service: HS256 is sufficient (good performance)
- Multi-service/third-party verification: RS256 (only issuer has private key)

### 5. Don't store JWT in LocalStorage (frontend)

LocalStorage is vulnerable to XSS attacks.

✅ Recommendations:
- In-memory storage (SPA apps)
- HttpOnly Cookie (traditional web apps)

### 6. Implement token revocation mechanism

JWT is stateless and can't be directly revoked after issuance. Common solutions:
- Short expiration times
- Revocation blacklist (Redis)
- Version number mechanism

## Common JWT Misconceptions

**Myth 1: JWT is encrypted, very secure

❌ Wrong. JWT is encoding + signature,**NOT encryption**. Contents are plainly visible.

**Myth 2: JWT is more secure than Session

❌ Not necessarily. Each has pros and cons depending on implementation. Session with HttpOnly + Secure Cookie is equally secure.

**Myth 3: JWT should be stored in LocalStorage

❌ LocalStorage can't defend against XSS. HttpOnly Cookie is recommended.

## Online Tool

Use our [JWT Decoder tool](/tools/jwt) to quickly decode JWT Header and Payload, view expiration time, issuer, and more.

## Summary

JWT is a powerful yet simple standard. Understanding the three-part structure, understanding that signature ≠ encryption, understanding use cases, you can use JWT well.

Remember three core principles:
1. **JWT is NOT encryption
2. **Set expiration times
3. **Transmit over HTTPS

---

Next time you use a JWT, decode it with our tool to see what's inside!
