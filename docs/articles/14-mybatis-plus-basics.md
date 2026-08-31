---
category: tools
slug: mybatis-plus-basics
title: MyBatis-Plus 极速增强工具教程
summary: MyBatis-Plus 单表通用 CRUD、LambdaQueryWrapper 条件构造器、分页插件与逻辑删除实战。
minutes: 15
---

### 什么是 MyBatis-Plus 与核心优势

在企业级业务开发中，大部分数据库交互都是基础的单表增删改查。MyBatis-Plus 提供了极高的开发效率：
* **零 SQL 单表操作**：Mapper 接口只需继承 `BaseMapper<T>`，即可直接获得全套基础 CRUD 方法；
* **类型安全条件构造**：通过 `LambdaQueryWrapper` 消除 SQL 字段字符串硬编码，重构更安全；
* **内置通用插件**：自带物理分页插件、性能分析、逻辑删除与字段自动填充功能。

### 引入依赖与实体类注解

在 `pom.xml` 中引入 MyBatis-Plus 起步依赖（注意无需再重复引入原生的 `mybatis-spring-boot-starter`）：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.5</version>
</dependency>
```

#### 实体类标准定义

```java
package tech.yunfeiyang.demo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("products") // 映射数据库表名
public class Product {

    @TableId(type = IdType.AUTO) // 自增主键
    private Long id;

    private String title;
    private String category;
    private Double price;
    private Integer stock;

    @TableLogic // 逻辑删除标记（0 未删除，1 已删除）
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT) // 插入时自动填充当前时间
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE) // 插入与更新时自动更新时间
    private LocalDateTime updateTime;
}
```

### BaseMapper 零 SQL 单表 CRUD 实战

#### Mapper 接口定义

```java
package tech.yunfeiyang.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import tech.yunfeiyang.demo.entity.Product;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {
    // 继承 BaseMapper 后，自动获得 insert, selectById, updateById, deleteById 等数十个内置方法！
}
```

#### 业务层调用实战

```java
@Service
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    // 1. 插入记录
    public void addProduct(Product product) {
        productMapper.insert(product);
    }

    // 2. 根据主键查询
    public Product getById(Long id) {
        return productMapper.selectById(id);
    }

    // 3. 更新记录
    public void updateStock(Long id, int newStock) {
        Product p = new Product();
        p.setId(id);
        p.setStock(newStock);
        productMapper.updateById(p);
    }

    // 4. 逻辑删除记录
    public void deleteProduct(Long id) {
        productMapper.deleteById(id);
    }
}
```

### LambdaQueryWrapper 条件构造器

使用 Lambda 表达式指定实体类 Getter 方法，彻底杜绝字段名拼写错误：

```java
public List<Product> searchProducts(String category, Double maxPrice) {
    LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();

    // 动态拼接条件：只有当 category 非空时才生效
    wrapper.eq(category != null && !category.isBlank(), Product::getCategory, category)
           .le(maxPrice != null, Product::getPrice, maxPrice) // 价格 <= maxPrice
           .gt(Product::getStock, 0)                          // 库存 > 0
           .orderByDesc(Product::getPrice);                   // 按价格降序

    return productMapper.selectList(wrapper);
}
```

### 分页插件配置与实战

#### 1. 注册分页拦截器配置类

```java
package tech.yunfeiyang.demo.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加 MySQL 数据库分页拦截器
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

#### 2. 分页查询调用

```java
public Page<Product> getProductPage(int pageNum, int pageSize, String category) {
    // 构造分页对象（当前页码，每页条数）
    Page<Product> page = new Page<>(pageNum, pageSize);

    LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(category != null, Product::getCategory, category);

    // 执行分页查询，MyBatis-Plus 自动执行 COUNT 统计总数并完成分页限制
    return productMapper.selectPage(page, wrapper);
}
```

### 阶段实战大作业

1. 搭建 Spring Boot 工程并引入 MyBatis-Plus；
2. 编写 `Student` 实体类并继承 `BaseMapper<Student>`；
3. 使用 `LambdaQueryWrapper` 实现多条件组合查询与分页，并配置 `@TableLogic` 逻辑删除。
