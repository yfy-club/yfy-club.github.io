---
category: roadmap
slug: roadmap-enterprise-web
title: 阶段五：Maven 构建、MyBatis 与企业级三层架构
summary: 企业级筑基：Maven 依赖治理、三层分层纪律、MyBatis 持久层与声明式事务。
minutes: 12
---

### 核心背景与技术定位

阶段五是从「写程序」跨到「做工程」的分水岭。单体脚本能跑不叫工程：依赖要可仲裁、模块要可分工、事务要可追责、接口要可契约。本阶段以 Maven、Spring Boot、MyBatis 三件套为载体，建立企业级后端的骨架认知。

#### 三件套各管一层

Maven 管「构建与依赖」：谁的包、什么版本、冲突听谁的。Spring Boot 管「组装与运行时」：对象生命周期、事务代理、Web 容器。MyBatis 管「数据进出」：SQL 与对象之间的映射。三者边界清晰，学的时候也按这个边界分开学，不要搅成一锅。

### Maven 依赖仲裁与构建模型

#### 依赖冲突的最短路径原则

Maven 解析依赖树时，同一个构件出现多个版本，按两条规则仲裁：**路径最短优先**——离根节点传递层数少的版本胜出；层数相同时**先声明者胜**。仲裁结果不可靠猜，必须显式查验：

```bash
# 打印完整依赖树，定位冲突构件的两条来源路径
mvn dependency:tree -Dverbose

# 只过滤关心的构件，确认最终仲裁到的版本
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind
```

#### 依赖排除与版本锁定

确认冲突后，在引入方的 `<dependency>` 里用 `<exclusions>` 排除旧版本路径；多模块项目中，统一在父 POM 的 `<dependencyManagement>` 锁版本——子模块只写 `groupId` 与 `artifactId`，版本全局唯一来源，杜绝各模块版本漂移。

### 三层架构的单向分层纪律

#### Controller-Service-Mapper 的职责分界

| 层 | 职责 | 禁止事项 |
|---|---|---|
| Controller | 参数校验、协议转换、调用 Service | 不写业务逻辑，不碰 Mapper |
| Service | 业务编排、事务边界、对象转换 | 不处理 HTTP 细节，不拼 SQL |
| Mapper | 单表或简单关联的 SQL 访问 | 不含任何业务判断 |

依赖方向必须单向：Controller → Service → Mapper。反向依赖或跨层调用（Controller 直连 Mapper）会让事务边界、日志切面与参数校验全部绕过，是评审一票否决项。

#### 反例与正例：跨层调用 vs 对象流转

```java
// 反例：控制器直连 Mapper，事务、校验、日志全被绕过
@RestController
public class BadUserController {
    @Autowired
    private UserMapper userMapper;

    @PostMapping("/users")
    public Object save(@RequestBody Map<String, Object> raw) {
        User u = new User();
        u.setName((String) raw.get("name")); // 裸 Map 取值，无校验无类型
        userMapper.insert(u);                // 无事务边界，出错无兜底
        return u;                            // 实体直出，密码字段也漏给前端
    }
}
```

```java
// 正例：DTO 进、校验、Service 事务、VO 出，对象各司其职
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { // 构造器注入，依赖显式可见
        this.userService = userService;
    }

    @PostMapping("/users")
    public Result<UserVO> save(@Valid @RequestBody UserDTO dto) {
        return Result.ok(userService.register(dto)); // 返回 VO，绝不外泄实体
    }
}

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class) // 事务只落在 Service 层
    public UserVO register(UserDTO dto) {
        if (userMapper.existsByName(dto.name())) {
            throw new BizException(ErrorCode.NAME_TAKEN); // 业务异常枚举
        }
        User entity = UserConvert.toEntity(dto);
        userMapper.insert(entity);
        return UserConvert.toVO(entity);
    }
}
```

三类对象的铁律：**DTO 只装请求参数、Entity 只映射表结构、VO 只装响应字段**。密码、内部状态等字段永远不出现在 VO 里。

### MyBatis 持久层实战

#### 动态 SQL 三件套

`<if>` 做条件拼接，`<where>` 自动处理首个条件的 `AND` 前缀，`<foreach>` 展开集合。参数一律走 `#{}` 预编译占位符，`${}` 是字符串直接拼接，只允许用于无法参数化的表名排序字段且必须白名单校验。

<details>
<summary>动态条件查询映射文件示例</summary>

```json
{
  "说明": "此处以 MyBatis XML 片段的等价逻辑描述，实际工程放在 mapper.xml",
  "select": "SELECT id, name, grade FROM student",
  "where": [
    { "if": "name 非空", "条件": "AND name LIKE CONCAT('%', #{name}, '%')" },
    { "if": "grade 非空", "条件": "AND grade = #{grade}" },
    { "if": "ids 非空", "条件": "AND id IN (foreach 展开 #{ids})" }
  ],
  "安全约束": "全部使用 #{} 预编译占位符，禁止 ${} 拼接用户输入"
}
```

```sql
-- 对应的最终生成语句形态（条件齐备时）
SELECT id, name, grade FROM student
WHERE name LIKE CONCAT('%', ?, '%')
  AND grade = ?
  AND id IN (?, ?, ?)
```

</details>

#### 缓存失效机理

MyBatis 一级缓存绑定在 SqlSession 上：同一会话内相同查询直接命中，但任何增删改或手动 `clearCache` 都会清空；Spring 集成下每个请求通常自持一个会话，一级缓存的收益有限，却曾引发「查到自己刚改前的旧值」的事故。二级缓存绑定在 Mapper 命名空间，跨会话共享，但多表关联更新无法联动失效，生产环境默认关闭，缓存职责交给 Redis 这类外部设施。

### 声明式事务与失效场景

`@Transactional` 的本质是 AOP 代理：Spring 给 Bean 生成代理对象，在方法前后织入开启、提交、回滚事务的逻辑。理解了「事务由代理控制」，三种经典失效场景就不再需要死记：

| 失效场景 | 根因 | 修复 |
|---|---|---|
| 同类内部自调用 | `this.method()` 绕过代理，事务注解形同虚设 | 拆到另一个 Bean，或注入自身代理 |
| 异常被 `catch` 吞掉 | 代理感知不到异常，按成功提交 | 捕获后显式 `setRollbackOnly()` 或重抛 |
| 抛出受检异常 | 默认只回滚运行时异常 | `rollbackFor = Exception.class` 全量声明 |

另有一条纪律：事务方法必须 `public`，私有方法上的注解同样不会被代理织入。

### 阶段实战大作业与验收清单

搭建基于 Spring Boot 与 MyBatis-Plus 的企业级脚手架，实现双 Token（访问令牌 + 刷新令牌）无感刷新认证接口。

| 项目 | 验收标准 |
|---|---|
| 分层纪律 | 依赖单向，评审工具检查无跨层调用，DTO/Entity/VO 三类对象齐备 |
| 依赖治理 | `mvn dependency:tree` 无冲突告警，版本统一由父 POM 管理 |
| 双 Token 认证 | 访问令牌过期后自动用刷新令牌换新，前端调用方无感知 |
| 事务正确性 | 注册接口注入异常验证回滚，无脏数据残留 |
| 持久层规范 | 全部参数走预编译占位符，二级缓存关闭并有注释说明 |
| 异常体系 | 业务异常走枚举错误码，全局拦截器统一响应格式 |
