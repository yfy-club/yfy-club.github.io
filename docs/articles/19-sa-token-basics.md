---
category: tools
slug: sa-token-basics
title: Sa-Token 接口认证与权限管理教程
summary: Sa-Token 轻量权限框架实战：登录认证、Token 生成、全局拦截器、角色权限校验与无状态鉴权。
minutes: 15
---

### 什么是 Sa-Token 与核心优势

在企业级 Web 开发中，安全与权限是核心基础模块。相比配置繁重庞大的传统安全框架，Sa-Token 提供了极致简单的 API：
* **零繁琐配置**：无需实现数十个接口与过滤器链，引入依赖即开即用；
* **功能全覆盖**：支持登录认证、权限认证、单点登录、多账号体系、踢人下线与无状态 Token；
* **前后端分离友好**：天然适配 RESTful 接口架构，支持自定义 Header 传递 Token（默认 `satoken`）。

### 引入依赖与核心配置

在 `pom.xml` 中引入 Sa-Token Spring Boot 起步依赖：

```xml
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-spring-boot3-starter</artifactId>
    <version>1.37.0</version>
</dependency>
```

在 `application.yml` 中配置 Token 过期时间与属性：

```yaml
sa-token:
  token-name: satoken         # Token 字段名称（前端在请求头中携带的 Key）
  timeout: 2592000            # Token 有效期（单位：秒，默认 30 天）
  active-timeout: 1800        # Token 活跃期（半小时无操作自动冻结）
  is-concurrent: true         # 是否允许同一账号多地同时登录
  is-share: true              # 在多人登录同一账号时是否共享同一 Token
```

### 登录认证核心 API 实战

#### 用户登录与登出控制器示例

```java
package tech.yunfeiyang.demo.controller;

import cn.dev33.satoken.stp.StpUtil;
import org.springframework.web.bind.annotation.*;
import tech.yunfeiyang.demo.common.ApiResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // 1. 用户登录接口（开放接口，无需鉴权）
    @PostMapping("/login")
    public ApiResponse<String> login(@RequestParam String username, @RequestParam String password) {
        // 模拟数据库比对校验用户名与密码
        if ("admin".equals(username) && "123456".equals(password)) {
            // 会话登录：传入用户唯一 ID（如 10001），Sa-Token 自动生成 Token 并保存会话状态
            StpUtil.login(10001L);
            
            // 获取当前生成的 Token 字符串返回给前端
            String tokenValue = StpUtil.getTokenValue();
            return ApiResponse.success(tokenValue);
        }
        return ApiResponse.error(401, "用户名或密码错误");
    }

    // 2. 查询当前会话登录状态
    @GetMapping("/is-login")
    public ApiResponse<Boolean> isLogin() {
        return ApiResponse.success(StpUtil.isLogin());
    }

    // 3. 用户主动退出登录
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        StpUtil.logout();
        return ApiResponse.success(null);
    }
}
```

### 全局路由拦截器鉴权

通过配置类注册 `SaInterceptor`，实现对全站接口的一键自动鉴权，未携带有效 Token 的请求将被直接拦截：

```java
package tech.yunfeiyang.demo.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SaTokenWebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 路由拦截器
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/api/**")              // 拦截所有 /api/ 开头的接口
                .excludePathPatterns("/api/auth/login")  // 排除登录接口白名单
                .excludePathPatterns("/api/public/**");  // 排除公共开放接口
    }
}
```

### 角色与细粒度权限注解校验

#### 1. 实现权限加载接口（StpInterface）

实现 `StpInterface` 接口，告诉框架当前登录用户拥有哪些权限码与角色码：

```java
package tech.yunfeiyang.demo.config;

import cn.dev33.satoken.stp.StpInterface;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class StpInterfaceImpl implements StpInterface {

    // 返回指定账号拥有的权限码集合（如 user:add, user:delete）
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        // 实际开发中根据 loginId 查询数据库获取
        return List.of("user:list", "user:add", "order:export");
    }

    // 返回指定账号拥有的角色标识集合（如 admin, manager）
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        return List.of("admin");
    }
}
```

#### 2. 在 Controller 中使用鉴权注解

```java
package tech.yunfeiyang.demo.controller;

import cn.dev33.satoken.annotation.*;
import org.springframework.web.bind.annotation.*;
import tech.yunfeiyang.demo.common.ApiResponse;

@RestController
@RequestMapping("/api/user")
public class UserController {

    // 必须具备 admin 角色才能访问
    @SaCheckRole("admin")
    @GetMapping("/admin-dashboard")
    public ApiResponse<String> dashboard() {
        return ApiResponse.success("管理员专属控制面板数据");
    }

    // 必须具备 user:delete 权限码才能访问
    @SaCheckPermission("user:delete")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        // 执行删除逻辑
        return ApiResponse.success(null);
    }
}
```

### 全局异常统一捕获处理

当用户未登录或无权限访问时，Sa-Token 会主动抛出特定异常，在全局异常拦截器中集中捕获并转换为标准 JSON 响应：

```java
package tech.yunfeiyang.demo.exception;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import cn.dev33.satoken.exception.NotRoleException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tech.yunfeiyang.demo.common.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 捕获未登录异常
    @ExceptionHandler(NotLoginException.class)
    public ApiResponse<Void> handleNotLoginException(NotLoginException e) {
        return ApiResponse.error(401, "当前未登录或会话已过期，请重新登录");
    }

    // 捕获无权限异常
    @ExceptionHandler(NotPermissionException.class)
    public ApiResponse<Void> handleNotPermissionException(NotPermissionException e) {
        return ApiResponse.error(403, "无操作权限，缺少权限码: " + e.getPermission());
    }

    // 捕获无角色异常
    @ExceptionHandler(NotRoleException.class)
    public ApiResponse<Void> handleNotRoleException(NotRoleException e) {
        return ApiResponse.error(403, "无操作权限，缺少角色: " + e.getRole());
    }
}
```

### 阶段实战大作业

1. 搭建 Spring Boot 工程并引入 Sa-Token；
2. 编写用户登录接口，返回生成的 Token；
3. 配置全局路由拦截器并在接口上添加 `@SaCheckPermission("user:export")` 注解；
4. 使用 Postman 或 Apifox 验证未携带 Token 被拦截、携带 Token 正常访问。
