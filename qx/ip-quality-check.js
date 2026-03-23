/*
 * IP 纯净度检测 v4 (Quantumult X event-interaction)
 */

var req = {url: "http://ip-api.com/json/?fields=66846719&lang=zh-CN"};

var FLAGS = {"AE":"🇦🇪","AR":"🇦🇷","AT":"🇦🇹","AU":"🇦🇺","BD":"🇧🇩","BE":"🇧🇪","BG":"🇧🇬","BR":"🇧🇷","CA":"🇨🇦","CH":"🇨🇭","CL":"🇨🇱","CN":"🇨🇳","CO":"🇨🇴","CZ":"🇨🇿","DE":"🇩🇪","DK":"🇩🇰","EG":"🇪🇬","ES":"🇪🇸","FI":"🇫🇮","FR":"🇫🇷","GB":"🇬🇧","GR":"🇬🇷","HK":"🇭🇰","HR":"🇭🇷","HU":"🇭🇺","ID":"🇮🇩","IE":"🇮🇪","IL":"🇮🇱","IN":"🇮🇳","IS":"🇮🇸","IT":"🇮🇹","JP":"🇯🇵","KR":"🇰🇷","KZ":"🇰🇿","MO":"🇲🇴","MX":"🇲🇽","MY":"🇲🇾","NL":"🇳🇱","NO":"🇳🇴","NZ":"🇳🇿","PH":"🇵🇭","PK":"🇵🇰","PL":"🇵🇱","PT":"🇵🇹","RO":"🇷🇴","RU":"🇷🇺","SA":"🇸🇦","SE":"🇸🇪","SG":"🇸🇬","TH":"🇹🇭","TR":"🇹🇷","TW":"🇹🇼","UA":"🇺🇦","US":"🇺🇸","VN":"🇻🇳","ZA":"🇿🇦"};

$task.fetch(req).then(function(resp) {
  var info = JSON.parse(resp.body);
  var flag = FLAGS[info.countryCode] || "🏳️";
  var ipType, purity, advice;

  if (!info.hosting && !info.proxy) {
    ipType = "🏠 家宽/ISP";
    purity = "🟢 极高";
    advice = "💡 家宽IP，适合ChatGPT/Claude";
  } else if (!info.hosting && info.proxy) {
    ipType = "🔀 代理IP";
    purity = "🟡 中等";
    advice = "💡 非机房但被标记代理";
  } else if (info.hosting && !info.proxy) {
    ipType = "🖥️ 机房IP";
    purity = "🟠 较低";
    advice = "💡 机房IP，可能触发验证";
  } else {
    ipType = "🖥️ 机房+代理";
    purity = "🔴 低";
    advice = "💡 建议切换节点";
  }

  var msg = flag + " " + info.country + " · " + (info.city || info.regionName)
    + "\n━━━━━━━━━━━━━━━━"
    + "\n📍 IP: " + info.query
    + "\n🏷 类型: " + ipType
    + "\n✨ 纯净度: " + purity
    + "\n━━━━━━━━━━━━━━━━"
    + "\n🏢 ISP: " + info.isp
    + "\n🔗 AS: " + info.as
    + "\n━━━━━━━━━━━━━━━━"
    + "\n🕵 代理: " + (info.proxy ? "⚠️ 是" : "✅ 否")
    + "\n🖥 机房: " + (info.hosting ? "⚠️ 是" : "✅ 否")
    + "\n━━━━━━━━━━━━━━━━"
    + "\n" + advice;

  $notify("IP 纯净度检测", flag + " " + info.country, msg);
  $done({"title": "IP 纯净度检测", "message": msg});
}, function(error) {
  $notify("IP 纯净度检测", "检测失败", "网络错误");
  $done({"title": "IP 纯净度检测", "message": "❌ 网络错误"});
});
