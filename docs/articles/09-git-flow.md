---
category: engineering
slug: git-flow
title: Git 版本控制与 Markdown 文档语法
summary: Markdown 常用排版语法与 Git 版本控制核心操作教程：从标题列表到分支合并与远程推送。
minutes: 15
---

### 推荐学习视频教程

本篇推荐配合以下两套高分视频教程进行系统性学习与实操练习：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| Markdown 语法 | [Markdown 文档基础语法教程](https://www.bilibili.com/video/BV1eJ4m157kC) | `BV1eJ4m157kC` | 标题、列表、代码块、表格与超链接排版 |
| Git 版本控制 | [Git 版本控制快速上手教程](https://www.bilibili.com/video/BV1ce4y1W7YB) | `BV1ce4y1W7YB` | 工作区暂存区、分支创建切换、合并冲突与远程同步 |

<video-preview provider="bilibili" id="BV1eJ4m157kC" title="Markdown 文档基础语法教程" bvid="BV1eJ4m157kC"></video-preview>

<video-preview provider="bilibili" id="BV1ce4y1W7YB" title="Git 版本控制快速上手教程" bvid="BV1ce4y1W7YB"></video-preview>

### Markdown 核心语法教程

Markdown 是一种轻量级标记语言，允许使用易读易写的纯文本格式编写文档，随后转换成结构化 HTML。

#### 1. 标题语法

在行首插入 1 到 6 个 `#` 字符，对应一级标题到六级标题（`#` 和标题文本之间需保留一个空格）：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

#### 2. 文本修饰语法

| 语法格式 | 效果说明 | 渲染效果 |
|---|---|---|
| `**粗体文本**` | 字体加粗 | **粗体文本** |
| `*斜体文本*` | 字体倾斜 | *斜体文本* |
| `***粗斜体文本***` | 粗体并倾斜 | ***粗斜体文本*** |
| `~~删除线文本~~` | 添加删除线 | ~~删除线文本~~ |
| `` `行内代码` `` | 等宽行内代码 | `行内代码` |

#### 3. 列表语法

```markdown
<!-- 无序列表：使用 - 或 * 或 + 开头 -->
- 计算机组成原理
- 操作系统
- 计算机网络

<!-- 有序列表：使用数字加点号开头 -->
1. 需求分析
2. 系统设计
3. 编码实现

<!-- 待办任务列表 -->
- [x] 已完成环境配置
- [ ] 待完成大作业开发
```

#### 4. 引用与代码块

```markdown
> 这是一个一级引用块
>> 这是嵌套的二级引用块

```java
// 这是一个 Java 多行代码块
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Markdown!");
    }
}
```
```

#### 5. 超链接与图片

```markdown
<!-- 超链接格式：[显示文字](目标链接地址) -->
[访问云飞扬社团主页](https://yfy-club.github.io)

<!-- 图片格式：![图片描述](图片地址) -->
![社团徽标](https://yfy-club.github.io/logo.png)
```

#### 6. 表格语法

使用竖线 `|` 分隔列，使用横线 `-` 分隔表头与内容行；通过冒号 `:` 控制对齐方式：

```markdown
| 左对齐表头 | 居中对齐表头 | 右对齐表头 |
|:---|:---:|---:|
| 单元格内容 | 单元格内容 | 单元格内容 |
| 左侧文字 | 居中显示 | 99.00 |
```

---

### Git 版本控制核心教程

Git 是目前世界上最先进的分布式版本控制系统，用于敏捷高效地处理任何大小的项目版本管理。

#### Git 核心区域概念

Git 本地管理包含三个核心区域：
1. **工作区**：在电脑里能看到的实际项目文件目录。
2. **暂存区**：临时保存即将提交的修改内容的区域（索引文件）。
3. **本地版本库**：通过提交操作生成的版本历史记录快照集合（`.git` 目录）。

#### 1. 首次使用身份配置

安装 Git 后，首先需要配置提交者的用户名与邮箱地址：

```bash
# 配置全局用户名
git config --global user.name "YourName"

# 配置全局邮箱
git config --global user.email "your_email@example.com"

# 查看配置列表确认
git config --list
```

#### 2. 初始化与克隆仓库

```bash
# 方式 A：在当前目录初始化一个全新 Git 仓库
git init

# 方式 B：从远程代码托管平台克隆已有仓库到本地
git clone https://github.com/yfy-club/yfy-club.github.io.git
```

#### 3. 基础开发工作流（添加与提交）

```bash
# 1. 查看当前工作区与暂存区的状态
git status

# 2. 将指定文件添加到暂存区
git add src/main.js

# 2.1 或将当前目录所有改动文件批量添加到暂存区
git add .

# 3. 将暂存区内容提交到本地版本库并附带清晰的提交信息
git commit -m "feat: 完成用户登录表单界面开发"
```

#### 4. 查看提交历史与版本差异

```bash
# 查看简洁的单行提交历史日志
git log --oneline

# 查看最近 3 次提交的详细变更
git log -n 3

# 查看工作区与暂存区之间的文件差异
git diff
```

#### 5. 分支操作与多人协同

分支允许开发者在主线上分叉出独立的开发空间，互不影响。

```bash
# 查看本地所有分支（当前分支前会有 * 标记）
git branch

# 创建并切换到新特性分支（推荐做法）
git checkout -b feat/login-form

# （现代 Git 命令等价语法）
git switch -c feat/login-form

# 开发完成后，先切换回主干分支
git checkout main

# 将特性分支的修改合并到当前主干分支
git merge feat/login-form

# 删除已完成合并的特性分支
git branch -d feat/login-form
```

#### 6. 远程仓库同步与推送

```bash
# 关联远程仓库地址并命名为 origin
git remote add origin https://github.com/yfy-club/demo-repo.git

# 首次推送并将本地 main 分支与远程 main 分支关联
git push -u origin main

# 日常拉取远程最新代码并与本地分支合并
git pull

# 推送本地提交到远程分支
git push origin feat/login-form
```

#### 7. 忽略文件配置（.gitignore）

在项目根目录下创建 `.gitignore` 文件，指定哪些文件或目录无需被 Git 纳入版本跟踪：

```
# 忽略所有编译输出目录
target/
dist/
build/

# 忽略依赖包缓存
node_modules/

# 忽略本地环境变量与敏感密钥文件
.env
*.local

# 忽略 IDE 配置文件
.idea/
.vscode/
*.swp
```

### Git 常用操作命令速查表

| 命令 | 功能说明 | 适用场景 |
|---|---|---|
| `git status` | 查看工作区与暂存区文件状态 | 随时确认改动进度 |
| `git add .` | 将所有修改提交到暂存区 | 准备提交快照 |
| `git commit -m "msg"` | 提交暂存区到本地版本库 | 记录一次原子变更 |
| `git log --oneline` | 查看精简提交历史 | 查找历史版本提交 ID |
| `git checkout -b <name>` | 新建并切换到新分支 | 开启新特性开发 |
| `git pull` | 拉取远程最新提交并合并 | 同步团队成员代码 |
| `git push` | 推送本地提交到远程仓库 | 分享与备份代码 |

### 阶段实战大作业

1. 使用 Markdown 格式编写一份个人学习周报或项目说明文档（`README.md`），包含标题、有序与无序列表、格式化代码块与表格；
2. 在本地初始化 Git 仓库，配置 `.gitignore`；
3. 新建 `feat/doc-init` 特性分支，提交 Markdown 文件，切换回 `main` 分支完成合并；
4. 将本地仓库推送到 GitHub 或 Gitee 远程平台。
