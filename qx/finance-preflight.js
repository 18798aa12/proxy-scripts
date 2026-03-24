/*
 * 金融操作一键预检 v2.0 (Quantumult X event-interaction)
 * 长按节点触发，快速完成金融安全检查:
 *   1. IP 国家匹配
 *   2. IP 纯净度
 *   3. 延迟测试
 * 去掉慢的 API，保证 3 秒内出结果
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 2;
var results = {};

var FINANCE_MAP = {
  "US": { flag: "🇺🇸", name: "美国", apps: "Capital One, Fidelity, Schwab, Wise(US), Revolut(US)" },
  "GB": { flag: "🇬🇧", name: "英国", apps: "Monzo, Zilch, Yonder, Zopa, Wise(UK)" },
  "DE": { flag: "🇩🇪", name: "德国", apps: "N26, Skrill, Trade212, Coinbase, Curve" },
  "PH": { flag: "🇵🇭", name: "菲律宾", apps: "Maya, GCash" },
  "JP": { flag: "🇯🇵", name: "日本", apps: "Sony Bank, PayPay" }
};

var HOSTING_KEYWORDS = [
  "hosting", "cloud", "server", "vps", "datacenter",
  "hetzner", "ovh", "digitalocean", "vultr", "linode", "racknerd",
  "amazon", "aws", "azure", "google cloud", "gtt ", "contabo",
  "cogent", "m247", "leaseweb", "telia", "internet utilities"
];

var FLAGS = {
  "US":"🇺🇸","GB":"🇬🇧","DE":"🇩🇪","JP":"🇯🇵","CN":"🇨🇳","HK":"🇭🇰",
  "SG":"🇸🇬","TW":"🇹🇼","KR":"🇰🇷","PH":"🇵🇭","FR":"🇫🇷","AU":"🇦🇺",
  "CA":"🇨🇦","NL":"🇳🇱","IN":"🇮🇳","IT":"🇮🇹","SE":"🇸🇪","RU":"🇷🇺"
};

function matchKeywords(text, keywords) {
  if (!text) return false;
  var lower = text.toLowerCase();
  for (var i = 0; i < keywords.length; i++) {
    if (lower.indexOf(keywords[i]) >= 0) return true;
  }
  return false;
}

function checkDone() {
  completed++;
  if (completed < totalChecks) return;
  buildReport();
}

function buildReport() {
  var L = [];
  var passCount = 0;
  var warnings = [];

  var cc = results.countryCode || "";
  var matched = FINANCE_MAP[cc];
  var flag = results.flag || "🏳️";

  L.push(flag + " " + (results.ip || "未知") + " · " + (results.country || "未知"));
  L.push("ISP: " + (results.isp || "未知"));
  L.push("━━━━━━━━━━━━━━━━━━");

  // 1. 国家匹配
  if (matched) {
    L.push("1️⃣ 国家: ✅ " + matched.flag + " " + matched.name);
    passCount++;
  } else {
    L.push("1️⃣ 国家: ❌ 不在金融区域 (" + (results.country || "未知") + ")");
    warnings.push("IP不在金融服务区域");
  }

  // 2. 纯净度 (基于 ip-api + Blackbox)
  var purity = 100;
  if (results.blackbox) purity -= 30;
  if (results.hosting) purity -= 20;
  if (results.proxy) purity -= 20;
  var asnText = (results.as || "") + " " + (results.org || "") + " " + (results.isp || "");
  if (matchKeywords(asnText, HOSTING_KEYWORDS)) purity -= 15;
  if (purity < 0) purity = 0;

  if (purity >= 60) {
    L.push("2️⃣ 纯净度: ✅ " + purity + "%");
    passCount++;
  } else {
    L.push("2️⃣ 纯净度: ⚠️ " + purity + "% (偏低)");
    warnings.push("纯净度" + purity + "%，可能触发风控");
  }

  // 3. 延迟
  if (results.latency) {
    if (results.latency <= 500) {
      L.push("3️⃣ 延迟: ✅ " + results.latency + "ms");
      passCount++;
    } else {
      L.push("3️⃣ 延迟: ⚠️ " + results.latency + "ms");
      warnings.push("延迟偏高");
    }
  } else {
    L.push("3️⃣ 延迟: ❌ 测试失败");
  }

  // 综合
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");

  var safe = (passCount >= 2 && matched);

  if (safe && warnings.length === 0) {
    L.push("🟢 全部通过 (" + passCount + "/3)");
    L.push("✅ 可安全操作金融App");
    L.push("");
    L.push("📱 可用: " + matched.apps);
  } else if (safe) {
    L.push("🟡 基本通过 (" + passCount + "/3)");
    for (var w = 0; w < warnings.length; w++) L.push("  • " + warnings[w]);
    L.push("");
    L.push("📱 可用: " + matched.apps);
  } else {
    L.push("🔴 未通过 (" + passCount + "/3)");
    L.push("⛔ 不建议操作金融App!");
    for (var w2 = 0; w2 < warnings.length; w2++) L.push("  • " + warnings[w2]);
  }

  var msg = L.join("\n");
  var icon = safe ? (warnings.length === 0 ? "🟢" : "🟡") : "🔴";
  $notify("🏦 金融操作预检", icon + " " + passCount + "/3 | 纯净度 " + purity + "%", msg);
  $done({ title: "🏦 金融操作预检", message: msg });
}

// ── 检查 1: ip-api + Blackbox (并行) ──
var latStart = Date.now();

$task.fetch({
  url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    results.ip = d.query;
    results.country = d.country;
    results.countryCode = d.countryCode;
    results.flag = FLAGS[d.countryCode] || "🏳️";
    results.isp = d.isp;
    results.org = d.org;
    results.as = d.as;
    results.proxy = d.proxy;
    results.hosting = d.hosting;
  } catch(e) {}

  // Blackbox 检测 (快速，只返回 Y/N)
  var ip = results.ip || "";
  if (ip) {
    $task.fetch({
      url: "https://blackbox.ipinfo.app/lookup/" + ip,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(r2) {
      try { results.blackbox = (r2.body.trim() === "Y"); } catch(e) {}
      checkDone();
    }, function() { checkDone(); });
  } else {
    checkDone();
  }
}, function() { checkDone(); });

// ── 检查 2: 延迟 ──
$task.fetch({
  url: "https://cp.cloudflare.com/generate_204",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function() {
  results.latency = Date.now() - latStart;
  checkDone();
}, function() { checkDone(); });
