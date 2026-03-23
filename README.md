# Proxy Scripts Collection

Quantumult X & Surge 自用脚本合集 — 金融安全、网络诊断、行情监控、隐私检测等。

所有脚本兼容 **Quantumult X 1.5.5+** 和 **Surge 6.4+**，使用 ES5 语法确保最大兼容性。

> 社区脚本合集请查看 [COMMUNITY_SCRIPTS.md](COMMUNITY_SCRIPTS.md)

---

## 脚本详情

### 金融安全

#### finance-ip-guard.js — 金融 IP 安全检查 v2.0
- **平台**: QX | **类型**: 长按节点触发
- **使用场景**: 打开 Capital One/Monzo/N26 等金融 App 前，确认当前 IP 在正确的国家且纯净度足够。v2.0 新增 ipinfo Blackbox + proxycheck.io 多源纯净度检测，不再仅依赖 ip-api 的简单判断
- **使用方法**: 长按对应金融节点 → 选择此脚本 → 显示出口 IP 国家 + 纯净度评分 (%) + 可安全使用的 App 列表
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/finance-ip-guard.js, tag=🏦金融IP安全检查, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Lock.png, enabled=true
```

#### ip-quality-check.js — IP 纯净度检测
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 金融 App、Google 账号注册等对 IP 质量敏感的操作前，检查当前 IP 是否为机房 IP/代理 IP/家宽 IP，机房 IP 更容易触发风控
- **使用方法**: 长按策略组 → 选择此脚本 → 查看 IP 类型评分和风险等级
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/ip-quality-check.js, tag=🔍IP纯净度检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Lock.png, enabled=true
```

#### ip-reputation.js — IP 信誉检测 v3.0
- **平台**: QX | **类型**: 长按节点触发
- **使用场景**: 4源聚合检测 (ip-api + ipinfo Blackbox + proxycheck.io + ipwhois)，多源投票制评分，准确度对标 ping0.cc。同时显示风险评分和纯净度，精确识别机房/VPN/代理/住宅 IP
- **使用方法**: 长按节点 → 选择此脚本 → 查看 4 个数据源检测结果 + 综合风险评分 (0-100) + 纯净度
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/ip-reputation.js, tag=🛡IP信誉检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Lock.png, enabled=true
```

#### dns-leak-check.js — DNS 泄漏检测
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 使用代理时，如果 DNS 请求泄漏到本地 ISP，你的真实位置就暴露了。在进行金融操作或需要隐私保护的场景下，需要确认 DNS 没有泄漏
- **使用方法**: 长按策略组 → 选择此脚本 → 查看 DNS 服务器位置是否与代理出口一致，不一致则存在泄漏
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/dns-leak-check.js, tag=🔍DNS泄漏检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Lock.png, enabled=true
```

---

### 行情 & 汇率

#### market-dashboard.js — 市场行情面板
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 快速查看外汇汇率 (EUR/USD/GBP/JPY 等)、贵金属价格 (黄金白银，支持克/盎司/千克多种单位)、原油价格、加密货币价格，无需打开专门的行情 App
- **使用方法**: 长按任意策略组 → 选择此脚本 → 一屏显示所有行情数据
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/market-dashboard.js, tag=📊市场行情面板, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Stock.png, enabled=true
```

#### currency-converter.js — 多币种汇率换算
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 跨国金融操作时需要快速换算 USD/GBP/EUR/JPY/PHP/CNY 之间的汇率，比打开银行 App 或搜索更快
- **使用方法**: 长按策略组 → 选择此脚本 → 显示 100 美元兑换各币种金额 + 各币种兑人民币汇率
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/currency-converter.js, tag=💱汇率计算器, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Stock.png, enabled=true
```

#### timezone-dashboard.js — 多时区时钟 + 市场状态
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 操作多国金融账户时需要知道各地当前时间、银行是否营业、股市是否开盘。避免在非营业时间做 KYC 认证或银行转账白等
- **使用方法**: 长按策略组 → 选择此脚本 → 显示中/美/英/德/日/菲当前时间 + NYSE/LSE/FSE/TSE 开盘状态 + 外汇市场交易时段
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/timezone-dashboard.js, tag=🕐多时区时钟, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/World_Map.png, enabled=true
```

---

### 节点监控

#### node-health-monitor.js — 自建节点宕机告警
- **平台**: QX | **类型**: 定时 (每小时)
- **使用场景**: 你有多台自建 VPS 节点，想在节点宕机时第一时间收到通知，而不是等到用的时候才发现连不上
- **使用方法**: 全自动运行，每小时检测所有节点的端口连通性。节点正常时静默，**仅在宕机时推送通知**，不会频繁打扰
- **自定义**: 修改 `NODES` 数组为你的节点 IP 和端口
- **安装**:
```ini
# QX [task_local]
0 0 * * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/node-health-monitor.js, tag=🚨节点宕机告警, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png, enabled=true
```

#### surge-node-health.js — Surge 版节点宕机告警
- **平台**: Surge | **类型**: 定时 (每小时)
- **使用场景**: 同上，Surge 平台版本
- **安装**:
```ini
# Surge [Script]
节点宕机告警 = type=cron,cronexp=0 */1 * * *,timeout=30,script-path=https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/surge/surge-node-health.js,script-update-interval=86400
```

#### node-ip-watch.js — 节点 IP 变动监控
- **平台**: QX | **类型**: 定时 (每6小时)
- **使用场景**: 自建节点 IP 突然变化可能意味着 VPS 被迁移、DNS 劫持或遭到攻击。此脚本监控 IP 变化并及时通知
- **使用方法**: 全自动运行，记录每个节点的 IP 状态。IP 发生变化或节点变得不可达时推送通知，正常时静默
- **自定义**: 修改 `NODES` 数组
- **安装**:
```ini
# QX [task_local]
0 0 */6 * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/node-ip-watch.js, tag=👁节点IP监控, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png, enabled=true
```

#### cert-expiry-check.js — TLS 证书到期检测
- **平台**: QX | **类型**: 定时 (每日9AM)
- **使用场景**: 自建节点使用 Let's Encrypt 证书 (90天有效期)，证书过期会导致节点无法连接。提前 14 天收到提醒，避免突然断连
- **使用方法**: 全自动运行，证书即将过期时推送提醒，正常时静默
- **自定义**: 修改 `NODES` 数组
- **安装**:
```ini
# QX [task_local]
0 0 9 * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/cert-expiry-check.js, tag=🔒证书到期检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Lock.png, enabled=true
```

---

### 订阅管理

#### sub-alert.js — 订阅到期/流量预警
- **平台**: QX | **类型**: 定时 (每日8AM)
- **使用场景**: 机场订阅快到期或流量快用完时，能提前收到通知来续费或调整使用，避免突然断网
- **使用方法**: 全自动运行，检测所有订阅的流量和到期时间。流量使用 >80% 或 7 天内到期时推送告警，正常时静默
- **自定义**: 修改 `SUBS` 数组为你的订阅 URL
- **安装**:
```ini
# QX [task_local]
0 0 8 * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/sub-alert.js, tag=📊订阅预警, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png, enabled=true
```

#### surge-sub-alert.js — Surge 版订阅预警
- **平台**: Surge | **类型**: 定时 (每日8AM)
- **使用场景**: 同上，Surge 平台版本
- **安装**:
```ini
# Surge [Script]
订阅预警 = type=cron,cronexp=0 8 * * *,timeout=30,script-path=https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/surge/surge-sub-alert.js,script-update-interval=86400
```

#### traffic-audit.js — 机场流量审计面板
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 想一眼看到所有订阅的流量使用情况：已用/总量、百分比进度条、上传/下载明细、到期日期。比逐个打开机场网站查方便
- **使用方法**: 长按策略组 → 选择此脚本 → 显示每个订阅的 ▓░ 进度条 + 详细数据 + 汇总
- **自定义**: 修改 `SUBS` 数组
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/traffic-audit.js, tag=📊流量审计, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png, enabled=true
```

#### surge-traffic-audit.js — Surge 版流量审计面板
- **平台**: Surge | **类型**: 面板
- **使用场景**: 同上，Surge Dashboard 面板版本，实时显示在 Surge 主界面
- **安装**:
```ini
# Surge [Script]
流量审计 = type=generic,timeout=30,script-path=https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/surge/surge-traffic-audit.js,script-update-interval=86400

# Surge [Panel]
流量审计 = script-name=流量审计,update-interval=3600
```

---

### 流媒体 & App Store

#### streaming-precheck.js — 流媒体解锁预检
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 准备看 Netflix/Disney+ 前，想确认当前节点是否解锁。避免切到某个节点结果发现不能看，还得换节点重新登录
- **使用方法**: 长按对应策略组 (如"Netflix") → 选择此脚本 → 显示 Netflix/Disney+/YouTube Premium 的解锁状态和检测到的地区
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/streaming-precheck.js, tag=🎬流媒体预检, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Streaming.png, enabled=true
```

#### appstore-region.js — App Store 地区助手
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 切换到某个国家的节点后，想知道对应的 App Store 有哪些可下载的金融 App (如美区的 Capital One、英区的 Monzo)，以及应该用哪个节点
- **使用方法**: 长按策略组 → 选择此脚本 → 检测当前 IP 国家 → 显示对应 App Store 可下载的 App 列表 + 其他地区的切换指南
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/appstore-region.js, tag=🏪App Store地区, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png, enabled=true
```

---

### 网络诊断

#### node-checkup.js — 节点综合体检 v1.0
- **平台**: QX | **类型**: 长按节点触发
- **使用场景**: 一次性全面检测节点质量：延迟 (4目标)、下载速度 (Cloudflare 1MB)、丢包率 (10次探测)、IP 纯净度 (3源检测)、DNS 泄漏。最终给出 A/B/C/D/F 综合评级，帮你快速判断节点是否值得使用
- **使用方法**: 长按节点 → 选择此脚本 → 等待 5-10 秒 → 查看五项评分 + 综合评级
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/node-checkup.js, tag=🔬节点综合体检, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Speedtest.png, enabled=true
```

#### network-diag.js — 全链路网络诊断
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 网速慢或某个网站打不开时，一键测试 Google/Cloudflare/GitHub/金融站点/百度 等多个目标的连通性和延迟，快速定位是代理问题、DNS 问题还是目标站点问题
- **使用方法**: 长按策略组 → 选择此脚本 → 显示每个目标的 HTTP 状态码 + 响应延迟 (ms) + 诊断建议
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/network-diag.js, tag=🔧网络诊断, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Speedtest.png, enabled=true
```

#### site-monitor.js — 网站可用性监控
- **平台**: QX | **类型**: 定时 (每30分钟)
- **使用场景**: 监控你常用的网站 (机场官网、金融平台等) 是否正常运行，宕机时第一时间收到通知
- **使用方法**: 全自动运行，每 30 分钟检测一次。所有网站正常时静默，**仅在不可用时推送通知**
- **自定义**: 修改 `SITES` 数组为你要监控的网站
- **安装**:
```ini
# QX [task_local]
0 */30 * * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/site-monitor.js, tag=⚠️网站监控, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png, enabled=true
```

#### rate-advisor.js — 倍率建议
- **平台**: QX | **类型**: 长按触发
- **使用场景**: 机场有多种倍率档位 (0.01x~5x+)，WiFi 下应该选高倍率追求速度，蜂窝数据下应该选低倍率省流量。此脚本自动检测网络类型并给出建议
- **使用方法**: 长按策略组 → 选择此脚本 → 自动检测 WiFi/蜂窝 → 推荐最优倍率档位 + 各档位说明
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/rate-advisor.js, tag=⚡倍率建议, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Speedtest.png, enabled=true
```

---

### Surge 面板

#### surge-ip-panel.js — 当前 IP 信息面板
- **平台**: Surge | **类型**: 面板
- **使用场景**: 在 Surge Dashboard 实时显示当前出口 IP、国家、ISP 信息，无需手动查询
- **安装**:
```ini
# Surge [Script]
当前IP = type=generic,timeout=15,script-path=https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/surge/surge-ip-panel.js,script-update-interval=86400

# Surge [Panel]
当前IP = script-name=当前IP,update-interval=600
```

#### surge-speed-panel.js — 网速测试面板
- **平台**: Surge | **类型**: 面板
- **使用场景**: 在 Surge Dashboard 一键测速，显示下载/上传速度和延迟
- **安装**:
```ini
# Surge [Script]
网速测试 = type=generic,timeout=30,script-path=https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/surge/surge-speed-panel.js,script-update-interval=86400

# Surge [Panel]
网速测试 = script-name=网速测试,update-interval=3600
```

---

### 其他

#### backup-reminder.js — 配置备份提醒
- **平台**: QX | **类型**: 定时 (每日3AM)
- **使用场景**: QX 沙盒环境无法自动备份配置，此脚本每日提醒你同步配置到 GitHub Gist，避免配置丢失
- **使用方法**: 全自动运行，每日推送一次备份提醒，附带完整的同步命令可直接复制执行
- **自定义**: 修改 Gist ID 和文件路径为你的设置
- **安装**:
```ini
# QX [task_local]
0 0 3 * * * https://raw.githubusercontent.com/18798aa12/proxy-scripts/main/qx/backup-reminder.js, tag=💾备份提醒, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/iCloud.png, enabled=true
```

---

## 自定义配置

大部分脚本头部有可配置的变量，使用前请根据自己的环境修改：

| 脚本 | 需修改的变量 | 说明 |
|------|------------|------|
| `node-health-monitor.js` / `surge-node-health.js` | `NODES` 数组 | 替换为你的自建节点 IP 和端口 |
| `sub-alert.js` / `surge-sub-alert.js` | `SUBS` 数组 | 替换为你的订阅 URL |
| `traffic-audit.js` / `surge-traffic-audit.js` | `SUBS` 数组 | 同上 |
| `finance-ip-guard.js` | `FINANCE_MAP` 对象 | 替换为你的金融服务区域和节点名 |
| `site-monitor.js` | `SITES` 数组 | 替换为你要监控的网站列表 |
| `cert-expiry-check.js` | `NODES` 数组 | 替换为你的节点列表 |
| `node-ip-watch.js` | `NODES` 数组 | 替换为你的节点列表 |
| `backup-reminder.js` | Gist ID + 路径 | 替换为你的 Gist ID 和本地路径 |
| `appstore-region.js` | `REGIONS` 对象 | 可添加/修改地区和对应的 App 列表 |
| `node-checkup.js` | 无需修改 | 全自动检测，无需配置 |

---

## 兼容性

| 平台 | 最低版本 |
|------|---------|
| Quantumult X | 1.5.5-899 |
| Surge | 6.4.4 |

所有 QX 脚本使用 ES5 语法 (var, function, 无箭头函数/模板字符串)，确保最大兼容性。

---

## 许可

MIT License — 随意使用、修改、分发。

如果觉得有用，欢迎 Star 支持。
