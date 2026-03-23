/*
 * 自建节点宕机告警 v1.0 (Surge cron script)
 * 每小时检测 7 台自建节点，仅宕机时推送通知
 * 兼容 Surge 6.4.4+
 * cronexp: 0 */1 * * *
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
    return "❌ " + r.name + " (" + r.ip + ":" + r.port + ") - " + r.reason;
  }).join("\n");

  var upCount = results.length - down.length;
  var body = downList + "\n✅ 正常: " + upCount + "/" + NODES.length;

  $notification.post("🚨 节点宕机告警", down.length + " 个自建节点不可用", body);
  $done();
}

NODES.forEach(function(node) {
  var start = Date.now();
  $httpClient.get({
    url: "https://" + node.ip + ":" + node.port,
    timeout: 5,
    headers: { "User-Agent": "Mozilla/5.0" }
  }, function(error, response, data) {
    var elapsed = Date.now() - start;
    if (!error || (error && elapsed < 4500)) {
      results.push({ name: node.name, ip: node.ip, port: node.port, ok: true });
    } else {
      var errStr = String(error);
      var isDown = (elapsed > 4500) || errStr.indexOf("refused") >= 0 || errStr.indexOf("reset") >= 0;
      results.push({
        name: node.name, ip: node.ip, port: node.port,
        ok: !isDown,
        reason: isDown ? (elapsed > 4500 ? "连接超时" : "连接被拒绝") : ""
      });
    }
    checkDone();
  });
});
