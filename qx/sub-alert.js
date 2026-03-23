/*
 * 订阅到期/流量预警 v1.0 (Quantumult X cron task)
 * 每日8AM检测订阅剩余流量和到期时间
 * 兼容 QX 1.5.5-899
 * cron: 0 0 8 * * *
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

function checkDone() {
  completed++;
  if (completed < SUBS.length) return;

  var alerts = [];
  var normal = [];

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    if (!r.info) {
      normal.push(r.name + ": ⚠️ 无法获取订阅信息");
      continue;
    }

    var upload = r.info.upload || 0;
    var download = r.info.download || 0;
    var total = r.info.total || 0;
    var expire = r.info.expire || 0;

    var used = upload + download;
    var remaining = total > 0 ? total - used : 0;
    var usedPct = total > 0 ? Math.round(used / total * 100) : 0;

    var now = Math.floor(Date.now() / 1000);
    var daysLeft = expire > 0 ? Math.floor((expire - now) / 86400) : -1;
    var expireDate = "";
    if (expire > 0) {
      var d = new Date(expire * 1000);
      expireDate = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    var isAlert = false;
    var reasons = [];
    if (total > 0 && usedPct >= 80) {
      isAlert = true;
      reasons.push("流量已用 " + usedPct + "%");
    }
    if (daysLeft >= 0 && daysLeft <= 7) {
      isAlert = true;
      reasons.push(daysLeft + " 天后到期");
    }

    var line = r.name + ": "
      + formatBytes(used) + "/" + formatBytes(total)
      + " (" + usedPct + "%)"
      + (daysLeft >= 0 ? " | 到期: " + expireDate + " (" + daysLeft + "天)" : "");

    if (isAlert) {
      alerts.push("⚠️ " + line + "\n   → " + reasons.join(", "));
    } else {
      normal.push("✅ " + line);
    }
  }

  if (alerts.length === 0) {
    // All normal, stay silent
    $done();
    return;
  }

  var L = [];
  L.push("━━━ 订阅告警 ━━━");
  L.push("");
  for (var a = 0; a < alerts.length; a++) {
    L.push(alerts[a]);
  }
  if (normal.length > 0) {
    L.push("");
    L.push("━━━ 正常 ━━━");
    for (var n = 0; n < normal.length; n++) {
      L.push(normal[n]);
    }
  }

  $notify("📊 订阅预警", alerts.length + " 个订阅需注意", L.join("\n"));
  $done();
}

function pad(n) { return n < 10 ? "0" + n : "" + n; }

SUBS.forEach(function(sub) {
  $task.fetch({
    url: sub.url,
    method: "HEAD",
    headers: { "User-Agent": "Quantumult%20X/1.0" }
  }).then(function(resp) {
    var header = null;
    // QX headers are case-insensitive lookup
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
