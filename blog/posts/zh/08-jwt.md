---
title: JWT 完全指南：原理、使用场景与安全最佳实践
slug: jwt-guide
date: 2026-05-14
category: dev
lang: zh-CN
description: JWT 是什么？Header、Payload、Signature 三部分分别是什么意思？JWT 常见误区和 Cookie/Session 有什么区别？本文详细解答。
keywords: jwt详解,jwt原理,jwt教程,json web token,jwt安全
---

# JWT 完全指南：原理、使用场景与安全最佳实践

如果你做过后端开发或 API 对接，JWT 一定不陌生。作为目前最流行的跨域认证方案，JWT 已经成为现代 Web 应用的标配。但很多开发者真的理解 JWT 吗？

## 什么是 JWT？

JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输信息作为 JSON 对象。

JWT 的典型结构是一串用 Base64 编码的字符串，由三部分组成，用点号分隔：

```
xxxxx.yyyyy.zzzzz
```

分别是：
1. **Header**（头部）
2. **Payload**（载荷）
3. **Signature**（签名）

## JWT 三部分详解

### 1. Header

Header 通常由两部分组成：令牌类型（typ）和使用的签名算法（alg）。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

常用签名算法：
- **HS256** (HMAC-SHA256)：对称加密，用同一个密钥签名和验证
- **RS256** (RSA-SHA256)：非对称加密，用私钥签名，公钥验证
- **ES256** (ECDSA-SHA256)：椭圆曲线数字签名算法

### 2. Payload

Payload 包含声明（claims），即关于实体（通常是用户）和附加数据的声明。

三种声明类型：

- **注册声明**（Registered claims）：预定义的声明，可选但推荐使用
  - `iss` (issuer)：签发者
  - `exp` (expiration time)：过期时间
  - `sub` (subject)：主题
  - `aud` (audience)：受众
  - `iat` (issued at)：签发时间
- **公共声明**（Public claims）：自定义，建议在 IANA 注册或使用带命名空间
- **私有声明**（Private claims）：应用自定义

一个典型的 Payload：

```json
{
  "sub": "1234567890",
  "name": "张三",
  "role": "admin",
  "iat": 1620000000,
  "exp": 1620086400
}
```

**重要提醒：** **Payload 只是 Base64 编码，**不是加密**！任何人拿到 JWT 都可以解码看到 Payload 内容。**不要在 Payload 中存放敏感信息（密码、信用卡号等）。

### 3. Signature

Signature 是对编码后的 Header + 编码后的 Payload + 密钥，使用 Header 中指定的算法进行签名得到的。

以 HS256 算法为例：

```javascript
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

签名的作用：**验证消息没有被篡改**。如果有人修改了 Header 或 Payload，重新计算的签名就会和原签名不一致。

## JWT vs Session/Cookie

| 特性 | JWT | Session/Cookie |
|---|---|---|
| 存储位置 | 客户端（LocalStorage/内存） | 服务端 |
| 扩展性 | 好（无状态） | 差（有状态） |
| 跨域支持 | 原生支持 | 受限于同源策略 |
| CSRF 防护 | 天然免疫 | 需要额外防护 |
| 过期控制 | 相对困难 | 服务端直接删除 |
| 数据体积 | 较大（数百字节） | 极小（Session ID） |

**选择依据：
- ✅ 选 JWT：跨域 API、移动端 API、微服务架构
- ✅ 选 Session：传统 Web 应用、金融级安全要求、需要随时吊销

## JWT 常见使用场景

### 场景 1：用户认证

用户登录成功后，服务端签发 JWT，后续请求携带 JWT，服务端验证签名即可确认用户身份。

```
Authorization: Bearer <token>
```

### 场景 2：信息交换

服务之间安全传递信息。比如微服务 A 调用微服务 B，携带 JWT 证明身份。

### 场景 3：一次性令牌

密码重置链接、邮件验证链接等，JWT 自带过期时间，服务端验证签名即可。

## JWT 安全最佳实践

### 1. 永远不要在 Payload 中放敏感信息

Base64 不是加密！任何人都可以解码。

### 2. 设置合理的过期时间

```json
{
  "exp": Math.floor(Date.now() / 1000) + 3600  // 1 小时过期
}
```

短期 Token + Refresh Token 是最佳实践。

### 3. 使用 HTTPS

JWT 在传输过程中如果被截获，攻击者可以直接使用。必须在 HTTPS 环境下传输。

### 4. 选择合适的签名算法

- 单服务场景：HS256 足够（性能好）
- 多服务/第三方验证场景：RS256（只有签发方有私钥）

### 5. 不要将 JWT 存入 LocalStorage（前端

LocalStorage 容易受到 XSS 攻击。

✅ 推荐：
- 内存存储（SPA 应用
- HttpOnly Cookie（传统 Web 应用）

### 6. 实现 Token 吊销机制

JWT 是无状态的，签发后无法直接吊销。常用方案：
- 短过期时间
- 维护吊销黑名单（Redis）
- 版本号机制

## JWT 常见误区

**误区 1：JWT 是加密的，很安全

❌ 错误。JWT 只是编码 + 签名，**不是加密**。内容是明文可见的。

**误区 2：JWT 比 Session 更安全

❌ 不一定。各有优劣，取决于具体实现。Session 配合 HttpOnly + Secure Cookie 同样安全。

**误区 3：JWT 应该存到 LocalStorage

❌ LocalStorage 无法防御 XSS。推荐 HttpOnly Cookie。

## 在线工具

使用我们的 [JWT 解码工具](/tools/jwt)，可以快速解码 JWT 的 Header 和 Payload，查看过期时间、签发者等信息。

## 总结

JWT 是一个强大但简单的标准。理解了三部分结构，理解了签名不是加密，理解了适用场景，你就能用好 JWT。

记住三个核心原则：
1. **JWT 不是加密
2. **设置过期时间
3. **用 HTTPS 传输

---

下次使用 JWT 时，别忘了用我们的工具解码看看里面是什么！
