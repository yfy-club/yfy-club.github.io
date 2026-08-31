---
category: tools
slug: nginx-basics
title: Nginx 反向代理与负载均衡教程
summary: Nginx 核心配置结构、静态网站托管、单页应用刷新 404 解决、反向代理与多节点负载均衡实战。
minutes: 15
---

### 什么是 Nginx 与核心应用场景

Nginx 采用异步非阻塞的事件驱动模型，具备极高的并发连接处理能力（单机可支撑数万并发连接）与极低的内存消耗：
* **静态资源托管**：高效托管前端 HTML、CSS、JS 与图片视频等静态文件；
* **反向代理**：作为网关隐藏后端真实服务 IP，转发客户端请求并注入请求头；
* **负载均衡**：将流量按预设算法分发到后端多个应用实例节点；
* **跨域与安全防护**：统一配置 SSL 证书（HTTPS）与跨域 CORS 响应头。

### 常用管理控制命令

在 Linux 或 Windows 环境下管理 Nginx 服务：

```bash
# 启动 Nginx 服务
nginx

# 检查配置文件语法是否正确（修改配置后必执行）
nginx -t

# 平滑重新加载配置文件（无需停机）
nginx -s reload

# 优雅停止服务（处理完当前请求后停止）
nginx -s quit

# 强制立即停止服务
nginx -s stop
```

### nginx.conf 核心结构剖析

`nginx.conf` 配置文件主要由三大块组成：全局块、events 块与 http 块。

```
全局配置 (工作进程数、用户等)
events {
    worker_connections 1024; # 单进程最大并发连接数
}
http {
    # 包含 MIME 类型、日志格式、Gzip 压缩等
    upstream backend_pool { ... } # 负载均衡服务器池
    
    server {
        listen 80;               # 监听端口
        server_name example.com; # 绑定的域名
        
        location / { ... }       # 路由转发规则
    }
}
```

### 静态网站托管与单页应用 404 修复

在部署 Vue 或 React 等单页应用（SPA）时，直接刷新子路由（如 `/docs/intro`）会出现 404 错误。通过配置 `try_files` 将未匹配路径回退到 `index.html` 即可彻底解决：

```nginx
server {
    listen       80;
    server_name  localhost;

    # 前端静态打包产物目录
    location / {
        root   /usr/share/nginx/html/dist;
        index  index.html index.htm;
        # 核心：未匹配的文件自动回退到 index.html，交由前端路由处理
        try_files $uri $uri/ /index.html;
    }

    # 静态资源强缓存设置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff2)$ {
        root    /usr/share/nginx/html/dist;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### 反向代理与跨域解决配置

将前端发起的 `/api/` 开头接口请求无缝代理转发到本地或内网运行的 Spring Boot 后端服务（如 `http://127.0.0.1:8080`）：

```nginx
server {
    listen       80;
    server_name  api.yunfeiyang.tech;

    location /api/ {
        # 转发目标后端地址
        proxy_pass http://127.0.0.1:8080/;

        # 传递客户端真实 IP 与 Host 请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 解决跨域请求头注入
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
    }
}
```

### 负载均衡（Upstream）实战

通过 `upstream` 指令定义后端服务集群，Nginx 会自动进行请求分发与健康检查：

```nginx
# 定义后端集群池
upstream app_cluster {
    # 1. 权重轮询：按 weight 比例分发请求
    server 192.168.1.101:8080 weight=3;
    server 192.168.1.102:8080 weight=1;
    
    # 2. 备用节点：主节点全挂时才启用
    server 192.168.1.103:8080 backup;
}

server {
    listen 80;
    server_name app.yunfeiyang.tech;

    location / {
        proxy_pass http://app_cluster;
        proxy_set_header Host $host;
    }
}
```

### 阶段实战大作业

1. 在本地或 Linux 服务器安装 Nginx；
2. 部署一个前端构建产物并配置 `try_files`，验证路由刷新不报 404；
3. 配置反向代理转发 `/api/` 请求到 Spring Boot 8080 端口，并通过浏览器验证数据联通。
