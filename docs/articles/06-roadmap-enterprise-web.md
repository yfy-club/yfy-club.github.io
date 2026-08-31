---
category: roadmap
slug: roadmap-enterprise-web
title: 阶段五：企业级 Web 工程与 Spring Boot 入门
summary: Maven 依赖管理、Spring Boot 核心注解、统一 API 响应封装与 Controller-Service-Mapper 三层架构实战教程。
minutes: 15
---

### 推荐学习视频教程

阶段五推荐配合以下框架实战教程进行系统性学习：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| 框架开发 | [Gin 框架与后端微服务](https://www.bilibili.com/video/BV1gJ411p7xC) | `BV1gJ411p7xC` | RESTful 路由、中间件设计与数据库连接池 |
| 项目演练 | [企业级后端项目开发演练](https://www.bilibili.com/video/BV1BY4UefEkM) | `BV1BY4UefEkM` | 业务建模、分层架构落地与接口联合调试 |

<video-preview provider="bilibili" id="BV1gJ411p7xC" title="Gin 框架与后端微服务" bvid="BV1gJ411p7xC"></video-preview>

### Maven 项目构建与依赖管理

Maven 是 Java 生态最主流的项目构建与第三方依赖管理工具。

#### pom.xml 核心配置示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>tech.yunfeiyang</groupId>
    <artifactId>demo-service</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <!-- Spring Boot Web 起步依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- MySQL 数据库驱动 -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>
```

#### 常用 Maven 指令速查表

| 命令 | 说明 | 适用场景 |
|---|---|---|
| `mvn clean` | 清理编译生成的目标目录 `target` | 重新构建前清理缓存 |
| `mvn compile` | 编译项目源代码 | 检查是否有语法或类型错误 |
| `mvn test` | 执行项目单元测试用例 | 门禁自测 |
| `mvn package` | 将项目打包为可执行 JAR 文件 | 生产部署打包 |

### Spring Boot 核心注解与第一个接口

Spring Boot 简化了 Spring 应用的初始搭建与开发过程，约定大于配置。

#### 1. 主启动类

```java
package tech.yunfeiyang.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

#### 2. 第一个控制器与常用请求参数接收注解

```java
package tech.yunfeiyang.demo.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hello")
public class HelloController {

    // 1. GET 请求：接收 URL 路径参数，如 /api/hello/user/101
    @GetMapping("/user/{id}")
    public String getUserById(@PathVariable("id") Long id) {
        return "查询到用户 ID: " + id;
    }

    // 2. GET 请求：接收查询参数，如 /api/hello/search?keyword=java
    @GetMapping("/search")
    public String search(@RequestParam("keyword") String keyword) {
        return "搜索关键字: " + keyword;
    }
}
```

### 统一 API 响应对象封装

为了让前端能够以一致的方式解析数据，服务端返回给客户端的 JSON 数据应具备统一包装结构。

#### 统一响应类定义

```java
package tech.yunfeiyang.demo.common;

public class ApiResponse<T> {
    private int code;       // 业务状态码：0 或 200 表示成功，非 0 表示错误
    private String message; // 提示信息
    private T data;         // 实际数据载荷
    private long timestamp; // 时间戳

    public ApiResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(0);
        response.setMessage("success");
        response.setData(data);
        return response;
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(code);
        response.setMessage(message);
        return response;
    }

    // Getter 与 Setter 方法
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
```

### Controller-Service-Mapper 三层架构实战

企业级 Web 工程采用严格的职责单向分层：

```
客户端请求 ➔ Controller 控制层 ➔ Service 业务层 ➔ Mapper 数据持久层 ➔ 数据库
```

#### 1. 实体类（Entity）

```java
package tech.yunfeiyang.demo.entity;

public class User {
    private Long id;
    private String username;
    private String email;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

#### 2. 持久层（Mapper 接口）

```java
package tech.yunfeiyang.demo.mapper;

import org.apache.ibatis.annotations.*;
import tech.yunfeiyang.demo.entity.User;

@Mapper
public interface UserMapper {
    @Select("SELECT id, username, email FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);

    @Insert("INSERT INTO users(username, email) VALUES(#{username}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);
}
```

#### 3. 业务层（Service 接口与实现）

```java
package tech.yunfeiyang.demo.service;

import tech.yunfeiyang.demo.entity.User;

public interface UserService {
    User getUserById(Long id);
    User createUser(String username, String email);
}
```

```java
package tech.yunfeiyang.demo.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tech.yunfeiyang.demo.entity.User;
import tech.yunfeiyang.demo.mapper.UserMapper;
import tech.yunfeiyang.demo.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User getUserById(Long id) {
        return userMapper.findById(id);
    }

    @Override
    public User createUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        userMapper.insert(user);
        return user;
    }
}
```

#### 4. 控制层（Controller）

```java
package tech.yunfeiyang.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tech.yunfeiyang.demo.common.ApiResponse;
import tech.yunfeiyang.demo.entity.User;
import tech.yunfeiyang.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // 根据 ID 查询用户
    @GetMapping("/{id}")
    public ApiResponse<User> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        return ApiResponse.success(user);
    }

    // 创建新用户
    @PostMapping
    public ApiResponse<User> createUser(@RequestBody User requestUser) {
        User created = userService.createUser(requestUser.getUsername(), requestUser.getEmail());
        return ApiResponse.success(created);
    }
}
```

### 阶段实战大作业

搭建一个基于 Spring Boot 的商品信息管理微服务：
1. 建立数据库商品表，配置 `application.yml` 数据源连接；
2. 按照三层架构规范编写商品信息的增加、删除、修改与按 ID 查询接口；
3. 使用 Postman 或 Apifox 测试所有接口，验证统一响应格式。
