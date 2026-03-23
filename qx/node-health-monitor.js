/*
 * 自建节点宕机告警 v1.0 (Quantumult X cron task)
 * 每小时检测 7 台自建节点，仅宕机时推送通知
 * 兼容 QX 1.5.5-899
 * cron: 0 0 * * * *
 */

var NODES = [
  { name: "🇯🇵 JP-Node1", ip: "1.2.3.4", port: 12345 },
  { name: "🇺🇸 US-Node1", ip: "5.6.7.8", port: 23456 },
  { name: "🇺🇸 US-Node2", ip: "9.10.11.12", port: 34567 },
  { name: "🇺🇸 US-Node3", ip: "13.14.15.16", port: 45678 },
  { name: "🇩🇪 DE-Node1", ip: "17.18.19.20", port: 56789 },
  { name: "🇬🇧 UK-Node1", ip: "21.22.23.24", port: 11111 },
  { name: "🇬🇧 UK-Node2", ip: "25.26.27.28", port: 22222 }
];

var results = [];
var completed = 0;

function checkDone() {
  completed++;
  if (completed < NODES.length) return;

  var down = results.filter(function(r) { return !r.ok; });

  if (down.length === 0) {
    $done();
    return;
  }

  var downList = down.map(function(r) {
    return "❌ " + r.name + " (" + r.ip + ":" + r.port + ")\n   " + r.reason;
  }).join("\n");

  var upCount = results.length - down.length;
  var msg = "━━━ 宕机节点 (" + down.length + "/" + NODES.length + ") ━━━\n"
    + downList + "\n\n"
    + "✅ 正常节点: " + upCount + "/" + NODES.length;

  $notify("🚨 节点宕机告警", down.length + " 个自建节点不可用", msg);
  $done();
}

NODES.forEach(function(node) {
  var start = Date.now();
  $task.fetch({
    url: "https://" + node.ip + ":" + node.port,
    headers: { "User-Agent": "Mozilla/5.0" }
  }).then(function(resp) {
    // Any response (even 4xx/5xx) means port is alive
    results.push({ name: node.name, ip: node.ip, port: node.port, ok: true });
    checkDone();
  }, function(error) {
    var elapsed = Date.now() - start;
    var errStr = String(error);
    // TLS handshake errors mean port is reachable (just not HTTP)
    // Only timeout or connection refused = truly down
    var isDown = (elapsed > 4500) || errStr.indexOf("refused") >= 0 || errStr.indexOf("reset") >= 0;

    if (!isDown) {
      // TLS error, certificate error, etc. = port is alive
      results.push({ name: node.name, ip: node.ip, port: node.port, ok: true });
    } else {
      results.push({
        name: node.name, ip: node.ip, port: node.port, ok: false,
        reason: elapsed > 4500 ? "连接超时" : "连接被拒绝"
      });
    }
    checkDone();
  });
});
