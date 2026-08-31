---
category: roadmap
slug: roadmap-foundation
title: 阶段一：C/C++ 语法启蒙与内存指针基础
summary: C 与 C++ 核心入门教程：变量类型、控制流、函数、数组、指针与地址、结构体、动态内存与面向对象基础。
minutes: 15
---

### 推荐学习视频教程

阶段一学习推荐配合以下系统性视频教程进行同步练习：

| 模块 | 推荐视频教程 | BV 号 / 链接 | 核心学习重点 |
|---|---|---|---|
| C 语言程序设计 | [C 语言入门精讲教程](https://www.bilibili.com/video/BV1dr4y1n7vA) | `BV1dr4y1n7vA` | 变量、循环分支、数组、函数与指针内存操作 |
| C++ 现代面向对象 | [C++ 现代体系与标准库](https://www.bilibili.com/video/BV1FpWZemEMS) | `BV1FpWZemEMS` | 类与对象、构造析构、引用与标准容器 |
| 算法训练 | [灵神算法基础精讲](https://www.bilibili.com/video/BV1bP411c7oJ) | `BV1bP411c7oJ` | 顺序表、链表、二分查找与双指针实战 |

<video-preview provider="bilibili" id="BV1dr4y1n7vA" title="C 语言入门精讲教程" bvid="BV1dr4y1n7vA"></video-preview>

### 基本数据类型与变量声明

在 C 语言中，变量是存储数据的具名内存空间。定义变量时必须显式声明其数据类型。

#### 常用基本数据类型

| 类型关键字 | 类型名称 | 内存占用（典型值） | 取值范围或用途 | 格式占位符 |
|---|---|---|---|---|
| `int` | 基本整型 | 4 字节 | -2,147,483,648 到 2,147,483,647 | `%d` |
| `float` | 单精度浮点型 | 4 字节 | 6 到 7 位有效数字 | `%f` |
| `double` | 双精度浮点型 | 8 字节 | 15 到 17 位有效数字 | `%lf` |
| `char` | 字符型 | 1 字节 | 单个字符或 ASCII 码（-128 到 127） | `%c` |

#### 实例代码

```c
#include <stdio.h>

int main(void) {
    int age = 18;
    double score = 95.5;
    char grade = 'A';

    printf("年龄: %d\n", age);
    printf("得分: %.1f\n", score);
    printf("评级: %c\n", grade);

    return 0;
}
```

#### 实例解析

* `#include <stdio.h>`：引入标准输入输出库头文件，提供 `printf` 与 `scanf` 等函数支持。
* `int main(void)`：主函数，是 C 语言程序的执行入口。
* `printf("年龄: %d\n", age)`：通过格式化占位符 `%d` 输出整型变量 `age` 的值，`\n` 表示换行。
* `return 0;`：主函数返回 0 表示程序正常退出。

#### 运行结果

```
年龄: 18
得分: 95.5
评级: A
```

### 流程控制语句

流程控制语句用于决定代码的执行流向，主要包含条件判断与循环控制两类。

#### 1. 条件判断语句

`if-else` 语句根据布尔表达式的结果选择执行不同的代码块：

```c
#include <stdio.h>

int main(void) {
    int score = 85;

    if (score >= 90) {
        printf("优秀\n");
    } else if (score >= 60) {
        printf("及格\n");
    } else {
        printf("不及格\n");
    }

    return 0;
}
```

#### 2. 循环控制语句

C 语言提供 `for` 循环与 `while` 循环：

```c
#include <stdio.h>

int main(void) {
    /* 1. for 循环：已知循环次数 */
    printf("for 循环计数: ");
    for (int i = 1; i <= 5; i += 1) {
        printf("%d ", i);
    }
    printf("\n");

    /* 2. while 循环：基于条件循环 */
    int count = 3;
    printf("while 倒计时: ");
    while (count > 0) {
        printf("%d ", count);
        count -= 1;
    }
    printf("\n");

    return 0;
}
```

#### 运行结果

```
for 循环计数: 1 2 3 4 5 
while 倒计时: 3 2 1 
```

### 函数与参数传递

函数将实现特定功能的代码封装为独立模块，提高代码复用性与可读性。

#### 语法格式

```c
返回值类型 函数名(参数类型 参数名1, 参数类型 参数名2) {
    // 函数体代码
    return 返回值;
}
```

#### 实例代码

```c
#include <stdio.h>

/* 函数声明与定义：计算两个整数的最大值 */
int get_max(int num1, int num2) {
    if (num1 > num2) {
        return num1;
    }
    return num2;
}

/* 值传递演示：形参改变不影响实参 */
void swap_by_value(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}

int main(void) {
    int x = 10;
    int y = 20;

    int max_val = get_max(x, y);
    printf("较大值: %d\n", max_val);

    swap_by_value(x, y);
    printf("值传递后 x=%d, y=%d (原值未变)\n", x, y);

    return 0;
}
```

#### 实例解析

* C 语言默认采用**值传递**：调用函数时，实参的值被复制一份传递给形参，函数内部修改形参不会影响外部实参。
* 若需要在函数内部修改外部变量的值，必须传递指针（地址）。

### 数组与字符串

数组是相同数据类型元素的连续内存集合。

#### 实例代码

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    /* 1. 一维整型数组 */
    int numbers[5] = {10, 20, 30, 40, 50};
    int len = sizeof(numbers) / sizeof(numbers[0]);

    printf("数组元素: ");
    for (int i = 0; i < len; i += 1) {
        printf("%d ", numbers[i]);
    }
    printf("\n");

    /* 2. 字符数组与字符串 */
    char greeting[] = "Hello";
    printf("字符串: %s, 长度: %lu\n", greeting, strlen(greeting));

    return 0;
}
```

#### 常用字符串函数速查表

| 函数名 | 所在头文件 | 功能说明 | 示例 |
|---|---|---|---|
| `strlen(str)` | `<string.h>` | 返回字符串实际长度（不计末尾 `\0`） | `strlen("abc")` 返回 3 |
| `strcpy(dest, src)` | `<string.h>` | 将 src 字符串复制到 dest | `strcpy(buf, "hi");` |
| `strcmp(str1, str2)` | `<string.h>` | 字典序比较两字符串，相等返回 0 | `strcmp(a, b) == 0` |

### 指针核心与内存地址

指针也就是内存物理地址，指针变量是专门用来存储内存地址的变量。

#### 核心语法与运算符

```c
int var = 20;   // 普通变量
int *ptr;       // 声明指针变量
ptr = &var;     // & 是取地址运算符：获取 var 的内存地址
int val = *ptr; // * 是解引用运算符：读取 ptr 指向地址上的数据
```

#### 实例代码

```c
#include <stdio.h>

/* 通过指针实现真正的两数交换（地址传递） */
void swap_by_pointer(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int num = 100;
    int *p = &num;

    printf("num 的值: %d\n", num);
    printf("num 的地址: %p\n", (void*)&num);
    printf("p 存储的地址: %p\n", (void*)p);
    printf("*p 访问的值: %d\n", *p);

    /* 通过指针修改原变量 */
    *p = 200;
    printf("通过指针修改后 num 的值: %d\n", num);

    /* 指针交换实战 */
    int x = 1, y = 2;
    swap_by_pointer(&x, &y);
    printf("交换后 x=%d, y=%d\n", x, y);

    return 0;
}
```

#### 运行结果

```
num 的值: 100
num 的地址: 0x7ffd5e3e4a2c
p 存储的地址: 0x7ffd5e3e4a2c
*p 访问的值: 100
通过指针修改后 num 的值: 200
交换后 x=2, y=1
```

#### 关键注意事项

* **野指针防范**：声明指针变量后若暂不指向有效内存，必须显式赋为 `NULL` 或 `nullptr`（如 `int *p = NULL;`）。严禁对未初始化的指针执行解引用操作。
* **数组名与指针**：在大多数表达式中，数组名会自动退化为指向数组首元素的指针（即 `arr` 等价于 `&arr[0]`）。

### 结构体与自定义数据类型

结构体允许将不同类型的变量组合成一个单一的自定义复合数据类型。

#### 实例代码

```c
#include <stdio.h>
#include <string.h>

/* 定义学生结构体 */
struct Student {
    int id;
    char name[20];
    double score;
};

int main(void) {
    /* 声明并初始化结构体变量 */
    struct Student s1;
    s1.id = 1001;
    strcpy(s1.name, "张三");
    s1.score = 88.5;

    /* 结构体指针 */
    struct Student *p = &s1;

    /* 通过点号 . 访问结构体成员 */
    printf("学生学号: %d, 姓名: %s, 成绩: %.1f\n", s1.id, s1.name, s1.score);

    /* 通过箭头 -> 通过指针访问结构体成员 */
    printf("通过指针访问: 学号 %d, 姓名 %s\n", p->id, p->name);

    return 0;
}
```

#### 访问操作符对比

* **点号操作符 `.`**：适用于结构体变量本身，如 `s1.name`。
* **箭头操作符 `->`**：适用于结构体指针，如 `p->name`（等价于 `(*p).name`）。

### 动态内存管理

局部变量分配在栈上，生命周期随函数退出而销毁。当需要创建生命周期跨函数或在运行期动态确定大小的数据时，需使用堆内存管理。

#### 常用动态内存函数

| 函数声明 | 所在头文件 | 功能说明 |
|---|---|---|
| `void *malloc(size_t size)` | `<stdlib.h>` | 在堆上分配指定字节数的连续内存空间（未初始化） |
| `void free(void *ptr)` | `<stdlib.h>` | 释放由 malloc 分配的堆内存 |

#### 实例代码

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;

    /* 在堆上动态分配 5 个整数大小的内存空间 */
    int *arr = (int *)malloc(n * sizeof(int));

    /* 检查分配是否成功 */
    if (arr == NULL) {
        printf("内存分配失败\n");
        return 1;
    }

    /* 写入并读取数据 */
    for (int i = 0; i < n; i += 1) {
        arr[i] = (i + 1) * 10;
        printf("%d ", arr[i]);
    }
    printf("\n");

    /* 释放堆内存并将指针置空 */
    free(arr);
    arr = NULL;

    return 0;
}
```

#### 内存使用纪律

* **谁申请谁释放**：使用 `malloc` 分配的内存必须配合 `free` 释放，否则会导致内存泄漏。
* **释放后置空**：调用 `free(ptr)` 后，指针变量中存储的地址依然存在，此时应立即执行 `ptr = NULL`，防止意外使用悬空指针。

### C++ 面向对象与标准库入门

C++ 在 C 语言基础上增加了类与对象、引用以及丰富的标准库容器。

#### 1. 类与对象基础

```cpp
#include <iostream>
#include <string>

class User {
private:
    int id;
    std::string name;

public:
    // 构造函数
    User(int userId, const std::string &userName) : id(userId), name(userName) {}

    // 成员方法
    void printInfo() const {
        std::cout << "用户ID: " << id << ", 用户名: " << name << std::endl;
    }
};

int main() {
    // 实例化对象
    User u1(101, "李四");
    u1.printInfo();

    return 0;
}
```

#### 2. C++ 引用与动态数组容器

* **引用 `&`**：变量的别名，不产生多余拷贝，比指针更安全直观。
* **动态数组 `std::vector`**：可自动扩容的动态数组。

```cpp
#include <iostream>
#include <vector>

// 使用常量引用传参，避免内存复制
void printVector(const std::vector<int> &vec) {
    std::cout << "容器元素: ";
    for (int val : vec) {
        std::cout << val << " ";
    }
    std::cout << "\n";
}

int main() {
    std::vector<int> nums;

    // 向末尾追加元素
    nums.push_back(10);
    nums.push_back(20);
    nums.push_back(30);

    printVector(nums);
    std::cout << "元素总数: " << nums.size() << std::endl;

    // 删除末尾元素
    nums.pop_back();
    printVector(nums);

    return 0;
}
```

#### 运行结果

```
用户ID: 101, 用户名: 李四
容器元素: 10 20 30 
元素总数: 3
容器元素: 10 20 
```

### 阶段实战大作业

编写一个简易动态顺序表：
1. 使用结构体管理底层整型动态数组指针、当前元素个数与总容量；
2. 实现初始化、尾部插入（容量满时扩容为 2 倍）、按索引删除与内存销毁函数；
3. 使用 `valgrind` 检查确保无任何内存泄漏。
