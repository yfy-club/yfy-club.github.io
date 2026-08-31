---
category: roadmap
slug: roadmap-backend-java
title: 阶段三：JavaSE 企业级面向对象与集合基础
summary: JavaSE 核心入门教程：类与对象、面向对象三大特性、常用类、集合框架 ArrayList 与 HashMap、异常处理与文件读写。
minutes: 15
---

### 推荐学习视频教程

阶段三推荐配合以下视频教程进行系统性学习与编码实战：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| JavaSE 基础 | [JavaSE 零基础到进阶教程](https://www.bilibili.com/video/BV163GGz2E8c) | `BV163GGz2E8c` | 类与对象、继承多态、接口、集合与异常处理 |
| Git 协作 | [Git 版本控制与协同实战](https://www.bilibili.com/video/BV1ce4y1W7YB) | `BV1ce4y1W7YB` | 本地提交、分支合并与远程推送 |

<video-preview provider="bilibili" id="BV163GGz2E8c" title="JavaSE 零基础到进阶教程" bvid="BV163GGz2E8c"></video-preview>

### Java 基础语法与控制台输入输出

Java 是一门强类型的面向对象编程语言，所有代码都必须组织在类（`class`）内部。

#### 实例代码

```java
import java.util.Scanner;

public class HelloWorld {
    public static void main(String[] args) {
        // 1. 控制台输出
        System.out.println("欢迎来到 Java 的世界！");

        // 2. 控制台用户输入
        Scanner scanner = new Scanner(System.in);
        System.out.print("请输入你的姓名: ");
        String name = scanner.nextLine();

        System.out.print("请输入你的年龄: ");
        int age = scanner.nextInt();

        System.out.println("你好，" + name + "！明年你将 " + (age + 1) + " 岁。");
        scanner.close();
    }
}
```

#### 实例解析

* `public class HelloWorld`：定义公开类，类名必须与文件名 `HelloWorld.java` 严格一致。
* `public static void main(String[] args)`：Java 程序的执行入口主方法。
* `Scanner scanner = new Scanner(System.in)`：创建扫描器对象，用于读取键盘控制台输入。

### 面向对象核心特性

面向对象编程包含三大核心特性：**封装**、**继承**与**多态**。

#### 1. 封装与标准实体类

封装是将类的状态数据设为私有（`private`），通过公开的方法（Getter / Setter）进行安全访问。

```java
public class Student {
    private int id;
    private String name;
    private double score;

    // 无参构造函数
    public Student() {}

    // 有参构造函数
    public Student(int id, String name, double score) {
        this.id = id;
        this.name = name;
        this.score = score;
    }

    // Getter 与 Setter 方法
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getScore() { return score; }
    public void setScore(double score) {
        if (score >= 0 && score <= 100) {
            this.score = score;
        }
    }
}
```

#### 2. 继承与方法重写

子类使用 `extends` 关键字继承父类，可复用父类逻辑并重写（Override）特定方法：

```java
class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    public void makeSound() {
        System.out.println("动物发出叫声");
    }
}

class Dog extends Animal {
    public Dog(String name) {
        super(name); // 调用父类构造函数
    }

    @Override
    public void makeSound() {
        System.out.println(name + " 正在汪汪叫！");
    }
}
```

#### 3. 接口与多态

接口（`interface`）定义行为契约，实现类使用 `implements` 实现接口方法：

```java
// 定义支付接口
interface PaymentService {
    void pay(double amount);
}

// 微信支付实现类
class WechatPay implements PaymentService {
    @Override
    public void pay(double amount) {
        System.out.println("使用微信支付扣款: " + amount + " 元");
    }
}

// 支付宝支付实现类
class AliPay implements PaymentService {
    @Override
    public void pay(double amount) {
        System.out.println("使用支付宝扣款: " + amount + " 元");
    }
}

public class Main {
    public static void main(String[] args) {
        // 多态：父接口引用指向具体子类实现
        PaymentService payment = new WechatPay();
        payment.pay(99.0);

        // 切换实现
        payment = new AliPay();
        payment.pay(199.0);
    }
}
```

### 字符串与常用 API

#### 1. String 常用方法速查表

| 方法名 | 功能说明 | 示例 |
|---|---|---|
| `length()` | 返回字符串字符数 | `"hello".length()` 返回 5 |
| `charAt(int index)` | 获取指定索引处的字符 | `"abc".charAt(1)` 返回 `'b'` |
| `substring(start, end)` | 截取子字符串（左闭右开） | `"hello".substring(0, 2)` 返回 `"he"` |
| `equals(Object anObject)` | 比较字符串内容是否相等 | `str1.equals(str2)` |
| `split(String regex)` | 按指定分隔符切分字符串 | `"a,b,c".split(",")` |

#### 2. StringBuilder 字符串拼接

当需要进行大量字符串拼接时，应使用 `StringBuilder` 避免生成过多临时无用对象：

```java
StringBuilder sb = new StringBuilder();
sb.append("SELECT * FROM users ");
sb.append("WHERE age >= 18 ");
sb.append("ORDER BY id DESC");

String sql = sb.toString();
System.out.println(sql);
```

### 集合框架常用类

Java 集合框架用于在内存中存储并操作数据集合。

#### 1. ArrayList 动态列表

`ArrayList` 是底层基于动态扩容数组实现的列表集合。

```java
import java.util.ArrayList;
import java.util.List;

public class ListDemo {
    public static void main(String[] args) {
        // 创建列表集合
        List<String> fruits = new ArrayList<>();

        // 1. 添加元素
        fruits.add("苹果");
        fruits.add("香蕉");
        fruits.add("橙子");

        // 2. 根据索引获取与修改
        System.out.println("首个元素: " + fruits.get(0));
        fruits.set(1, "葡萄");

        // 3. 删除元素
        fruits.remove("橙子");

        // 4. 遍历列表
        for (String fruit : fruits) {
            System.out.println("水果: " + fruit);
        }
    }
}
```

#### 2. HashMap 键值对映射

`HashMap` 根据键（Key）的哈希值存储并索引对应的值（Value）。

```java
import java.util.HashMap;
import java.util.Map;

public class MapDemo {
    public static void main(String[] args) {
        // 创建 Map 映射（键为学号，值为姓名）
        Map<Integer, String> studentMap = new HashMap<>();

        // 1. 放入键值对
        studentMap.put(1001, "张三");
        studentMap.put(1002, "李四");
        studentMap.put(1003, "王五");

        // 2. 根据键获取值
        System.out.println("学号 1002 的学生: " + studentMap.get(1002));

        // 3. 检查键是否存在
        if (studentMap.containsKey(1001)) {
            System.out.println("学号 1001 存在于系统中");
        }

        // 4. 遍历 Map 键值对
        for (Map.Entry<Integer, String> entry : studentMap.entrySet()) {
            System.out.println("学号: " + entry.getKey() + ", 姓名: " + entry.getValue());
        }
    }
}
```

### 异常处理机制

Java 使用 `try-catch-finally` 机制捕获并处理运行期出现的异常，防止程序崩溃。

#### 实例代码

```java
public class ExceptionDemo {
    public static int divide(int a, int b) {
        if (b == 0) {
            // 主动抛出非法参数异常
            throw new IllegalArgumentException("除数不能为 0！");
        }
        return a / b;
    }

    public static void main(String[] args) {
        try {
            int result = divide(10, 0);
            System.out.println("结果: " + result);
        } catch (IllegalArgumentException e) {
            // 捕获特定异常并给出友好提示
            System.err.println("捕获到业务异常: " + e.getMessage());
        } finally {
            // 无论是否发生异常，finally 块都会执行
            System.out.println("计算处理结束");
        }
    }
}
```

### 基础文件读写操作

在 Java 中可以使用现代 `java.nio.file.Files` 工具类轻松完成纯文本文件的读写。

#### 实例代码

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class FileDemo {
    public static void main(String[] args) {
        Path filePath = Path.of("students.txt");

        try {
            // 1. 写入多行文本
            List<String> lines = List.of("1001,张三,88.5", "1002,李四,92.0");
            Files.write(filePath, lines);
            System.out.println("文件写入成功！");

            // 2. 读取全部行
            List<String> readLines = Files.readAllLines(filePath);
            for (String line : readLines) {
                System.out.println("读取到行: " + line);
            }
        } catch (IOException e) {
            System.err.println("文件操作失败: " + e.getMessage());
        }
    }
}
```

### 阶段实战大作业

编写一个单机控制台学生管理系统：
1. 包含 `Student` 实体类（包含学号、姓名、专业、成绩）；
2. 使用 `ArrayList` 或 `HashMap` 管理学生列表；
3. 提供控制台菜单：1. 添加学生、2. 查询学生、3. 删除学生、4. 导出保存到文本文件；
4. 包含完善的输入格式校验与异常处理，输入非法数据不报错退出。
