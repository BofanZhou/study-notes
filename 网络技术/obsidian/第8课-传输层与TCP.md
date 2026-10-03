---
title: 第 8 课 · 传输层与 TCP
tags:
  - 网络技术/课程
lesson: 8
status: todo
aliases:
  - TCP
  - 三次握手
  - 四次挥手
---

# 第 8 课 · 传输层与 TCP

> [!important] 两次"必背流程"
> **三次握手**:SYN → SYN+ACK → ACK(防失效连接请求;第三次可携带数据)。
> **四次挥手**:FIN → ACK → FIN → ACK,主动方 **TIME_WAIT 等 2MSL**(全双工分向关闭)。

## UDP vs TCP

| | UDP | TCP |
| --- | --- | --- |
| 连接 | 无连接 | 面向连接 |
| 可靠 | 尽力而为 | 可靠(序号/确认/重传) |
| 首部 | **8 字节** | 20~60 字节 |
| 场景 | DNS/DHCP/直播 | HTTP/邮件/文件 |

## 端口(必背)

FTP 20/21 · Telnet 23 · SMTP 25 · DNS 53 · HTTP 80 · POP3 110 · HTTPS 443

> [!warning] 陷阱
> 流量控制护**接收方**(rwnd);拥塞控制护**网络**(cwnd:慢启动→拥塞避免→快重传/快恢复);
> UDP 首部 8 字节不是 20。

🔗 [[术语表-网络技术]] · 习题 [[第8课-习题]]
