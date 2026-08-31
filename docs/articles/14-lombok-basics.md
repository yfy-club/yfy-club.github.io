---
category: tools
slug: lombok-basics
title: Lombok 代码简化框架教程
summary: Lombok 效率工具实战：@Data、@Builder、@Slf4j、Getter/Setter 消除样板代码与编译期原理。
minutes: 12
---

### 推荐学习视频教程

Lombok 是 Java 社区最流行的生产力工具之一，能够通过注解自动在编译期生成样板代码：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| Lombok 工具 | [Lombok 代码简化框架极速上手教程](https://www.bilibili.com/video/BV1gb421J7ok) | `BV1gb421J7ok` | 注解处理器、@Data、@Builder、@Slf4j 与避坑指南 |

<video-preview provider="bilibili" id="BV1gb421J7ok" title="Lombok 代码简化框架极速上手教程" bvid="BV1gb421J7ok"></video-preview>

### 什么是 Lombok 与工作原理

在传统 Java 开发中，一个简单的实体类需要手动手写大量样板代码（Getter / Setter、`equals`、`hashCode`、`toString`、构造函数等）。

Lombok 在**编译期**通过 Java 插入式注解处理器（Annotation Processing Tool）修改抽象语法树（AST），自动将对应方法的字节码注入到生成的 `.class` 文件中，既省去了手动编写样板代码的繁琐，又不产生任何运行期反射性能开销。

### 引入依赖与 IDEA 插件配置

在 `pom.xml` 中引入 Lombok 依赖（通常设为 `provided` 范围）：

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.30</version>
    <scope>provided</scope>
</dependency>
```

#### IDEA 开启注解处理

在 IntelliJ IDEA 中打开设置：`Settings -> Build, Execution, Deployment -> Compiler -> Annotation Processors`，勾选 **Enable annotation processing**（启用注解处理）。

### 常用核心注解速查表

| 注解 | 功能说明 | 注入的方法或成员 |
|---|---|---|
| `@Getter` / `@Setter` | 为所有非静态字段生成访问器方法 | `getId()`、`setId(...)` |
| `@ToString` | 生成打印所有字段内容的 `toString()` 方法 | `toString()` |
| `@EqualsAndHashCode` | 生成成对的哈希比对方法 | `equals(Object o)`、`hashCode()` |
| `@NoArgsConstructor` | 生成无参构造函数 | `public User()` |
| `@AllArgsConstructor` | 生成包含全部字段的构造函数 | `public User(Long id, String name, ...)` |
| `@Data` | 组合注解（包含上述五个注解的全部功能） | 核心实体类一键生成 |
| `@Builder` | 为类生成优雅的流式建造者（Builder）模式 | `User.builder().name("张三").build()` |
| `@Slf4j` | 在类中自动注入日志记录器常量 `log` | `log.info(...)`、`log.error(...)` |

### 传统写法 vs Lombok 极简写法对比

#### 1. 使用 Lombok 之前（繁琐冗长）

```java
public class User {
    private Long id;
    private String name;
    private Integer age;

    public User() {}
    public User(Long id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    @Override
    public boolean equals(Object o) { /* 繁琐逻辑 */ return true; }
    @Override
    public int hashCode() { /* 繁琐逻辑 */ return 0; }
    @Override
    public String toString() { return "User{" + "id=" + id + ", name='" + name + '\'' + ", age=" + age + '}'; }
}
```

#### 2. 使用 Lombok 之后（清爽干净）

```java
package tech.yunfeiyang.demo.entity;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String name;
    private Integer age;
}
```

### @Builder 建造者模式实战

使用 `@Builder` 注解后，可以通过连贯的链式调用创建对象，避免长参数列表构造函数传参错位的风险：

```java
public class Main {
    public static void main(String[] args) {
        // 使用链式 Builder 创建对象
        User user = User.builder()
                .id(1001L)
                .name("张三")
                .age(20)
                .build();

        System.out.println("创建的用户: " + user);
    }
}
```

### @Slf4j 快速输出结构化日志

在类上添加 `@Slf4j` 注解后，无需手动声明 `LoggerFactory.getLogger(...)`，直接在方法中使用 `log` 即可：

```java
package tech.yunfeiyang.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OrderService {

    public void processOrder(Long orderId) {
        log.info("开始处理订单，订单号: {}", orderId);

        try {
            // 业务处理逻辑
            log.debug("正在执行扣款与库存锁定...");
        } catch (Exception e) {
            log.error("订单处理发生异常，订单号: {}", orderId, e);
        }
    }
}
```

### 注意事项与高频避坑

1. **循环引用与栈溢出**：在双向关联关系（例如订单类包含用户对象，用户类又包含订单列表）中，直接使用 `@ToString` 或 `@EqualsAndHashCode` 会导致相互调用引发死循环栈溢出（StackOverflowError）。解决方法是使用 `@ToString.Exclude` 排除关联字段：
   ```java
   @ToString.Exclude
   private List<Order> orders;
   ```
2. **子类判等**：当实体类存在继承关系时，默认生成的 `equals` 不会比对父类字段。需在子类显式声明：
   ```java
   @EqualsAndHashCode(callSuper = true)
   ```

### 阶段实战大作业

1. 创建带有 `@Data`、`@Builder`、`@NoArgsConstructor`、`@AllArgsConstructor` 的用户与角色实体类；
2. 编写一个测试类，使用 `.builder()` 链式创建测试对象；
3. 使用 `@Slf4j` 输出带参数占位符的运行日志。
