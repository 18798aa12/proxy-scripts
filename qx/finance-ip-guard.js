/*
 * 金融 App IP 安全检查 v2.0 (Quantumult X event-interaction)
 * 长按节点触发，检测出口 IP 是否匹配期望金融区域
 * v2.0: 增加 ipinfo Blackbox + proxycheck.io 多源纯净度检测
 * 兼容 QX 1.5.5-899
 */

// ══════ 自定义区域 ══════
// 修改为你的金融服务区域、节点名和 App 列表
var FINANCE_MAP = {
  "US": {
    flag: "🇺🇸",
    name: "美国金融",
    group: "美国金融",
    node: "your-us-node",
    apps: "Capital One, Fidelity, Schwab, Wise(US), Revolut(US)"
  },
  "GB": {
    flag: "🇬🇧",
    name: "英国金融",
    group: "英国金融",
    node: "your-uk-node",
    apps: "Monzo, Zilch, Revolut(UK), Wise(UK)"
  },
  "DE": {
    flag: "🇩🇪",
    name: "德国金融",
    group: "德国金融",
    node: "your-de-node",
    apps: "N26, Trade Republic, Coinbase"
  },
  "PH": {
    flag: "🇵🇭",
    name: "菲律宾金融",
    group: "菲律宾金融",
    node: "your-ph-node",
    apps: "Maya, GCash"
  },
  "JP": {
    flag: "🇯🇵",
    name: "日本金融",
    group: "日本金融",
    node: "your-jp-node",
    apps: "Sony Bank, PayPay"
  }
};

var FLAGS = {"AE":"🇦🇪","AR":"🇦🇷","AT":"🇦🇹","AU":"🇦🇺","BD":"🇧🇩","BE":"🇧🇪","BG":"🇧🇬","BR":"🇧🇷","CA":"🇨🇦","CH":"🇨🇭","CL":"🇨🇱","CN":"🇨🇳","CO":"🇨🇴","CZ":"🇨🇿","DE":"🇩🇪","DK":"🇩🇰","EG":"🇪🇬","ES":"🇪🇸","FI":"🇫🇮","FR":"🇫🇷","GB":"🇬🇧","GR":"🇬🇷","HK":"🇭🇰","HR":"🇭🇷","HU":"🇭🇺","ID":"🇮🇩","IE":"🇮🇪","IL":"🇮🇱","IN":"🇮🇳","IS":"🇮🇸","IT":"🇮🇹","JP":"🇯🇵","KR":"🇰🇷","KZ":"🇰🇿","MO":"🇲🇴","MX":"🇲🇽","MY":"🇲🇾","NL":"🇳🇱","NO":"🇳🇴","NZ":"🇳🇿","PH":"🇵🇭","PK":"🇵🇰","PL":"🇵🇱","PT":"🇵🇹","RO":"🇷🇴","RU":"🇷🇺","SA":"🇸🇦","SE":"🇸🇪","SG":"🇸🇬","TH":"🇹🇭","TR":"🇹🇷","TW":"🇹🇼","UA":"🇺🇦","US":"🇺🇸","VN":"🇻🇳","ZA":"🇿🇦"};

var HOSTING_KEYWORDS = [
  "hosting", "cloud", "server", "vps", "data center", "datacenter",
  "colocation", "dedicated",
  "hetzner", "ovh", "digitalocean", "vultr", "linode", "choopa",
  "amazon", "google cloud", "microsoft", "azure", "aws", "racknerd",
  "buyvm", "bandwagon", "cogent", "m247", "multacom", "contabo",
  "gtt communications", "gtt ", "internet utilities", "telia"
];

function matchKeywords(text, keywords) {
  if (!text) return false;
  var lower = text.toLowerCase();
  for (var i = 0; i < keywords.length; i++) {
    if (lower.indexOf(keywords[i]) >= 0) return true;
  }
  return false;
}

var purityChecks = 0;
var purityTotal = 2;
var purityData = {};
var geoInfo = null;

function purityDone() {
  purityChecks++;
  if (purityChecks < purityTotal) return;
  buildOutput();
}

function buildOutput() {
  var info = geoInfo;
  if (!info) {
    $notify("🏦 金融IP安全检查", "检测失败", "❌ 无法获取IP信息");
    $done({ title: "🏦 金融IP安全检查", message: "❌ 无法获取IP信息" });
    return;
  }

  var cc = info.countryCode;
  var flag = FLAGS[cc] || "🏳️";

  // 多源纯净度评估
  var purityScore = 100;
  var purityFlags = [];

  // ip-api 检测
  if (info.hosting) { purityScore -= 20; purityFlags.push("ip-api: 机房IP"); }
  if (info.proxy) { purityScore -= 20; purityFlags.push("ip-api: 代理IP"); }

  // ipinfo Blackbox 检测
  if (typeof purityData.blackbox !== "undefined") {
    if (purityData.blackbox) {
      purityScore -= 25;
      purityFlags.push("ipinfo: 代理/机房");
    }
  }

  // proxycheck.io 检测
  if (purityData.proxycheck) {
    var pc = purityData.proxycheck;
    if (pc.proxy === "yes") { purityScore -= 20; purityFlags.push("proxycheck: 代理(" + (pc.type || "?") + ")"); }
    else if (pc.type && pc.type !== "Residential") { purityScore -= 10; purityFlags.push("proxycheck: " + pc.type); }
    var pcRisk = parseInt(pc.risk) || 0;
    if (pcRisk >= 50) { purityScore -= 10; purityFlags.push("风险分 " + pcRisk); }
  }

  // ASN 关键词
  var asnText = (info.as || "") + " " + (info.org || "") + " " + (info.isp || "");
  if (matchKeywords(asnText, HOSTING_KEYWORDS)) {
    purityScore -= 15;
    purityFlags.push("ASN: 机房/托管商");
  }

  if (purityScore < 0) purityScore = 0;

  // 纯净度等级
  var purityLevel, purityIcon;
  if (purityScore >= 80) { purityLevel = "极高"; purityIcon = "🟢"; }
  else if (purityScore >= 60) { purityLevel = "较高"; purityIcon = "🟢"; }
  else if (purityScore >= 40) { purityLevel = "中等"; purityIcon = "🟡"; }
  else if (purityScore >= 20) { purityLevel = "较低"; purityIcon = "🟠"; }
  else { purityLevel = "极低"; purityIcon = "🔴"; }

  // IP 类型判定
  var ipType;
  if (purityScore <= 30) {
    ipType = "🖥️ 机房/代理IP";
  } else if (purityScore <= 50) {
    ipType = "🏢 商业IP";
  } else if (info.mobile) {
    ipType = "📱 移动网络";
  } else {
    ipType = "🏠 家宽ISP";
  }

  var matched = FINANCE_MAP[cc];
  var L = [];

  L.push(flag + " 出口 IP: " + info.query);
  L.push("📍 " + info.country + " · " + (info.city || info.regionName));
  L.push("🏢 " + info.isp);
  L.push("🏷 " + ipType);
  L.push("");

  // 纯净度进度条
  var barLen = 15;
  var filled = Math.round(purityScore / 100 * barLen);
  var bar = "";
  for (var b = 0; b < filled; b++) bar += "▓";
  for (var e = 0; e < barLen - filled; e++) bar += "░";
  L.push("🛡 纯净度: " + purityIcon + " " + purityLevel + " " + purityScore + "%");
  L.push("  " + bar);
  if (purityFlags.length > 0) {
    for (var pf = 0; pf < purityFlags.length; pf++) {
      L.push("  • " + purityFlags[pf]);
    }
  }
  L.push("━━━━━━━━━━━━━━━━━━━━");

  if (matched) {
    L.push("");
    L.push("✅ 当前IP在 " + matched.flag + " " + matched.name + " 区域");
    L.push("");
    L.push("📱 可安全使用:");
    var apps = matched.apps.split(", ");
    for (var i = 0; i < apps.length; i++) {
      L.push("  ✅ " + apps[i]);
    }

    // 纯净度低于40时警告
    if (purityScore < 40) {
      L.push("");
      L.push("━━━━━━━━━━━━━━━━━━━━");
      L.push("⚠️ IP纯净度较低 (" + purityScore + "%)");
      L.push("💡 金融App对IP纯净度敏感");
      L.push("   建议使用家宽/ISP节点降低风控");
    } else if (purityScore < 60) {
      L.push("");
      L.push("━━━━━━━━━━━━━━━━━━━━");
      L.push("⚠️ IP纯净度中等 (" + purityScore + "%)");
      L.push("💡 谨慎操作，大额转账建议换更纯净节点");
    }

    L.push("");
    L.push("━━━━━━━━━━━━━━━━━━━━");
    L.push("⛔ 以下金融App请勿在当前IP使用:");
    var keys = Object.keys(FINANCE_MAP);
    for (var j = 0; j < keys.length; j++) {
      if (keys[j] !== cc) {
        var other = FINANCE_MAP[keys[j]];
        L.push("  " + other.flag + " " + other.apps);
      }
    }

    var title = "✅ " + matched.name + " | 纯净度 " + purityIcon + purityScore + "%";
    $notify("🏦 金融IP安全检查", title, L.join("\n"));
    $done({ title: "🏦 金融IP安全检查", message: L.join("\n") });

  } else {
    L.push("");
    L.push("⛔ 当前IP不在任何金融服务区域!");
    L.push("   当前位于: " + flag + " " + info.country);
    L.push("");
    L.push("━━━ 请长按对应金融节点再触发 ━━━");
    L.push("");

    var keys2 = Object.keys(FINANCE_MAP);
    for (var k = 0; k < keys2.length; k++) {
      var f = FINANCE_MAP[keys2[k]];
      L.push(f.flag + " " + f.apps);
      L.push("  → 长按【" + f.node + "】节点");
      L.push("");
    }

    L.push("━━━━━━━━━━━━━━━━━━━━");
    L.push("💡 长按金融区域节点触发可检测该节点出口IP");

    $notify("🏦 金融IP安全检查", "⛔ 非金融区域", L.join("\n"));
    $done({ title: "🏦 金融IP安全检查", message: L.join("\n") });
  }
}

// ── Step 1: ip-api.com (基础地理 + 代理检测) ──
$task.fetch({
  url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    geoInfo = JSON.parse(resp.body);
  } catch(e) {}

  // 获得 IP 后，并行发起纯净度检测
  var ip = geoInfo ? geoInfo.query : "";

  // ── 纯净度源 1: ipinfo Blackbox ──
  if (ip) {
    $task.fetch({
      url: "https://blackbox.ipinfo.app/lookup/" + ip,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp2) {
      try {
        purityData.blackbox = (resp2.body.trim() === "Y");
      } catch(e) {}
      purityDone();
    }, function(err) {
      purityDone();
    });
  } else {
    purityDone();
  }

  // ── 纯净度源 2: proxycheck.io ──
  if (ip) {
    $task.fetch({
      url: "http://proxycheck.io/v2/" + ip + "?vpn=1&asn=1&risk=1",
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp3) {
      try {
        var d = JSON.parse(resp3.body);
        if (d[ip]) {
          purityData.proxycheck = {
            proxy: d[ip].proxy || "no",
            type: d[ip].type || "Unknown",
            risk: d[ip].risk || "0"
          };
        }
      } catch(e) {}
      purityDone();
    }, function(err) {
      purityDone();
    });
  } else {
    purityDone();
  }

}, function(error) {
  $notify("🏦 金融IP安全检查", "检测失败", "网络错误: " + error);
  $done({ title: "🏦 金融IP安全检查", message: "❌ 网络错误，请检查连接" });
});
