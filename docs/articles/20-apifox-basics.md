---
category: tools
slug: apifox-basics
title: Apifox 接口设计与协同调试教程
summary: Apifox 接口定义、多环境配置、动态 Token 自动提取、智能 Mock 数据与自动化测试实战。
minutes: 12
---

### 什么是 Apifox 与核心价值

在传统开发模式中，接口文档写在 Word 里、调试用 Postman、Mock 数据用专门服务器、测试用脚本，极易导致文档脱节与前后端撕扯。

Apifox 实现了“一套数据源贯穿整个研发生命周期”：
* **接口文档即调试界面**：定义好接口字段后，直接点击即可发起调试，无需重复填参；
* **前后端并行开发**：后端定义好契约后，Apifox 自动生成高保真 Mock 数据，前端无需等待后端编码完成；
* **自动化测试回归**：将多个接口按业务场景串联成测试套件，一键批量执行并生成通过率报告。

### 接口设计与标准参数定义

#### 1. 基础信息定义

* **请求方法**：`GET`（查询）、`POST`（创建）、`PUT`（更新）、`DELETE`（删除）；
* **接口路径**：推荐 RESTful 规范，如 `/api/v1/products/{id}`；
* **接口名称**：明确动宾短语，如 `根据商品ID查询详情`。

#### 2. 参数类型选择与规范

| 参数位置 | 说明 | 适用场景 | 示例 |
|---|---|---|---|
| **Path 参数** | 嵌入在 URL 路径中 | 资源定位唯一标识 | `/users/{id}` |
| **Query 参数** | 挂载在 URL `?` 后面 | 列表过滤、排序、分页 | `/products?page=1&pageSize=10` |
| **Body (JSON)** | 放在 HTTP 请求体中 | 复杂表单数据、新增、更新 | `{"name": "张三", "age": 20}` |
| **Header 参数** | 放在 HTTP 请求头中 | 认证凭证、签名、多租户 | `Authorization: Bearer xxx` |

### 环境变量与动态 Token 自动提取

在调用需要登录鉴权的接口前，无需每次手动复制粘贴 Token。通过 Apifox 后置脚本即可实现全自动流转。

#### 1. 配置环境变量（本地环境 vs 线上环境）

在环境管理中新建 `本地开发环境`，定义前置基础 URL：
```
baseUrl: http://127.0.0.1:8080
```

#### 2. 登录接口后置脚本自动保存 Token

在 `用户登录` 接口的【后置操作】中添加自定义脚本：

```javascript
// 1. 获取登录接口返回的 JSON 数据
const responseJson = pm.response.json();

// 2. 校验接口是否返回成功并提取 Token
if (responseJson.code === 0 && responseJson.data) {
    const token = responseJson.data.token;
    
    // 3. 将 Token 自动写入当前全局环境变量
    pm.environment.set("current_token", token);
    console.log("Token 自动提取并保存成功:", token);
}
```

#### 3. 全局请求头一键注入

在项目根目录或分类目录的【全局请求头】中配置：
```
Header: Authorization
Value: Bearer {{current_token}}
```
后续所有接口测试均会自动带上最新 Token，彻底告别手动复制！

### 智能 Mock 模拟数据规则

在前后端联调前，前端可以直接调用 Apifox 提供的本地/云端 Mock 服务获取模拟数据。

#### 常用 Faker 智能 Mock 语法

* `@name`：随机生成中文姓名（如“李强”）；
* `@cparagraph(1, 3)`：随机生成 1 到 3 句中文段落文本；
* `@integer(18, 60)`：生成 18 到 60 之间的随机整数；
* `@datetime("yyyy-MM-dd HH:mm:ss")`：生成标准格式的当前时间；
* `@image('200x100', '#50B347', '#FFF', '商品图')`：生成指定尺寸的占位图 URL。

### 自动化测试用例集编排

将独立的接口按真实用户业务闭环进行编排并添加断言：

```
1. 发起登录请求 ➔ 2. 断言 HTTP 状态码 200 且 code 为 0
       ↓
3. 创建新商品 ➔ 4. 自动提取返回的 productId
       ↓
5. 查询商品详情 ➔ 6. 断言商品名称与创建时一致
       ↓
7. 删除该商品 ➔ 8. 断言删除成功
```

### 阶段实战大作业

1. 下载并安装 Apifox 客户端；
2. 新建一个测试项目并设计一组用户与商品增删改查接口；
3. 编写登录后置脚本实现 Token 自动提取；
4. 运行一次自动化测试用例套件并导出测试报告。
