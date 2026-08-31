---
category: tools
slug: maven-basics
title: Maven 项目与依赖管理教程
summary: Apache Maven 依赖管理实战：pom.xml 核心配置、GAV 坐标、依赖范围、生命周期命令与镜像加速配置。
minutes: 15
---

### 推荐学习视频教程

Maven 是 Java 工程化体系中必不可少的项目管理与依赖构建工具：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| Maven 依赖管理 | [Apache Maven 依赖管理教程](https://www.bilibili.com/video/BV1ZgScYfE3r) | `BV1ZgScYfE3r` | GAV 坐标、pom.xml 依赖引入、生命周期与依赖冲突解决 |

<video-preview provider="bilibili" id="BV1ZgScYfE3r" title="Apache Maven 依赖管理教程" bvid="BV1ZgScYfE3r"></video-preview>

### 什么是 Maven 与标准目录结构

Maven 是一个基于项目对象模型（POM）的项目管理工具，通过一小段描述信息来管理项目的构建、报告和文档。

#### Maven 标准目录结构规范

```
my-project/
├── pom.xml                 # 核心项目对象模型配置文件
└── src/
    ├── main/
    │   ├── java/           # 生产 Java 源代码
    │   └── resources/      # 配置文件与静态资源
    └── test/
        └── java/           # 单元测试源代码
```

### GAV 坐标体系与 pom.xml 核心配置

Maven 使用一组唯一的坐标在仓库中精准定位一个组件：
* `groupId`：组织或公司的唯一标识（通常是反向域名，如 `org.springframework.boot`）；
* `artifactId`：项目或模块的唯一名称（如 `spring-boot-starter-web`）；
* `version`：当前构件的版本号（如 `3.2.0` 或 `1.0.0-SNAPSHOT`）。

#### pom.xml 核心结构实例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>tech.yunfeiyang</groupId>
    <artifactId>demo-app</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- 引入第三方依赖组件 -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
    </dependencies>
</project>
```

### 依赖范围（Scope）

在 `<dependency>` 中通过 `<scope>` 标签控制依赖项在编译、测试与运行等不同阶段的有效范围：

| 依赖范围（Scope） | 编译期有效 | 测试期有效 | 运行期打包 | 典型示例 |
|---|:---:|:---:|:---:|---|
| `compile`（默认） | 是 | 是 | 是 | `spring-web`、`gson` |
| `provided` | 是 | 是 | 否（由运行容器提供） | `servlet-api`、`lombok` |
| `runtime` | 否 | 是 | 是 | `mysql-connector-j` |
| `test` | 否 | 是 | 否 | `junit`、`mockito` |

### Maven 核心生命周期与命令

Maven 构建生命周期分为清理（clean）、默认构建（default）与站点生成（site）三大独立周期：

| 常用命令 | 说明 | 适用场景 |
|---|---|---|
| `mvn clean` | 删除编译输出目录 `target` | 清理旧构建产物与缓存 |
| `mvn compile` | 编译 `src/main/java` 源码 | 检查代码是否存在编译语法错误 |
| `mvn test` | 执行 `src/test/java` 单元测试 | 提交前本地质量自测 |
| `mvn package` | 将项目编译并打包为 JAR 或 WAR 文件 | 打包可执行交付物 |
| `mvn install` | 将打包结果安装到本地 Maven 仓库 | 供本地其他模块依赖引用 |

### 国内阿里云镜像加速配置

打开 Maven 安装目录下的 `conf/settings.xml`（或用户目录 `~/.m2/settings.xml`），在 `<mirrors>` 节点内添加阿里云镜像以大幅提升依赖下载速度：

```xml
<mirrors>
    <mirror>
        <id>aliyunmaven</id>
        <mirrorOf>central</mirrorOf>
        <name>阿里云公共仓库</name>
        <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
</mirrors>
```

### 依赖冲突仲裁与手动排除

当项目中引入的多个依赖间接依赖了同一个组件的不同版本时，Maven 会根据仲裁规则自动选择一个版本：
1. **路径最短优先原则**：直接依赖的版本优先于间接传递依赖；
2. **声明先者优先原则**：当路径长度相同时，在 `pom.xml` 中先声明的依赖生效。

#### 手动排除冲突依赖示例

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <!-- 排除 Spring Boot 默认自带的 Tomcat 容器 -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 阶段实战大作业

1. 在 IntelliJ IDEA 中创建一个标准 Maven 模块；
2. 在 `pom.xml` 中引入 `fastjson2` 或 `gson` 依赖；
3. 编写一个实体类并将其序列化为 JSON 字符串输出；
4. 执行 `mvn clean package` 并在 `target/` 目录下找到生成的 JAR 文件。
