/*
 * 节点综合体检 v1.0 (Quantumult X event-interaction)
 * 长按任意节点触发，一次性检测:
 *   1. 延迟测速 (多目标)
 *   2. 下载速度测试
 *   3. 丢包率检测
 *   4. IP 纯净度/信誉 (多源检测)
 *   5. DNS 泄漏检测
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 5;
var report = {};

var FLAGS = {
  "US":"🇺🇸","GB":"🇬🇧","DE":"🇩🇪","JP":"🇯🇵","CN":"🇨🇳","HK":"🇭🇰",
  "SG":"🇸🇬","TW":"🇹🇼","KR":"🇰🇷","FR":"🇫🇷","NL":"🇳🇱","AU":"🇦🇺",
  "CA":"🇨🇦","RU":"🇷🇺","PH":"🇵🇭","IN":"🇮🇳","SE":"🇸🇪","IE":"🇮🇪",
  "TR":"🇹🇷","BR":"🇧🇷","TH":"🇹🇭","VN":"🇻🇳","MY":"🇲🇾","ID":"🇮🇩",
  "IT":"🇮🇹","ES":"🇪🇸","CH":"🇨🇭","AT":"🇦🇹","DE":"🇩🇪","NZ":"🇳🇿"
};

// 已知机房 ASN 关键词
var HOSTING_KEYWORDS = [
  "hosting", "cloud", "server", "vps", "data center", "datacenter",
  "colocation", "dedicated",
  "hetzner", "ovh", "digitalocean", "vultr", "linode", "choopa",
  "amazon", "google cloud", "microsoft", "azure", "aws", "racknerd",
  "buyvm", "bandwagon", "cogent", "m247", "ponynet", "multacom",
  "psychz", "quadranet", "zenlayer", "leaseweb", "hostwind",
  "contabo", "ionos", "kamatera", "upcloud", "cherry", "scaleway",
  "aeza", "dmit", "greencloud", "spartanhost", "frantech",
  "colocrossing", "nocix", "gtt communications", "gtt ",
  "internet utilities", "bgp.exchange", "telia"
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
  buildFullReport();
}

function buildFullReport() {
  var L = [];
  var grades = [];

  // ─── 标题 ───
  var flag = FLAGS[report.countryCode] || "🏳️";
  L.push(flag + " 节点综合体检报告");
  L.push("IP: " + (report.ip || "未知"));
  L.push("位置: " + (report.country || "未知") + " · " + (report.city || "未知"));
  L.push("ISP: " + (report.isp || "未知"));
  L.push("ASN: " + (report.as || "未知"));
  L.push("━━━━━━━━━━━━━━━━━━");

  // ─── 1. 延迟测试 ───
  L.push("");
  L.push("⏱ 延迟测试:");
  if (report.latency && report.latency.length > 0) {
    var latSum = 0;
    var latCount = 0;
    var latMin = 99999;
    var latMax = 0;
    for (var i = 0; i < report.latency.length; i++) {
      var item = report.latency[i];
      if (item.ok) {
        L.push("  " + item.name + ": " + item.ms + "ms");
        latSum += item.ms;
        latCount++;
        if (item.ms < latMin) latMin = item.ms;
        if (item.ms > latMax) latMax = item.ms;
      } else {
        L.push("  " + item.name + ": ❌ " + item.error);
      }
    }
    if (latCount > 0) {
      var latAvg = Math.round(latSum / latCount);
      L.push("  ─────");
      L.push("  平均: " + latAvg + "ms | 最低: " + latMin + "ms | 最高: " + latMax + "ms");

      if (latAvg <= 100) grades.push({ name: "延迟", score: "A", icon: "🟢" });
      else if (latAvg <= 200) grades.push({ name: "延迟", score: "B", icon: "🟢" });
      else if (latAvg <= 400) grades.push({ name: "延迟", score: "C", icon: "🟡" });
      else if (latAvg <= 800) grades.push({ name: "延迟", score: "D", icon: "🟠" });
      else grades.push({ name: "延迟", score: "F", icon: "🔴" });
    } else {
      grades.push({ name: "延迟", score: "F", icon: "🔴" });
    }
  } else {
    L.push("  ❌ 测试失败");
    grades.push({ name: "延迟", score: "F", icon: "🔴" });
  }

  // ─── 2. 下载速度 ───
  L.push("");
  L.push("📥 下载速度:");
  if (report.speed) {
    L.push("  文件: " + report.speed.size);
    L.push("  耗时: " + report.speed.time + "s");
    L.push("  速度: " + report.speed.mbps + " Mbps");

    var mbps = parseFloat(report.speed.mbps);
    if (mbps >= 50) grades.push({ name: "速度", score: "A", icon: "🟢" });
    else if (mbps >= 20) grades.push({ name: "速度", score: "B", icon: "🟢" });
    else if (mbps >= 5) grades.push({ name: "速度", score: "C", icon: "🟡" });
    else if (mbps >= 1) grades.push({ name: "速度", score: "D", icon: "🟠" });
    else grades.push({ name: "速度", score: "F", icon: "🔴" });
  } else {
    L.push("  ❌ " + (report.speedError || "测试失败"));
    grades.push({ name: "速度", score: "?", icon: "⚪" });
  }

  // ─── 3. 丢包率 ───
  L.push("");
  L.push("📶 丢包率:");
  if (typeof report.packetLoss !== "undefined") {
    var sent = report.packetSent || 0;
    var lost = report.packetLost || 0;
    var lossRate = sent > 0 ? Math.round(lost / sent * 100) : 0;
    L.push("  发送: " + sent + " | 丢失: " + lost + " | 丢包率: " + lossRate + "%");

    if (lossRate === 0) grades.push({ name: "丢包", score: "A", icon: "🟢" });
    else if (lossRate <= 5) grades.push({ name: "丢包", score: "B", icon: "🟢" });
    else if (lossRate <= 15) grades.push({ name: "丢包", score: "C", icon: "🟡" });
    else if (lossRate <= 30) grades.push({ name: "丢包", score: "D", icon: "🟠" });
    else grades.push({ name: "丢包", score: "F", icon: "🔴" });
  } else {
    L.push("  ❌ 测试失败");
    grades.push({ name: "丢包", score: "?", icon: "⚪" });
  }

  // ─── 4. IP 纯净度 ───
  L.push("");
  L.push("🛡 IP 纯净度:");
  var purityScore = 100;
  var purityFlags = [];

  // Blackbox 检测
  if (typeof report.blackboxProxy !== "undefined") {
    L.push("  ipinfo检测: " + (report.blackboxProxy ? "⚠️ 代理/机房" : "✅ 干净"));
    if (report.blackboxProxy) { purityScore -= 30; purityFlags.push("ipinfo标记为代理/机房"); }
  }

  // proxycheck.io
  if (report.proxycheck) {
    var pc = report.proxycheck;
    L.push("  proxycheck: " + (pc.proxy === "yes" ? "⚠️ " : "✅ ") + (pc.type || "未知") + " (风险" + (pc.risk || "0") + ")");
    if (pc.proxy === "yes") { purityScore -= 25; purityFlags.push("proxycheck标记代理"); }
    if (pc.type && pc.type !== "Residential") { purityScore -= 15; purityFlags.push("非住宅IP(" + pc.type + ")"); }
    var pcRisk = parseInt(pc.risk) || 0;
    if (pcRisk >= 50) { purityScore -= 10; purityFlags.push("风险分" + pcRisk); }
  }

  // ip-api 检测
  if (report.hosting) {
    L.push("  ip-api机房: ⚠️ 是");
    purityScore -= 15;
    purityFlags.push("ip-api机房标记");
  }
  if (report.proxy) {
    L.push("  ip-api代理: ⚠️ 是");
    purityScore -= 15;
    purityFlags.push("ip-api代理标记");
  }

  // ASN 分析
  var asnText = (report.as || "") + " " + (report.org || "") + " " + (report.isp || "");
  if (matchKeywords(asnText, HOSTING_KEYWORDS)) {
    L.push("  ASN分析: ⚠️ 机房/托管商ASN");
    purityScore -= 15;
    purityFlags.push("ASN属于机房");
  } else {
    L.push("  ASN分析: ✅ 非机房ASN");
  }

  if (purityScore < 0) purityScore = 0;

  var pBarLen = 20;
  var pFilled = Math.round(purityScore / 100 * pBarLen);
  var pBar = "";
  for (var pb = 0; pb < pFilled; pb++) pBar += "▓";
  for (var pe = 0; pe < pBarLen - pFilled; pe++) pBar += "░";
  L.push("  纯净度: " + purityScore + "/100 " + pBar);

  if (purityFlags.length > 0) {
    for (var pf = 0; pf < purityFlags.length; pf++) {
      L.push("    • " + purityFlags[pf]);
    }
  }

  if (purityScore >= 80) grades.push({ name: "纯净", score: "A", icon: "🟢" });
  else if (purityScore >= 60) grades.push({ name: "纯净", score: "B", icon: "🟢" });
  else if (purityScore >= 40) grades.push({ name: "纯净", score: "C", icon: "🟡" });
  else if (purityScore >= 20) grades.push({ name: "纯净", score: "D", icon: "🟠" });
  else grades.push({ name: "纯净", score: "F", icon: "🔴" });

  // ─── 5. DNS 泄漏 ───
  L.push("");
  L.push("🌐 DNS 泄漏:");
  if (report.dnsLeak) {
    if (report.dnsLeak.leaked) {
      L.push("  ⚠️ 检测到DNS泄漏!");
      L.push("  泄漏DNS: " + report.dnsLeak.server);
      grades.push({ name: "DNS", score: "F", icon: "🔴" });
    } else {
      L.push("  ✅ 未检测到DNS泄漏");
      L.push("  DNS服务器: " + (report.dnsLeak.server || "未知"));
      grades.push({ name: "DNS", score: "A", icon: "🟢" });
    }
  } else {
    L.push("  ❌ 检测失败");
    grades.push({ name: "DNS", score: "?", icon: "⚪" });
  }

  // ─── 综合评分 ───
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");
  L.push("📊 综合评分:");
  L.push("");

  var totalScore = 0;
  var scoreCount = 0;
  var scoreMap = { "A": 5, "B": 4, "C": 3, "D": 2, "F": 1 };

  for (var g = 0; g < grades.length; g++) {
    var gr = grades[g];
    L.push("  " + gr.icon + " " + gr.name + ": " + gr.score);
    if (scoreMap[gr.score]) {
      totalScore += scoreMap[gr.score];
      scoreCount++;
    }
  }

  var overallAvg = scoreCount > 0 ? (totalScore / scoreCount) : 0;
  var overallGrade, overallIcon, overallAdvice;
  if (overallAvg >= 4.5) {
    overallGrade = "A"; overallIcon = "🟢";
    overallAdvice = "节点状态极佳，适合所有场景";
  } else if (overallAvg >= 3.5) {
    overallGrade = "B"; overallIcon = "🟢";
    overallAdvice = "节点状态良好，日常使用优秀";
  } else if (overallAvg >= 2.5) {
    overallGrade = "C"; overallIcon = "🟡";
    overallAdvice = "节点状态一般，可考虑更换";
  } else if (overallAvg >= 1.5) {
    overallGrade = "D"; overallIcon = "🟠";
    overallAdvice = "节点状态较差，建议更换";
  } else {
    overallGrade = "F"; overallIcon = "🔴";
    overallAdvice = "节点状态极差，强烈建议更换";
  }

  L.push("");
  L.push("  " + overallIcon + " 综合评级: " + overallGrade);
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("💡 " + overallAdvice);

  var msg = L.join("\n");
  var subtitle = overallIcon + " 综合 " + overallGrade + " | 纯净度 " + purityScore + "%";
  $notify("🔬 节点综合体检", subtitle, msg);
  $done({ title: "🔬 节点综合体检", message: msg });
}

// ════════════════════════════════════
// 测试 1: 延迟测试 (多目标)
// ════════════════════════════════════
var latencyTargets = [
  { name: "Google", url: "https://www.google.com/generate_204" },
  { name: "Cloudflare", url: "https://cp.cloudflare.com/generate_204" },
  { name: "Apple", url: "https://captive.apple.com/hotspot-detect.html" },
  { name: "GitHub", url: "https://github.com" }
];

var latResults = [];
var latDone = 0;

function latencyCheckDone() {
  latDone++;
  if (latDone < latencyTargets.length) return;
  report.latency = latResults;
  checkDone();
}

for (var lt = 0; lt < latencyTargets.length; lt++) {
  (function(target) {
    var start = Date.now();
    $task.fetch({
      url: target.url,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp) {
      var ms = Date.now() - start;
      latResults.push({ name: target.name, ok: true, ms: ms });
      latencyCheckDone();
    }, function(error) {
      latResults.push({ name: target.name, ok: false, error: "超时/失败" });
      latencyCheckDone();
    });
  })(latencyTargets[lt]);
}

// ════════════════════════════════════
// 测试 2: 下载速度测试
// ════════════════════════════════════
var speedStart = Date.now();
$task.fetch({
  url: "https://speed.cloudflare.com/__down?bytes=1048576",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  var elapsed = (Date.now() - speedStart) / 1000;
  var bytes = 1048576; // 1MB
  var mbps = ((bytes * 8) / elapsed / 1000000).toFixed(2);
  report.speed = {
    size: "1 MB",
    time: elapsed.toFixed(2),
    mbps: mbps
  };
  checkDone();
}, function(error) {
  report.speedError = "下载失败";
  checkDone();
});

// ════════════════════════════════════
// 测试 3: 丢包率 (通过多次快速请求)
// ════════════════════════════════════
var packetTotal = 10;
var packetOk = 0;
var packetDoneCount = 0;

function packetCheckDone() {
  packetDoneCount++;
  if (packetDoneCount < packetTotal) return;
  report.packetSent = packetTotal;
  report.packetLost = packetTotal - packetOk;
  report.packetLoss = Math.round((packetTotal - packetOk) / packetTotal * 100);
  checkDone();
}

for (var pk = 0; pk < packetTotal; pk++) {
  (function(idx) {
    $task.fetch({
      url: "https://cp.cloudflare.com/generate_204?t=" + Date.now() + "_" + idx,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp) {
      if (resp.statusCode >= 200 && resp.statusCode < 400) {
        packetOk++;
      }
      packetCheckDone();
    }, function(error) {
      packetCheckDone();
    });
  })(pk);
}

// ════════════════════════════════════
// 测试 4: IP 纯净度 (多源检测)
// ════════════════════════════════════
var ipCheckDone2 = 0;
var ipCheckTotal = 3; // ip-api + blackbox + proxycheck

function ipCheckComplete() {
  ipCheckDone2++;
  if (ipCheckDone2 < ipCheckTotal) return;
  checkDone();
}

// 4a. ip-api.com
$task.fetch({
  url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    report.ip = d.query;
    report.country = d.country;
    report.countryCode = d.countryCode;
    report.city = d.city || d.regionName;
    report.isp = d.isp;
    report.org = d.org;
    report.as = d.as;
    report.proxy = d.proxy;
    report.hosting = d.hosting;
    report.mobile = d.mobile;
  } catch(e) {}
  ipCheckComplete();
}, function(error) {
  ipCheckComplete();
});

// 4b. ipinfo Blackbox
$task.fetch({
  url: "https://ipinfo.io/ip",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var ip = resp.body.trim();
    if (!report.ip) report.ip = ip;
    $task.fetch({
      url: "https://blackbox.ipinfo.app/lookup/" + ip,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp2) {
      try {
        report.blackboxProxy = (resp2.body.trim() === "Y");
      } catch(e) {}
      ipCheckComplete();
    }, function(err) {
      ipCheckComplete();
    });
  } catch(e) {
    ipCheckComplete();
  }
}, function(error) {
  ipCheckComplete();
});

// 4c. proxycheck.io
$task.fetch({
  url: "https://ipinfo.io/ip",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var ip = resp.body.trim();
    $task.fetch({
      url: "http://proxycheck.io/v2/" + ip + "?vpn=1&asn=1&risk=1",
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp2) {
      try {
        var d = JSON.parse(resp2.body);
        if (d[ip]) {
          report.proxycheck = {
            proxy: d[ip].proxy || "no",
            type: d[ip].type || "Unknown",
            risk: d[ip].risk || "0"
          };
          if (!report.as && d[ip].asn) report.as = d[ip].asn;
          if (!report.org && d[ip].organisation) report.org = d[ip].organisation;
        }
      } catch(e) {}
      ipCheckComplete();
    }, function(err) {
      ipCheckComplete();
    });
  } catch(e) {
    ipCheckComplete();
  }
}, function(error) {
  ipCheckComplete();
});

// ════════════════════════════════════
// 测试 5: DNS 泄漏检测
// ════════════════════════════════════
var dnsId = Math.random().toString(36).substring(2, 10);
$task.fetch({
  url: "https://1.1.1.1/cdn-cgi/trace",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var body = resp.body || "";
    var lines = body.split("\n");
    var dnsServer = "";
    var clientIP = "";
    for (var dl = 0; dl < lines.length; dl++) {
      if (lines[dl].indexOf("ip=") === 0) {
        clientIP = lines[dl].substring(3);
      }
    }
    // 对比 Cloudflare 看到的 IP 和 ip-api 返回的 IP
    // 如果不同，可能存在 DNS 泄漏或路由问题
    if (clientIP && report.ip && clientIP.trim() !== report.ip.trim()) {
      report.dnsLeak = {
        leaked: true,
        server: "IP不一致: CF=" + clientIP.trim() + " vs API=" + report.ip
      };
    } else {
      report.dnsLeak = {
        leaked: false,
        server: clientIP.trim() || "Cloudflare CDN"
      };
    }
  } catch(e) {
    report.dnsLeak = null;
  }
  checkDone();
}, function(error) {
  report.dnsLeak = null;
  checkDone();
});
