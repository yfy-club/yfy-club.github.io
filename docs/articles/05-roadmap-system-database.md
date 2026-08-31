---
category: roadmap
slug: roadmap-system-database
title: 阶段四：Linux 系统底座与 MySQL 数据库基础
summary: Linux 常用运维命令、文件权限体系与 MySQL 数据库核心增删改查、聚合分组及多表联查教程。
minutes: 15
---

### 推荐学习教程与资源

阶段四推荐结合以下学习资源进行系统性练习：

| 领域 | 推荐学习资源 | 资源形式 | 核心学习重点 |
|---|---|---|---|
| 底层与网络 | [小林coding 计算机底座](https://xiaolincoding.com/) | 图解专栏 | 操作系统进程、TCP 网络与 MySQL 索引底层 |
| 数据库实战 | 社团 MySQL 综合练习题库 | 题单实战 | 多表关联、分组聚合、子查询与事务实战 |

### Linux 核心常用操作命令

Linux 是绝大多数服务端后台程序运行的操作系统环境。

#### 1. 文件与目录常用命令速查表

| 命令格式 | 功能说明 | 示例 |
|---|---|---|
| `pwd` | 显示当前所在绝对路径 | `pwd` |
| `ls -la` | 列出当前目录下所有文件（含隐藏文件与详细权限） | `ls -la` |
| `cd <路径>` | 切换工作目录 | `cd /var/log` 或 `cd ..` 返回上级 |
| `mkdir -p <目录>` | 递归创建新目录 | `mkdir -p app/logs` |
| `rm -rf <目标>` | 强制删除文件或目录 | `rm -rf temp/` |
| `cp -r <源> <目标>` | 复制文件或目录 | `cp -r config/ backup/` |
| `mv <源> <目标>` | 移动文件或重命名 | `mv app.jar /opt/app/` |

#### 2. 内容查看与监控排查命令

| 命令格式 | 功能说明 | 示例 |
|---|---|---|
| `cat <文件>` | 一次性输出文件全部内容 | `cat config.yml` |
| `tail -f <文件>` | 实时追踪并输出文件末尾新增内容（常用于看日志） | `tail -f app.log` |
| `grep <模式> <文件>` | 在文件中检索匹配行 | `grep "ERROR" app.log` |
| `ps -ef` | 查看系统当前运行的所有进程 | `ps -ef \| grep java` |
| `top` | 实时查看 CPU 与内存占用情况 | `top`（按 `q` 退出） |
| `kill -9 <PID>` | 根据进程号强制终止进程 | `kill -9 12345` |
| `ss -tlnp` | 查看系统当前监听的端口号与服务 | `ss -tlnp \| grep 8080` |

#### 3. Linux 文件权限计算

Linux 文件权限由三组标识（所有者、群组、其他用户）组成，每组由读（`r=4`）、写（`w=2`）、执行（`x=1`）相加计算：

```bash
# 755 代表：所有者 rwx(7)，群组 r-x(5)，其他用户 r-x(5)
chmod 755 start.sh

# 644 代表：所有者 rw-(6)，群组 r--(4)，其他用户 r--(4)
chmod 644 application.yml
```

### MySQL 数据库与数据表管理

MySQL 是一种广泛使用的开源关系型数据库。

#### 1. 常用数据类型速查

| 数据类型 | 说明 | 适用场景 |
|---|---|---|
| `INT` | 4 字节整数 | 主键 ID、数量、状态码 |
| `BIGINT` | 8 字节整数 | 分布式唯一 ID、大范围计数 |
| `VARCHAR(N)` | 变长字符串（最多 N 个字符） | 姓名、邮箱、标题 |
| `DECIMAL(M, D)` | 精确固定小数 | 金额、商品单价（避免浮点误差） |
| `DATETIME` | 日期与时间（`YYYY-MM-DD HH:MM:SS`） | 创建时间、更新时间 |

#### 2. 数据库与建表 SQL 实例

```sql
-- 1. 创建并切换数据库
CREATE DATABASE IF NOT EXISTS yfy_club DEFAULT CHARACTER SET utf8mb4;
USE yfy_club;

-- 2. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名（唯一）',
    age INT NOT NULL DEFAULT 18 COMMENT '年龄',
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基础信息表';
```

### SQL 数据增删改查基础

#### 1. 插入数据（INSERT）

```sql
-- 插入一条新记录
INSERT INTO users (username, age, balance) 
VALUES ('张三', 20, 100.50);

-- 批量插入多条记录
INSERT INTO users (username, age, balance) VALUES 
('李四', 22, 250.00),
('王五', 19, 50.00),
('赵六', 22, 500.00);
```

#### 2. 更新数据（UPDATE）

```sql
-- 将用户名为 '张三' 的余额修改为 200.00
UPDATE users 
SET balance = 200.00 
WHERE username = '张三';
```

#### 3. 删除数据（DELETE）

```sql
-- 删除指定 ID 的用户记录（切记必须加 WHERE 条件）
DELETE FROM users 
WHERE id = 4;
```

#### 4. 基础查询与条件筛选（SELECT）

```sql
-- 查询年龄大于等于 20 岁的所有用户，按余额降序排序，取前 5 条
SELECT id, username, age, balance 
FROM users 
WHERE age >= 20 
ORDER BY balance DESC 
LIMIT 5;
```

### SQL 聚合函数与分组统计

#### 常用聚合函数

| 函数名 | 说明 | 示例 |
|---|---|---|
| `COUNT(*)` | 统计总行数 | `SELECT COUNT(*) FROM users;` |
| `SUM(列名)` | 计算指定列的总和 | `SELECT SUM(balance) FROM users;` |
| `AVG(列名)` | 计算指定列的平均值 | `SELECT AVG(age) FROM users;` |
| `MAX(列名)` / `MIN(列名)` | 计算最大值 / 最小值 | `SELECT MAX(balance) FROM users;` |

#### 分组统计实例

```sql
-- 按年龄分组统计用户人数与平均余额，且仅保留人数大于 1 的分组
SELECT age, COUNT(*) AS user_count, AVG(balance) AS avg_balance
FROM users
GROUP BY age
HAVING COUNT(*) > 1;
```

### 多表联查（JOIN）

通过主外键关联关系同时查询多张表中的数据。

#### 实例代码：用户与订单表联查

```sql
-- 订单表定义
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 内连接查询：仅返回有订单的用户及其订单信息
SELECT u.username, o.order_id, o.amount, o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 左连接查询：返回所有用户，无论其是否有订单（无订单则订单字段为 NULL）
SELECT u.username, o.order_id, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

### 阶段实战大作业

1. 在本地或 Linux 服务器上安装运行 MySQL 数据库服务；
2. 设计一套图书管理系统表结构（图书表、读者表、借阅记录表）；
3. 插入测试数据，编写 SQL 完成借阅排行统计、超期未还读者查询与多表连接。
