---
category: setup
slug: env-setup
title: 环境与工具
summary: 开发环境选型、运行时矩阵与工程配置规范。
minutes: 6
---

### 开发工具与 IDE 选型

选择适合当前技术栈的集成开发环境：

| 工具 | 适用技术栈 | 核心优势 |
|---|---|---|
| Visual Studio Code | 前端开发、Python 脚本、Markdown 文档 | 启动迅速、插件生态丰富、多语言支持完善 |
| IntelliJ IDEA | JavaSE、Spring Boot 企业级开发 | 深度语法静态分析、重构支持强劲、Maven 整合完善 |
| Git 客户端 | 版本控制与团队协同 | 推荐配合终端命令行或 IDE 内置 Git 树状视图使用 |

### 运行时矩阵与版本管理

推荐采用主流长期支持（LTS）版本，保持开发环境与生产环境的一致性：

```bash
# 推荐运行时版本
Node.js   >= 20.x LTS   # 前端构建与工具链
JDK       >= 17 LTS     # Java 后端开发环境
Python    >= 3.10       # 智能脚本与数据处理
```

推荐使用版本管理工具（如前端使用 `fnm` 或 `nvm`，Python 使用 `venv` 或 `conda`）进行多版本隔离，避免全局环境污染。

### 依赖锁定与确定性构建

项目中必须包含依赖锁定文件（如 `package-lock.json` 或 `pom.xml`）：

依赖锁定文件精确记录了每个依赖包的完整版本号与哈希校验和，能够确保团队所有成员以及持续集成服务器在执行安装时获得完全一致的依赖树，消除由于微版本漂移带来的不可预期缺陷。

### 换行符跨平台一致性

为避免 Windows 系统（CRLF）与 Linux/macOS 系统（LF）之间的换行符冲突，建议在代码仓库根目录维护 `.gitattributes` 文件：

```gitattributes
# 统一代码换行符为 LF
* text=auto eol=lf
```

### 敏感配置与环境变量隔离

项目中的数据库密码、接口密钥与私有令牌严禁直接硬编码在代码文件中。

建议通过 `.env` 环境变量文件进行本地注入，并将 `.env` 列入 `.gitignore` 排除列表；同时在仓库中维护不包含敏感信息的 `.env.example` 模板文件，供团队成员克隆后参考配置。
