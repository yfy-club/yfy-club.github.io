---
category: roadmap
slug: roadmap-foundation
title: 阶段一：C/C++ 语法启蒙与内存指针底层
summary: C/C++ 语法筑基：指针与内存物理模型、对象底层机制与手写数据结构大作业。
minutes: 12
---

### 核心背景与技术定位

C/C++ 是社团培养阶梯的第一站，目标不是学会一门语言，而是建立「代码如何落到内存里」的物理直觉。上层语言把内存管理藏进垃圾回收，出问题时无处下手；而 C/C++ 强迫你直面每一个字节的去向，这份直面换来的底层意识，会在之后学 Java 集合、数据库索引、操作系统调度时持续复利。

#### 为什么从指针开始建立世界观

指针是 C 语言的灵魂，也是最多人劝退的地方。它的本质并不神秘：指针就是一个存着内存地址的整型变量，解引用是按这个地址去读写数据。一旦把「变量、数组、结构体都是内存上的一段区域」这件事想通，后面的链表、栈帧、虚函数表都只是同一件事的不同排布。

#### 本阶段的能力边界

完成本阶段后应能：手写动态数组与链表并保证无泄漏、口述栈与堆的分配差异、解释结构体内存对齐、说明虚函数调用的寻址过程。达不到的部分不许进入阶段二，欠的底层债会在企业级开发里加倍偿还。

### 指针运算与内存物理模型

#### 指针运算就是地址偏移

指针加减一个整数，偏移量会自动乘以所指类型的大小。`int *p` 执行 `p + 1`，地址实际增加 `sizeof(int)` 即 4 字节；`double *p` 则增加 8 字节。这正是数组下标 `a[i]` 与 `*(a + i)` 等价的底层原因：

```c
#include <stdio.h>

int main(void) {
    int a[4] = {10, 20, 30, 40};
    int *p = a;

    /* 防御：先确认数组非空语境且下标在界内，再做指针运算 */
    if (p == NULL) {
        return 1;
    }
    for (int i = 0; i < 4; i += 1) {
        /* *(p + i) 与 a[i] 是同一件事：基址 + i * sizeof(int) */
        printf("a[%d] = %d, 地址差 = %ld\n", i, *(p + i), (long)((p + i) - p) * sizeof(int));
    }
    return 0;
}
```

#### 栈帧压栈与堆内存生命周期

栈内存由编译器自动管理：函数调用时压入栈帧，局部变量随帧而生、随返回而灭，分配只是移动一下栈指针，极快但生命周期短。堆内存由 `malloc` 向操作系统申请、由 `free` 归还，生命周期跨越函数边界，代价是每一笔都要走分配器的簿记，且忘了还就是泄漏。口诀：**栈快而短命，堆慢而长寿，谁申请谁归还。**

```c
#include <stdio.h>
#include <stdlib.h>

/* 在堆上创建整型数组，调用方负责释放 */
int *create_buffer(size_t n) {
    if (n == 0) {
        return NULL; /* 边界防护：零长度直接返回空 */
    }
    int *buf = (int *)malloc(n * sizeof(int));
    if (buf == NULL) {
        return NULL; /* 分配失败必须检查，不许直接使用 */
    }
    for (size_t i = 0; i < n; i += 1) {
        buf[i] = 0; /* 初始化，杜绝未初始化读 */
    }
    return buf;
}
```

#### 内存对齐与结构体填充

结构体的字段并非紧密排布：编译器会按各字段的对齐要求在缝隙里填字节，让每个字段落在自身大小的整数倍地址上，换取 CPU 一次访存就能读全。结果是结构体大小经常大于字段之和：

```c
#include <stdio.h>
#include <stddef.h>

typedef struct {
    char flag;     /* 1 字节，其后填充 3 字节 */
    int score;     /* 4 字节 */
    char level;    /* 1 字节，其后填充 3 字节 */
} Student;

int main(void) {
    /* sizeof(Student) = 12，而非 1+4+1 = 6 */
    printf("size = %zu, flag 偏移 %zu, score 偏移 %zu, level 偏移 %zu\n",
           sizeof(Student), offsetof(Student, flag),
           offsetof(Student, score), offsetof(Student, level));
    return 0;
}
```

调整字段声明顺序（大字段在前）或按用途拆分结构体，可以显著压低填充损耗——网络协议包与高频缓存对象尤其在乎这几个字节。

### C++ 对象模型与虚函数机制

#### 虚函数表与虚指针的寻址过程

含虚函数的类在编译期会生成一张虚函数表（vtable），表里按声明顺序存放各虚函数的入口地址；每个对象内部被编译器塞入一个虚指针（vptr），指向所属类的虚表。通过基类指针调用虚函数时，运行时要走三步：由对象取 vptr，由 vptr 查虚表对应槽位，再跳转执行。

#### 多态调用的性能开销

这三步间接寻址就是多态的成本：相比直接调用，多了一次指针跳转，且跳转目标在运行期才确定，编译器难以内联优化。因此高频热点循环（如每帧上万次的物理计算）慎用虚函数多态，可用模板静态多态或数据驱动的分发表替代；普通业务逻辑则完全不需要为此焦虑。

#### 构造与析构的资源纪律

C++ 对象的核心纪律是 RAII：资源（内存、文件、锁）在构造时获取，在析构时释放。只要对象生命周期结束，资源必然归还，异常路径也不例外。这是后面学智能指针、学 Java try-with-resources 之前必须建立的思想原型。

### 正反例设计范式

#### 反例：野指针与未初始化指针

```c
#include <stdlib.h>

void broken(void) {
    int *p;               /* 未初始化：p 指向随机地址 */
    *p = 42;              /* 未定义行为：随时段错误 */

    int *q = (int *)malloc(sizeof(int));
    free(q);
    q = NULL;             /* 若漏掉这一行，下面的二次释放与悬空读写都会发生 */
    /* free(q);  二次释放：堆元数据损坏 */
    /* *q = 1;   悬空指针读写：未定义行为 */
}
```

隐患拆解：未初始化指针的解引用是未定义行为，可能当场段错误，也可能静默破坏别处数据，后者更危险；`free` 后不置空的指针叫悬空指针，二次释放会破坏分配器簿记，读写则是经典悬空访问。这类问题往往在出错点之外的地方爆炸，排查成本极高。

#### 正例：现代 C++ 智能指针范式

```cpp
#include <memory>
#include <vector>

struct Sensor {
    int id = 0;
    double value = 0.0;
};

std::unique_ptr<Sensor> make_sensor(int id) {
    // make_unique 保证分配与构造的异常安全，无需手写 new
    auto sensor = std::make_unique<Sensor>();
    sensor->id = id;
    return sensor; // 所有权转移，出作用域自动释放
}

int main() {
    auto s = make_sensor(7);
    if (!s) {
        return 1; // 空值检查永远在前
    }
    // 多个观察者共享同一对象时用 shared_ptr，引用计数归零自动销毁
    std::shared_ptr<Sensor> shared = std::move(std::make_unique<Sensor>());
    std::vector<std::unique_ptr<Sensor>> pool;
    pool.reserve(8); // 预分配，避免反复扩容搬移
    return 0;
}
```

范式要点：独占所有权用 `unique_ptr`，共享所有权用 `shared_ptr`，裸 `new/delete` 在现代 C++ 中几乎不应出现。所有权语义写在类型里，编译器替你守住资源纪律。

### 高频故障与实操避坑

| 症状 | 根因 | 排查命令与修复 |
|---|---|---|
| `Segmentation fault` | 解引用野指针或越界写 | `gdb ./app` 后 `run`，崩溃时 `bt` 看调用栈 |
| 内存随时间只涨不降 | 堆内存泄漏 | `valgrind --leak-check=full ./app` 定位未释放点 |
| `double free detected` | 同一块内存释放两次 | 释放后立即置 `NULL`，或改用智能指针 |
| 结构体序列化错乱 | 直接 `fwrite` 带填充的结构体 | 逐字段序列化，禁止整块写盘或整块发网 |
| 大数组放局部变量崩溃 | 栈空间有限（常为 8MB） | 大数据结构一律走堆分配 |

编译期就应打开防御开关，把尽可能多的错误提前到构建时暴露：

```bash
# -Wall -Wextra 打开常规告警，-Werror 把告警当错误，-fsanitize 运行期检测越界与泄漏
gcc -Wall -Wextra -Werror -g -fsanitize=address,undefined main.c -o main

# 运行一次完整用例集，AddressSanitizer 会在首个越界点给出精确行号
./main

# 无 sanitizer 的环境下用 valgrind 复查泄漏，退出码非 0 视为不通过
valgrind --leak-check=full --error-exitcode=1 ./main
```

### 阶段实战大作业与验收清单

使用 C 实现通用顺序表与双向链表，再用 C++ 用智能指针重写链表版本，两套实现都必须通过师傅的边界用例集。

<details>
<summary>顺序表参考骨架：动态扩容与内存自清理</summary>

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int *data;
    size_t size;      /* 当前元素数 */
    size_t capacity;  /* 当前容量 */
} SeqList;

/* 初始化：容量为 0 视为非法 */
int seq_init(SeqList *list, size_t capacity) {
    if (list == NULL || capacity == 0) {
        return -1;
    }
    list->data = (int *)malloc(capacity * sizeof(int));
    if (list->data == NULL) {
        return -1;
    }
    list->size = 0;
    list->capacity = capacity;
    return 0;
}

/* 追加：容量不足时按 2 倍扩容，扩容失败不破坏原表 */
int seq_push(SeqList *list, int value) {
    if (list == NULL || list->data == NULL) {
        return -1;
    }
    if (list->size == list->capacity) {
        size_t next = list->capacity * 2;
        int *grown = (int *)realloc(list->data, next * sizeof(int));
        if (grown == NULL) {
            return -1; /* 原指针保持有效，调用方可安全重试或释放 */
        }
        list->data = grown;
        list->capacity = next;
    }
    list->data[list->size] = value;
    list->size += 1;
    return 0;
}

/* 销毁：释放后置空，防止悬空访问 */
void seq_destroy(SeqList *list) {
    if (list == NULL) {
        return;
    }
    free(list->data);
    list->data = NULL;
    list->size = 0;
    list->capacity = 0;
}
```

</details>

验收清单（全部满足才可进入阶段二）：

| 项目 | 验收标准 |
|---|---|
| 功能完整性 | 顺序表与链表支持增删查改与遍历，链表支持头尾双向插入 |
| 内存安全 | `valgrind` 全绿，零泄漏零越界；释放后指针置空 |
| 边界防护 | 空表删除、下标越界、扩容失败均有明确返回码，不崩溃 |
| 原理口述 | 能讲清指针运算偏移、栈堆差异、内存对齐与虚表寻址 |
| 工程习惯 | 提交记录符合 Conventional Commits，每个提交单一职责 |
