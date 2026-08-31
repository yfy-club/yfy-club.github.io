/**
 * 问答面板的预设问题。规格 3.6（M9 新增）。
 *
 * 两类，视觉上必须分开——它们决定了访客对这个助手能力边界的第一印象：
 *
 *   concept  技术概念。模型用自己的知识答，与档案库无关。
 *   archive  档案库里怎么规定的。只回答「这条在第几篇的哪一节」，
 *            不复述条款原文——代理端只把篇名与节标题喂给模型，它没有正文。
 */

export type QaPromptKind = 'concept' | 'archive'

export interface QaPrompt {
  kind: QaPromptKind
  text: string
}

/** 全局默认空态四条。 */
export const QA_PROMPTS: readonly QaPrompt[] = [
  { kind: 'concept', text: '介绍一下 Java 面向对象核心概念' },
  { kind: 'concept', text: '什么是 REST 接口与三层架构' },
  { kind: 'archive', text: '社团培养阶梯与成长蓝图是什么' },
  { kind: 'archive', text: '第一周新人生存指南讲了什么' },
]

/** 各篇目专属快捷提问库 */
const SLUG_PROMPTS: Record<string, readonly QaPrompt[]> = {
  'training-roadmap': [
    { kind: 'archive', text: '大一到大四的进阶时间节点怎么规划' },
    { kind: 'archive', text: '一对一师徒制考核流程是怎样的' },
    { kind: 'concept', text: '大一零基础应该先学 C 语言还是 Java' },
    { kind: 'concept', text: '如何平衡专业课成绩与工作室项目开发' },
  ],
  'roadmap-foundation': [
    { kind: 'concept', text: 'C 语言里的指针和内存地址怎么理解' },
    { kind: 'concept', text: '结构体和指针结合使用有哪些典型示例' },
    { kind: 'archive', text: '阶段一 C/C++ 语法启蒙大作业要求是什么' },
    { kind: 'concept', text: '动态内存分配 malloc 和 free 如何避免内存泄漏' },
  ],
  'roadmap-web-basics': [
    { kind: 'concept', text: 'Flexbox 弹性盒布局的核心属性有哪些' },
    { kind: 'concept', text: 'Fetch 异步请求与 Promise 机制如何运作' },
    { kind: 'archive', text: '阶段二 Web 前端大作业要求是什么' },
    { kind: 'concept', text: '标准盒模型与怪异盒模型有什么区别' },
  ],
  'roadmap-backend-java': [
    { kind: 'concept', text: 'Java 中 ArrayList 和 LinkedList 的区别与选型' },
    { kind: 'concept', text: 'HashMap 的底层结构与哈希冲突解决机制' },
    { kind: 'archive', text: '阶段三 JavaSE 大作业要求是什么' },
    { kind: 'concept', text: '抽象类和接口的核心区别与适用场景' },
  ],
  'roadmap-system-database': [
    { kind: 'concept', text: 'Linux 下 755 和 644 文件权限分别代表什么' },
    { kind: 'concept', text: 'MySQL 中 INNER JOIN 和 LEFT JOIN 的区别' },
    { kind: 'archive', text: '阶段四 Linux 与 MySQL 大作业要求是什么' },
    { kind: 'concept', text: 'GROUP BY 聚合查询与 HAVING 的过滤逻辑' },
  ],
  'roadmap-enterprise-web': [
    { kind: 'concept', text: 'Spring Boot 控制层、服务层与持久层三层架构职责' },
    { kind: 'concept', text: '为什么推荐使用统一 API 响应体封装数据' },
    { kind: 'archive', text: '阶段五 Spring Boot 大作业要求是什么' },
    { kind: 'concept', text: '常见 HTTP 状态码 200、400、401、403、500 含义' },
  ],
  'markdown-basics': [
    { kind: 'concept', text: 'Markdown 中如何编写规范的代码块与语言高亮' },
    { kind: 'concept', text: 'Markdown 怎么排版对齐表格与待办清单' },
    { kind: 'archive', text: 'Markdown 排版语法教程的实战大作业要求' },
    { kind: 'concept', text: '引用块和多级无序列表怎么组合嵌套' },
  ],
  'git-flow': [
    { kind: 'concept', text: 'Git 工作区、暂存区和本地仓库三区模型' },
    { kind: 'concept', text: '分支冲突产生的原因与标准解决步骤' },
    { kind: 'archive', text: '代码提交信息规范与分支命名要求是什么' },
    { kind: 'concept', text: '怎么彻底撤销某次错误提交并保留修改' },
  ],
  'maven-basics': [
    { kind: 'concept', text: 'Maven 坐标 GAV 体系与 scope 依赖范围' },
    { kind: 'concept', text: 'compile、test、package 生命周期执行顺序' },
    { kind: 'archive', text: 'Maven 项目与依赖管理教程实战大作业' },
    { kind: 'concept', text: '如何配置国内阿里云 Maven 镜像加速源' },
  ],
  'mysql-basics': [
    { kind: 'concept', text: 'MySQL 主键、唯一键和外键约束的区别' },
    { kind: 'concept', text: 'LIMIT 分页查询在大数据量下的常见优化' },
    { kind: 'archive', text: 'MySQL 数据库技术实战大作业要求' },
    { kind: 'concept', text: '如何根据查询条件合理设计数据库索引' },
  ],
  'mybatis-basics': [
    { kind: 'concept', text: 'MyBatis 中 #{} 和 ${} 参数占位的核心区别' },
    { kind: 'concept', text: 'XML 动态 SQL 中 if、where 和 foreach 标签用法' },
    { kind: 'archive', text: 'MyBatis 数据持久层实战大作业要求' },
    { kind: 'concept', text: '插入数据时如何自动回填数据库自增主键 ID' },
  ],
  'mybatis-plus-basics': [
    { kind: 'concept', text: 'BaseMapper 提供了哪些开箱即用的 CRUD 方法' },
    { kind: 'concept', text: 'LambdaQueryWrapper 条件构造器相比传统写法的好处' },
    { kind: 'archive', text: 'MyBatis-Plus 极速增强教程大作业要求' },
    { kind: 'concept', text: '如何配置物理分页插件与逻辑删除注解' },
  ],
  'lombok-basics': [
    { kind: 'concept', text: 'Lombok @Data 注解包含哪些常用方法' },
    { kind: 'concept', text: '建造者模式 @Builder 注解的优势与应用' },
    { kind: 'archive', text: 'Lombok 教程中提到的循环引用避坑指南' },
    { kind: 'concept', text: '使用 @Slf4j 进行结构化日志输出的规范' },
  ],
  'redis-basics': [
    { kind: 'concept', text: 'Redis 缓存穿透、缓存击穿与缓存雪崩的区别及应对' },
    { kind: 'concept', text: 'Redis 五大核心数据类型的典型应用场景' },
    { kind: 'archive', text: 'Redis 内存缓存教程实战大作业要求' },
    { kind: 'concept', text: '在 Spring Boot 中如何使用 StringRedisTemplate' },
  ],
  'nginx-basics': [
    { kind: 'concept', text: '单页应用刷新 404 为什么用 try_files 修复' },
    { kind: 'concept', text: 'Nginx 反向代理 proxy_pass 与跨域响应头配置' },
    { kind: 'archive', text: 'Nginx 反向代理与负载均衡实战大作业' },
    { kind: 'concept', text: 'upstream 负载均衡轮询与权重权重算法' },
  ],
  'docker-basics': [
    { kind: 'concept', text: 'Docker 镜像与容器的核心区别与联系' },
    { kind: 'concept', text: 'Dockerfile 常用指令与 Spring Boot 镜像构建' },
    { kind: 'archive', text: 'Docker 容器化实战大作业要求' },
    { kind: 'concept', text: '如何使用 docker-compose 一键拉起微服务集群' },
  ],
  'sa-token-basics': [
    { kind: 'concept', text: 'Sa-Token 会话登录与 Token 生成核心机制' },
    { kind: 'concept', text: '如何配置全局拦截器与路由白名单' },
    { kind: 'archive', text: 'Sa-Token 权限管理实战大作业要求' },
    { kind: 'concept', text: '在 Controller 中如何使用角色与权限注解校验' },
  ],
  'apifox-basics': [
    { kind: 'concept', text: 'Apifox 环境变量与登录 Token 自动提取脚本' },
    { kind: 'concept', text: '智能 Mock 数据规则如何助力前后端并行开发' },
    { kind: 'archive', text: 'Apifox 接口设计与协同实战大作业' },
    { kind: 'concept', text: '如何编排自动化测试用例集并生成报告' },
  ],
  'shell-basics': [
    { kind: 'concept', text: 'Shell 脚本中 $0、$1、$#、$? 等特殊变量含义' },
    { kind: 'concept', text: '编写 Spring Boot 生产级管理脚本 app.sh 的核心要点' },
    { kind: 'archive', text: 'Linux Shell 自动化运维脚本大作业' },
    { kind: 'concept', text: 'nohup 后台启动与日志重定向语法' },
  ],
  'rabbitmq-basics': [
    { kind: 'concept', text: '消息队列三大核心场景：异步解耦、流量削峰与延时队列' },
    { kind: 'concept', text: 'Direct、Fanout 与 Topic 交换机的区别与路由规则' },
    { kind: 'archive', text: 'RabbitMQ 消息队列实战大作业要求' },
    { kind: 'concept', text: 'Spring Boot 中如何使用 RabbitTemplate 发送消息' },
  ],
  'frontend-spec': [
    { kind: 'archive', text: '前端工程规范中目录结构是怎样划分的' },
    { kind: 'archive', text: '代码格式化与 ESLint 规范包含哪些硬性要求' },
    { kind: 'concept', text: '前端组件拆分与状态管理通用设计原则' },
    { kind: 'concept', text: '无障碍色彩对比度 AA 级别有什么标准' },
  ],
  'backend-spec': [
    { kind: 'archive', text: '后端工程规范中分层架构是怎样规定的' },
    { kind: 'archive', text: '数据库索引与慢 SQL 调优规范包含哪些要求' },
    { kind: 'concept', text: '事务隔离级别与常见并发安全防护' },
    { kind: 'concept', text: '全局统一异常处理与业务错误码设计' },
  ],
  'troubleshooting': [
    { kind: 'archive', text: '端口冲突与服务无法启动时怎么排查' },
    { kind: 'archive', text: '跨域 CORS 报错的典型成因与解决方案' },
    { kind: 'concept', text: '数据库连接池耗尽排查思路' },
    { kind: 'concept', text: 'Java 内存溢出 OOM 与线程阻塞分析方法' },
  ],
}

/** 根据当前页面 slug 动态获取专属预设问题。 */
export function getPromptsForSlug(slug?: string | null): readonly QaPrompt[] {
  if (!slug) return QA_PROMPTS
  const prompts = SLUG_PROMPTS[slug]
  if (prompts && prompts.length > 0) return prompts
  return [
    { kind: 'concept', text: '总结一下这篇文档的核心知识点与应用场景' },
    { kind: 'concept', text: '初学这部分内容有哪些常见的踩坑点？' },
    { kind: 'archive', text: '这篇实战大作业的要求和目标是什么' },
    { kind: 'archive', text: '在社团实际项目中如何应用本篇技术规范？' },
  ]
}

/** 两类各一句说明，标在空态标题下面。 */
export const QA_KIND_NOTE: Record<QaPromptKind, string> = {
  concept: '技术概念我直接讲',
  archive: '档案库的规矩我只能指路',
}
