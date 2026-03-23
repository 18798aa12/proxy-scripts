/*
 * IP 信誉/黑名单检测 v1.0 (Quantumult X event-interaction)
 * 多源聚合检测当前IP的信誉评分和黑名单状态
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 3;
var ipData = {};
var reputationResults = [];

function checkDone() {
  completed++;
  if (completed < totalChecks) return;
  buildReport();
}

function buildReport() {
  var msg = "━━━ 🛡 IP 信誉检测报告 ━━━\n";

  // Basic IP info
  if (ipData.ip) {
    msg += "\n📍 基本信息:\n";
    msg += "  IP: " + ipData.ip + "\n";
    msg += "  国家: " + (ipData.flag || "") + " " + (ipData.country || "未知") + "\n";
    msg += "  城市: " + (ipData.city || "未知") + "\n";
    msg += "  ISP: " + (ipData.isp || "未知") + "\n";
    msg += "  AS: " + (ipData.as || "未知") + "\n";
    msg += "  ━━━━━━━━━━━━━━━━\n";
  }

  // Reputation details
  msg += "\n🔍 检测结果:\n";

  var riskScore = 0;
  var riskFactors = 0;
  var totalFactors = 0;

  // ip-api proxy/hosting detection
  if (typeof ipData.proxy !== "undefined") {
    totalFactors += 2;
    var proxyStr = ipData.proxy ? "⚠️ 是" : "✅ 否";
    var hostingStr = ipData.hosting ? "⚠️ 是" : "✅ 否";
    msg += "  🕵 代理检测: " + proxyStr + "\n";
    msg += "  🖥 机房检测: " + hostingStr + "\n";
    if (ipData.proxy) { riskScore += 25; riskFactors++; }
    if (ipData.hosting) { riskScore += 20; riskFactors++; }
  }

  // Mobile detection
  if (typeof ipData.mobile !== "undefined") {
    totalFactors++;
    msg += "  📱 移动网络: " + (ipData.mobile ? "✅ 是" : "ℹ️ 否") + "\n";
    if (ipData.mobile) riskScore -= 10; // Mobile IPs are usually cleaner
  }

  msg += "  ━━━━━━━━━━━━━━━━\n";

  // Additional reputation results
  for (var i = 0; i < reputationResults.length; i++) {
    var r = reputationResults[i];
    msg += "\n  📋 " + r.source + ":\n";
    msg += r.detail + "\n";
    riskScore += r.riskAdd;
    totalFactors += r.factorCount;
    riskFactors += r.riskFactorCount;
  }

  // Overall risk assessment
  msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
  msg += "📊 综合评估:\n";

  // Clamp score
  if (riskScore < 0) riskScore = 0;
  if (riskScore > 100) riskScore = 100;

  var riskLevel, riskIcon, riskAdvice;
  if (riskScore <= 10) {
    riskLevel = "极低风险";
    riskIcon = "🟢";
    riskAdvice = "IP信誉良好，适合各类服务";
  } else if (riskScore <= 30) {
    riskLevel = "低风险";
    riskIcon = "🟢";
    riskAdvice = "IP基本正常，少数服务可能触发验证";
  } else if (riskScore <= 50) {
    riskLevel = "中等风险";
    riskIcon = "🟡";
    riskAdvice = "可能触发人机验证，建议关注";
  } else if (riskScore <= 75) {
    riskLevel = "较高风险";
    riskIcon = "🟠";
    riskAdvice = "建议更换节点或IP";
  } else {
    riskLevel = "高风险";
    riskIcon = "🔴";
    riskAdvice = "IP信誉极差，强烈建议更换";
  }

  msg += "  " + riskIcon + " 风险等级: " + riskLevel + "\n";
  msg += "  📈 风险分数: " + riskScore + "/100\n";
  msg += "  🏷 风险因素: " + riskFactors + "/" + totalFactors + "\n";
  msg += "  ━━━━━━━━━━━━━━━━\n";
  msg += "  💡 " + riskAdvice;

  var subtitle = (ipData.ip || "检测完成") + " · " + riskIcon + " " + riskLevel;

  $notify("🛡 IP 信誉检测", subtitle, msg);
  $done({"title": "🛡 IP 信誉检测", "message": msg});
}

var FLAGS = {
  "US":"🇺🇸","GB":"🇬🇧","DE":"🇩🇪","JP":"🇯🇵","CN":"🇨🇳","HK":"🇭🇰",
  "SG":"🇸🇬","TW":"🇹🇼","KR":"🇰🇷","FR":"🇫🇷","NL":"🇳🇱","AU":"🇦🇺",
  "CA":"🇨🇦","RU":"🇷🇺","PH":"🇵🇭","IN":"🇮🇳","SE":"🇸🇪","IE":"🇮🇪"
};

// Check 1: ip-api.com (proxy, hosting, mobile detection)
$task.fetch({
  url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(
  function(resp) {
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
  },
  function(error) {
    checkDone();
  }
);

// Check 2: ipwhois.app (additional ISP and abuse info)
$task.fetch({
  url: "https://ipwhois.app/json/?lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(
  function(resp) {
    try {
      var d = JSON.parse(resp.body);
      var detail = "";
      var riskAdd = 0;
      var riskFC = 0;
      var factorC = 0;

      if (!ipData.ip && d.ip) ipData.ip = d.ip;

      // Check security fields if available
      if (d.security) {
        factorC += 3;
        var sec = d.security;
        detail += "    VPN: " + (sec.vpn ? "⚠️ 是" : "✅ 否") + "\n";
        detail += "    Tor: " + (sec.tor ? "⚠️ 是" : "✅ 否") + "\n";
        detail += "    匿名代理: " + (sec.anonymous ? "⚠️ 是" : "✅ 否") + "\n";
        if (sec.vpn) { riskAdd += 15; riskFC++; }
        if (sec.tor) { riskAdd += 30; riskFC++; }
        if (sec.anonymous) { riskAdd += 20; riskFC++; }
      } else {
        detail += "    ISP: " + (d.isp || "N/A") + "\n";
        detail += "    类型: " + (d.type || "N/A") + "\n";
      }

      reputationResults.push({
        source: "ipwhois.app",
        detail: detail,
        riskAdd: riskAdd,
        factorCount: factorC,
        riskFactorCount: riskFC
      });
    } catch(e) {
      reputationResults.push({
        source: "ipwhois.app",
        detail: "    ❌ 解析失败\n",
        riskAdd: 0, factorCount: 0, riskFactorCount: 0
      });
    }
    checkDone();
  },
  function(error) {
    reputationResults.push({
      source: "ipwhois.app",
      detail: "    ❌ 请求失败\n",
      riskAdd: 0, factorCount: 0, riskFactorCount: 0
    });
    checkDone();
  }
);

// Check 3: ipapi.co (abuse/threat detection, ASN info)
$task.fetch({
  url: "https://ipapi.co/json/",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(
  function(resp) {
    try {
      var d = JSON.parse(resp.body);
      var detail = "";
      var riskAdd = 0;
      var riskFC = 0;
      var factorC = 1;

      detail += "    ASN: " + (d.asn || "N/A") + "\n";
      detail += "    组织: " + (d.org || "N/A") + "\n";
      detail += "    网络: " + (d.network || "N/A") + "\n";

      // Check if known hosting providers
      var orgLower = (d.org || "").toLowerCase();
      var hostingKeywords = ["hosting", "cloud", "server", "vps", "data center",
        "datacenter", "hetzner", "ovh", "digitalocean", "vultr", "linode",
        "amazon", "google", "microsoft", "azure", "aws", "racknerd", "buyvm"];
      var isHosting = false;
      for (var h = 0; h < hostingKeywords.length; h++) {
        if (orgLower.indexOf(hostingKeywords[h]) >= 0) {
          isHosting = true;
          break;
        }
      }
      detail += "    机房特征: " + (isHosting ? "⚠️ 疑似机房" : "✅ 未检测到") + "\n";
      if (isHosting) { riskAdd += 15; riskFC++; }

      reputationResults.push({
        source: "ipapi.co",
        detail: detail,
        riskAdd: riskAdd,
        factorCount: factorC,
        riskFactorCount: riskFC
      });
    } catch(e) {
      reputationResults.push({
        source: "ipapi.co",
        detail: "    ❌ 解析失败\n",
        riskAdd: 0, factorCount: 0, riskFactorCount: 0
      });
    }
    checkDone();
  },
  function(error) {
    reputationResults.push({
      source: "ipapi.co",
      detail: "    ❌ 请求失败\n",
      riskAdd: 0, factorCount: 0, riskFactorCount: 0
    });
    checkDone();
  }
);
