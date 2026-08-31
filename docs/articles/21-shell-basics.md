---
category: tools
slug: shell-basics
title: Linux Shell 自动化运维脚本教程
summary: Bash 基础语法、参数变量传递、文本三剑客与 Spring Boot 生产级应用管理脚本实战。
minutes: 15
---

### 什么是 Shell 脚本与执行规范

Shell 脚本是一个包含一系列 Linux 命令的纯文本文件。

#### 1. 脚本头部声明与执行

* 必须以 `#!/bin/bash` 开头（指定解释器路径）；
* 执行前必须赋予可执行权限：`chmod +x script.sh`。

#### 2. 第一个 Shell 脚本实例

```bash
#!/bin/bash

# 这是一个单行注释
echo "===== 开始执行自动化脚本 ====="
CURRENT_TIME=$(date "+%Y-%m-%d %H:%M:%S")
echo "当前服务器时间: $CURRENT_TIME"
echo "当前主机名: $(hostname)"
```

### 变量与特殊参数传递

在 Bash 中定义变量时，**等号 `=` 两侧绝对不能有空格**：

```bash
# 1. 自定义变量
APP_NAME="demo-service"
PORT=8080

# 引用变量使用 $ 或 ${}
echo "启动服务: ${APP_NAME}, 监听端口: ${PORT}"
```

#### 特殊预定义参数速查表

| 特殊变量 | 含义说明 | 示例 |
|---|---|---|
| `$0` | 当前正在执行的脚本文件名 | `echo $0` 输出 `deploy.sh` |
| `$1`, `$2`, ... | 传递给脚本的第 1 个、第 2 个位置参数 | `./app.sh start` 中 `$1` 为 `start` |
| `$#` | 传递给脚本的位置参数总个数 | 用于校验用户是否少传了参数 |
| `$?` | 上一条命令执行的退出状态码（0 代表成功，非 0 代表失败） | `if [ $? -eq 0 ]; then ...` |
| `$$` | 当前脚本运行时的进程号（PID） | 用于记录锁文件 |

### 流程控制语句实战

#### 1. 条件判断语句（if-else）

中括号 `[ ... ]` 内侧两侧必须保留空格：

```bash
#!/bin/bash

# 判断传入的参数是否为空（-z 代表字符串长度为 0）
if [ -z "$1" ]; then
    echo "错误：请传入操作指令（start|stop|status）"
    exit 1
fi

# 常用数值比对：-eq（等于）、-ne（不等于）、-gt（大于）、-lt（小于）
COUNT=5
if [ $COUNT -gt 0 ]; then
    echo "计数大于 0"
fi
```

#### 2. case 分支语句

```bash
#!/bin/bash

ACTION=$1

case "$ACTION" in
    "start")
        echo "正在启动应用..."
        ;;
    "stop")
        echo "正在停止应用..."
        ;;
    "status")
        echo "正在检查运行状态..."
        ;;
    *)
        echo "未知指令: $ACTION，仅支持 start|stop|status"
        exit 1
        ;;
esac
```

#### 3. 循环控制语句

```bash
#!/bin/bash

# 遍历列表项
for ENV in "dev" "test" "prod"; do
    echo "正在准备部署环境: $ENV"
done
```

### 管道符与输出重定向

* **管道符 `|`**：将前一个命令的标准输出作为后一个命令的标准输入，如 `ps -ef | grep java`；
* **覆盖重定向 `>`**：将输出覆盖写入文件；
* **追加重定向 `>>`**：将输出追加写入文件末尾；
* **后台日志重定向 `> app.log 2>&1 &`**：将标准输出（1）与标准错误（2）统一合并写入 `app.log` 并在后台脱离终端运行。

---

### 企业级 Spring Boot 生产运维管理脚本（app.sh）

在日常部署中，通过编写一个通用的 `app.sh` 脚本统一控制应用的启动、停止与状态监控：

```bash
#!/bin/bash

# 应用 JAR 文件名
JAR_NAME="demo-service-1.0.0.jar"
LOG_FILE="app.log"

# 获取应用当前运行的进程号 PID
get_pid() {
    echo $(ps -ef | grep "$JAR_NAME" | grep -v grep | awk '{print $2}')
}

start() {
    PID=$(get_pid)
    if [ -n "$PID" ]; then
        echo "应用已在运行中，进程号 PID: $PID"
        return
    fi

    echo "正在启动 $JAR_NAME ..."
    # 核心后台启动命令
    nohup java -Xms512m -Xmx1024m -jar $JAR_NAME > $LOG_FILE 2>&1 &

    sleep 2
    PID=$(get_pid)
    if [ -n "$PID" ]; then
        echo "启动成功！进程号 PID: $PID，日志文件: $LOG_FILE"
    else
        echo "启动失败，请查看日志: $LOG_FILE"
    fi
}

stop() {
    PID=$(get_pid)
    if [ -z "$PID" ]; then
        echo "应用未在运行"
        return
    fi

    echo "正在停止进程 PID: $PID ..."
    kill $PID
    
    # 循环等待进程优雅退出
    for i in {1..10}; do
        sleep 1
        PID=$(get_pid)
        if [ -z "$PID" ]; then
            echo "应用已安全停止"
            return
        fi
    done

    echo "优雅停止超时，执行强制 kill -9 ..."
    kill -9 $PID
}

status() {
    PID=$(get_pid)
    if [ -n "$PID" ]; then
        echo "应用正在运行，进程号 PID: $PID"
    else
        echo "应用未运行"
    fi
}

# 根据传入的第一个参数分发执行
case "$1" in
    "start")
        start
        ;;
    "stop")
        stop
        ;;
    "restart")
        stop
        sleep 2
        start
        ;;
    "status")
        status
        ;;
    *)
        echo "使用方式: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
```

### 阶段实战大作业

1. 在 Linux 系统中创建 `app.sh` 脚本并赋予执行权限（`chmod +x app.sh`）；
2. 使用 `./app.sh start` 启动一个测试 Java 程序并检查进程与日志；
3. 执行 `./app.sh status` 与 `./app.sh stop` 验证控制流程。
