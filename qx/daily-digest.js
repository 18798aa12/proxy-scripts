/*
 * 每日晨报 v1.0 (Quantumult X cron)
 * 每日7:30AM推送一条汇总通知:
 *   1. 自建节点在线状态
 *   2. 订阅流量/到期概况
 *   3. 当日汇率摘要
 * 全部正常只推一句话，有异常才展开
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 3;
var report = { nodes: [], subs: [], rates: null };

function checkDone() {
  completed++;
  if (completed < totalChecks) return;
  buildDigest();
}

function buildDigest() {
  var L = [];
  var alerts = [];
  var now = new Date();
  var dateStr = (now.getMonth() + 1) + "/" + now.getDate() + " " + (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();

  L.push("📋 每日晨报 " + dateStr);
  L.push("━━━━━━━━━━━━━━━━━━");

  // ── 1. 节点状态 ──
  var nodeUp = 0;
  var nodeDown = [];
  for (var i = 0; i < report.nodes.length; i++) {
    var n = report.nodes[i];
    if (n.ok) {
      nodeUp++;
    } else {
      nodeDown.push(n.name);
    }
  }

  if (nodeDown.length === 0) {
    L.push("🖥 节点: ✅ " + nodeUp + "/" + report.nodes.length + " 全部在线");
  } else {
    L.push("🖥 节点: ⚠️ " + nodeUp + "/" + report.nodes.length + " 在线");
    for (var nd = 0; nd < nodeDown.length; nd++) {
      L.push("  ❌ " + nodeDown[nd]);
    }
    alerts.push(nodeDown.length + "个节点离线");
  }

  // ── 2. 订阅状态 ──
  var subIssues = [];
  for (var j = 0; j < report.subs.length; j++) {
    var s = report.subs[j];
    if (s.error) {
      subIssues.push(s.name + ": 请求失败");
      continue;
    }
    if (s.daysLeft >= 0 && s.daysLeft <= 7) {
      subIssues.push(s.name + ": " + s.daysLeft + "天后到期");
    }
    if (s.usedPercent >= 80) {
      subIssues.push(s.name + ": 流量已用" + s.usedPercent + "%");
    }
  }

  if (subIssues.length === 0) {
    L.push("📡 订阅: ✅ " + report.subs.length + "个订阅正常");
  } else {
    L.push("📡 订阅:");
    for (var si = 0; si < subIssues.length; si++) {
      L.push("  ⚠️ " + subIssues[si]);
    }
    alerts.push(subIssues.length + "个订阅需注意");
  }

  // ── 3. 汇率摘要 ──
  if (report.rates) {
    var r = report.rates;
    L.push("💱 汇率: $1 = ¥" + (r.CNY || "?") + " | £" + (r.GBP || "?") + " | €" + (r.EUR || "?") + " | ¥" + (r.JPY || "?"));
  } else {
    L.push("💱 汇率: 获取失败");
  }

  // ── 综合 ──
  L.push("━━━━━━━━━━━━━━━━━━");
  if (alerts.length === 0) {
    L.push("✅ 一切正常，祝你愉快！");
  } else {
    L.push("⚠️ " + alerts.length + "项需要注意");
  }

  var msg = L.join("\n");
  var subtitle = alerts.length === 0 ? "✅ 一切正常" : ("⚠️ " + alerts.length + "项异常");
  $notify("📋 每日晨报", subtitle, msg);
  $done();
}

// ── 检查 1: 节点在线状态 ──
var NODES = [
  { name: "🇯🇵 JP", host: "YOUR_SERVER_IP_1", port: 34532 },
  { name: "🇺🇸 US-1", host: "YOUR_SERVER_IP_2", port: 50465 },
  { name: "🇺🇸 US-2", host: "YOUR_SERVER_IP_3", port: 29869 },
  { name: "🇺🇸 US-3", host: "YOUR_SERVER_IP_4", port: 14758 },
  { name: "🇩🇪 德国", host: "YOUR_SERVER_IP_5", port: 35227 },
  { name: "🇬🇧 UK-1", host: "YOUR_SERVER_IP_6", port: 30138 },
  { name: "🇬🇧 UK-2", host: "YOUR_SERVER_IP_7", port: 27955 }
];

var nodeDone = 0;
function nodeCheckDone() {
  nodeDone++;
  if (nodeDone < NODES.length) return;
  checkDone();
}

for (var ni = 0; ni < NODES.length; ni++) {
  (function(node) {
    var start = Date.now();
    $task.fetch({
      url: "https://" + node.host + ":" + node.port,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp) {
      report.nodes.push({ name: node.name, ok: true });
      nodeCheckDone();
    }, function(error) {
      var elapsed = Date.now() - start;
      report.nodes.push({ name: node.name, ok: elapsed < 5000 });
      nodeCheckDone();
    });
  })(NODES[ni]);
}

// ── 检查 2: 订阅状态 ──
var SUBS = [
  { name: "DlerCloud", url: "https://YOUR_SUB_URL_1" },
  { name: "Linka", url: "https://YOUR_SUB_URL_2" },
  { name: "Rama", url: "https://YOUR_SUB_URL_3" },
  { name: "CheckHere", url: "https://YOUR_SUB_URL_4" }
];

var subDone = 0;
function subCheckDone() {
  subDone++;
  if (subDone < SUBS.length) return;
  checkDone();
}

for (var si2 = 0; si2 < SUBS.length; si2++) {
  (function(sub) {
    $task.fetch({
      url: sub.url,
      headers: { "User-Agent": "Quantumult%20X/1.5.5" }
    }).then(function(resp) {
      try {
        var info = resp.headers["subscription-userinfo"] || resp.headers["Subscription-Userinfo"] || "";
        if (!info) {
          report.subs.push({ name: sub.name, error: false, usedPercent: 0, daysLeft: 999 });
          subCheckDone();
          return;
        }
        var upload = 0, download = 0, total = 0, expire = 0;
        var parts = info.split(";");
        for (var p = 0; p < parts.length; p++) {
          var kv = parts[p].trim().split("=");
          if (kv.length === 2) {
            var k = kv[0].trim();
            var v = parseInt(kv[1].trim()) || 0;
            if (k === "upload") upload = v;
            else if (k === "download") download = v;
            else if (k === "total") total = v;
            else if (k === "expire") expire = v;
          }
        }
        var used = upload + download;
        var usedPercent = total > 0 ? Math.round(used / total * 100) : 0;
        var daysLeft = expire > 0 ? Math.round((expire * 1000 - Date.now()) / 86400000) : 999;
        report.subs.push({ name: sub.name, error: false, usedPercent: usedPercent, daysLeft: daysLeft });
      } catch(e) {
        report.subs.push({ name: sub.name, error: true });
      }
      subCheckDone();
    }, function(error) {
      report.subs.push({ name: sub.name, error: true });
      subCheckDone();
    });
  })(SUBS[si2]);
}

// ── 检查 3: 汇率 ──
$task.fetch({
  url: "https://open.er-api.com/v6/latest/USD",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    if (d.rates) {
      report.rates = {
        CNY: (d.rates.CNY || 0).toFixed(2),
        GBP: (d.rates.GBP || 0).toFixed(4),
        EUR: (d.rates.EUR || 0).toFixed(4),
        JPY: (d.rates.JPY || 0).toFixed(1),
        PHP: (d.rates.PHP || 0).toFixed(2)
      };
    }
  } catch(e) {}
  checkDone();
}, function(error) {
  checkDone();
});
