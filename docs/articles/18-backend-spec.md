---
category: engineering
slug: backend-spec
title: 后端工程规范
summary: 后端约定：单向分层边界、对象解耦、异常分层拦截与结构化审计日志。
minutes: 10
---

### 核心背景与技术定位

后端代码的腐烂都是从边界失守开始的：实体对象一路穿透到接口响应，异常堆栈直接甩给前端，日志里躺着明文密码。本篇给出社团后端项目的三条硬约定——分层边界、异常分层、安全审计，它们是评审的一票否决项。

#### 与阶段五路线的关系

《阶段五》篇讲三件套的原理与为什么要分层，本篇是分层的执法细则：哪些对象允许出现在哪一层、异常在哪一层被接住、日志允许写什么不允许写什么。

### 分层边界与对象解耦

#### 单向依赖调用链

依赖方向只许一条线：Controller → Service → Mapper，逐层向下、单向依赖。禁止反向调用、禁止同层互调产生环、禁止跨层抄近路。工具类与通用组件放在独立的公共模块，被各层引用而不引用任何业务层。

#### 三类数据对象的流转纪律

| 对象 | 允许出现的层 | 禁止事项 |
|---|---|---|
| DTO | Controller 入参、Service 入参 | 不许映射进数据库表 |
| Entity | Service 内部、Mapper | 不许出现在接口签名与响应里 |
| VO | Service 出口、Controller 响应 | 不许包含密码、内部主键策略等敏感字段 |

对象转换集中在 Service 层的转换器里完成，禁止在 Controller 里手拼、禁止用 BeanUtils 无脑拷贝带过校验——拷贝工具绕过了类型检查，字段错位要到运行时才炸。

#### 反例与正例：实体穿透

```java
// 反例：实体直接当响应返回——密码哈希、逻辑删除标记全暴露给前端
@GetMapping("/users/{id}")
public User getById_bad(@PathVariable Long id) {
    return userMapper.selectById(id); // 实体穿透，且未处理查无此人
}
```

```java
// 正例：VO 出参，字段白名单，空结果走业务异常
@GetMapping("/users/{id}")
public Result<UserVO> getById_good(@PathVariable Long id) {
    if (id == null || id <= 0) {
        throw new BizException(ErrorCode.PARAM_INVALID);
    }
    User entity = userService.findById(id); // 查无此人内部抛 NOT_FOUND
    return Result.ok(UserConvert.toVO(entity));
}
```

### 异常分层与统一拦截

#### 业务异常枚举化

业务错误一律抛 `BizException` 并携带错误码枚举，禁止用字符串消息自由发挥——前端按错误码做分支，字符串消息只做给人看的补充。参数校验失败、资源不存在、权限不足、业务规则冲突各自独立成码，不允许共用一个「操作失败」兜底码。

#### 全局统一异常拦截器

所有异常的最终出口只有一个：全局拦截器。它把三类异常翻译成三种响应，日志详细度各不相同：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 业务异常：信息可原样返回给调用方
    @ExceptionHandler(BizException.class)
    public Result<Void> onBiz(BizException e) {
        log.info("业务异常: {}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    // 参数校验异常：回传具体字段问题
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> onParam(MethodArgumentNotValidException e) {
        String detail = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .findFirst().orElse("参数不合法");
        return Result.fail(ErrorCode.PARAM_INVALID, detail);
    }

    // 未知异常：对外只给通用文案，堆栈只进日志
    @ExceptionHandler(Exception.class)
    public Result<Void> onUnknown(HttpServletRequest req, Exception e) {
        log.error("未处理异常 {} {}", req.getMethod(), req.getRequestURI(), e);
        // 生产环境绝不把 SQL 与堆栈细节返回，防注入探测与信息泄露
        return Result.fail(ErrorCode.INTERNAL, "服务暂不可用，请稍后重试");
    }
}
```

#### 禁止的异常姿势

`catch` 后空处理与 `e.printStackTrace()` 是一票否决项：前者把错误吞进黑暗，后者把堆栈打进标准输出无法归集。捕获后只有两种合法动作——转换为业务异常上抛，或记录结构化日志并给出兜底返回。

### 安全审计与日志规范

#### 追加模式结构化审计日志

涉及账号、权限、资金的操作必须写审计日志：追加写入、只增不改，记录谁（操作者标识）、何时（时间戳）、对谁（目标对象）、做了什么（操作类型与结果）。审计日志与业务日志分库或分文件存放，保留期按项目合规要求设定。

#### 敏感字段脱敏

日志输出前经过统一的脱敏层：手机号保留前三后四、身份证保留首三位与末四位、令牌与密码永不落盘。脱敏在日志框架的编码器层统一做，而不是依赖每个开发者手写——漏一个点就是泄露一个点。

```java
// 统一脱敏工具示例：任何写日志前的敏感字段都过这里
public final class Sensitive {
    public static String phone(String raw) {
        if (raw == null || raw.length() < 11) {
            return "***"; // 非法输入直接全遮，不做局部暴露
        }
        return raw.substring(0, 3) + "****" + raw.substring(7);
    }

    public static String token(String raw) {
        // 令牌无论多短都全遮，只留存在性信息
        return raw == null || raw.isEmpty() ? "(空)" : "***";
    }
}
```

### 高频故障与实操避坑

| 症状 | 根因 | 修复方案 |
|---|---|---|
| 前端拿到密码哈希 | 实体直接出参 | 强制 VO 出参，评审检查接口签名 |
| 报错信息里带出表结构 | 未知异常未拦截 | 接入全局拦截器，生产关闭堆栈外泄 |
| 同层互调成环 | 模块划分按技术而不是业务 | 按业务域重切模块，公共逻辑下沉公共层 |
| 审计查不到操作人 | 日志未记操作者标识 | 拦截器统一注入操作者上下文 |
| BeanUtils 拷贝字段错位 | 无脑拷贝绕过类型检查 | 手写转换器或 MapStruct 编译期生成 |

### 实操验收清单

| 项目 | 验收标准 |
|---|---|
| 分层检查 | 依赖分析工具确认单向依赖，无跨层调用 |
| 对象纪律 | 接口签名与响应中检索不到 Entity 类型 |
| 异常出口 | 全部异常经全局拦截器，无 `printStackTrace` 与空 `catch` |
| 日志安全 | 抽查一周日志无明文密码、令牌与完整手机号 |
| 审计完整 | 账号权限类操作可按操作者检索到完整审计记录 |
