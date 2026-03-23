/*
 * 金融 App IP 安全检查 v1.1 (Quantumult X event-interaction)
 * ⚠️ 使用方法: 长按【金融策略组】(美国金融/英国金融/德国金融等) 触发
 * 检测该策略组出口 IP 是否匹配期望国家
 * 兼容 QX 1.5.5-899
 */

var FINANCE_MAP = {
  "US": {
    flag: "🇺🇸",
    name: "美国金融",
    group: "美国金融",
    node: "your US node",
    apps: "Capital One, Fidelity, Schwab, Tello, Wise(US)"
  },
  "GB": {
    flag: "🇬🇧",
    name: "英国金融",
    group: "英国金融",
    node: "your UK node",
    apps: "Monzo, Zilch, Yonder, Zopa, Kraken(UK), Wise(UK)"
  },
  "DE": {
    flag: "🇩🇪",
    name: "德国金融",
    group: "德国金融",
    node: "your DE node",
    apps: "N26, Skrill, Trade212, Coinbase, Curve"
  },
  "PH": {
    flag: "🇵🇭",
    name: "菲律宾金融",
    group: "菲律宾金融",
    node: "菲律宾节点",
    apps: "Maya, GCash"
  },
  "JP": {
    flag: "🇯🇵",
    name: "日本金融",
    group: "日本金融",
    node: "日本节点",
    apps: "Revolut(JP), Sony Bank"
  }
};

var FLAGS = {"AE":"🇦🇪","AR":"🇦🇷","AT":"🇦🇹","AU":"🇦🇺","BD":"🇧🇩","BE":"🇧🇪","BG":"🇧🇬","BR":"🇧🇷","CA":"🇨🇦","CH":"🇨🇭","CL":"🇨🇱","CN":"🇨🇳","CO":"🇨🇴","CZ":"🇨🇿","DE":"🇩🇪","DK":"🇩🇰","EG":"🇪🇬","ES":"🇪🇸","FI":"🇫🇮","FR":"🇫🇷","GB":"🇬🇧","GR":"🇬🇷","HK":"🇭🇰","HR":"🇭🇷","HU":"🇭🇺","ID":"🇮🇩","IE":"🇮🇪","IL":"🇮🇱","IN":"🇮🇳","IS":"🇮🇸","IT":"🇮🇹","JP":"🇯🇵","KR":"🇰🇷","KZ":"🇰🇿","MO":"🇲🇴","MX":"🇲🇽","MY":"🇲🇾","NL":"🇳🇱","NO":"🇳🇴","NZ":"🇳🇿","PH":"🇵🇭","PK":"🇵🇰","PL":"🇵🇱","PT":"🇵🇹","RO":"🇷🇴","RU":"🇷🇺","SA":"🇸🇦","SE":"🇸🇪","SG":"🇸🇬","TH":"🇹🇭","TR":"🇹🇷","TW":"🇹🇼","UA":"🇺🇦","US":"🇺🇸","VN":"🇻🇳","ZA":"🇿🇦"};

$task.fetch({
  url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN"
}).then(function(resp) {
  var info = JSON.parse(resp.body);
  var cc = info.countryCode;
  var flag = FLAGS[cc] || "🏳️";
  var ipType = (info.hosting && info.proxy) ? "🖥️+🔀 机房代理"
    : info.hosting ? "🖥️ 机房IP"
    : info.proxy ? "🔀 代理IP"
    : "🏠 家宽ISP";

  var matched = FINANCE_MAP[cc];
  var L = [];

  L.push(flag + " 出口 IP: " + info.query);
  L.push("📍 " + info.country + " · " + (info.city || info.regionName));
  L.push("🏢 " + info.isp);
  L.push("🏷 " + ipType);
  L.push("━━━━━━━━━━━━━━━━━━━━");

  if (matched) {
    // IP 匹配到某个金融区域
    L.push("");
    L.push("✅ 当前IP在 " + matched.flag + " " + matched.name + " 区域");
    L.push("");
    L.push("📱 可安全使用:");
    var apps = matched.apps.split(", ");
    for (var i = 0; i < apps.length; i++) {
      L.push("  ✅ " + apps[i]);
    }

    // IP 纯净度警告
    if (info.hosting) {
      L.push("");
      L.push("━━━━━━━━━━━━━━━━━━━━");
      L.push("⚠️ 注意: 当前为机房IP");
      L.push("💡 金融App对IP纯净度敏感");
      L.push("   建议使用家宽/ISP节点降低风控");
    }

    // 提示其他区域不安全
    L.push("");
    L.push("━━━━━━━━━━━━━━━━━━━━");
    L.push("⛔ 以下金融App请勿在当前IP使用:");
    var keys = Object.keys(FINANCE_MAP);
    for (var j = 0; j < keys.length; j++) {
      if (keys[j] !== cc) {
        var other = FINANCE_MAP[keys[j]];
        L.push("  " + other.flag + " " + other.apps);
        L.push("     → 需长按【" + other.group + "】策略组再检测");
      }
    }

    var title = "✅ " + matched.name + " — 安全";
    $notify("🏦 金融IP安全检查", title, L.join("\n"));
    $done({ title: "🏦 金融IP安全检查", message: L.join("\n") });

  } else {
    // IP 不在任何金融区域
    L.push("");
    L.push("⛔ 当前IP不在任何金融服务区域!");
    L.push("   当前位于: " + flag + " " + info.country);
    L.push("");
    L.push("━━━ 请长按对应策略组再触发 ━━━");
    L.push("");

    var keys2 = Object.keys(FINANCE_MAP);
    for (var k = 0; k < keys2.length; k++) {
      var f = FINANCE_MAP[keys2[k]];
      L.push(f.flag + " " + f.apps);
      L.push("  → 长按【" + f.group + "】策略组");
      L.push("");
    }

    L.push("━━━━━━━━━━━━━━━━━━━━");
    L.push("💡 此脚本需长按金融策略组触发才有意义");
    L.push("   长按非金融策略组检测的不是金融出口IP");

    $notify("🏦 金融IP安全检查", "⛔ 请长按金融策略组", L.join("\n"));
    $done({ title: "🏦 金融IP安全检查", message: L.join("\n") });
  }

}, function(error) {
  $notify("🏦 金融IP安全检查", "检测失败", "网络错误: " + error);
  $done({ title: "🏦 金融IP安全检查", message: "❌ 网络错误，请检查连接" });
});
