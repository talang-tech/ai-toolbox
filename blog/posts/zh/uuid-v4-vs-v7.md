---
title: UUID v4 vs v7 完全对比：什么时候该用哪个？(2026 最新)
description: 详解 UUID v4（随机）和 UUID v7（时间序）的区别，性能基准、数据库索引影响、迁移建议，以及 6 个真实场景该选哪个。
keywords: UUID v4,UUID v7,UUID 对比,UUID 数据库性能,Snowflake ID,主键设计,分布式 ID
date: 2026-05-10
readtime: 11 分钟阅读
---

如果你最近一年没关注 UUID 的话，可能已经过时了。**RFC 9562**（2024 年 5 月发布）正式标准化了 UUID v6/v7/v8，其中 **UUID v7** 正在迅速取代 v4 成为新项目的默认选择。

这篇文章告诉你为什么。

## 一、UUID v4 是什么？

UUID v4 = 122 bit 随机数 + 6 bit 版本号。长这样：

```
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

碰撞概率：**生成 10 亿个有 50% 概率重复一个**。所以可以认为永不重复。

**优点**：
- 完全随机，不暴露任何信息
- 无需中心化协调
- 最常见，所有语言库都支持

**缺点（这是 v7 出现的原因）**：
- 没有时间顺序 → 数据库 B-Tree 索引插入时**随机分散写入**
- 不能按生成时间排序
- 在大表中是**性能杀手**（页分裂、缓存失效）

## 二、UUID v7 是什么？

UUID v7 = **48 bit Unix 毫秒时间戳** + 74 bit 随机数 + 6 bit 版本号。长这样：

```
01928a3f-1234-7567-89ab-0123456789ab
└─时间戳─┘└随机─┘└版本└─随机───┘
```

**前 48 bit 是时间**，后续是随机。所以：

- 仍然全球唯一（74 bit 随机 ≈ 1.8 × 10^22 种组合）
- **天然按生成时间排序**
- 数据库插入时是**顺序追加**，不再页分裂

## 三、性能对比：插入 1000 万行

PostgreSQL 16 单表插入 1000 万行的实测：

| 主键类型 | 插入耗时 | 表大小 | 索引大小 |
|---|---|---|---|
| BIGSERIAL（自增） | 32s | 850 MB | 215 MB |
| **UUID v7** | 41s | 1.0 GB | 280 MB |
| UUID v4 | 138s | 1.0 GB | 540 MB |

**关键发现**：

1. UUID v7 比 v4 快 **3.4 倍**
2. UUID v7 索引比 v4 小 **48%**（顺序写入页填充率高）
3. v7 接近 BIGSERIAL 的性能，但保留 UUID 的所有优点

数据来源：[uuid7 PostgreSQL benchmark](https://github.com/uuid7/postgres-benchmark)

## 四、6 个场景该选哪个？

| 场景 | 推荐 | 原因 |
|---|---|---|
| 数据库主键（新项目） | **v7** | 顺序写入，索引友好 |
| 分布式系统 ID | **v7** | 多节点天然按时间排序，方便分片 |
| 临时会话 ID / token | v4 | 不需要时间，纯随机更安全 |
| 加密 nonce / API key | v4 | 必须不可预测 |
| 文件名（防猜测） | v4 | 时间戳暴露上传时间 |
| 日志关联 ID | **v7** | 按时间归档天然有序 |

## 五、常见问题

### Q: v7 暴露生成时间，会不会有安全问题？

会，但只在特定场景。如果你的业务依赖 ID 不可预测（如优惠券码、临时分享链接），**还是用 v4**。日常数据库主键不敏感，v7 的好处大于风险。

### Q: 现有 v4 系统能迁移到 v7 吗？

不需要全部迁移。两者都符合 UUID 标准（128 bit），可以**新数据用 v7、老数据保留 v4**，不影响读取。但表的物理排序不会因此优化（要做 `CLUSTER` 才能整理）。

### Q: 跟 Snowflake ID、Sonyflake、Nano ID 比呢？

| ID 类型 | 长度 | 时间序 | 中心化 | 推荐场景 |
|---|---|---|---|---|
| BIGSERIAL | 8 字节 | ✅ | ⚠️ 单 DB | 单库、小项目 |
| **UUID v7** | 16 字节 | ✅ | ❌ | 大多数场景 |
| Snowflake | 8 字节 | ✅ | ❌（节点 ID） | 超大规模、可以管理节点 ID |
| Nano ID | 21 字符 | ❌ | ❌ | URL 短链、API key |
| ULID | 26 字符 | ✅ | ❌ | 类似 v7 但用 base32 字符串 |

**2026 推荐**：除非有特殊需求，新项目主键直接用 **UUID v7**。

### Q: 各语言怎么生成 v7？

| 语言 | 库 |
|---|---|
| JavaScript | `uuidv7` 包，或 `crypto.randomUUID()` （Node 20+ 待确认） |
| Python | `uuid6` 包：`uuid6.uuid7()` |
| Go | `github.com/google/uuid` v1.6+ |
| Rust | `uuid` crate v1.5+ |
| Java | `com.fasterxml.uuid:java-uuid-generator` v5+ |
| PostgreSQL | `uuidv7()` 函数 (pg_uuidv7 扩展) 或 v17 内置 |

## 六、UUID v7 实现原理（30 行 JS）

```js
function uuidv7() {
  const ts = Date.now();              // 48 bit 毫秒时间戳
  const tsHex = ts.toString(16).padStart(12, '0');
  // 12 字节 = 24 hex 字符
  const rand = crypto.getRandomValues(new Uint8Array(10));
  let randHex = Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('');
  // 设置版本号 7 和 RFC 9562 variant
  randHex = '7' + randHex.slice(1, 4) + ((parseInt(randHex[4], 16) & 0x3) | 0x8).toString(16) + randHex.slice(5);
  // 拼成 8-4-4-4-12 格式
  return `${tsHex.slice(0,8)}-${tsHex.slice(8,12)}-${randHex.slice(0,4)}-${randHex.slice(4,8)}-${randHex.slice(8,20)}`;
}
```

完整生产代码看 [uuid 库](https://github.com/uuidjs/uuid)。

## 七、立刻去试

👉 [AI 工具盒子的 UUID 生成器](/tools/uuid-generator.html) 支持：

- UUID v4（随机）
- UUID v7（时间序）
- 批量生成 1-1000 个
- 一键复制
- **纯本地生成**，数据不外发

## 总结

- **新项目数据库主键 → UUID v7**（除非有不可预测需求）
- **token / nonce / 文件名 → UUID v4**
- v7 比 v4 数据库性能快 3 倍，索引小一半
- 标准已正式发布（RFC 9562, 2024）

**立刻生成**：[AI 工具盒子 - UUID 生成器](/tools/uuid-generator.html)
