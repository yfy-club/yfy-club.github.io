---
category: roadmap
slug: roadmap-backend-java
title: 阶段三：JavaSE 企业级面向对象与集合底层原理
summary: JavaSE 筑基：面向对象与异常体系、HashMap 底层推演与并发容器对比实战。
minutes: 12
---

### 核心背景与技术定位

阶段三选择 Java 作为企业级方向的基石语言：它的面向对象体系、集合框架与异常模型，是后面 Spring 全家桶、MyBatis 乃至整个后端工程的地基。本阶段的目标不是背 API，而是把「集合在内存里怎么摆、并发时怎么坏」这两件事推演到能白板讲清的程度。

#### 为什么集合底层是必答题

`HashMap` 是后端代码里出现频率最高的数据结构，没有之一：参数映射、缓存、会话、去重全靠它。面试官问它的底层不是刁难，而是因为线上事故的大量根因就藏在「哈希冲突怎么处理」「并发写入会怎样」这两个问题里。会用和懂底层，对应的是两种完全不同的排障能力。

#### 本阶段的能力边界

完成本阶段后应能：用面向对象拆解一个业务域、推导 HashMap 从数组到红黑树的完整演化、解释 `ConcurrentHashMap` 的并发控制手段、用设计模式替代长分支。

### HashMap 底层结构推演

#### 数组加链表加红黑树

`HashMap` 的主体是一个 `Node` 数组（哈希桶）。放入键值对时，先算键的哈希值，再与数组长度减一做与运算定位桶下标——这要求容量始终是 2 的幂，让 `hash & (n - 1)` 等价于取模但快得多。同一桶内发生哈希冲突的条目以链表串起；JDK 8 起，链表长度达到阈值会升级为红黑树，把最坏查找从 O(n) 压到 O(log n)。

#### 负载因子 0.75 的权衡

容量达到「当前容量 × 负载因子」时触发扩容。0.75 是空间与时间的折中值：取 1，桶太挤、冲突链变长、查找变慢；取 0.5，空间浪费近半。0.75 恰好在泊松分布下让单个桶的元素数量大概率不超过 8 个。

#### 树化阈值 8 的泊松分布推演

源码注释给出依据：在负载因子 0.75 的理想散列条件下，桶内元素数量服从参数约 0.5 的泊松分布，达到 8 个的概率约为千万分之六——正常代码里根本不会发生。因此阈值 8 不是性能调参，而是「非理想散列的告警线」：真走到树化，说明哈希函数写得有问题；而当树退化到 6 个元素以下，又转回链表，避免小树浪费指针空间。

### 并发安全与容器选型

#### 并发写入的灾难现场

多线程同时写入 `HashMap`：JDK 7 的头插法扩容会形成环形链表，取数时陷入死循环，CPU 打满；JDK 8 改为尾插法消除了成环，但并发写入仍会丢数据、扩容结果被互相覆盖。**任何场景都不许在多线程环境裸用 `HashMap`**，这不是保守，是事故清单换来的结论。

#### ConcurrentHashMap 的控制手段

JDK 8 的 `ConcurrentHashMap` 抛弃了分段锁，改用更细的粒度：桶为空时用 CAS 直接写入，无需加锁；桶非空时只对桶头节点加 `synchronized`，锁的粒度从「段」细化到「单桶」，冲突锁竞争的概率大幅下降。计数用 `LongAdder` 风格的分段累加，避免全局锁。

```java
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionRegistry {
    // 多线程环境必须用并发容器，禁止裸 HashMap
    private final Map<String, String> sessions = new ConcurrentHashMap<>();

    public void bind(String userId, String token) {
        if (userId == null || userId.isBlank() || token == null) {
            throw new IllegalArgumentException("用户与令牌均不允许为空");
        }
        sessions.put(userId, token);
    }

    public String tokenOf(String userId) {
        if (userId == null) {
            return null; // 空值防御：查询入参为空直接返回，不抛异常
        }
        return sessions.get(userId); // 键不存在返回 null，由调用方兜底
    }
}
```

### 正反例设计范式

#### 反例：多层嵌套 if-else 业务分流

```java
// 反例：每加一种会员等级就要改这个方法，分支越嵌越深
public double price_bad(double base, String level, boolean festival) {
    if (level.equals("gold")) {            // 常量在后，level 为 null 时直接 NPE
        if (festival) {
            return base * 0.7;
        } else {
            return base * 0.8;
        }
    } else if (level.equals("silver")) {
        if (festival) {
            return base * 0.85;
        } else {
            return base * 0.9;
        }
    } else if (level.equals("normal")) {
        return festival ? base * 0.95 : base;
    }
    return base; // 未知等级静默放过，问题被掩盖
}
```

隐患拆解：等值判断用变量在前的写法埋下空指针；新增等级必须改动这个日益膨胀的方法，违反开闭原则；未知输入静默返回原价，业务错误无法被发现。

#### 正例：策略模式与工厂模式解耦

```java
// 策略接口：每种定价规则一个实现，互不干扰
public interface PricePolicy {
    double apply(double base, boolean festival);
}

public final class GoldPolicy implements PricePolicy {
    @Override
    public double apply(double base, boolean festival) {
        if (base < 0) {
            throw new IllegalArgumentException("基础价不允许为负");
        }
        return festival ? base * 0.7 : base * 0.8;
    }
}

// 工厂：用不可变表注册策略，未知等级快速失败而不是静默放过
public final class PricePolicyFactory {
    private static final Map<String, PricePolicy> REGISTRY =
            Map.of("gold", new GoldPolicy());

    public static PricePolicy of(String level) {
        PricePolicy policy = REGISTRY.get(level == null ? "" : level);
        if (policy == null) {
            throw new IllegalArgumentException("未知会员等级: " + level);
        }
        return policy;
    }
}
```

新增等级只需增加一个实现类并注册一行，原有代码零改动——这就是面向扩展开放、面向修改关闭。

### 高频故障与实操避坑

| 症状 | 根因 | 修复方案 |
|---|---|---|
| 对象存入 Map 取不出 | 重写 `equals` 忘了重写 `hashCode` | 两者必须成对重写，用 IDE 一起生成 |
| `foreach` 中删除抛并发修改异常 | 迭代器外直接调集合 `remove` | 用 `Iterator.remove()` 或 `removeIf` |
| 容器 CPU 打满死循环 | 多线程写裸 `HashMap`（JDK 7 环链） | 换 `ConcurrentHashMap`，全量排查裸容器 |
| 大集合扩容卡顿 | 未预估规模反复扩容 | 构造时给出初始容量：`new HashMap<>(预估量 / 0.75 + 1)` |
| 金额比较不相等 | 用 `double` 存金额 | 金额一律 `BigDecimal`，比较用 `compareTo` |

对象判等与哈希的正确姿势，也是评审必查项：

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;                 // 同一引用快速返回
    if (!(o instanceof Student other)) return false; // 类型检查兼空值防御
    return id == other.id && name.equals(other.name);
}

@Override
public int hashCode() {
    return Objects.hash(id, name);              // 与 equals 字段严格对应
}
```

### 阶段实战大作业与验收清单

实现一个单机综合信息管理系统：学生信息的多维度增删查改、自定义文件格式持久化、异常兜底全覆盖。

| 项目 | 验收标准 |
|---|---|
| 面向对象 | 领域模型至少三层：实体、仓储、服务，职责清晰不越界 |
| 持久化 | 自定义文本格式落盘，读入时损坏行跳过并记日志，不允许整库崩溃 |
| 异常兜底 | 文件不存在、格式错误、重复主键均有专属异常与友好提示 |
| 多维度排序 | 支持按总分、姓名、学号组合排序，比较器可插拔 |
| 集合规范 | 判等成对重写 `equals` 与 `hashCode`；容量给出初始预估 |
| 防御性代码 | 所有外部输入（文件行、控制台输入）先校验后使用 |
