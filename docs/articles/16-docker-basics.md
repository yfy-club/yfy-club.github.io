---
category: tools
slug: docker-basics
title: Docker 容器化技术教程
summary: Docker 镜像管理、容器生命周期、数据卷挂载、Dockerfile 构建与 Docker Compose 多容器编排实战。
minutes: 15
---

### 推荐学习视频教程

Docker 是云原生与现代微服务架构中统一运行环境与交付部署的核心标准：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| Docker 容器 | [Docker 容器技术实战教程](https://www.bilibili.com/video/BV1r34y1p7j9) | `BV1r34y1p7j9` | 镜像构建、容器操作、数据卷、Dockerfile 与 Docker Compose |

<video-preview provider="bilibili" id="BV1r34y1p7j9" title="Docker 容器技术实战教程" bvid="BV1r34y1p7j9"></video-preview>

### 什么是 Docker 与三大核心概念

Docker 是一个开源的容器引擎，它允许开发者将应用及其所有依赖项打包进一个可移植的容器镜像中，实现“一次构建，到处运行”。

```
镜像仓库 (Registry) ──(docker pull)──> 镜像 (Image) ──(docker run)──> 容器 (Container)
```

1. **镜像（Image）**：只读的应用运行环境模版（类似于类 Class 或安装光盘）。
2. **容器（Container）**：由镜像运行生成的独立进程实例（类似于对象 Object 或运行中的虚拟机）。
3. **镜像仓库（Registry）**：集中存储和分发镜像的平台（如 Docker Hub、阿里云镜像服务）。

### 镜像核心操作命令

```bash
# 1. 从远程仓库拉取镜像
docker pull mysql:8.0
docker pull redis:7.0

# 2. 列出本地已下载的所有镜像
docker images

# 3. 删除指定镜像
docker rmi redis:7.0
```

### 容器生命周期管理命令

```bash
# 1. 运行并启动一个新容器（-d 后台运行，-p 端口映射 宿主端口:容器端口，--name 指定容器名）
docker run -d -p 6379:6379 --name my-redis redis:7.0

# 2. 运行 MySQL 容器并挂载数据卷（-v 宿主绝对路径:容器路径，-e 传递环境变量）
docker run -d \
  -p 3306:3306 \
  --name my-mysql \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -v /opt/mysql/data:/var/lib/mysql \
  mysql:8.0

# 3. 查看正在运行的容器（-a 查看包含已停止的所有容器）
docker ps -a

# 4. 查看容器实时运行日志
docker logs -f my-redis

# 5. 进入正在运行的容器内部交互终端
docker exec -it my-redis bash

# 6. 停止与启动容器
docker stop my-redis
docker start my-redis

# 7. 删除容器（需先停止容器）
docker rm my-redis
```

### Dockerfile 制作自定义镜像

Dockerfile 是一个包含一系列指令的文本文件，用于自动化构建自定义镜像。

#### 常用 Dockerfile 指令速查

| 指令 | 说明 | 示例 |
|---|---|---|
| `FROM` | 指定基础镜像 | `FROM eclipse-temurin:17-jre` |
| `WORKDIR` | 设置容器内的工作目录 | `WORKDIR /app` |
| `COPY` | 将宿主机文件复制到容器内 | `COPY target/app.jar app.jar` |
| `EXPOSE` | 声明容器运行时监听的端口号 | `EXPOSE 8080` |
| `ENTRYPOINT` | 指定容器启动时执行的主命令 | `ENTRYPOINT ["java", "-jar", "app.jar"]` |

#### Spring Boot 应用打包示例

```dockerfile
# 1. 基础镜像：轻量级 JDK 17 运行环境
FROM eclipse-temurin:17-jre-alpine

# 2. 创建并切换工作目录
WORKDIR /app

# 3. 复制 Maven 打包后的可执行 JAR 到容器内
COPY target/demo-app-1.0.0.jar app.jar

# 4. 暴露应用端口
EXPOSE 8080

# 5. 容器启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建与运行镜像：

```bash
# 1. 构建镜像（-t 指定镜像名与标签，末尾的点 . 代表当前上下文路径）
docker build -t yfy/demo-app:1.0.0 .

# 2. 启动自定义镜像容器
docker run -d -p 8080:8080 --name my-app yfy/demo-app:1.0.0
```

### Docker Compose 多容器一键编排

当应用需要同时依赖 MySQL、Redis 与后端应用时，使用 `docker-compose.yml` 能够实现一键快速启动整个服务集群。

#### docker-compose.yml 实战文件

```yaml
version: '3.8'

services:
  app-mysql:
    image: mysql:8.0
    container_name: compose-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: yfy_mall
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  app-redis:
    image: redis:7.0
    container_name: compose-redis
    restart: always
    ports:
      - "6379:6379"

volumes:
  mysql-data:
```

#### Compose 常用命令

```bash
# 后台一键构建并启动所有编排服务
docker compose up -d

# 查看编排服务运行状态
docker compose ps

# 停止并清理编排的所有容器与网络
docker compose down
```

### 阶段实战大作业

1. 在本地或 Linux 虚拟机中安装 Docker 与 Docker Compose；
2. 编写 `docker-compose.yml` 文件一键拉起 MySQL 8.0 与 Redis 7.0 实例；
3. 为自己的 Spring Boot 项目编写 `Dockerfile`，成功构建并运行容器。
