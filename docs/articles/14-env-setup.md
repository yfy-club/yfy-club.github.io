---
category: handbook
slug: env-setup
title: 开发环境与工具链配置指南
summary: 环境基线：JDK 与 Node 版本管理、Git 配置、镜像加速与 IDE 插件集。
minutes: 10
---

### 核心背景与技术定位

环境问题吞掉的新人时间，比写代码还多：版本不一致导致「我这能跑你那不行」，镜像没配导致依赖装一小时，格式化没接导致评审里一半意见是缩进。本篇给出社团统一的开发环境基线——装什么版本、怎么管理版本、怎么加速、IDE 怎么配。

#### 环境基线的原则

一切工具链版本以项目仓库的声明为准（`pom.xml`、`package.json`、`.nvmrc`），本机环境服务于仓库声明，而不是反过来。装完每一项都用命令验证版本输出，不许「装完就算」。

### JDK 与 Node.js 版本管理

#### 发行版选择

社团统一使用开源发行版：Eclipse Temurin 或 Amazon Corretto，均为 OpenJDK 构建，长期支持版本优先。版本跟随项目：老项目 Java 8 或 11，新项目一律 Java 17 及以上。

```bash
# Windows 推荐用版本管理器安装，多版本共存按项目切换
scoop install temurin17-jdk

# 验证：三行输出齐全才算装好
java -version
javac -version
echo $env:JAVA_HOME   # PowerShell 下确认环境变量已指向 JDK
```

`JAVA_HOME` 必须指向 JDK 而不是 JRE，构建工具依赖它定位编译器；多版本共存时切换版本就是切换这个变量，建议交给版本管理器而不是手改。

Node 版本禁止全局装死：用版本管理器按项目切换，每个项目根目录放 `.nvmrc` 声明版本，进目录切换一次即可。

```bash
# nvm-windows 安装与按项目切换
nvm install 22.11.0
nvm use 22.11.0

# 验证：版本与包管理器就位
node -v
npm -v
```

```json
{
  "说明": "项目根目录的 .nvmrc 只写大版本或精确版本",
  ".nvmrc": "22.11.0"
}
```

### Git 与包管理器配置

#### Git 全局基线

```bash
# 身份标识用真实姓名与常用邮箱，提交归属靠它
git config --global user.name "你的名字"
git config --global user.email "you@example.com"

# 换行纪律：仓库声明为准，本机关闭自动转换防污染
git config --global core.autocrlf false

# 默认分支名与拉取策略
git config --global init.defaultBranch main
git config --global pull.rebase true
```

#### 镜像加速配置

网络环境下直连官方源经常超时，统一配置镜像后再装依赖：

```bash
# npm 镜像：查看与设置
npm config get registry
npm config set registry https://registry.npmmirror.com

# Maven 镜像：在 settings.xml 的 mirrors 节点配置
# 下载慢先查镜像是否生效，而不是反复重试
mvn help:effective-settings
```

装依赖统一用锁文件命令：`npm ci` 按 `package-lock.json` 精确安装，禁止在有锁文件的项目里随手 `npm install` 改动版本。

### IDE 插件集与格式化

#### 推荐插件组合

| 场景 | 插件方向 | 作用 |
|---|---|---|
| 前端项目 | ESLint / Prettier 类 | 静态检查与格式化 |
| Java 项目 | Lombok / SonarLint 类 | 样板消除与静态扫描 |
| 通用 | Git 图形化 / 编辑器配置类 | 可视化提交与跨编辑器统一缩进 |

#### 保存即格式化

格式化必须自动化：编辑器开启「保存时格式化」，项目提供统一的格式化配置（如 `.editorconfig` 与格式化规则文件）。评审里出现缩进与引号意见，视为格式化配置没接好，先修配置再修代码。

<details>
<summary>环境自检脚本：一键核对基线是否就位</summary>

```bash
# 任一行输出缺失即环境不达标，回到对应章节重装
java -version
node -v
npm -v
git --version
npm config get registry

# 项目级自检：进仓库目录后
cat .nvmrc
npm ci --dry-run
```

</details>

### 高频故障与实操避坑

| 症状 | 根因 | 修复方案 |
|---|---|---|
| `java` 与 `javac` 版本不一致 | 环境里混着多个 JDK | 统一 `JAVA_HOME`，清理 PATH 中的旧路径 |
| `npm ci` 报锁文件不同步 | 有人手改过依赖 | 还原锁文件，依赖变更走正常 `install` 再提交锁文件 |
| 依赖下载龟速 | 镜像未生效 | 检查 `npm config get registry` 与实际构建工具配置 |
| 换行符大面积变更 | 自动转换开着 | `core.autocrlf` 关闭，仓库用 `.gitattributes` 声明 |
| 同事机器格式不一致 | 各自编辑器配置 | 格式化配置入仓，保存即格式化全员统一 |

### 实操验收清单

| 项目 | 验收标准 |
|---|---|
| JDK | `java -version` 与 `JAVA_HOME` 输出一致，编译命令可用 |
| Node | 版本与项目 `.nvmrc` 一致，切换命令可用 |
| Git | 身份、换行、拉取策略配置齐全，`git config -l` 可查 |
| 镜像 | 依赖全量安装在合理时间内完成 |
| IDE | 保存自动格式化生效，插件按清单就位 |
| 自检 | 环境自检脚本逐项通过 |
