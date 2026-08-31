---
category: handbook
slug: troubleshooting
title: 高频故障排查手册
summary: 排障手册：跨域与代理冲突、Git 冲突救砖、JVM 内存溢出与连接池耗尽。
minutes: 12
---

### 核心背景与技术定位

排障能力是工程师的生存技能，而排障的差距不在工具多少，在于有没有方法论。本篇沉淀社团项目里复发率最高的四类故障——跨域、Git 冲突、内存溢出、连接池耗尽，每类都给出机理、排查命令与修复方案。

#### 排障四步法

所有故障按同一条路径推进：**固定现象**（完整报错、复现步骤、发生时间）→ **提出假设**（最近改了什么、哪一层最可能）→ **最小验证**（一次只改一个变量）→ **修复并记录**（修完写进本篇）。最忌在没看清报错全文的情况下乱改一气。

#### 先定界再定位

任何报错先回答「断在哪一层」：浏览器控制台、网关、应用、数据库。网络面板看请求是否发出、响应码是什么；应用日志看堆栈；数据库看慢查询与连接。定界错误会让后面所有排查南辕北辙。

### 跨域与网络代理

#### CORS 预检的机理

浏览器同源策略下，跨域的「非简单请求」（自定义头、JSON 体、PUT/DELETE 等）会先发一个 `OPTIONS` 预检请求询问服务器是否允许。预检不过，真实请求根本不会发出——控制台报的是 `CORS error`，而服务端日志里可能一条请求都没有，这是新人最常见的困惑。

#### 反代与跨域中间件只能留一个

典型事故：Nginx 反向代理已经加了一组跨域响应头，后端应用的跨域中间件又加一组，浏览器看到重复的 `Access-Control-Allow-Origin` 直接拒绝——**两层同时配等于必坏**。纪律：生产走反向代理同源化，跨域头只在代理层配；后端中间件只在本地联调直连时启用。

<details>
<summary>Nginx 反向代理与跨域头完整配置示例</summary>

```bash
# /etc/nginx/conf.d/app.conf
server {
    listen 80;
    server_name app.example.com;

    # 前端静态资源
    location / {
        root /opt/app/dist;
        try_files $uri $uri/ /index.html;
    }

    # 接口反向代理：同源化后前端不再触发跨域
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 跨域头只在这里出现一次；若后端中间件也在加，必须关掉一处
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization,Content-Type" always;
        add_header Access-Control-Allow-Credentials "true" always;

        # 预检请求在此终结，不透传给后端
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
```

</details>

```bash
# 验证：预检请求必须返回 204 且响应头只有一份
curl -i -X OPTIONS https://app.example.com/api/users \
  -H "Origin: https://web.example.com" \
  -H "Access-Control-Request-Method: POST"
```

### Git 冲突与误操作救砖

#### 合并冲突与变基冲突的解决步骤

两类冲突的解法是同一条：打开冲突文件，在每个冲突标记块里决定保留谁，删掉全部冲突标记，再分别走对应的收尾命令。

```bash
# 合并冲突：解决后标记完成并收尾
git status                 # 先看哪些文件冲突
# 逐文件编辑解决冲突标记后
git add <冲突文件>
git commit                 # 生成合并提交

# 变基冲突：解决后继续，注意是 rebase --continue
git add <冲突文件>
git rebase --continue

# 变基过程中局面失控：随时可以整体放弃，回到变基前
git rebase --abort
```

纪律：**一次只解决一个文件，解决完立刻验证编译**。连环冲突时边改边错最致命。

#### 误操作救砖：引用日志是后悔药

Git 的引用日志记录了本地分支的每一次移动，最近九十天内的「丢」几乎都能找回来：

```bash
# 误重置、误删分支后：先找到目标提交的哈希
git reflog

# 找回误删分支：从引用日志里的提交重建分支
git branch feat/rescued <提交哈希>

# 误提交想撤回且未推送：软重置保留改动
git reset --soft HEAD~1

# 已推送的提交需要撤销：用反向提交，不改写共享历史
git revert <提交哈希>
```

铁律：共享分支上不改写历史，一律用反向提交；本地私有提交才允许重置与变基。

### JVM 内存溢出排查

#### 先分清是哪种溢出

`OutOfMemoryError` 不是单一故障：堆溢出是大对象或泄漏，元空间溢出是类加载失控，栈溢出是递归过深。报错全文的第一行决定排查方向，别看都不看就加内存参数——那只是把爆炸推迟。

#### 三板斧：线程、堆转储、分析

```bash
# 第一步：找到目标进程
jps -l

# 线程级快照：定位死锁与阻塞，连打三次对比可发现线程不动
jstack <进程号> > thread-1.txt

# 堆转储：内存泄漏的最终证据
jmap -dump:format=b,file=heap.hprof <进程号>

# 预防性配置：溢出瞬间自动生成转储，事故现场不丢
# -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/opt/app/dump
```

转储文件用内存分析工具打开，看支配树里哪个对象占了最大份额、引用链通向哪里——泄漏的十有八九是只增不减的集合（静态缓存、监听器列表、未关闭的资源）。

#### 连接池耗尽定位

「获取连接超时」的根因几乎不在线程等待本身，而在连接被借走后没归还：事务里夹着远程调用、连接借出后异常路径未释放、慢查询把连接占死。排查路径：连接池监控看活跃数曲线 → 慢查询日志找长占连接者 → 代码里查事务内的外部调用。临时调大连接数上限只是止痛，不归还连接，多大池子都会被抽干。

### 高频故障速查表

| 现象 | 第一反应 | 本篇章节 |
|---|---|---|
| 浏览器跨域报错、后端无日志 | 查预检是否被正确响应 | 跨域与网络代理 |
| 跨域头明明配了还是报错 | 查代理与中间件是否双重配置 | 跨域与网络代理 |
| 变基到一半冲突不断 | `rebase --abort` 冷静重来 | Git 冲突与误操作救砖 |
| 分支删了提交丢了 | `reflog` 找回，九十天内有救 | Git 冲突与误操作救砖 |
| 服务内存一路向北 | 堆转储加支配树分析 | JVM 内存溢出排查 |
| 获取连接超时 | 查连接借出后的归还路径 | 连接池耗尽定位 |

### 实操验收清单

| 项目 | 验收标准 |
|---|---|
| 方法论 | 能按四步法复述一次真实排障的完整过程 |
| 跨域 | 能解释预检机理，并指出代理与中间件二选一的原因 |
| Git 救援 | 能独立用引用日志找回误删分支，用反向提交撤销已推送变更 |
| 内存排查 | 能独立产出线程快照与堆转储，并用工具定位一个模拟泄漏 |
| 沉淀习惯 | 新踩的坑在四十八小时内补进本篇 |
