---
category: setup
slug: roadmap-enterprise-web
title: 企业级 Web
summary: Maven 依赖构建、MyBatis 持久层与 Controller-Service-Mapper 三层架构。
minutes: 8
---

### 推荐视频与框架进阶

阶段五推荐结合以下主流框架与实战视频深入理解工程化 Web 架构：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| 框架开发 | [Gin 框架与后端微服务](https://www.bilibili.com/video/BV1gJ411p7xC) | `BV1gJ411p7xC` | RESTful 路由、中间件设计与数据库连接池 |
| 项目演练 | [企业级后端项目开发演练](https://www.bilibili.com/video/BV1BY4UefEkM) | `BV1BY4UefEkM` | 业务建模、分层架构落地与接口联合调试 |

### Maven 构建与依赖仲裁机制

掌握 Maven 坐标体系（`GroupId`、`ArtifactId`、`Version`），通过 `pom.xml` 集中管理项目第三方组件依赖。

掌握 Maven 标准生命周期（`clean`、`compile`、`test`、`package`、`install`），深入理解依赖传递与版本冲突仲裁规则：遵循“路径最短优先”与“先声明优先”原则，必要时通过 `<exclusions>` 手动排除冲突依赖。

### Controller-Service-Mapper 三层分层架构

企业级 Web 工程采用严格的职责分层体系：

```
controller   接收并校验请求入参（DTO），组装 HTTP 协议响应（VO）
service      封装核心业务规则，控制事务边界（@Transactional）
mapper       执行数据库 CRUD 操作，映射数据持久化对象（Entity）
```

明确区分数据对象模型：入参传输对象（DTO）、持久化实体（Entity）以及视图呈现对象（VO）。控制层通过业务接口间接调用数据访问，避免跨层直接操作数据库。

### 持久层框架与动态 SQL

掌握 MyBatis / MyBatis-Plus 数据持久层开发，利用 XML 映射或注解编写类型安全的 SQL。

熟练运用 `<if>`、`<where>`、`<foreach>` 等标签组装动态 SQL 条件。理解 MyBatis 一级缓存（SqlSession 级别）与二级缓存（Namespace 级别）的工作原理与失效条件。

合理利用 Lombok 工具库（如 `@Getter`、`@Setter`、`@Builder`、`@RequiredArgsConstructor`）消除样板代码，提升工程整洁度。

### RESTful API 规范与统一协议封装

遵循 RESTful 规范组织接口 URI 资源路径与 HTTP 动词：

```
GET    /api/users       查询用户列表
POST   /api/users       创建新用户
PUT    /api/users/{id}  更新指定用户
DELETE /api/users/{id}  删除指定用户
```

接口返回统一包装结构（如 `ApiResponse<T>`），明确区分传输层 HTTP 状态码（200、400、401、403、500）与业务层错误码（`code` 与 `message`），为前端提供一致的联调体验。
