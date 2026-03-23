/*
 * IP 信誉检测 v3.0 (Quantumult X event-interaction)
 * 4源聚合: ip-api + ipinfo Blackbox + proxycheck.io + ipwhois
 * 大幅提高机房/代理/VPN检测准确度 (对标 ping0.cc)
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 4;
var ipData = {};

var FLAGS = {
  "US":"🇺🇸","GB":"🇬🇧","DE":"🇩🇪","JP":"🇯🇵","CN":"🇨🇳","HK":"🇭🇰",
  "SG":"🇸🇬","TW":"🇹🇼","KR":"🇰🇷","FR":"🇫🇷","NL":"🇳🇱","AU":"🇦🇺",
  "CA":"🇨🇦","RU":"🇷🇺","PH":"🇵🇭","IN":"🇮🇳","SE":"🇸🇪","IE":"🇮🇪",
  "TR":"🇹🇷","BR":"🇧🇷","TH":"🇹🇭","VN":"🇻🇳","MY":"🇲🇾","ID":"🇮🇩",
  "IT":"🇮🇹","ES":"🇪🇸","CH":"🇨🇭","AT":"🇦🇹","PL":"🇵🇱","CZ":"🇨🇿",
  "RO":"🇷🇴","UA":"🇺🇦","FI":"🇫🇮","NO":"🇳🇴","DK":"🇩🇰","PT":"🇵🇹",
  "GR":"🇬🇷","HU":"🇭🇺","BG":"🇧🇬","HR":"🇭🇷","MX":"🇲🇽","AR":"🇦🇷",
  "CL":"🇨🇱","CO":"🇨🇴","AE":"🇦🇪","SA":"🇸🇦","IL":"🇮🇱","ZA":"🇿🇦"
};

// 已知机房/托管 ASN 关键词 (扩展列表)
var HOSTING_KEYWORDS = [
  "hosting", "cloud", "server", "vps", "data center", "datacenter",
  "colocation", "colo ", "dedicated",
  "hetzner", "ovh", "digitalocean", "vultr", "linode", "choopa",
  "amazon", "google cloud", "microsoft", "azure", "aws", "racknerd",
  "buyvm", "bandwagon", "cogent", "m247", "ponynet", "multacom",
  "psychz", "quadranet", "zenlayer", "leaseweb", "hostwind",
  "contabo", "ionos", "kamatera", "upcloud", "cherry", "scaleway",
  "aeza", "v.ps", "dmit", "greencloud", "spartanhost",
  "frantech", "hostus", "hostdare", "guang", "cloudcone", "crowncloud",
  "pacificrack", "hosthatch", "vpscheap", "extravm", "letbox",
  "colocrossing", "quadranet", "dacentec", "servermania",
  "reliablesite", "fdcservers", "steadfast", "nocix",
  "phoenixnap", "100tb", "webair", "serverhub", "datapipe",
  "gtt communications", "gtt ", "telia", "ntt ", "lumen",
  "level3", "zayo", "he.net", "hurricane electric",
  "internet utilities", "bgp.exchange"
];

var VPN_KEYWORDS = [
  "vpn", "tunnel", "wireguard", "mullvad", "nordvpn", "express",
  "surfshark", "cyberghost", "private internet", "pia", "proton",
  "hide.me", "windscribe", "torguard", "ipvanish", "astrill",
  "purevpn", "strongvpn", "hotspot shield", "zenmate"
];

// 已知机房 ASN 号码 (常见 VPS 提供商)
var HOSTING_ASNS = [
  "AS13335", "AS16509", "AS14061", "AS20473", "AS63949", "AS24940",
  "AS16276", "AS36352", "AS55720", "AS35916", "AS209", "AS174",
  "AS3356", "AS6939", "AS9009", "AS396982", "AS62567", "AS51167",
  "AS212238", "AS4785", "AS46562", "AS36007", "AS36351", "AS30083",
  "AS398101", "AS19318", "AS46844", "AS32097", "AS21859",
  "AS3257"  // GTT Communications
];

function matchKeywords(text, keywords) {
  if (!text) return false;
  var lower = text.toLowerCase();
  for (var i = 0; i < keywords.length; i++) {
    if (lower.indexOf(keywords[i]) >= 0) return true;
  }
  return false;
}

function matchASN(asText, asnList) {
  if (!asText) return false;
  var upper = asText.toUpperCase();
  for (var i = 0; i < asnList.length; i++) {
    if (upper.indexOf(asnList[i]) >= 0) return true;
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
  var riskScore = 0;
  var riskDetails = [];

  // ─── 基本信息 ───
  L.push("📍 基本信息:");
  L.push("  IP: " + (ipData.ip || "未知"));
  L.push("  国家: " + (ipData.flag || "") + " " + (ipData.country || "未知"));
  L.push("  城市: " + (ipData.city || "未知"));
  L.push("  ISP: " + (ipData.isp || "未知"));
  L.push("  ASN: " + (ipData.as || "未知"));
  L.push("  组织: " + (ipData.org || "未知"));
  L.push("━━━━━━━━━━━━━━━━━━");

  // ─── 检测结果 (4个数据源) ───
  L.push("");
  L.push("🔍 多源检测结果:");
  L.push("");

  // 计数器: 多少个源标记为代理/机房
  var proxyVotes = 0;
  var hostingVotes = 0;
  var totalSources = 0;

  // ── 数据源 1: ip-api.com ──
  L.push("  ┌─ ip-api.com ─");
  if (typeof ipData.proxy !== "undefined") {
    L.push("  │ 代理: " + (ipData.proxy ? "⚠️ 是" : "✅ 否"));
    if (ipData.proxy) proxyVotes++;
  }
  if (typeof ipData.hosting !== "undefined") {
    L.push("  │ 机房: " + (ipData.hosting ? "⚠️ 是" : "✅ 否"));
    if (ipData.hosting) hostingVotes++;
  }
  if (typeof ipData.mobile !== "undefined") {
    L.push("  │ 移动: " + (ipData.mobile ? "📱 是" : "— 否"));
  }
  totalSources++;

  // ── 数据源 2: ipinfo Blackbox ──
  L.push("  ├─ ipinfo Blackbox ─");
  if (typeof ipData.blackboxProxy !== "undefined") {
    var bbResult = ipData.blackboxProxy;
    L.push("  │ 代理/机房: " + (bbResult ? "⚠️ 是" : "✅ 否"));
    if (bbResult) {
      proxyVotes++;
      hostingVotes++;
    }
    totalSources++;
  } else {
    L.push("  │ 检测失败");
  }

  // ── 数据源 3: proxycheck.io ──
  L.push("  ├─ proxycheck.io ─");
  if (ipData.proxycheck) {
    var pc = ipData.proxycheck;
    L.push("  │ 代理: " + (pc.proxy === "yes" ? "⚠️ 是" : "✅ 否"));
    L.push("  │ 类型: " + (pc.type || "未知"));
    L.push("  │ 风险: " + (pc.risk || "0") + "/100");
    if (pc.proxy === "yes") proxyVotes++;
    if (pc.type && pc.type !== "Residential") hostingVotes++;
    totalSources++;
  } else {
    L.push("  │ 检测失败");
  }

  // ── 数据源 4: ipwhois.app ──
  L.push("  └─ ipwhois.app ─");
  if (ipData.whoisSecurity) {
    var sec = ipData.whoisSecurity;
    L.push("    VPN: " + (sec.vpn ? "⚠️ 是" : "✅ 否"));
    L.push("    Tor: " + (sec.tor ? "⚠️ 是" : "✅ 否"));
    L.push("    匿名: " + (sec.anonymous ? "⚠️ 是" : "✅ 否"));
    if (sec.vpn) proxyVotes++;
    if (sec.tor) proxyVotes += 2;
    totalSources++;
  } else {
    L.push("    检测失败");
  }

  // ─── 评分计算 (多源投票制) ───

  // 1. 代理/VPN 投票 (权重最高)
  if (proxyVotes >= 3) {
    riskScore += 45;
    riskDetails.push("多源确认代理/VPN (" + proxyVotes + "票)");
  } else if (proxyVotes >= 2) {
    riskScore += 35;
    riskDetails.push("多源疑似代理/VPN (" + proxyVotes + "票)");
  } else if (proxyVotes >= 1) {
    riskScore += 20;
    riskDetails.push("单源检测为代理 (" + proxyVotes + "票)");
  }

  // 2. 机房检测 (权重高)
  if (hostingVotes >= 3) {
    riskScore += 35;
    riskDetails.push("多源确认机房IP (" + hostingVotes + "票)");
  } else if (hostingVotes >= 2) {
    riskScore += 25;
    riskDetails.push("多源疑似机房IP (" + hostingVotes + "票)");
  } else if (hostingVotes >= 1) {
    riskScore += 15;
    riskDetails.push("单源检测为机房 (" + hostingVotes + "票)");
  }

  // 3. ASN 关键词分析 (独立于 API 结果)
  var asnText = (ipData.as || "") + " " + (ipData.org || "") + " " + (ipData.isp || "");
  var isHostingASN = matchKeywords(asnText, HOSTING_KEYWORDS);
  var isVpnASN = matchKeywords(asnText, VPN_KEYWORDS);
  var isKnownHostingASN = matchASN(ipData.as || "", HOSTING_ASNS);

  if (isHostingASN || isKnownHostingASN) {
    riskScore += 20;
    riskDetails.push("ASN属于机房/托管商");
  }
  if (isVpnASN) {
    riskScore += 15;
    riskDetails.push("ASN属于VPN服务商");
  }

  // 4. proxycheck.io 风险分 (如果有)
  if (ipData.proxycheck && ipData.proxycheck.risk) {
    var pcRisk = parseInt(ipData.proxycheck.risk) || 0;
    if (pcRisk >= 66) {
      riskScore += 15;
      riskDetails.push("proxycheck风险 " + pcRisk + "/100");
    } else if (pcRisk >= 33) {
      riskScore += 8;
    }
  }

  // 5. ipwhois 特殊标记
  if (ipData.whoisSecurity) {
    var sec2 = ipData.whoisSecurity;
    if (sec2.tor) {
      riskScore += 20;
      riskDetails.push("Tor出口节点");
    }
    if (sec2.anonymous && !sec2.vpn) {
      riskScore += 10;
      riskDetails.push("匿名代理");
    }
  }

  // 6. 住宅 IP 减分 (仅当所有源都没标记时)
  var isMajorISP = matchKeywords((ipData.isp || "").toLowerCase(), [
    "china telecom", "china unicom", "china mobile", "comcast", "verizon",
    "at&t", "bt ", "virgin media", "vodafone", "telefonica", "orange",
    "deutsche telekom", "ntt ", "softbank", "kddi", "pldt", "globe",
    "chunghwa", "hinet", "pccw", "hkt", "singtel", "starhub"
  ]);

  if (proxyVotes === 0 && hostingVotes === 0 && !isHostingASN && !isKnownHostingASN) {
    if (isMajorISP) {
      riskScore -= 15;
    } else if (ipData.mobile) {
      riskScore -= 10;
    }
  }

  // 限制范围
  if (riskScore < 0) riskScore = 0;
  if (riskScore > 100) riskScore = 100;

  // ─── 纯净度 (100 - 风险分) ───
  var purity = 100 - riskScore;

  // ─── 风险等级 ───
  var riskLevel, riskIcon, purityIcon, riskAdvice;
  if (riskScore <= 10) {
    riskLevel = "极低风险"; riskIcon = "🟢"; purityIcon = "🟢";
    riskAdvice = "IP信誉优秀，适合金融/注册等敏感操作";
  } else if (riskScore <= 25) {
    riskLevel = "低风险"; riskIcon = "🟢"; purityIcon = "🟢";
    riskAdvice = "IP质量良好，日常使用无问题";
  } else if (riskScore <= 45) {
    riskLevel = "中等风险"; riskIcon = "🟡"; purityIcon = "🟡";
    riskAdvice = "可能触发验证码，不建议用于金融App";
  } else if (riskScore <= 70) {
    riskLevel = "较高风险"; riskIcon = "🟠"; purityIcon = "🟠";
    riskAdvice = "IP信誉较差，建议更换节点";
  } else {
    riskLevel = "高风险"; riskIcon = "🔴"; purityIcon = "🔴";
    riskAdvice = "IP信誉极差，强烈建议更换";
  }

  // ─── IP 类型判定 ───
  var ipType;
  if (proxyVotes >= 2 || (proxyVotes >= 1 && isVpnASN)) {
    ipType = "🔀 VPN/代理";
  } else if (hostingVotes >= 2 || isHostingASN || isKnownHostingASN) {
    ipType = "🖥 机房/托管";
  } else if (ipData.mobile) {
    ipType = "📱 移动网络";
  } else if (isMajorISP) {
    ipType = "🏠 家宽ISP";
  } else {
    ipType = "🏢 商业/未知";
  }

  // 进度条 (风险)
  var barLen = 20;
  var filled = Math.round(riskScore / 100 * barLen);
  var bar = "";
  for (var b = 0; b < filled; b++) bar += "▓";
  for (var e2 = 0; e2 < barLen - filled; e2++) bar += "░";

  // 纯净度进度条
  var pFilled = Math.round(purity / 100 * barLen);
  var pBar = "";
  for (var p = 0; p < pFilled; p++) pBar += "▓";
  for (var q = 0; q < barLen - pFilled; q++) pBar += "░";

  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");
  L.push("📊 综合评估:");
  L.push("  IP类型: " + ipType);
  L.push("");
  L.push("  " + riskIcon + " 风险评分: " + riskScore + "/100");
  L.push("  " + bar);
  L.push("");
  L.push("  " + purityIcon + " 纯净度: " + purity + "/100");
  L.push("  " + pBar);

  if (riskDetails.length > 0) {
    L.push("");
    L.push("  ⚠️ 风险因素 (" + riskDetails.length + "):");
    for (var r = 0; r < riskDetails.length; r++) {
      L.push("    • " + riskDetails[r]);
    }
  }

  // 数据源统计
  L.push("");
  L.push("  📡 数据源: " + totalSources + "/4 成功");
  L.push("  🗳 代理投票: " + proxyVotes + " | 机房投票: " + hostingVotes);

  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("💡 " + riskAdvice);

  var msg = L.join("\n");
  var subtitle = riskIcon + " " + riskLevel + " | 纯净度 " + purity + "%";
  $notify("🛡 IP 信誉检测", subtitle, msg);
  $done({ title: "🛡 IP 信誉检测", message: msg });
}

// ── 数据源 1: ip-api.com (地理/ISP/代理/机房) ──
$task.fetch({
  url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    ipData.ip = d.query;
    ipData.country = d.country;
    ipData.countryCode = d.countryCode;
    ipData.flag = FLAGS[d.countryCode] || "🏳️";
    ipData.city = d.city || d.regionName;
    ipData.isp = d.isp;
    ipData.org = d.org;
    ipData.as = d.as;
    ipData.proxy = d.proxy;
    ipData.hosting = d.hosting;
    ipData.mobile = d.mobile;
  } catch(e) {}
  checkDone();
}, function(error) {
  checkDone();
});

// ── 数据源 2: ipinfo Blackbox (高准确度代理/机房检测) ──
// 先获取当前 IP，再用 Blackbox 查询
$task.fetch({
  url: "https://ipinfo.io/ip",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var currentIP = resp.body.trim();
    if (!ipData.ip) ipData.ip = currentIP;
    // 用获取到的 IP 查询 Blackbox
    $task.fetch({
      url: "https://blackbox.ipinfo.app/lookup/" + currentIP,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp2) {
      try {
        var result = resp2.body.trim();
        // "Y" = proxy/VPN/datacenter, "N" = clean
        ipData.blackboxProxy = (result === "Y");
      } catch(e2) {}
      checkDone();
    }, function(err2) {
      checkDone();
    });
  } catch(e) {
    checkDone();
  }
}, function(error) {
  checkDone();
});

// ── 数据源 3: proxycheck.io (风险评分 + IP类型) ──
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
          ipData.proxycheck = {
            proxy: d[ip].proxy || "no",
            type: d[ip].type || "Unknown",
            risk: d[ip].risk || "0",
            provider: d[ip].provider || ""
          };
          // 补充 ASN 信息
          if (!ipData.as && d[ip].asn) {
            ipData.as = d[ip].asn;
          }
          if (!ipData.org && d[ip].organisation) {
            ipData.org = d[ip].organisation;
          }
        }
      } catch(e2) {}
      checkDone();
    }, function(err2) {
      checkDone();
    });
  } catch(e) {
    checkDone();
  }
}, function(error) {
  checkDone();
});

// ── 数据源 4: ipwhois.app (VPN/Tor/匿名代理) ──
$task.fetch({
  url: "https://ipwhois.app/json/?objects=security,isp,org,type",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    if (d.security) {
      ipData.whoisSecurity = d.security;
    }
    if (!ipData.isp && d.isp) ipData.isp = d.isp;
    if (!ipData.org && d.org) ipData.org = d.org;
  } catch(e) {}
  checkDone();
}, function(error) {
  checkDone();
});
