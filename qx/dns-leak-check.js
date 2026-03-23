/*
 * DNS 泄露检测 v1.0 (Quantumult X event-interaction)
 * 检测 DNS 解析服务器位置，判断是否存在 DNS 泄露
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalTests = 3;
var dnsResults = [];

var TEST_ENDPOINTS = [
  {
    name: "IP-API",
    url: "http://ip-api.com/json/?fields=query,country,countryCode,city,isp,org,as",
    parse: function(body) {
      var d = JSON.parse(body);
      return { ip: d.query, country: d.country, cc: d.countryCode, city: d.city || "", isp: d.isp, org: d.org };
    }
  },
  {
    name: "ipinfo.io",
    url: "https://ipinfo.io/json",
    parse: function(body) {
      var d = JSON.parse(body);
      return { ip: d.ip, country: d.country || "", cc: d.country || "", city: d.city || "", isp: d.org || "", org: d.org || "" };
    }
  },
  {
    name: "ifconfig.co",
    url: "https://ifconfig.co/json",
    parse: function(body) {
      var d = JSON.parse(body);
      return { ip: d.ip, country: d.country || "", cc: d.country_iso || "", city: d.city || "", isp: d.asn_org || "", org: d.asn_org || "" };
    }
  }
];

var FLAGS = {
  "US":"🇺🇸","GB":"🇬🇧","DE":"🇩🇪","JP":"🇯🇵","CN":"🇨🇳","HK":"🇭🇰",
  "SG":"🇸🇬","TW":"🇹🇼","KR":"🇰🇷","FR":"🇫🇷","NL":"🇳🇱","AU":"🇦🇺",
  "CA":"🇨🇦","RU":"🇷🇺","IN":"🇮🇳","BR":"🇧🇷","PH":"🇵🇭","SE":"🇸🇪"
};

function getFlag(cc) {
  return FLAGS[cc] || "🏳️";
}

function checkDone() {
  completed++;
  if (completed < totalTests) return;

  var msg = "━━━ DNS 泄露检测结果 ━━━\n";

  if (dnsResults.length === 0) {
    msg += "❌ 所有检测端点均失败\n";
    msg += "请检查网络连接";
    $notify("DNS 泄露检测", "检测失败", msg);
    $done({"title": "DNS 泄露检测", "message": msg});
    return;
  }

  // Determine the expected exit IP (first successful result)
  var exitIP = dnsResults[0].ip;
  var exitCC = dnsResults[0].cc;
  var exitCountry = dnsResults[0].country;

  // Check if all results agree on country
  var leakDetected = false;
  var countries = {};

  for (var i = 0; i < dnsResults.length; i++) {
    var r = dnsResults[i];
    countries[r.cc] = (countries[r.cc] || 0) + 1;
    msg += "\n" + getFlag(r.cc) + " " + r.name + "\n";
    msg += "   IP: " + r.ip + "\n";
    msg += "   国家: " + r.country + " " + r.city + "\n";
    msg += "   ISP: " + r.isp + "\n";
    msg += "   ━━━━━━━━━━━━━━━━";
  }

  // Count unique countries
  var countryKeys = [];
  for (var k in countries) {
    if (countries.hasOwnProperty(k)) {
      countryKeys.push(k);
    }
  }

  msg += "\n\n━━━ 分析结果 ━━━\n";
  msg += "🌐 出口IP: " + exitIP + "\n";
  msg += "📍 出口国家: " + getFlag(exitCC) + " " + exitCountry + "\n";

  if (countryKeys.length > 1) {
    leakDetected = true;
    msg += "\n⚠️ 检测到异常！\n";
    msg += "多个检测点返回不同国家，\n可能存在 DNS 泄露或路由异常。\n";
    msg += "检测到的国家: ";
    for (var j = 0; j < countryKeys.length; j++) {
      msg += getFlag(countryKeys[j]) + " " + countryKeys[j];
      if (j < countryKeys.length - 1) msg += ", ";
    }
  } else {
    msg += "\n✅ 未检测到 DNS 泄露\n";
    msg += "所有解析结果均指向同一地区";
  }

  // Check if exit IP is Chinese (potential leak for proxy users)
  if (exitCC === "CN") {
    msg += "\n\n🔴 注意：出口IP为中国\n";
    msg += "如果您正在使用代理，DNS 可能已泄露";
    leakDetected = true;
  }

  var subtitle = leakDetected ? "⚠️ 可能存在泄露" : "✅ 未检测到泄露";
  subtitle += " · " + getFlag(exitCC) + " " + exitCountry;

  $notify("DNS 泄露检测", subtitle, msg);
  $done({"title": "DNS 泄露检测", "message": msg});
}

for (var t = 0; t < TEST_ENDPOINTS.length; t++) {
  (function(endpoint) {
    $task.fetch({ url: endpoint.url, headers: { "User-Agent": "Mozilla/5.0" } }).then(
      function(resp) {
        try {
          var result = endpoint.parse(resp.body);
          result.name = endpoint.name;
          dnsResults.push(result);
        } catch(e) {
          // parse failed, skip
        }
        checkDone();
      },
      function(error) {
        checkDone();
      }
    );
  })(TEST_ENDPOINTS[t]);
}
