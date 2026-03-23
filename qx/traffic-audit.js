/*
 * 机场流量审计面板 v1.0 (Quantumult X event-interaction)
 * 交互式查看所有订阅的流量使用情况
 * 兼容 QX 1.5.5-899
 */

var SUBS = [
  {
    name: "SubProvider-1",
    url: "https://example-sub1.com/api/subscribe?token=YOUR_TOKEN_1"
  },
  {
    name: "SubProvider-2",
    url: "https://example-sub2.com/api/subscribe?token=YOUR_TOKEN_2"
  },
  {
    name: "SubProvider-3",
    url: "https://example-sub3.com/api/subscribe?token=YOUR_TOKEN_3"
  },
  {
    name: "SubProvider-4",
    url: "https://example-sub4.com/api/subscribe?token=YOUR_TOKEN_4"
  }
];

var results = [];
var completed = 0;

function formatBytes(bytes) {
  if (bytes <= 0) return "0 B";
  var units = ["B", "KB", "MB", "GB", "TB"];
  var i = 0;
  var val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val = val / 1024;
    i++;
  }
  return val.toFixed(2) + " " + units[i];
}

function parseInfo(header) {
  if (!header) return null;
  var info = {};
  var parts = header.split(";");
  for (var i = 0; i < parts.length; i++) {
    var kv = parts[i].trim().split("=");
    if (kv.length === 2) {
      info[kv[0].trim()] = parseInt(kv[1].trim(), 10);
    }
  }
  return info;
}

function pad(n) { return n < 10 ? "0" + n : "" + n; }

function makeBar(pct) {
  var filled = Math.round(pct / 5);
  if (filled > 20) filled = 20;
  var empty = 20 - filled;
  var bar = "";
  for (var i = 0; i < filled; i++) bar += "▓";
  for (var j = 0; j < empty; j++) bar += "░";
  return bar;
}

function checkDone() {
  completed++;
  if (completed < SUBS.length) return;

  var L = [];
  var now = Math.floor(Date.now() / 1000);
  var today = new Date();
  L.push("📅 " + today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate()));
  L.push("━━━━━━━━━━━━━━━━━━");

  var totalUsed = 0;
  var totalQuota = 0;
  var hasData = false;

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    L.push("");

    if (!r.info) {
      L.push("📦 " + r.name);
      L.push("   ⚠️ 无法获取订阅信息");
      continue;
    }

    hasData = true;
    var upload = r.info.upload || 0;
    var download = r.info.download || 0;
    var total = r.info.total || 0;
    var expire = r.info.expire || 0;

    var used = upload + download;
    var remaining = total > 0 ? total - used : 0;
    var usedPct = total > 0 ? Math.round(used / total * 100) : 0;

    totalUsed += used;
    totalQuota += total;

    var daysLeft = expire > 0 ? Math.floor((expire - now) / 86400) : -1;
    var expireDate = "";
    if (expire > 0) {
      var d = new Date(expire * 1000);
      expireDate = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    var statusIcon = usedPct >= 80 ? "🔴" : usedPct >= 50 ? "🟡" : "🟢";

    L.push(statusIcon + " " + r.name);
    L.push("   " + makeBar(usedPct) + " " + usedPct + "%");
    L.push("   📊 " + formatBytes(used) + " / " + formatBytes(total));
    L.push("   ⬆️ " + formatBytes(upload) + "  ⬇️ " + formatBytes(download));
    if (daysLeft >= 0) {
      var daysIcon = daysLeft <= 7 ? "🔴" : daysLeft <= 30 ? "🟡" : "🟢";
      L.push("   " + daysIcon + " 到期: " + expireDate + " (剩余 " + daysLeft + " 天)");
    }
  }

  if (hasData) {
    L.push("");
    L.push("━━━━━━━━━━━━━━━━━━");
    var totalPct = totalQuota > 0 ? Math.round(totalUsed / totalQuota * 100) : 0;
    L.push("📊 汇总: " + formatBytes(totalUsed) + " / " + formatBytes(totalQuota) + " (" + totalPct + "%)");
    L.push("   " + makeBar(totalPct));
  }

  var msg = L.join("\n");
  $notify("📊 流量审计", "订阅流量使用概览", msg);
  $done({ title: "📊 流量审计", message: msg });
}

SUBS.forEach(function(sub) {
  $task.fetch({
    url: sub.url,
    method: "HEAD",
    headers: { "User-Agent": "Quantumult%20X/1.0" }
  }).then(function(resp) {
    var header = null;
    if (resp.headers) {
      var keys = Object.keys(resp.headers);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === "subscription-userinfo") {
          header = resp.headers[keys[i]];
          break;
        }
      }
    }
    results.push({ name: sub.name, info: parseInfo(header) });
    checkDone();
  }, function(error) {
    results.push({ name: sub.name, info: null });
    checkDone();
  });
});
