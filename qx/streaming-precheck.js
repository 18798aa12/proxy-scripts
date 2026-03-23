/*
 * 流媒体解锁预检 v1.0 (Quantumult X event-interaction)
 * 检测当前节点对 Netflix/Disney+/YouTube Premium 的解锁状态
 * 兼容 QX 1.5.5-899
 */

var results = [];
var completed = 0;
var total = 3;

function checkDone() {
  completed++;
  if (completed < total) return;

  var L = [];
  L.push("━━━ 流媒体解锁检测 ━━━");
  L.push("");

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    L.push(r.icon + " " + r.name + ": " + r.status);
    if (r.detail) L.push("   " + r.detail);
  }

  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("💡 如未解锁，请切换到对应地区的节点");

  var allOk = results.every(function(r) { return r.ok; });
  var title = allOk ? "✅ 全部解锁" : "⚠️ 部分未解锁";
  var msg = L.join("\n");
  $notify("🎬 流媒体预检", title, msg);
  $done({ title: "🎬 流媒体预检", message: msg });
}

// 1. Netflix
$task.fetch({
  url: "https://www.netflix.com/title/81280792",
  headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }
}).then(function(resp) {
  var status = resp.statusCode;
  if (status === 200) {
    // Check if it's the full site or redirect to a specific region
    var body = resp.body || "";
    var regionMatch = body.match(/"currentCountry":"([A-Z]+)"/);
    var region = regionMatch ? regionMatch[1] : "未知";
    results.push({
      name: "Netflix", icon: "🎬", ok: true,
      status: "✅ 已解锁",
      detail: "地区: " + region
    });
  } else if (status === 403) {
    results.push({
      name: "Netflix", icon: "🎬", ok: false,
      status: "❌ 未解锁 (IP被封锁)",
      detail: "HTTP " + status
    });
  } else if (status === 404) {
    results.push({
      name: "Netflix", icon: "🎬", ok: false,
      status: "⚠️ 仅自制剧 (非全解锁)",
      detail: "HTTP " + status
    });
  } else {
    results.push({
      name: "Netflix", icon: "🎬", ok: false,
      status: "⚠️ 状态异常",
      detail: "HTTP " + status
    });
  }
  checkDone();
}, function(error) {
  results.push({
    name: "Netflix", icon: "🎬", ok: false,
    status: "❌ 检测失败",
    detail: String(error).substring(0, 50)
  });
  checkDone();
});

// 2. Disney+
$task.fetch({
  url: "https://disneyplus.com",
  headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }
}).then(function(resp) {
  var status = resp.statusCode;
  var body = resp.body || "";
  if (status >= 200 && status < 400) {
    var blocked = body.indexOf("not-available") >= 0 || body.indexOf("unavailable") >= 0;
    if (blocked) {
      results.push({
        name: "Disney+", icon: "🏰", ok: false,
        status: "❌ 未解锁 (地区不可用)",
        detail: null
      });
    } else {
      results.push({
        name: "Disney+", icon: "🏰", ok: true,
        status: "✅ 已解锁",
        detail: null
      });
    }
  } else if (status === 403) {
    results.push({
      name: "Disney+", icon: "🏰", ok: false,
      status: "❌ 未解锁",
      detail: "HTTP " + status
    });
  } else {
    results.push({
      name: "Disney+", icon: "🏰", ok: status >= 200 && status < 400,
      status: status >= 200 && status < 400 ? "✅ 可访问" : "⚠️ 状态异常",
      detail: "HTTP " + status
    });
  }
  checkDone();
}, function(error) {
  results.push({
    name: "Disney+", icon: "🏰", ok: false,
    status: "❌ 检测失败",
    detail: String(error).substring(0, 50)
  });
  checkDone();
});

// 3. YouTube Premium
$task.fetch({
  url: "https://www.youtube.com/premium",
  headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }
}).then(function(resp) {
  var body = resp.body || "";
  var regionMatch = body.match(/"GL":"([A-Z]+)"/);
  var region = regionMatch ? regionMatch[1] : null;

  if (!region) {
    regionMatch = body.match(/gl=([A-Z]+)/);
    region = regionMatch ? regionMatch[1] : "未知";
  }

  var FLAGS = {"AE":"🇦🇪","AR":"🇦🇷","AU":"🇦🇺","BR":"🇧🇷","CA":"🇨🇦","CN":"🇨🇳","DE":"🇩🇪","FR":"🇫🇷","GB":"🇬🇧","HK":"🇭🇰","ID":"🇮🇩","IN":"🇮🇳","JP":"🇯🇵","KR":"🇰🇷","MX":"🇲🇽","MY":"🇲🇾","PH":"🇵🇭","RU":"🇷🇺","SG":"🇸🇬","TH":"🇹🇭","TR":"🇹🇷","TW":"🇹🇼","US":"🇺🇸","VN":"🇻🇳"};
  var flag = FLAGS[region] || "";

  results.push({
    name: "YouTube Premium", icon: "▶️", ok: true,
    status: "✅ 可访问",
    detail: "地区: " + flag + " " + region
  });
  checkDone();
}, function(error) {
  results.push({
    name: "YouTube Premium", icon: "▶️", ok: false,
    status: "❌ 检测失败",
    detail: String(error).substring(0, 50)
  });
  checkDone();
});
