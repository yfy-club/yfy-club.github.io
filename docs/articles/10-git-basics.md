---
category: tools
slug: git-flow
title: Git 版本控制与分支协同教程
summary: Git 核心操作教程：工作区暂存区、分支创建合并、远程仓库推送与 .gitignore 忽略规则。
minutes: 15
---

### 推荐学习视频教程

Git 是现代软件研发团队进行版本管理与团队协同的核心基础设施：

| 模块 | 推荐视频教程 | BV 号 | 核心学习重点 |
|---|---|---|---|
| Git 版本控制 | [Git 版本控制快速上手教程](https://www.bilibili.com/video/BV1ce4y1W7YB) | `BV1ce4y1W7YB` | 工作区暂存区、分支创建切换、合并冲突与远程同步 |

<video-preview provider="bilibili" id="BV1ce4y1W7YB" title="Git 版本控制快速上手教程" bvid="BV1ce4y1W7YB"></video-preview>

### Git 核心概念与区域模型

Git 在本地维护三个核心区域：
1. **工作区**：在操作系统文件管理器中直接看到的项目文件目录。
2. **暂存区**：临时保存待提交修改的索引区域。
3. **本地版本库**：保存所有历史提交快照的核心仓库（`.git` 隐藏目录）。

```
工作区 ──(git add)──> 暂存区 ──(git commit)──> 本地版本库 ──(git push)──> 远程仓库
```

### 首次使用身份配置

安装 Git 后，首先需设置提交者的用户名与邮箱地址：

```bash
# 配置全局用户名
git config --global user.name "YourName"

# 配置全局邮箱
git config --global user.email "your_email@example.com"

# 查看确认配置
git config --list
```

### 仓库初始化与克隆

```bash
# 1. 在当前目录初始化一个全新的 Git 仓库
git init

# 2. 从远程托管平台克隆已有仓库到本地
git clone https://github.com/yfy-club/yfy-club.github.io.git
```

### 日常基础工作流（添加与提交）

```bash
# 1. 查看当前工作区和暂存区状态
git status

# 2. 将修改后的文件添加到暂存区
git add src/App.tsx

# 2.1 批量将所有改动文件添加到暂存区
git add .

# 3. 提交暂存区到版本库并附带清晰的提交说明
git commit -m "feat: 完成用户列表分页查询功能"
```

### 查看提交历史与版本差异

```bash
# 查看单行简洁历史日志
git log --oneline

# 查看最近 3 次提交的详细变更
git log -n 3

# 查看工作区相比暂存区的改动差异
git diff
```

### 分支管理与多人协同

分支允许在不影响主干的前提下独立开发新特性或修复缺陷。

```bash
# 1. 查看本地所有分支
git branch

# 2. 创建并切换到新特性分支（推荐做法）
git checkout -b feat/user-login
# （或现代 Git 命令语法）
git switch -c feat/user-login

# 3. 开发完成提交后，切换回主干分支
git checkout main

# 4. 将特性分支的修改合并到主干
git merge feat/user-login

# 5. 删除已完成合并的本地分支
git branch -d feat/user-login
```

### 远程仓库关联与推送

```bash
# 关联远程仓库地址并命名为 origin
git remote add origin https://github.com/yfy-club/demo-repo.git

# 首次推送并将本地 main 与远程 main 关联
git push -u origin main

# 日常推送当前分支提交
git push origin feat/user-login

# 拉取远程最新代码并自动合并
git pull
```

### 忽略文件规则（.gitignore）

在项目根目录下创建 `.gitignore` 文件，声明无需被版本库跟踪的文件与目录：

```
# 编译生成物
target/
dist/
build/

# 依赖缓存
node_modules/

# 敏感密钥与本地环境变量
.env
*.local

# IDE 工具配置
.idea/
.vscode/
```

### 常用 Git 命令速查表

| 命令 | 功能说明 | 适用场景 |
|---|---|---|
| `git status` | 查看文件状态 | 随时确认工作区进度 |
| `git add .` | 添加所有变更到暂存区 | 准备打包提交 |
| `git commit -m "msg"` | 提交快照到本地版本库 | 记录一次原子变更 |
| `git log --oneline` | 查看精简提交历史 | 查找提交版本号 |
| `git checkout -b <name>` | 新建并切换到新分支 | 开启新任务开发 |
| `git pull` | 拉取远程更新并合并 | 开始工作前同步代码 |
| `git push` | 推送本地提交到远端 | 备份与分享代码 |

### 阶段实战大作业

1. 在本地初始化一个 Git 仓库并创建 `.gitignore`；
2. 新建 `feat/init` 特性分支，编写代码并提交；
3. 切换回 `main` 分支完成合并，并推送到 GitHub 远程仓库。
