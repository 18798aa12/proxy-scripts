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
- **协议**: MIT License
- **说明**: 高级订阅管理器，支持 QX/Surge/Loon/Stash。订阅格式转换、多订阅合并、本地解析不泄漏订阅链接
- **使用场景**: 你有多个机场订阅，想合并成一个链接统一管理；或者订阅格式不兼容 QX，需要自动转换
- **安装**:
```ini
# QX [http_backend]
https://github.com/sub-store-org/Sub-Store/releases/latest/download/sub-store.min.js, tag=Sub-Store, path=/, enabled=true

# QX [task_local] — 定时同步
0 0 6 * * * https://github.com/sub-store-org/Sub-Store/releases/latest/download/cron-sync-artifacts.min.js, tag=Sub-Store同步, enabled=true
```

### Resource Parser — 资源解析器
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: QX 必装的资源解析器，将 Surge/Clash 格式订阅自动转换为 QX 可用格式
- **使用场景**: 机场只提供 Surge/Clash 订阅链接，QX 无法直接导入 → 安装解析器后自动转换
- **安装**:
```ini
# QX [general]
resource_parser_url=https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js
```

### GeoIP 查询
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: 查询当前节点的地理位置、ISP、AS 信息
- **使用场景**: 想确认当前节点实际落地 IP 是否在目标国家（比如"日本节点"是否真的在日本），或查看 ISP 信息判断是否为机房 IP
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/geo_location.js, tag=节点地理信息, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/World_Map.png, enabled=true
```

### 流媒体解锁检测
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: 一键检测当前节点对 Netflix/Disney+/HBO/Paramount+/Discovery+ 等流媒体的解锁状态
- **使用场景**: 切换到某个节点后，想知道能看哪些流媒体平台 → 长按策略组运行即可看到完整解锁报告
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js, tag=流媒体解锁检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Streaming.png, enabled=true
```

### YouTube 画质检测
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: 检测当前节点 YouTube 支持的最高画质 (4K/1080p/720p 等)
- **使用场景**: 看 YouTube 画质不够高，想确认是节点限制还是网络问题 → 长按 YouTube 策略组检测支持的最高画质
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/ytb-ui-check.js, tag=YouTube画质检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube_Letter.png, enabled=true
```

### Google 切换检测
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: 检测当前节点访问 Google 时被识别为哪个地区
- **使用场景**: 想确认 Google 搜索结果是否为目标地区的结果（比如搜索附近餐厅时需要美国结果）
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/switch-check-google.js, tag=Google切换检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google.png, enabled=true
```

### 节点详细信息
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: 查看当前节点的详细网络信息（IP、延迟、丢包率、AS 号等）
- **使用场景**: 网速慢或连接不稳定时，想看节点的详细网络数据来排查问题
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/server-info-plus.js, tag=节点详细信息, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Speedtest.png, enabled=true
```

### 策略流量查询
- **作者**: [KOP-XIAO](https://github.com/KOP-XIAO)
- **仓库**: https://github.com/KOP-XIAO/QuantumultX
- **说明**: 查询各策略组的流量使用情况
- **使用场景**: 想知道哪个策略组/节点消耗了最多流量，方便优化流量使用
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/traffic-check.js, tag=策略流量查询, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png, enabled=true
```

---

## 去广告

### 墨鱼去广告计划 (ddgksf2013)
- **作者**: [ddgksf2013](https://github.com/ddgksf2013)
- **仓库**: https://github.com/ddgksf2013/ddgksf2013
- **说明**: 最全面的中文 App 去广告合集

| 功能 | 使用场景 | QX [rewrite_remote] 安装 |
|------|---------|------------------------|
| 开屏广告通杀 | 打开任何 App 都有开屏广告烦人 → 一键通杀 | `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/StartUp.conf` |
| YouTube 去广告 | 看 YouTube 频繁插入广告 → 去除视频前贴片/中插广告 | `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/YoutubeAds.conf` |
| 微博去广告 | 微博信息流广告、开屏广告、推荐广告太多 | `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Weibo.conf` |
| 知乎去广告 | 知乎回答中间插广告、推荐流广告 | `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Zhihu.conf` |
| 哔哩哔哩去广告 | B站开屏广告、推荐流广告、播放页广告 | `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Bilibili.conf` |
| 小红书去广告 | 小红书信息流广告、搜索广告 | `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/XiaoHongShu.conf` |
| 高德地图净化 | 高德打车广告、首页推广、弹窗广告 | `https://raw.githubusercontent.com/ddgksf2013/Rewrite/master/AdBlock/Amap.conf` |

### blackmatrix7 去广告规则
- **作者**: [blackmatrix7](https://github.com/blackmatrix7)
- **仓库**: https://github.com/blackmatrix7/ios_rule_script
- **协议**: MIT License (部分规则有独立协议)
- **说明**: 自动更新的去广告分流规则 + 重写规则，覆盖 QX/Surge/Loon/Clash/AdGuard

| 功能 | 使用场景 | QX [filter_remote] 安装 |
|------|---------|------------------------|
| 广告拦截规则 | 从 DNS 层面拦截广告域名，覆盖大部分国内外广告 | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/AdvertisingLite/AdvertisingLite.list, tag=广告拦截, force-policy=reject, enabled=true` |
| 隐私保护规则 | 阻止 App 上报隐私数据和行为追踪 | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Privacy/Privacy.list, tag=隐私保护, force-policy=reject, enabled=true` |

### NobyDa 去广告规则
- **作者**: [NobyDa](https://github.com/NobyDa)
- **仓库**: https://github.com/NobyDa/Script
- **协议**: GPL-3.0 License
- **说明**: 8000+ 条去广告规则

| 功能 | 使用场景 | QX 安装 |
|------|---------|--------|
| 去广告规则集 | 作为 blackmatrix7 规则的补充，更大的规则库 | `[filter_remote]` `https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/AdRule.list, tag=NobyDa去广告, force-policy=reject, enabled=true` |
| 去广告重写 | 修改 HTTP 响应来移除广告内容 | `[rewrite_remote]` `https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/Rewrite_lhie1.conf, tag=NobyDa重写去广告, enabled=true` |

### fmz200 去广告
- **作者**: [fmz200](https://github.com/fmz200)
- **仓库**: https://github.com/fmz200/wool_scripts
- **说明**: 730+ App 去开屏广告，持续更新

| 功能 | 使用场景 | QX [rewrite_remote] 安装 |
|------|---------|------------------------|
| 去开屏广告 | 覆盖 730+ 国内 App 的开屏广告，比墨鱼覆盖面更广 | `https://raw.githubusercontent.com/fmz200/wool_scripts/main/QuantumultX/rewrite/chongxie.txt, tag=fmz200去开屏广告, enabled=true` |

---

## 流媒体解锁

### DualSubs 双语字幕
- **作者**: [DualSubs](https://github.com/DualSubs)
- **仓库**: https://github.com/DualSubs/YouTube
- **协议**: MPL-2.0 License
- **说明**: YouTube/Netflix/Disney+ 等平台实时双语字幕
- **使用场景**: 看外语 YouTube 视频时想同时显示中英双语字幕 → 安装后自动在原字幕下方添加翻译
- **安装**:
```ini
# QX [rewrite_remote]
https://github.com/DualSubs/YouTube/releases/latest/download/DualSubs.YouTube.snippet, tag=YouTube双语字幕, enabled=true
```

### 网易云音乐解锁检测
- **作者**: [I-am-R-E](https://github.com/I-am-R-E)
- **仓库**: https://github.com/I-am-R-E/QuantumultX
- **说明**: 检测当前节点是否能解锁网易云音乐灰色歌曲
- **使用场景**: 网易云很多歌曲因版权变灰无法播放 → 长按策略组检测哪个节点能解锁最多灰色歌曲
- **安装**:
```ini
# QX [task_local]
event-interaction https://raw.githubusercontent.com/I-am-R-E/QuantumultX/main/TaskLocal/NeteaseMusicUnlockCheck.js, tag=网易云解锁检测, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netease_Music.png, enabled=true
```

### Spotify 解锁
- **作者**: [app2smile](https://github.com/app2smile)
- **仓库**: https://github.com/app2smile/rules
- **说明**: Spotify 免费用户去广告 + 解锁高音质
- **使用场景**: 用 Spotify 免费版听歌有广告且音质被限制 → 安装后去除广告并提升音质
- **安装**:
```ini
# QX [rewrite_remote]
https://raw.githubusercontent.com/app2smile/rules/master/module/spotify.conf, tag=Spotify解锁, enabled=true
```

---

## 签到脚本

### BoxJs 签到合集
- **作者**: [chavyleung](https://github.com/chavyleung)
- **仓库**: https://github.com/chavyleung/scripts
- **协议**: MIT License
- **说明**: 最大的签到脚本合集，需配合 BoxJs 使用
- **使用场景**: 每天手动打开 N 个 App 签到领积分太麻烦 → 配置一次后 QX 自动定时签到

| App | 使用场景 | QX [task_local] cron |
|-----|---------|---------------------|
| 京东 | 自动签到领京豆，每月可攒几百京豆 | `5 0 * * * https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js, tag=京东签到, enabled=true` |
| 哔哩哔哩 | 自动签到+投币+直播签到领经验升级 | `10 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/bilibili/bilibili.js, tag=B站签到, enabled=true` |
| 网易云音乐 | 自动签到领云贝、升级听歌等级 | `15 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/neteasemusic/neteasemusic.js, tag=网易云签到, enabled=true` |
| 顺丰速运 | 自动签到领丰蜜，可兑换优惠券 | `20 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.js, tag=顺丰签到, enabled=true` |
| 百度贴吧 | 自动签到领贴吧经验，所有关注的吧 | `25 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.js, tag=贴吧签到, enabled=true` |
| 爱奇艺 | 自动签到领成长值/会员天数 | `30 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/iQIYI/iQIYI.js, tag=爱奇艺签到, enabled=true` |
| 中国联通 | 自动签到领流量/话费红包 | `35 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/10010/10010.js, tag=联通签到, enabled=true` |
| 中国移动 | 自动签到领积分，可兑换话费 | `40 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/10086/10086.js, tag=移动签到, enabled=true` |

> ⚠️ **首次使用**: 打开对应 App → 手动签到一次 → QX 通过 MITM 自动抓取 Cookie → 之后 cron 自动执行
>
> ⚠️ **前提条件**: 需要安装 BoxJs 并配置 MITM 证书

---

## App 增强/解锁

### TestFlight 区域解锁
- **作者**: [NobyDa](https://github.com/NobyDa)
- **仓库**: https://github.com/NobyDa/Script
- **协议**: GPL-3.0 License
- **说明**: 解除 TestFlight 地区限制
- **使用场景**: 想参加某个 App 的 TestFlight 测试但提示"此 App 目前不接受测试员" → 通常是地区限制，安装后可解除
- **安装**:
```ini
# QX [rewrite_remote]
https://raw.githubusercontent.com/NobyDa/Script/master/TestFlight/TestFlightAccount.js, tag=TestFlight解锁, enabled=true
```

### TikTok 换区
- **作者**: [Semporia](https://github.com/Semporia)
- **仓库**: https://github.com/Semporia/TikTok-Unlock
- **说明**: TikTok 区域解锁，可切换到任意国家查看当地内容
- **使用场景**: 中国区 TikTok 即抖音，想看海外版 TikTok 的日本/美国/韩国内容 → 安装对应地区的重写

| 地区 | 使用场景 | QX [rewrite_remote] 安装 |
|------|---------|------------------------|
| 日本 | 想看日本 TikTok 热门内容 | `https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Quantumult-X/TikTok-JP.conf, tag=TikTok日本, enabled=true` |
| 美国 | 想看美国 TikTok 热门内容 | `https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Quantumult-X/TikTok-US.conf, tag=TikTok美国, enabled=true` |
| 韩国 | 想看韩国 TikTok 热门内容 | `https://raw.githubusercontent.com/Semporia/TikTok-Unlock/master/Quantumult-X/TikTok-KR.conf, tag=TikTok韩国, enabled=true` |

---

## 分流规则

### blackmatrix7 分流规则集 (推荐)
- **作者**: [blackmatrix7](https://github.com/blackmatrix7)
- **仓库**: https://github.com/blackmatrix7/ios_rule_script
- **协议**: MIT License (部分规则有独立协议)
- **说明**: 最全面的分流规则集，每8小时自动更新，覆盖所有主流代理工具
- **使用场景**: 需要精确控制每个 App/服务走哪个策略组 → 按服务添加对应规则

常用规则 (QX `[filter_remote]`):

| 规则 | 使用场景 | URL (基础路径: `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master`) |
|------|---------|-----|
| Google | Google 搜索/Gmail/Drive 走代理 | `.../rule/QuantumultX/Google/Google.list` |
| YouTube | YouTube 视频走代理 | `.../rule/QuantumultX/YouTube/YouTube.list` |
| Netflix | Netflix 走指定解锁节点 | `.../rule/QuantumultX/Netflix/Netflix.list` |
| Disney+ | Disney+ 走指定解锁节点 | `.../rule/QuantumultX/Disney/Disney.list` |
| Telegram | Telegram 消息走代理 | `.../rule/QuantumultX/Telegram/Telegram.list` |
| Twitter | Twitter/X 走代理 | `.../rule/QuantumultX/Twitter/Twitter.list` |
| GitHub | GitHub 代码/下载走代理 | `.../rule/QuantumultX/GitHub/GitHub.list` |
| Apple | Apple 服务分流 (部分直连部分代理) | `.../rule/QuantumultX/Apple/Apple.list` |
| Microsoft | Microsoft 365/Azure 走代理 | `.../rule/QuantumultX/Microsoft/Microsoft.list` |
| OpenAI | ChatGPT/Claude 走代理 | `.../rule/QuantumultX/OpenAI/OpenAI.list` |
| 国内直连 | 国内网站/App 直连不走代理 | `.../rule/QuantumultX/ChinaMaxNoIP/ChinaMaxNoIP.list` |
| 广告拦截 | 广告域名直接拒绝 | `.../rule/QuantumultX/AdvertisingLite/AdvertisingLite.list` |

### ACL4SSR 规则
- **作者**: [ACL4SSR](https://github.com/ACL4SSR)
- **仓库**: https://github.com/ACL4SSR/ACL4SSR
- **协议**: GPL-3.0 License
- **说明**: 主要面向 Clash 的规则集，也可用于 QX (需资源解析器)
- **使用场景**: 用 Clash 的用户首选，规则分类清晰，有 BanAD/BanProgramAD/Google/YouTube 等

---

## 图标资源

### Koolson/Qure (推荐)
- **作者**: [Koolson](https://github.com/Koolson)
- **仓库**: https://github.com/Koolson/Qure
- **说明**: 最流行的 QX 图标集，300+ 彩色图标
- **使用场景**: 策略组图标默认很丑 → 用 Qure 图标美化，支持国旗、App logo、功能图标
- **URL 格式**: `https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/{name}.png`
- **常用图标**: `Google.png`, `YouTube.png`, `Netflix.png`, `Telegram.png`, `Twitter.png`, `Speedtest.png`, `Lock.png`, `World_Map.png`, `Streaming.png`

### Orz-3/mini
- **作者**: [Orz-3](https://github.com/Orz-3)
- **仓库**: https://github.com/Orz-3/mini
- **说明**: 简约风格图标集，Color + Alpha 两种风格
- **使用场景**: 喜欢简约风格 → 用 mini 图标替代 Qure
- **URL 格式**: `https://raw.githubusercontent.com/Orz-3/mini/master/Color/{name}.png`

### Semporia/Hand-Painted-icon
- **作者**: [Semporia](https://github.com/Semporia)
- **仓库**: https://github.com/Semporia/Hand-Painted-icon
- **说明**: 手绘风格图标，风格独特
- **使用场景**: 想要个性化风格的策略组图标

---

## 脚本管理平台

### BoxJs
- **作者**: [chavyleung](https://github.com/chavyleung)
- **仓库**: https://github.com/chavyleung/scripts
- **文档**: https://docs.boxjs.app
- **协议**: MIT License
- **说明**: 通用脚本管理平台，提供 Web UI 管理脚本设置、Cookie、会话
- **使用场景**: 签到脚本需要管理 Cookie、修改脚本参数 → BoxJs 提供可视化网页界面，不用手动编辑配置
- **安装**:
```ini
# QX [rewrite_remote]
https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.quanx.conf, tag=BoxJs, enabled=true
```
- 安装后浏览器访问 `http://boxjs.com` 进入管理界面

---

## 版权声明

本合集仅做收录和分类索引，**不包含任何第三方脚本文件**，所有链接均指向原作者仓库。

所有脚本版权归原作者所有，具体协议请查看各仓库的 LICENSE 文件:
- NobyDa/Script — GPL-3.0
- blackmatrix7/ios_rule_script — MIT (部分规则独立协议)
- ddgksf2013 — 请查看原仓库
- chavyleung/scripts — MIT
- KOP-XIAO/QuantumultX — 请查看原仓库
- sub-store-org/Sub-Store — MIT
- DualSubs — MPL-2.0
- Semporia/TikTok-Unlock — 请查看原仓库
- ACL4SSR — GPL-3.0
- fmz200/wool_scripts — 请查看原仓库

如有侵权请提 [Issue](https://github.com/18798aa12/proxy-scripts/issues)，将立即移除。

> 部分脚本可能需要 MITM 证书和特定 hostname 配置才能正常工作，请阅读原仓库 README。
