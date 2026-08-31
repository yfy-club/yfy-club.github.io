---
category: tools
slug: mysql-basics
title: MySQL 数据库技术与 SQL 实战教程
summary: MySQL 核心操作教程：数据库与表管理、数据类型约束、增删改查 SQL、聚合函数与多表 JOIN 联查。
minutes: 15
---

### 推荐学习视频教程

MySQL 是全球应用最广泛的关系型数据库，是后端数据持久化存储的核心：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| MySQL 数据库 | [MySQL 数据库技术教程](https://www.bilibili.com/video/BV19d4y147Df) | `BV19d4y147Df` | 建表约束、增删改查 SQL、多表联查、事务与索引 |

<video-preview provider="bilibili" id="BV19d4y147Df" title="MySQL 数据库技术教程" bvid="BV19d4y147Df"></video-preview>

### 数据库与数据表基础管理

关系型数据库以二维表格的形式组织与存储结构化数据。

#### 1. 常用字段数据类型速查

| 数据类型 | 占用空间 | 说明与用途 |
|---|---|---|
| `INT` | 4 字节 | 标准整数（主键 ID、数量、枚举值） |
| `BIGINT` | 8 字节 | 超大整数（分布式雪花 ID、大计数器） |
| `VARCHAR(N)` | 动态分配 | 变长字符串，N 代表最大允许字符数 |
| `DECIMAL(M, D)` | 精确空间 | 固定点高精度小数，M 为总位数，D 为小数位（适合存金额） |
| `DATETIME` | 8 字节 | 日期时间格式 `YYYY-MM-DD HH:MM:SS` |

#### 2. 建库与建表标准 SQL 实例

```sql
-- 1. 创建数据库并指定 utf8mb4 字符集（完整支持表情与中文）
CREATE DATABASE IF NOT EXISTS yfy_mall DEFAULT CHARACTER SET utf8mb4;
USE yfy_mall;

-- 2. 创建商品数据表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品主键 ID',
    title VARCHAR(100) NOT NULL COMMENT '商品标题',
    category VARCHAR(30) NOT NULL DEFAULT '通用' COMMENT '分类名称',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '商品单价',
    stock INT NOT NULL DEFAULT 0 COMMENT '库存数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上架时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品信息表';
```

### SQL 数据增删改基础（DML）

#### 1. 插入数据（INSERT）

```sql
-- 插入单条记录
INSERT INTO products (title, category, price, stock) 
VALUES ('机械键盘', '外设', 299.00, 50);

-- 批量插入多条记录
INSERT INTO products (title, category, price, stock) VALUES 
('无线鼠标', '外设', 129.00, 100),
('4K 显示器', '数码', 1899.00, 20),
('人体工学椅', '家具', 899.00, 15);
```

#### 2. 更新数据（UPDATE）

```sql
-- 将分类为 '外设' 的商品库存增加 10 件（务必携带 WHERE 条件）
UPDATE products 
SET stock = stock + 10 
WHERE category = '外设';
```

#### 3. 删除数据（DELETE）

```sql
-- 删除指定 ID 的商品记录
DELETE FROM products 
WHERE id = 4;
```

### SQL 数据查询进阶（SELECT）

#### 1. 条件筛选与排序

```sql
-- 查询价格在 100 到 1000 之间、且库存大于 0 的外设商品，按价格降序排列
SELECT id, title, price, stock 
FROM products 
WHERE category = '外设' 
  AND price BETWEEN 100 AND 1000 
  AND stock > 0 
ORDER BY price DESC;
```

#### 2. 分页查询（LIMIT）

在 Web 应用中展示列表必须配合分页，避免一次性加载全表导致内存溢出：

```sql
-- 分页查询：LIMIT offset, count（跳过前 0 条，查 10 条，即第 1 页）
SELECT * FROM products ORDER BY id DESC LIMIT 0, 10;

-- 第 2 页查询（跳过前 10 条，查 10 条）
SELECT * FROM products ORDER BY id DESC LIMIT 10, 10;
```

### 聚合函数与分组统计

#### 常用聚合函数速查

| 函数 | 说明 | 示例 |
|---|---|---|
| `COUNT(*)` | 统计符合条件的行数 | `SELECT COUNT(*) FROM products;` |
| `SUM(列名)` | 统计指定数值列的总和 | `SELECT SUM(stock) FROM products;` |
| `AVG(列名)` | 计算指定数值列的平均值 | `SELECT AVG(price) FROM products;` |
| `MAX(列名)` / `MIN(列名)` | 返回列中的最大值 / 最小值 | `SELECT MAX(price) FROM products;` |

#### 分组统计实例

```sql
-- 按分类统计商品总数、平均价格，并筛选出平均价格大于 200 的分类
SELECT category, COUNT(*) AS total_count, AVG(price) AS avg_price
FROM products
GROUP BY category
HAVING AVG(price) > 200;
```

### 多表关联查询（JOIN）

通过主键与外键关联，将分散在多张表中的数据联合输出。

```sql
-- 1. 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    buy_count INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 内连接查询：同时输出订单及其对应的商品名称与单价
SELECT o.order_id, p.title AS product_name, p.price, o.buy_count, o.total_amount
FROM orders o
INNER JOIN products p ON o.product_id = p.id;

-- 3. 左连接查询：返回所有商品及其订单（无订单则订单字段为 NULL）
SELECT p.title, o.order_id, o.buy_count
FROM products p
LEFT JOIN orders o ON p.id = o.product_id;
```

### 阶段实战大作业

1. 搭建本地 MySQL 服务并创建数据库；
2. 设计一套学生选课系统（学生表、课程表、选课记录表）；
3. 编写 SQL 语句完成：统计每门课程的选课人数、查询某学生选修的所有课程名称与授课教师。
