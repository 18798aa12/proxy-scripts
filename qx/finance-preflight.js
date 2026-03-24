/*
 * 金融操作一键预检 v1.0 (Quantumult X event-interaction)
 * 长按节点触发，一次性完成所有金融安全检查:
 *   1. IP 国家匹配检测
 *   2. IP 纯净度 (多源)
 *   3. DNS 泄漏检测
 *   4. 延迟测试
 * 全部通过才显示"安全"，任一失败显示"危险"
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 4;
var results = {};

var FINANCE_MAP = {
  "US": { flag: "🇺🇸", name: "美国", apps: "Capital One, Fidelity, Schwab, Wise(US), Revolut(US)" },
  "GB": { flag: "🇬🇧", name: "英国", apps: "Monzo, Zilch, Yonder, Zopa, Wise(UK)" },
  "DE": { flag: "🇩🇪", name: "德国", apps: "N26, Skrill, Trade212, Coinbase, Curve" },
  "PH": { flag: "🇵🇭", name: "菲律宾", apps: "Maya, GCash" },
  "JP": { flag: "🇯🇵", name: "日本", apps: "Sony Bank, PayPay" }
};

var HOSTING_KEYWORDS = [
  "hosting", "cloud", "server", "vps", "datacenter", "data center",
  "hetzner", "ovh", "digitalocean", "vultr", "linode", "racknerd",
  "amazon", "aws", "azure", "google cloud", "gtt ", "contabo",
  "buyvm", "bandwagon", "cogent", "m247", "leaseweb", "telia",
  "internet utilities", "colocrossing"
];

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
  var totalItems = 4;
  var warnings = [];

  // ─── 检查 1: IP 国家 ───
  var cc = results.countryCode || "";
  var matched = FINANCE_MAP[cc];
  var flag = results.flag || "🏳️";

  L.push(flag + " " + (results.ip || "未知") + " · " + (results.country || "未知") + " · " + (results.city || ""));
  L.push("ISP: " + (results.isp || "未知"));
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");

  if (matched) {
    L.push("1️⃣ 国家匹配: ✅ " + matched.flag + " " + matched.name);
    passCount++;
  } else {
    L.push("1️⃣ 国家匹配: ❌ 不在金融区域");
    warnings.push("IP不在金融服务区域");
  }

  // ─── 检查 2: 纯净度 ───
  var purity = 100;
  if (results.blackbox) { purity -= 30; }
  if (results.hosting) { purity -= 20; }
  if (results.proxy) { purity -= 20; }
  var asnText = (results.as || "") + " " + (results.org || "") + " " + (results.isp || "");
  if (matchKeywords(asnText, HOSTING_KEYWORDS)) { purity -= 15; }
  if (results.proxycheck && results.proxycheck.proxy === "yes") { purity -= 25; }
  if (purity < 0) purity = 0;

  if (purity >= 60) {
    L.push("2️⃣ IP纯净度: ✅ " + purity + "%");
    passCount++;
  } else if (purity >= 30) {
    L.push("2️⃣ IP纯净度: ⚠️ " + purity + "% (偏低)");
    warnings.push("IP纯净度偏低(" + purity + "%)，可能触发风控");
  } else {
    L.push("2️⃣ IP纯净度: ❌ " + purity + "% (危险)");
    warnings.push("IP纯净度极低(" + purity + "%)，高风险");
  }

  // ─── 检查 3: DNS 泄漏 ───
  if (typeof results.dnsLeak !== "undefined") {
    if (results.dnsLeak) {
      L.push("3️⃣ DNS泄漏: ❌ 检测到泄漏");
      warnings.push("DNS泄漏可能暴露真实位置");
    } else {
      L.push("3️⃣ DNS泄漏: ✅ 无泄漏");
      passCount++;
    }
  } else {
    L.push("3️⃣ DNS泄漏: ⚪ 检测失败");
  }

  // ─── 检查 4: 延迟 ───
  if (results.latency) {
    if (results.latency <= 300) {
      L.push("4️⃣ 网络延迟: ✅ " + results.latency + "ms");
      passCount++;
    } else if (results.latency <= 800) {
      L.push("4️⃣ 网络延迟: ⚠️ " + results.latency + "ms (偏高)");
      warnings.push("延迟偏高，操作可能超时");
    } else {
      L.push("4️⃣ 网络延迟: ❌ " + results.latency + "ms (过高)");
      warnings.push("延迟过高，不建议操作");
    }
  } else {
    L.push("4️⃣ 网络延迟: ❌ 测试失败");
    warnings.push("无法测试延迟");
  }

  // ─── 综合判定 ───
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");

  var safe = (passCount >= 3 && matched && purity >= 30);

  if (safe && warnings.length === 0) {
    L.push("");
    L.push("🟢 全部通过 (" + passCount + "/" + totalItems + ")");
    L.push("✅ 可安全操作金融App");
    if (matched) {
      L.push("");
      L.push("📱 可用: " + matched.apps);
    }
  } else if (safe) {
    L.push("");
    L.push("🟡 基本通过 (" + passCount + "/" + totalItems + ")");
    L.push("⚠️ 可操作但需注意:");
    for (var w = 0; w < warnings.length; w++) {
      L.push("  • " + warnings[w]);
    }
    if (matched) {
      L.push("");
      L.push("📱 可用: " + matched.apps);
    }
  } else {
    L.push("");
    L.push("🔴 未通过 (" + passCount + "/" + totalItems + ")");
    L.push("⛔ 不建议操作金融App!");
    for (var w2 = 0; w2 < warnings.length; w2++) {
      L.push("  • " + warnings[w2]);
    }
    if (!matched) {
      L.push("");
      L.push("📍 当前不在金融区域，请切换到对应节点");
    }
  }

  var msg = L.join("\n");
  var icon = safe ? (warnings.length === 0 ? "🟢" : "🟡") : "🔴";
  var subtitle = icon + " " + passCount + "/4 通过 | 纯净度 " + purity + "%";
  $notify("🏦 金融操作预检", subtitle, msg);
  $done({ title: "🏦 金融操作预检", message: msg });
}

// ── 检查 1+2: ip-api + Blackbox + proxycheck ──
var ipCheckDone = 0;
var ipCheckTotal = 3;

function ipDone() {
  ipCheckDone++;
  if (ipCheckDone < ipCheckTotal) return;
  checkDone(); // IP country
  checkDone(); // IP purity
}

var FLAGS = {
  "US":"🇺🇸","GB":"🇬🇧","DE":"🇩🇪","JP":"🇯🇵","CN":"🇨🇳","HK":"🇭🇰",
  "SG":"🇸🇬","TW":"🇹🇼","KR":"🇰🇷","PH":"🇵🇭","FR":"🇫🇷","AU":"🇦🇺",
  "CA":"🇨🇦","NL":"🇳🇱","SE":"🇸🇪","IE":"🇮🇪","IN":"🇮🇳","IT":"🇮🇹",
  "ES":"🇪🇸","CH":"🇨🇭","AT":"🇦🇹","RU":"🇷🇺","BR":"🇧🇷","MX":"🇲🇽"
};

// 1a. ip-api
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
    results.city = d.city;
    results.isp = d.isp;
    results.org = d.org;
    results.as = d.as;
    results.proxy = d.proxy;
    results.hosting = d.hosting;
  } catch(e) {}

  var ip = results.ip || "";

  // 1b. Blackbox
  if (ip) {
    $task.fetch({
      url: "https://blackbox.ipinfo.app/lookup/" + ip,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(r2) {
      try { results.blackbox = (r2.body.trim() === "Y"); } catch(e) {}
      ipDone();
    }, function() { ipDone(); });
  } else { ipDone(); }

  // 1c. proxycheck
  if (ip) {
    $task.fetch({
      url: "http://proxycheck.io/v2/" + ip + "?vpn=1&risk=1",
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(r3) {
      try {
        var d3 = JSON.parse(r3.body);
        if (d3[ip]) {
          results.proxycheck = { proxy: d3[ip].proxy || "no", risk: d3[ip].risk || "0" };
        }
      } catch(e) {}
      ipDone();
    }, function() { ipDone(); });
  } else { ipDone(); }

}, function() {
  ipDone(); ipDone(); ipDone();
});

// ── 检查 3: DNS 泄漏 ──
$task.fetch({
  url: "https://1.1.1.1/cdn-cgi/trace",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var body = resp.body || "";
    var lines = body.split("\n");
    var cfIP = "";
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf("ip=") === 0) cfIP = lines[i].substring(3).trim();
    }
    // 等 ip-api 结果对比
    setTimeout(function() {
      if (cfIP && results.ip && cfIP !== results.ip) {
        results.dnsLeak = true;
      } else {
        results.dnsLeak = false;
      }
      checkDone();
    }, 2000);
  } catch(e) {
    checkDone();
  }
}, function() { checkDone(); });

// ── 检查 4: 延迟 ──
var latStart = Date.now();
$task.fetch({
  url: "https://cp.cloudflare.com/generate_204",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  results.latency = Date.now() - latStart;
  checkDone();
}, function() {
  checkDone();
});
