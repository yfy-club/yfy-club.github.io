---
category: tools
slug: redis-basics
title: Redis 内存缓存技术教程
summary: Redis 核心数据类型、命令速查、Spring Boot 整合与缓存穿透击穿雪崩防范实战教程。
minutes: 15
---

### 推荐学习视频教程

Redis 是现代高性能后端架构中不可或缺的内存键值型数据库：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| Redis 缓存 | [Redis 缓存技术实战教程](https://www.bilibili.com/video/BV1vR4y1o7Z2) | `BV1vR4y1o7Z2` | 五大核心数据类型、过期策略、持久化与缓存防护 |

<video-preview provider="bilibili" id="BV1vR4y1o7Z2" title="Redis 缓存技术实战教程" bvid="BV1vR4y1o7Z2"></video-preview>

### 什么是 Redis 与核心优势

Redis 是一个开源的使用 ANSI C 语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value 数据库：
* **读写极速**：全内存操作，读写性能达 10 万次每秒（QPS）；
* **丰富数据类型**：支持字符串（String）、哈希（Hash）、列表（List）、集合（Set）与有序集合（ZSet）；
* **原子性与过期支持**：所有单条命令执行均为原子性，支持为键设置过期时间（TTL）自动清理。

### 五大核心数据结构及常用命令

#### 1. 字符串（String）

最基础的键值存储类型，可存储文本、JSON 字符串或二进制数字：

```bash
# 设置键值与获取值
SET user:101 "张三"
GET user:101

# 设置带有效期的键（60 秒后自动过期）
SETEX token:abc 60 "session_data"

# 原子自增与自减（常用于阅读量计数、点赞数统计）
SET page:views 100
INCR page:views       # 变为 101
INCRBY page:views 10  # 变为 111
DECR page:views       # 变为 110
```

#### 2. 哈希（Hash）

适合存储对象，键对应一个字段与值的映射表（类似于 Java 中的 `Map<String, String>`）：

```bash
# 存储用户对象字段
HSET user:profile:101 name "李四" age 22 city "北京"

# 获取单个字段与全部字段
HGET user:profile:101 name
HGETALL user:profile:101

# 检查字段是否存在与删除字段
HEXISTS user:profile:101 age
HDEL user:profile:101 city
```

#### 3. 列表（List）

双向链表结构，常用于实现消息队列、最新动态列表与时间线：

```bash
# 从左侧与右侧推入元素
LPUSH news:latest "新闻A" "新闻B"
RPUSH news:latest "新闻C"

# 范围查询（0 到 -1 代表查询全部列表）
LRANGE news:latest 0 -1

# 弹出元素
LPOP news:latest
RPOP news:latest
```

#### 4. 集合（Set）

无序且元素不可重复的哈希表集合，常用于抽奖、共同好友与去重：

```bash
# 添加元素（自动去重）
SADD tags:101 "Java" "Spring" "Redis" "Java"

# 获取集合内所有元素与集合总数
SMEMBERS tags:101
SCARD tags:101

# 判断元素是否存在与移除元素
SISMEMBER tags:101 "Spring"
SREM tags:101 "Redis"
```

#### 5. 有序集合（ZSet）

每个元素关联一个浮点数分值（Score），元素按分值从小到大有序排列，常用于排行榜：

```bash
# 添加玩家积分（ZADD 键 分数 成员）
ZADD rank:game 1200 "玩家A"
ZADD rank:game 1500 "玩家B"
ZADD rank:game 980  "玩家C"

# 降序查询前 3 名（从高分到低分）
ZREVRANGE rank:game 0 2 WITHSCORES
```

### 键通用操作命令速查表

| 命令 | 功能说明 | 示例 |
|---|---|---|
| `EXPIRE key seconds` | 为指定键设置生存时间（秒） | `EXPIRE verify:code 300` |
| `TTL key` | 查看键的剩余生存时间（-1 永久，-2 已失效） | `TTL verify:code` |
| `DEL key` | 删除指定键 | `DEL cache:user:1` |
| `EXISTS key` | 判断键是否存在（存在返回 1，不存在返回 0） | `EXISTS lock:order` |
| `TYPE key` | 查询键存储的数据类型 | `TYPE user:profile:101` |

### Spring Boot 整合 Redis 实战

在 Spring Boot 项目中，推荐使用官方封装的 `StringRedisTemplate` 进行高效缓存读写。

#### 1. 引入依赖与配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: your_password
      timeout: 3000ms
```

#### 2. 缓存业务服务代码实例

```java
package tech.yunfeiyang.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
public class CacheService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // 写入带过期时间的缓存
    public void setToken(String userId, String token, long timeoutSeconds) {
        String key = "token:" + userId;
        redisTemplate.opsForValue().set(key, token, timeoutSeconds, TimeUnit.SECONDS);
    }

    // 读取缓存
    public String getToken(String userId) {
        String key = "token:" + userId;
        return redisTemplate.opsForValue().get(key);
    }

    // 原子计数自增
    public Long incrementViewCount(String pageId) {
        String key = "views:" + pageId;
        return redisTemplate.opsForValue().increment(key);
    }
}
```

### 缓存常见三大问题与应对策略

| 异常现象 | 产生根因 | 标准解决方案 |
|---|---|---|
| **缓存穿透** | 查询数据库中根本不存在的数据，导致每次请求都直接打入数据库 | 1. 缓存空值（设置较短过期时间）<br>2. 使用布隆过滤器（BloomFilter）在前置拦截 |
| **缓存击穿** | 某一个超级热点 Key 突发过期，海量并发瞬间穿透到数据库 | 1. 热点 Key 设置永不过期<br>2. 使用互斥锁（如 Redis 分布式锁）保证仅一个线程回源查库 |
| **缓存雪崩** | 大量缓存在同一时间大面积集中过期失效，数据库压力暴增崩溃 | 1. 缓存过期时间加上随机浮动值（如 1~5 分钟随机扰动）<br>2. 搭建 Redis 高可用集群 |

### 阶段实战大作业

1. 在本地启动 Redis 服务并通过控制台完成五大基本数据类型的增删改查；
2. 在 Spring Boot 中整合 Redis，编写商品详情查询缓存逻辑（优先查 Redis，未命中查 MySQL 并回填 Redis）；
3. 验证设置过期时间与随机扰动防雪崩策略。
