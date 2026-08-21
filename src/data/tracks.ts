/**
 * 五个技术方向的本站文案。
 *
 * 内容是主站 src/content/tracks.ts 的**重述**，不是权威副本（spec 第 0 节）。
 * 抽取口径固定，改内容前先照这个口径回主站核对，不要凭记忆改：
 *   nameZh          取 characters.ts 的 role，本站不另立叫法
 *   abilities[].zh  deepFocus[].title 去掉括号里的英文
 *   abilities[].code 括号里的英文转大写，当 hud 代号
 *   abilities[].keys deepFocus[].subtitle，只有大卡出这一行
 *   stages[].title  curriculumModules[].title 的 `·` 之后那半截
 *
 * **能力条不填百分比。** 主站 deepFocus[] 里没有任何可以当熟练度的数值，
 * 编一个 85% 违反「事实性数据一律不维护」。见 spec 4.2 的 M4 修正记录二。
 *
 * 文案每加一个新汉字都要过字体预算（spec 7.2），改完必须跑 npm run fonts:subset。
 */
import type { TrackSlug } from './characters'

export interface Ability {
  /** 中文能力名。卡面主行。 */
  zh: string
  /** 英文代号，走 hud 字体。 */
  code: string
  /** 关键词行。只有大卡出。 */
  keys: string
}

export interface Stage {
  /** 年级。展开面板里的分段标记。 */
  year: string
  /** 阶段代号，走 hud 字体。 */
  code: string
  title: string
  /** 该阶段的技术栈，全拉丁，不吃中文字体预算。 */
  tags: readonly string[]
}

export interface Track {
  slug: TrackSlug
  /** 两位序号，走 hud 字体。 */
  index: string
  /** 一句话定位，取主站 tagline。只在展开面板里出。 */
  tagline: string
  abilities: readonly [Ability, Ability, Ability]
  stages: readonly [Stage, Stage, Stage]
}

export const TRACKS: readonly Track[] = [
  {
    slug: 'ai',
    index: '01',
    tagline: '探索大模型智能体与计算机视觉前沿',
    abilities: [
      {
        zh: '计算机视觉与目标检测',
        code: 'COMPUTER VISION',
        keys: 'YOLO / 缺陷识别 / 智能视频流分析',
      },
      {
        zh: '大语言模型与智能体工程',
        code: 'LLM & AGENT',
        keys: 'Function Calling / RAG / 知识库问答',
      },
      {
        zh: '端侧推理与智能机器人',
        code: 'EDGE AI & ROBOTICS',
        keys: '嵌入式 AI / 模型轻量化 / ROS 机器人',
      },
    ],
    stages: [
      {
        year: '大一',
        code: 'STG-01',
        title: '底层启蒙与数据科学基础',
        tags: ['C/C++', 'Python', 'NumPy', 'Git'],
      },
      {
        year: '大二',
        code: 'STG-02',
        title: '深度学习与方向专项攻坚',
        tags: ['PyTorch', 'ResNet', 'YOLO', 'OpenCV'],
      },
      {
        year: '大三',
        code: 'STG-03',
        title: '工程落地与就业 / 考研双通道',
        tags: ['ONNX', 'TensorRT', 'vLLM', 'RAG'],
      },
    ],
  },
  {
    slug: 'software',
    index: '02',
    tagline: '融合现代软件工程与 AI 智能体',
    abilities: [
      {
        zh: '企业级微服务与高并发架构',
        code: 'MICROSERVICES',
        keys: 'Spring Cloud / 分布式事务 / 异步解耦',
      },
      {
        zh: '现代工程化 Web 全栈',
        code: 'MODERN FULL-STACK',
        keys: 'TypeScript / Vue 3 / Next.js / Tailwind CSS',
      },
      {
        zh: '云原生运维与自动化交付',
        code: 'DEVOPS & CLOUD',
        keys: 'Docker / Nginx / 反向代理 / 监控看板',
      },
    ],
    stages: [
      {
        year: '大一',
        code: 'STG-01',
        title: '面向对象与 Web 工程入门',
        tags: ['Java', 'SOLID', 'MySQL', 'JDBC'],
      },
      {
        year: '大二',
        code: 'STG-02',
        title: '企业级全栈与微服务攻坚',
        tags: ['Spring Boot', 'MyBatis-Plus', 'Vue 3', 'Redis'],
      },
      {
        year: '大三',
        code: 'STG-03',
        title: '分布式架构与就业 / 考研双通道',
        tags: ['Spring Cloud', 'Nacos', 'RabbitMQ', 'Sentinel'],
      },
    ],
  },
  {
    slug: 'database',
    index: '03',
    tagline: '深耕分布式存储与国产信创数据库',
    abilities: [
      {
        zh: '存储引擎底层与内核机制',
        code: 'STORAGE ENGINE',
        keys: 'InnoDB / B+ 树 / LSM-Tree / MVCC',
      },
      {
        zh: 'SQL 执行计划与深度性能调优',
        code: 'QUERY OPTIMIZATION',
        keys: 'Explain / 索引覆盖 / 慢查询优化',
      },
      {
        zh: '分布式共识与国产信创生态',
        code: 'DISTRIBUTED SQL',
        keys: 'openGauss / OceanBase / Raft',
      },
    ],
    stages: [
      {
        year: '大一',
        code: 'STG-01',
        title: '关系模型与 SQL 严谨工程表达',
        tags: ['SQL', 'ACID', 'Linux', 'Join'],
      },
      {
        year: '大二',
        code: 'STG-02',
        title: '存储引擎深入与性能调优实战',
        tags: ['InnoDB', 'Explain', 'Redis', 'openGauss'],
      },
      {
        year: '大三',
        code: 'STG-03',
        title: '分布式架构与 DBA 职业通道',
        tags: ['Raft', '2PC', 'ShardingSphere', 'TiDB'],
      },
    ],
  },
  {
    slug: 'cloud-iot',
    index: '04',
    tagline: '打通端、边、云一体化全链路协同',
    abilities: [
      {
        zh: '嵌入式驱动与实时操作系统',
        code: 'MCU & RTOS',
        keys: 'STM32 / ESP32 / FreeRTOS',
      },
      {
        zh: '物联网通信协议与边缘网关',
        code: 'IOT PROTOCOLS',
        keys: 'MQTT / Modbus / EMQX',
      },
      {
        zh: '云端设备孪生与时序遥测',
        code: 'CLOUD TWIN',
        keys: 'ThingsBoard / 时序数据可视化',
      },
    ],
    stages: [
      {
        year: '大一',
        code: 'STG-01',
        title: '硬件基础与 C 语言裸机编程',
        tags: ['C', 'STM32', 'UART', 'GPIO'],
      },
      {
        year: '大二',
        code: 'STG-02',
        title: '嵌入式操作系统与 MQTT 通信',
        tags: ['FreeRTOS', 'ESP32', 'MQTT', 'Modbus-RTU'],
      },
      {
        year: '大三',
        code: 'STG-03',
        title: '端边云协同与综合系统工程',
        tags: ['OTA', 'Embedded Linux', 'TLS', 'Gateway'],
      },
    ],
  },
  {
    slug: 'industrial',
    index: '05',
    tagline: '软硬结合深度赋能工业 4.0 智能制造',
    abilities: [
      {
        zh: 'PLC 智能控制与现场总线',
        code: 'PLC & FIELDBUS',
        keys: '西门子 S7 / 梯形图 / OPC UA',
      },
      {
        zh: '工业机器视觉与智能引导',
        code: 'MACHINE VISION',
        keys: 'OpenCV / 缺陷检测 / 手眼标定',
      },
      {
        // FORGE 只跳 3 列，“与工业 SCADA” 会挤成两行，三张小卡高度就不齐。实测过。
        zh: '产线数字孪生与 SCADA',
        code: 'DIGITAL TWIN',
        keys: 'Three.js / WebGL / Node-RED',
      },
    ],
    stages: [
      {
        year: '大一',
        code: 'STG-01',
        title: '工业自动化启蒙与测控编程',
        tags: ['C/C++', 'CRC', 'RS-485', 'C#'],
      },
      {
        year: '大二',
        code: 'STG-02',
        title: 'PLC 逻辑编程与工业机器视觉',
        tags: ['S7-1200', 'SFC/LAD', 'OpenCV', 'OPC UA'],
      },
      {
        year: '大三',
        code: 'STG-03',
        title: '产线数字孪生与工业互联网攻坚',
        tags: ['Three.js', 'Node-RED', 'PHM', 'WebGL'],
      },
    ],
  },
] as const

/** 大卡多出一行关键词，小卡只出能力名。两张大卡就是这两个 slug。 */
export const FEATURE_TRACKS: readonly TrackSlug[] = ['ai', 'software']

export const isFeature = (slug: TrackSlug) => FEATURE_TRACKS.includes(slug)
