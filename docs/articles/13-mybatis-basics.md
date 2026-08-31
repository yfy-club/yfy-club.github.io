---
category: tools
slug: mybatis-basics
title: MyBatis 数据持久层框架教程
summary: MyBatis 持久层开发实战：Mapper 接口注解、XML 映射文件、动态 SQL 标签与多表结果映射。
minutes: 15
---

### 推荐学习视频教程

MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| MyBatis 持久层 | [MyBatis 经典 ORM 框架教程](https://www.bilibili.com/video/BV1ME421w7Ms) | `BV1ME421w7Ms` | Mapper 接口注解、XML 动态 SQL、结果映射与缓存机制 |

<video-preview provider="bilibili" id="BV1ME421w7Ms" title="MyBatis 经典 ORM 框架教程" bvid="BV1ME421w7Ms"></video-preview>

### 什么是 MyBatis 与核心优势

MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作：
* **SQL 与 Java 代码解耦**：可在注解或 XML 文件中统一集中管理 SQL；
* **灵活高效**：支持原生 SQL 编写，便于精细化性能调优与索引命中；
* **动态 SQL**：内置强大的标签体系，轻松应对多条件组合查询。

### 引入依赖与数据源配置

在 `pom.xml` 中引入 MyBatis 与 MySQL 驱动：

```xml
<dependencies>
    <!-- MyBatis Spring Boot 起步依赖 -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>3.0.3</version>
    </dependency>

    <!-- MySQL 数据库驱动 -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

在 `application.yml` 中配置数据库连接参数：

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/yfy_mall?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password

mybatis:
  mapper-locations: classpath:mapper/*.xml
  configuration:
    map-underscore-to-camel-case: true # 自动将下划线字段映射为驼峰属性
```

### 注解式 Mapper 接口开发

#### 1. 实体类定义

```java
package tech.yunfeiyang.demo.entity;

public class User {
    private Long id;
    private String username;
    private Integer age;
    private String email;

    // Getter 与 Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

#### 2. Mapper 接口定义

```java
package tech.yunfeiyang.demo.mapper;

import org.apache.ibatis.annotations.*;
import tech.yunfeiyang.demo.entity.User;
import java.util.List;

@Mapper
public interface UserMapper {

    // 1. 根据 ID 查询单条记录
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);

    // 2. 插入新记录并自动回填自增主键 ID 到实体对象
    @Insert("INSERT INTO users(username, age, email) VALUES(#{username}, #{age}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    // 3. 根据 ID 更新记录
    @Update("UPDATE users SET username = #{username}, email = #{email} WHERE id = #{id}")
    int update(User user);

    // 4. 根据 ID 删除记录
    @Delete("DELETE FROM users WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    // 5. 条件查询多条记录
    @Select("SELECT * FROM users WHERE age >= #{minAge}")
    List<User> listByMinAge(@Param("minAge") int minAge);
}
```

### XML 映射与动态 SQL 标签

当查询逻辑复杂或条件多变时，推荐使用 XML 映射文件组织动态 SQL。

#### 动态 SQL 标签详解

| 标签 | 功能说明 | 适用场景 |
|---|---|---|
| `<if test="...">` | 条件判断，满足条件才拼接 SQL | 多条件组合查询 |
| `<where>` | 智能去除开头的 `AND` 或 `OR`，全空时不生成 WHERE | 安全拼接过滤条件 |
| `<foreach>` | 循环遍历集合或数组 | `IN (1, 2, 3)` 批量查询或批量插入 |

#### UserMapper.xml 实战实例

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="tech.yunfeiyang.demo.mapper.UserMapper">

    <!-- 多条件动态组合查询 -->
    <select id="searchUsers" resultType="tech.yunfeiyang.demo.entity.User">
        SELECT id, username, age, email
        FROM users
        <where>
            <if test="username != null and username != ''">
                AND username LIKE CONCAT('%', #{username}, '%')
            </if>
            <if test="minAge != null">
                AND age &gt;= #{minAge}
            </if>
        </where>
        ORDER BY id DESC
    </select>

    <!-- 批量根据 ID 集合查询（foreach 标签） -->
    <select id="findByIds" resultType="tech.yunfeiyang.demo.entity.User">
        SELECT * FROM users
        WHERE id IN
        <foreach collection="ids" item="id" open="(" separator="," close=")">
            #{id}
        </foreach>
    </select>

</mapper>
```

### 参数占位符：#{} 与 ${} 的核心区别

* **`#{}`（预编译占位符，强烈推荐）**：参数会被当做字符串字面量处理，由底层 PreparedStatement 自动转义，**天然彻底杜绝 SQL 注入**；
* **`${}`（字符串直接拼接，极度慎用）**：将参数原封不动拼接进 SQL 语句中，存在严重的 SQL 注入漏洞隐患，仅可在传入表名、列名或排序关键字（如 `ORDER BY ${column}`）等无法预编译的场景下经过严格白名单校验后使用。

### 阶段实战大作业

1. 创建商品表 `products`；
2. 编写 `ProductMapper` 接口，使用 XML 实现带商品名称模糊查询、价格区间筛选与分类过滤的动态 SQL 查询方法；
3. 编写单元测试验证各种条件组合下生成的 SQL 执行结果。
