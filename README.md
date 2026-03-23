# Proxy Scripts Collection

Quantumult X & Surge 自用脚本合集 — 金融安全、网络诊断、行情监控、隐私检测等。

所有脚本兼容 **Quantumult X 1.5.5+** 和 **Surge 6.4+**。

---

## 脚本一览

### 金融安全

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [finance-ip-guard.js](qx/finance-ip-guard.js) | QX | 长按触发 | 检测当前 IP 是否匹配金融服务区域，防止用错 IP 导致风控冻结 |
| [ip-quality-check.js](qx/ip-quality-check.js) | QX | 长按触发 | IP 纯净度检测，分析机房/家宽/代理类型 |
| [ip-reputation.js](qx/ip-reputation.js) | QX | 长按触发 | IP 信誉/黑名单检测，聚合多个数据源评估风险分 |
| [dns-leak-check.js](qx/dns-leak-check.js) | QX | 长按触发 | DNS 泄漏检测，确认 DNS 请求未暴露真实位置 |

### 行情 & 汇率

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [market-dashboard.js](qx/market-dashboard.js) | QX | 长按触发 | 市场行情面板 — 外汇/黄金白银(克/盎司/千克)/原油/加密货币 |
| [currency-converter.js](qx/currency-converter.js) | QX | 长按触发 | 多币种实时汇率换算 (USD/GBP/EUR/JPY/PHP/CNY) |
| [timezone-dashboard.js](qx/timezone-dashboard.js) | QX | 长按触发 | 多时区时钟 + 全球股市/银行开市状态 |

### 节点监控

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [node-health-monitor.js](qx/node-health-monitor.js) | QX | 定时 (每小时) | 自建节点宕机告警，仅故障时推送 |
| [surge-node-health.js](surge/surge-node-health.js) | Surge | 定时 (每小时) | Surge 版节点宕机告警 |
| [node-ip-watch.js](qx/node-ip-watch.js) | QX | 定时 (6小时) | 节点 IP 变动监控，IP 变化或不可达时推送 |
| [cert-expiry-check.js](qx/cert-expiry-check.js) | QX | 定时 (每日9AM) | TLS 证书到期检测 (Let's Encrypt 90天周期) |

### 订阅管理

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [sub-alert.js](qx/sub-alert.js) | QX | 定时 (每日8AM) | 订阅到期/流量预警，剩余<20%或7天内到期时推送 |
| [surge-sub-alert.js](surge/surge-sub-alert.js) | Surge | 定时 (每日8AM) | Surge 版订阅预警 |
| [traffic-audit.js](qx/traffic-audit.js) | QX | 长按触发 | 机场流量审计面板，进度条可视化各订阅用量 |
| [surge-traffic-audit.js](surge/surge-traffic-audit.js) | Surge | 面板 | Surge 版流量审计面板 |

### 流媒体 & App Store

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [streaming-precheck.js](qx/streaming-precheck.js) | QX | 长按触发 | Netflix/Disney+/YouTube Premium 解锁预检 |
| [appstore-region.js](qx/appstore-region.js) | QX | 长按触发 | App Store 地区检测 + 各区可用金融 App 列表 |

### 网络诊断

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [network-diag.js](qx/network-diag.js) | QX | 长按触发 | 全链路网络诊断 — 延迟/连通性/DNS 一键排查 |
| [site-monitor.js](qx/site-monitor.js) | QX | 定时 (30分钟) | 网站可用性监控，宕机时推送告警 |
| [rate-advisor.js](qx/rate-advisor.js) | QX | 长按触发 | WiFi/蜂窝网络倍率建议 |

### Surge 面板

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [surge-ip-panel.js](surge/surge-ip-panel.js) | Surge | 面板 | 当前 IP 信息面板 |
| [surge-speed-panel.js](surge/surge-speed-panel.js) | Surge | 面板 | 网速测试面板 |

### 其他

| 脚本 | 平台 | 类型 | 说明 |
|------|------|------|------|
| [backup-reminder.js](qx/backup-reminder.js) | QX | 定时 (每日3AM) | 配置备份提醒 |

---

## 使用方法

### Quantumult X

#### 长按触发脚本 (event-interaction)

在 `[task_local]` 中添加：

```ini
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/脚本名.js, tag=脚本标签, img-url=图标URL, enabled=true
```

然后在 QX 主界面**长按策略组图标**即可触发。

#### 定时任务 (cron)

```ini
# 每小时执行
0 0 * * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/脚本名.js, tag=脚本标签, img-url=图标URL, enabled=true

# 每日8AM执行
0 0 8 * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/脚本名.js, tag=脚本标签, img-url=图标URL, enabled=true
```

### Surge

#### 面板脚本

```ini
[Script]
脚本名 = type=generic,timeout=30,script-path=https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/surge/脚本名.js,script-update-interval=86400

[Panel]
脚本名 = script-name=脚本名,update-interval=3600
```

#### 定时脚本

```ini
[Script]
脚本名 = type=cron,cronexp=0 */1 * * *,timeout=30,script-path=https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/surge/脚本名.js,script-update-interval=86400
```

---

## 自定义配置

大部分脚本头部有可配置的变量，使用前请根据自己的环境修改：

- **node-health-monitor.js / surge-node-health.js** — 修改 `NODES` 数组为你的自建节点 IP 和端口
- **sub-alert.js / surge-sub-alert.js** — 修改 `SUBS` 数组为你的订阅 URL
- **traffic-audit.js / surge-traffic-audit.js** — 同上，修改 `SUBS` 数组
- **finance-ip-guard.js** — 修改 `FINANCE_MAP` 为你的金融服务区域和节点名
- **site-monitor.js** — 修改 `SITES` 数组为你要监控的网站
- **cert-expiry-check.js** — 修改 `NODES` 数组为你的节点列表
- **backup-reminder.js** — 修改 Gist ID 和文件路径

---

## 兼容性

| 平台 | 最低版本 |
|------|---------|
| Quantumult X | 1.5.5-899 |
| Surge | 6.4.4 |

所有 QX 脚本使用 ES5 语法，确保最大兼容性。

---

## 许可

MIT License — 随意使用、修改、分发。

如果觉得有用，欢迎 Star 支持。
