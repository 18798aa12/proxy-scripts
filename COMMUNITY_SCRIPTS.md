# 社区脚本合集

精选社区优秀脚本，按功能分类整理。所有脚本均保留原作者版权，仅做收录和分类。

> 最后更新: 2026-03-23

---

## 目录
- [基础工具](#基础工具)
- [去广告](#去广告)
- [流媒体解锁](#流媒体解锁)
- [签到脚本](#签到脚本)
- [App 增强/解锁](#app-增强解锁)
- [分流规则](#分流规则)
- [图标资源](#图标资源)
- [脚本管理平台](#脚本管理平台)

---

## 基础工具

### Sub-Store — 订阅管理器
- **作者**: [Peng-YM](https://github.com/Peng-YM) / [sub-store-org](https://github.com/sub-store-org)
- **仓库**: https://github.com/sub-store-org/Sub-Store
- **说明**: 高级订阅管理器，支持 QX/Surge/Loon/Stash。订阅格式转换、多订阅合并、本地解析不泄漏订阅链接
- **安装**:
  QX [task_local]:
  `event-interaction https://raw.githubusercontent.com/sub-store-org/Sub-Store/release/sub-store.min.js...`
  QX [http_backend]:
  `https://github.com/sub-store-org/Sub-Store/releases/latest/download/sub-store.min.js, tag=Sub-Store, path=/, enabled=true`

### Resource Parser — 资源解析器
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: QX 必装的资源解析器，将其他格式订阅转换为 QX 可用格式
- **安装**: QX [general] 中设置 `resource_parser_url=https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js`

### GeoIP 查询
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **文件**: `Scripts/geo_location.js`, `Scripts/IP_API.js`
- **说明**: 节点地理位置信息查询
- **安装**: QX [task_local]: `event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/geo_location.js, tag=节点地理信息, enabled=true`

### 流媒体解锁检测
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **文件**: `Scripts/streaming-ui-check.js`
- **说明**: 检测当前节点 Netflix/Disney+/HBO 等流媒体解锁状态
- **安装**: QX [task_local]: `event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js, tag=流媒体解锁检测, enabled=true`

### YouTube 画质检测
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **文件**: `Scripts/ytb-ui-check.js`
- **说明**: 检测当前节点 YouTube 支持的最高画质
- **安装**: QX [task_local]: `event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/ytb-ui-check.js, tag=YouTube画质检测, enabled=true`

### Google 切换检测
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **文件**: `Scripts/switch-check-google.js`

### 节点详细信息
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **文件**: `Scripts/server-info-plus.js`

### 策略流量查询
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **文件**: `Scripts/traffic-check.js`

---

## 去广告

### 墨鱼去广告计划 (ddgksf2013)
- **作者**: [ddgksf2013](https://github.com/ddgksf2013)
- **仓库**: https://github.com/ddgksf2013/ddgksf2013
- **说明**: 最全面的中文 App 去广告合集

| 功能 | QX 安装方式 |
|------|-----------|
| 开屏广告通杀 | `[rewrite_remote]` `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/StartUp.conf` |
| YouTube 去广告 | `[rewrite_remote]` `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/YoutubeAds.conf` |
| 微博去广告 | `[rewrite_remote]` `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Weibo.conf` |
| 知乎去广告 | `[rewrite_remote]` `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Zhihu.conf` |
| 哔哩哔哩去广告 | `[rewrite_remote]` `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Bilibili.conf` |
| 小红书去广告 | `[rewrite_remote]` `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/XiaoHongShu.conf` |
| 高德地图净化 | `[rewrite_remote]` `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Amap.conf` |

### blackmatrix7 去广告规则
- **作者**: [blackmatrix7](https://github.com/blackmatrix7)
- **仓库**: https://github.com/blackmatrix7/ios_rule_script
- **说明**: 自动更新的去广告分流规则 + 重写规则，覆盖 QX/Surge/Loon/Clash/AdGuard

| 功能 | QX 安装方式 |
|------|-----------|
| 广告拦截规则 | `[filter_remote]` `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/AdvertisingLite/AdvertisingLite.list` |
| 隐私保护规则 | `[filter_remote]` `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Privacy/Privacy.list` |

### NobyDa 去广告规则
- **作者**: [NobyDa](https://github.com/NobyDa)
- **仓库**: https://github.com/NobyDa/Script
- **说明**: 8000+ 条去广告规则

| 功能 | QX 安装方式 |
|------|-----------|
| 去广告规则集 | `[filter_remote]` `https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/AdRule.list` |
| 去广告重写 | `[rewrite_remote]` `https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/Rewrite_lhie1.conf` |

### fmz200 去广告
- **作者**: [fmz200](https://github.com/fmz200)
- **仓库**: https://github.com/fmz200/wool_scripts
- **说明**: 730+ App 去开屏广告

| 功能 | QX 安装方式 |
|------|-----------|
| 去开屏广告 | `[rewrite_remote]` `https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/rewrite/chongxie.txt` |

---

## 流媒体解锁

### DualSubs 双语字幕
- **作者**: [DualSubs](https://github.com/DualSubs)
- **仓库**: https://github.com/DualSubs/YouTube
- **说明**: YouTube/Netflix/Disney+ 等平台双语字幕

| 平台 | QX 安装方式 |
|------|-----------|
| YouTube 双语字幕 | `[rewrite_remote]` `https://github.com/DualSubs/YouTube/releases/latest/download/DualSubs.YouTube.snippet` |

### 网易云音乐解锁
- **作者**: [I-am-R-E](https://github.com/I-am-R-E)
- **文件**: `TaskLocal/NeteaseMusicUnlockCheck.js`
- **说明**: 检测网易云音乐灰色歌曲解锁状态
- **安装**: QX [task_local]: `event-interaction https://raw.githubusercontent.com/I-am-R-E/QuantumultX/main/TaskLocal/NeteaseMusicUnlockCheck.js, tag=网易云解锁检测, enabled=true`

### Spotify 解锁
- **作者**: [app2smile](https://github.com/app2smile)
- **仓库**: https://github.com/app2smile/rules
- **说明**: Spotify Premium 功能解锁（免费用户去广告+高音质）
- **安装**: `[rewrite_remote]` `https://raw.githubusercontent.com/app2smile/rules/master/module/spotify.conf`

---

## 签到脚本

### BoxJs 签到合集
- **作者**: [chavyleung](https://github.com/chavyleung)
- **仓库**: https://github.com/chavyleung/scripts
- **说明**: 最大的签到脚本合集，需配合 BoxJs 使用

主要签到脚本 (在 [task_local] 中配置 cron):

| App | 脚本路径 |
|-----|---------|
| 京东 | `https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js` |
| 哔哩哔哩 | `https://raw.githubusercontent.com/chavyleung/scripts/master/bilibili/bilibili.js` |
| 网易云音乐 | `https://raw.githubusercontent.com/chavyleung/scripts/master/neteasemusic/neteasemusic.js` |
| 顺丰速运 | `https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.js` |
| 百度贴吧 | `https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.js` |
| 爱奇艺 | `https://raw.githubusercontent.com/chavyleung/scripts/master/iQIYI/iQIYI.js` |
| 中国联通 | `https://raw.githubusercontent.com/chavyleung/scripts/master/10010/10010.js` |
| 中国移动 | `https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.js` |

> ⚠️ 签到脚本需要先获取 Cookie: 打开对应 App → 手动签到一次 → QX 自动抓取 Cookie → 之后 cron 自动签到

---

## App 增强/解锁

### TestFlight 区域解锁
- **作者**: [NobyDa](https://github.com/NobyDa)
- **说明**: 解除 TestFlight 地区限制
- **安装**: `[rewrite_remote]` `https://raw.githubusercontent.com/NobyDa/Script/master/TestFlight/TestFlightAccount.js`

### TikTok 换区
- **作者**: [Semporia](https://github.com/Semporia)
- **仓库**: https://github.com/Semporia/TikTok-Unlock
- **说明**: TikTok 区域解锁，可切换到任意国家

| 地区 | QX 安装方式 |
|------|-----------|
| 日本 | `[rewrite_remote]` `https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Quantumult-X/TikTok-JP.conf` |
| 美国 | `[rewrite_remote]` `https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Quantumult-X/TikTok-US.conf` |
| 韩国 | `[rewrite_remote]` `https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Quantumult-X/TikTok-KR.conf` |

---

## 分流规则

### blackmatrix7 分流规则集 (推荐)
- **作者**: [blackmatrix7](https://github.com/blackmatrix7)
- **仓库**: https://github.com/blackmatrix7/ios_rule_script
- **说明**: 最全面的分流规则集，每8小时自动更新

常用规则 (QX [filter_remote]):

| 规则 | URL |
|------|-----|
| Google | `.../rule/QuantumultX/Google/Google.list` |
| YouTube | `.../rule/QuantumultX/YouTube/YouTube.list` |
| Netflix | `.../rule/QuantumultX/Netflix/Netflix.list` |
| Disney+ | `.../rule/QuantumultX/Disney/Disney.list` |
| Telegram | `.../rule/QuantumultX/Telegram/Telegram.list` |
| Twitter | `.../rule/QuantumultX/Twitter/Twitter.list` |
| GitHub | `.../rule/QuantumultX/GitHub/GitHub.list` |
| Apple | `.../rule/QuantumultX/Apple/Apple.list` |
| Microsoft | `.../rule/QuantumultX/Microsoft/Microsoft.list` |
| OpenAI | `.../rule/QuantumultX/OpenAI/OpenAI.list` |
| 国内直连 | `.../rule/QuantumultX/ChinaMaxNoIP/ChinaMaxNoIP.list` |
| 广告拦截 | `.../rule/QuantumultX/AdvertisingLite/AdvertisingLite.list` |

> 基础 URL: `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master`

### ACL4SSR 规则
- **作者**: [ACL4SSR](https://github.com/ACL4SSR)
- **仓库**: https://github.com/ACL4SSR/ACL4SSR
- **说明**: 主要面向 Clash 的规则集，也可用于 QX (需解析器)

---

## 图标资源

### Koolson/Qure (推荐)
- **作者**: [Koolson](https://github.com/Koolson)
- **仓库**: https://github.com/Koolson/Qure
- **说明**: 最流行的 QX 图标集，300+ 彩色图标
- **URL 格式**: `https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/{name}.png`

### Orz-3/mini
- **作者**: [Orz-3](https://github.com/Orz-3)
- **仓库**: https://github.com/Orz-3/mini
- **说明**: 简约风格图标集，Color + Alpha 两种风格
- **URL 格式**: `https://raw.githubusercontent.com/Orz-3/mini/master/Color/{name}.png`

### Semporia/Hand-Painted-icon
- **作者**: [Semporia](https://github.com/Semporia)
- **仓库**: https://github.com/Semporia/Hand-Painted-icon
- **说明**: 手绘风格图标

---

## 脚本管理平台

### BoxJs
- **作者**: [chavyleung](https://github.com/chavyleung)
- **仓库**: https://github.com/chavyleung/scripts
- **文档**: https://docs.boxjs.app
- **说明**: 通用脚本管理平台，提供 Web UI 管理脚本设置、Cookie、会话
- **安装**: QX [rewrite_remote]: `https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.quanx.conf, tag=BoxJs, enabled=true`
- 安装后浏览器访问 `http://boxjs.com` 进入管理界面

---

## 版权声明

本合集仅做收录和分类，所有脚本版权归原作者所有。如有侵权请提 Issue，将立即移除。

使用社区脚本前请阅读原仓库的 README 和 License。部分脚本可能需要 MITM 证书和特定配置才能正常工作。
