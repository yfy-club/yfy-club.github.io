---
category: tools
slug: rabbitmq-basics
title: RabbitMQ 消息队列实战教程
summary: 消息队列核心场景、交换机模型（Direct/Fanout/Topic）、Spring Boot 整合与延迟队列实战。
minutes: 15
---

### 什么是消息队列与三大核心应用场景

消息队列（Message Queue）本质是一个用于存放消息的容器队列，用于不同服务之间的异步通信。

#### 1. 异步解耦

用户注册后需要发邮件和发短信：传统串行调用耗时 200ms；引入 MQ 后，主流程将消息写入队列（耗时 5ms）即可立即返回成功，邮件与短信服务异步监听消费，互不阻塞。

#### 2. 流量削峰

在秒杀或高并发抢购场景下，瞬间涌入 10 万请求可能直接压垮 MySQL 数据库。通过 MQ 作为蓄水池接收请求，后端消费者按自身处理能力（如 1000/s）匀速消费处理，保障系统平稳不宕机。

#### 3. 延时任务

如下单 30 分钟未支付自动关闭订单、预约定时通知等。

---

### RabbitMQ 核心架构与交换机模型

```
生产者 (Producer) ──(发送消息)──> 交换机 (Exchange) ──(RoutingKey 路由)──> 队列 (Queue) ──(拉取消息)──> 消费者 (Consumer)
```

#### 常用交换机类型对比

| 交换机类型 | 路由规则说明 | 适用场景 |
|---|---|---|
| **Direct（直连）** | 消息携带的 RoutingKey 必须与队列绑定的 BindingKey 完全精准一致 | 点对点精准通知、日志分级路由 |
| **Fanout（广播）** | 忽略所有 RoutingKey，将收到的消息无条件群发给所有绑定的队列 | 全网广播、多系统同步订阅 |
| **Topic（主题）** | 支持通配符匹配（`*` 匹配单单词，`#` 匹配零或多单词） | 复杂多维度数据分发（如 `order.beijing.*`） |

---

### Spring Boot 整合 RabbitMQ 实战

#### 1. 引入依赖与配置

在 `pom.xml` 中引入 AMQP 起步依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

在 `application.yml` 中配置连接参数：

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

#### 2. 声明交换机、队列与绑定关系配置类

```java
package tech.yunfeiyang.demo.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE_NAME = "order.direct.exchange";
    public static final String QUEUE_NAME = "order.create.queue";
    public static final String ROUTING_KEY = "order.create";

    // 1. 声明直连交换机
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(EXCHANGE_NAME, true, false);
    }

    // 2. 声明持久化队列
    @Bean
    public Queue orderQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    // 3. 将队列绑定到交换机并指定路由键
    @Bean
    public Binding orderBinding(Queue orderQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderQueue).to(orderExchange).with(ROUTING_KEY);
    }
}
```

#### 3. 生产者：发送消息

```java
package tech.yunfeiyang.demo.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tech.yunfeiyang.demo.config.RabbitConfig;

@Service
public class OrderMessageProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendOrderCreateMessage(String orderId) {
        // 向指定交换机发送携带 RoutingKey 的消息
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY, orderId);
        System.out.println("成功发送订单创建消息，订单号: " + orderId);
    }
}
```

#### 4. 消费者：监听并消费消息

```java
package tech.yunfeiyang.demo.listener;

import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tech.yunfeiyang.demo.config.RabbitConfig;

@Component
@RabbitListener(queues = RabbitConfig.QUEUE_NAME) // 监听指定队列
public class OrderMessageConsumer {

    @RabbitHandler
    public void handleOrderMessage(String orderId) {
        System.out.println("收到订单消息，正在执行后续积分发放与短信推送，订单号: " + orderId);
    }
}
```

### 阶段实战大作业

1. 启动本地 RabbitMQ 容器并打开 Management Web 管理后台（默认端口 15672）；
2. 搭建 Spring Boot 工程，声明直连交换机与通知队列；
3. 编写 Controller 接口触发消息投递，并观察消费者异步接收打印日志。
