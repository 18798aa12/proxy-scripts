/*
 * 隐私指纹检测 v1.0 (Quantumult X event-interaction)
 * 长按节点触发，检测代理隐私泄漏:
 *   1. IP 一致性 (多源对比)
 *   2. DNS 泄漏
 *   3. 时区匹配
 *   4. IP 类型风险
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 3;
var data = {};

var TZ_MAP = {
  "US": ["America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Anchorage","Pacific/Honolulu"],
  "GB": ["Europe/London"],
  "DE": ["Europe/Berlin"],
  "JP": ["Asia/Tokyo"],
  "CN": ["Asia/Shanghai"],
  "HK": ["Asia/Hong_Kong"],
  "SG": ["Asia/Singapore"],
  "KR": ["Asia/Seoul"],
  "PH": ["Asia/Manila"],
  "TW": ["Asia/Taipei"],
  "FR": ["Europe/Paris"],
  "NL": ["Europe/Amsterdam"],
  "AU": ["Australia/Sydney","Australia/Melbourne","Australia/Brisbane"],
  "CA": ["America/Toronto","America/Vancouver"],
  "IN": ["Asia/Kolkata"]
};

function checkDone() {
  completed++;
  if (completed < totalChecks) return;
  buildReport();
}

function buildReport() {
  var L = [];
  var risks = [];
  var passCount = 0;

  L.push("🔒 隐私指纹检测");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");

  // ── 1. IP 一致性 ──
  var ip1 = data.ipApi || "";
  var ip2 = data.cfIP || "";
  var ip3 = data.ipinfoIP || "";

  L.push("1️⃣ IP一致性:");
  L.push("  ip-api: " + (ip1 || "失败"));
  L.push("  Cloudflare: " + (ip2 || "失败"));
  L.push("  ipinfo: " + (ip3 || "失败"));

  var ips = [];
  if (ip1) ips.push(ip1);
  if (ip2) ips.push(ip2);
  if (ip3) ips.push(ip3);

  var allSame = true;
  for (var i = 1; i < ips.length; i++) {
    if (ips[i] !== ips[0]) { allSame = false; break; }
  }

  if (ips.length >= 2 && allSame) {
    L.push("  ✅ 一致 — 代理通道稳定");
    passCount++;
  } else if (ips.length >= 2) {
    L.push("  ❌ 不一致 — 可能存在分流泄漏");
    risks.push("IP不一致: 不同检测源返回不同IP，代理可能部分泄漏");
  } else {
    L.push("  ⚠️ 数据不足");
  }

  // ── 2. DNS 泄漏 ──
  L.push("");
  L.push("2️⃣ DNS泄漏:");
  if (ip1 && ip2) {
    if (ip1 === ip2) {
      L.push("  ✅ 无泄漏 (ip-api与CF一致)");
      passCount++;
    } else {
      L.push("  ❌ 可能泄漏 (IP不一致)");
      risks.push("DNS可能泄漏: 请检查DNS配置");
    }
  } else {
    L.push("  ⚠️ 检测数据不足");
  }

  // ── 3. 时区匹配 ──
  L.push("");
  L.push("3️⃣ 时区指纹:");
  var cc = data.countryCode || "";
  var deviceTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  L.push("  设备时区: " + deviceTZ);
  L.push("  IP国家: " + (data.flag || "") + " " + (data.country || "未知") + " (" + cc + ")");

  var expectedTZs = TZ_MAP[cc];
  if (expectedTZs && deviceTZ) {
    var tzMatch = false;
    for (var t = 0; t < expectedTZs.length; t++) {
      if (deviceTZ === expectedTZs[t]) { tzMatch = true; break; }
    }
    if (tzMatch) {
      L.push("  ✅ 时区匹配IP国家");
      passCount++;
    } else {
      L.push("  ⚠️ 时区不匹配!");
      L.push("  期望: " + expectedTZs.join(" / "));
      risks.push("时区不匹配: 设备" + deviceTZ + " vs IP国家" + cc + "。金融App可能检测到异常");
    }
  } else {
    L.push("  ⚪ 无法判断 (未知国家时区)");
  }

  // ── 4. IP 类型 ──
  L.push("");
  L.push("4️⃣ IP类型:");
  if (typeof data.hosting !== "undefined") {
    L.push("  机房IP: " + (data.hosting ? "⚠️ 是" : "✅ 否"));
    L.push("  代理标记: " + (data.proxy ? "⚠️ 是" : "✅ 否"));
    L.push("  移动网络: " + (data.mobile ? "📱 是" : "— 否"));
    if (data.hosting || data.proxy) {
      risks.push("IP被标记为机房/代理，金融App风控可能触发");
    }
  }

  // ── 综合 ──
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");

  if (risks.length === 0 && passCount >= 3) {
    L.push("🟢 隐私保护良好 (" + passCount + "/3 通过)");
    L.push("✅ 未检测到指纹泄漏");
  } else if (risks.length <= 1) {
    L.push("🟡 存在轻微风险 (" + passCount + "/3 通过)");
    for (var r = 0; r < risks.length; r++) {
      L.push("  • " + risks[r]);
    }
  } else {
    L.push("🔴 隐私风险较高 (" + passCount + "/3 通过)");
    for (var r2 = 0; r2 < risks.length; r2++) {
      L.push("  • " + risks[r2]);
    }
  }

  var msg = L.join("\n");
  var icon = risks.length === 0 ? "🟢" : (risks.length <= 1 ? "🟡" : "🔴");
  $notify("🔒 隐私指纹检测", icon + " " + passCount + "/3 通过", msg);
  $done({ title: "🔒 隐私指纹检测", message: msg });
}

var FLAGS = {
  "US":"🇺🇸","GB":"🇬🇧","DE":"🇩🇪","JP":"🇯🇵","CN":"🇨🇳","HK":"🇭🇰",
  "SG":"🇸🇬","TW":"🇹🇼","KR":"🇰🇷","PH":"🇵🇭","FR":"🇫🇷","AU":"🇦🇺",
  "CA":"🇨🇦","NL":"🇳🇱","IN":"🇮🇳","SE":"🇸🇪","IE":"🇮🇪","IT":"🇮🇹"
};

// ── 源 1: ip-api.com ──
$task.fetch({
  url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    data.ipApi = d.query;
    data.country = d.country;
    data.countryCode = d.countryCode;
    data.flag = FLAGS[d.countryCode] || "🏳️";
    data.isp = d.isp;
    data.hosting = d.hosting;
    data.proxy = d.proxy;
    data.mobile = d.mobile;
  } catch(e) {}
  checkDone();
}, function() { checkDone(); });

// ── 源 2: Cloudflare trace ──
$task.fetch({
  url: "https://1.1.1.1/cdn-cgi/trace",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var lines = (resp.body || "").split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf("ip=") === 0) {
        data.cfIP = lines[i].substring(3).trim();
      }
    }
  } catch(e) {}
  checkDone();
}, function() { checkDone(); });

// ── 源 3: ipinfo.io ──
$task.fetch({
  url: "https://ipinfo.io/ip",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    data.ipinfoIP = resp.body.trim();
  } catch(e) {}
  checkDone();
}, function() { checkDone(); });
