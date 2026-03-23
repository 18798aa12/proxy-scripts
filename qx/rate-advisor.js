/*
 * 倍率建议 v1.0 (Quantumult X event-interaction)
 * 根据当前网络类型(WiFi/蜂窝)推荐最优倍率档位
 * 兼容 QX 1.5.5-899
 */

var env = typeof $environment !== "undefined" ? $environment : {};
var ssid = (env.ssid != null && env.ssid !== "") ? env.ssid : null;
var isWifi = !!ssid;

var L = [];

if (isWifi) {
  L.push("📶 当前网络: WiFi (" + ssid + ")");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");
  L.push("🎯 推荐策略: 追求速度");
  L.push("");
  L.push("  ✅ 标准倍率 (0.5x~1x) — 平衡首选");
  L.push("  ✅ 高倍率 (1.5x~3x) — 追求极速");
  L.push("  ⚡ 负载均衡-均速 — 全自动最快");
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("💡 WiFi下流量不受限，优先选速度快的档位");
  L.push("   如需看4K/下载大文件，推荐「高倍率」");
} else {
  L.push("📱 当前网络: 蜂窝数据");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");
  L.push("🎯 推荐策略: 省流量");
  L.push("");
  L.push("  ✅ 超低倍率 (0.01x~0.2x) — 最省流量");
  L.push("  ✅ 低倍率 (0.2x~0.5x) — 省流首选");
  L.push("  ⚠️ 标准倍率 — 仅在超低/低倍率无可用节点时");
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("💡 蜂窝下每MB都是真金白银");
  L.push("   切换到「负载均衡-省流」→「超低倍率」");
}

L.push("");
L.push("📊 各档位说明:");
L.push("  超低 0.01~0.2x  几乎不计流量");
L.push("  低   0.2~0.5x   省流首选");
L.push("  标准 0.5~1x     速度与成本平衡");
L.push("  高   1.5~3x     Premium品质");
L.push("  超高 5x+        顶级专线");

var msg = L.join("\n");
var title = isWifi ? "📶 WiFi模式 — 推荐标准/高倍率" : "📱 蜂窝模式 — 推荐超低/低倍率";
$notify("⚡ 倍率建议", title, msg);
$done({ title: "⚡ 倍率建议", message: msg });
