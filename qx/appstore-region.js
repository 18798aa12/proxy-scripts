/*
 * App Store 地区切换助手 v1.0 (Quantumult X event-interaction)
 * 检测当前IP对应的App Store地区，显示可用金融App
 * 兼容 QX 1.5.5-899
 */

var REGIONS = {
  "US": {
    flag: "🇺🇸", store: "美国 App Store",
    apps: ["Capital One", "Fidelity", "Schwab", "TD Ameritrade", "Tello", "Wise", "Venmo", "Cash App"],
    node: "美国节点 (推荐 your US node)"
  },
  "GB": {
    flag: "🇬🇧", store: "英国 App Store",
    apps: ["Monzo", "Zilch", "Yonder", "Zopa", "Kraken", "Wise", "Revolut"],
    node: "英国节点 (your UK node)"
  },
  "DE": {
    flag: "🇩🇪", store: "德国 App Store",
    apps: ["N26", "Trade Republic", "Scalable Capital", "Curve", "Vivid Money"],
    node: "德国节点 (your DE node)"
  },
  "PH": {
    flag: "🇵🇭", store: "菲律宾 App Store",
    apps: ["Maya", "GCash", "BDO", "BPI"],
    node: "菲律宾节点"
  },
  "JP": {
    flag: "🇯🇵", store: "日本 App Store",
    apps: ["PayPay", "LINE Pay", "Rakuten", "Revolut JP"],
    node: "日本节点"
  },
  "HK": {
    flag: "🇭🇰", store: "香港 App Store",
    apps: ["PayMe", "AlipayHK", "Octopus", "ZA Bank"],
    node: "香港节点"
  },
  "SG": {
    flag: "🇸🇬", store: "新加坡 App Store",
    apps: ["DBS", "GrabPay", "Singtel Dash"],
    node: "新加坡节点"
  },
  "CN": {
    flag: "🇨🇳", store: "中国 App Store",
    apps: ["支付宝", "微信", "京东金融", "招商银行"],
    node: "直连 (DIRECT)"
  }
};

var FLAGS = {"AE":"🇦🇪","AR":"🇦🇷","AT":"🇦🇹","AU":"🇦🇺","BD":"🇧🇩","BE":"🇧🇪","BR":"🇧🇷","CA":"🇨🇦","CH":"🇨🇭","CN":"🇨🇳","DE":"🇩🇪","DK":"🇩🇰","ES":"🇪🇸","FI":"🇫🇮","FR":"🇫🇷","GB":"🇬🇧","HK":"🇭🇰","ID":"🇮🇩","IE":"🇮🇪","IN":"🇮🇳","IT":"🇮🇹","JP":"🇯🇵","KR":"🇰🇷","MX":"🇲🇽","MY":"🇲🇾","NL":"🇳🇱","NO":"🇳🇴","NZ":"🇳🇿","PH":"🇵🇭","PL":"🇵🇱","PT":"🇵🇹","RU":"🇷🇺","SE":"🇸🇪","SG":"🇸🇬","TH":"🇹🇭","TR":"🇹🇷","TW":"🇹🇼","US":"🇺🇸","VN":"🇻🇳","ZA":"🇿🇦"};

$task.fetch({ url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN" }).then(function(resp) {
  var info = JSON.parse(resp.body);
  var cc = info.countryCode;
  var flag = FLAGS[cc] || "🏳️";
  var region = REGIONS[cc];

  var L = [];
  L.push(flag + " 当前IP: " + info.query);
  L.push("📍 " + info.country + " · " + (info.city || info.regionName));
  L.push("━━━━━━━━━━━━━━━━━━");

  if (region) {
    L.push("");
    L.push("🏪 对应: " + region.store);
    L.push("");
    L.push("📱 可下载的金融App:");
    region.apps.forEach(function(app) {
      L.push("  • " + app);
    });
  } else {
    L.push("");
    L.push("🏪 对应: " + info.country + " App Store");
    L.push("⚠️ 该地区无已配置的金融App信息");
  }

  L.push("");
  L.push("━━━ 切换指南 ━━━");
  var keys = Object.keys(REGIONS);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k === "CN") continue;
    var r = REGIONS[k];
    var isCurrent = (k === cc);
    L.push((isCurrent ? "✅ " : "  ") + r.flag + " " + r.store + " → " + r.node);
  }

  var msg = L.join("\n");
  var title = region ? region.flag + " " + region.store : flag + " " + info.country;
  $notify("🏪 App Store 地区", title, msg);
  $done({ title: "🏪 App Store 地区助手", message: msg });
}, function(err) {
  $notify("🏪 App Store 地区", "检测失败", "网络错误");
  $done({ title: "🏪 App Store 地区助手", message: "❌ 网络错误" });
});
