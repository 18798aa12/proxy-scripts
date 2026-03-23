/*
 * 节点IP变动监控 v1.0 (Quantumult X cron task)
 * 每6小时检测自建节点IP可达性和变动
 * 兼容 QX 1.5.5-899
 * cron: 0 0 */6 * * *
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

var PREFS_PREFIX = "node_watch_";
var results = [];
var completed = 0;

function checkDone() {
  completed++;
  if (completed < NODES.length) return;

  var changes = [];
  var unreachable = [];
  var recovered = [];
  var now = new Date();
  var timestamp = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
    + " " + pad(now.getHours()) + ":" + pad(now.getMinutes());

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var stateKey = PREFS_PREFIX + "state_" + r.ip;
    var timeKey = PREFS_PREFIX + "time_" + r.ip;
    var prevState = $prefs.valueForKey(stateKey); // "up" or "down" or null

    if (r.reachable) {
      // Currently up
      if (prevState === "down") {
        // Was down, now up - recovered
        var downSince = $prefs.valueForKey(timeKey) || "未知";
        recovered.push({
          name: r.name,
          ip: r.ip,
          port: r.port,
          downSince: downSince
        });
      }
      $prefs.setValueForKey("up", stateKey);
      $prefs.setValueForKey(timestamp, timeKey);
    } else {
      // Currently unreachable
      if (prevState !== "down") {
        // Was up or first check - now down
        unreachable.push({
          name: r.name,
          ip: r.ip,
          port: r.port,
          error: r.error
        });
        $prefs.setValueForKey(timestamp, timeKey);
      } else {
        // Already known down
        unreachable.push({
          name: r.name,
          ip: r.ip,
          port: r.port,
          error: r.error,
          since: $prefs.valueForKey(timeKey) || "未知"
        });
      }
      $prefs.setValueForKey("down", stateKey);
    }
  }

  // Silent when all normal
  if (unreachable.length === 0 && recovered.length === 0) {
    $done();
    return;
  }

  var msg = "━━━ 节点IP监控 ━━━\n";
  msg += "🕐 " + timestamp + "\n";

  if (unreachable.length > 0) {
    msg += "\n❌ 不可达节点:\n";
    for (var u = 0; u < unreachable.length; u++) {
      var n = unreachable[u];
      msg += "  " + n.name + "\n";
      msg += "  " + n.ip + ":" + n.port + "\n";
      if (n.since) {
        msg += "  宕机起始: " + n.since + "\n";
      }
      if (n.error) {
        msg += "  原因: " + n.error.substring(0, 50) + "\n";
      }
      msg += "  ━━━━━━━━━━━━━━━━\n";
    }
  }

  if (recovered.length > 0) {
    msg += "\n✅ 恢复的节点:\n";
    for (var rv = 0; rv < recovered.length; rv++) {
      var rc = recovered[rv];
      msg += "  " + rc.name + "\n";
      msg += "  " + rc.ip + ":" + rc.port + "\n";
      msg += "  之前宕机: " + rc.downSince + "\n";
      msg += "  ━━━━━━━━━━━━━━━━\n";
    }
  }

  var upCount = NODES.length - unreachable.length;
  msg += "\n📊 总计: ✅" + upCount + " ❌" + unreachable.length + " / " + NODES.length;

  var subtitle = "";
  if (unreachable.length > 0) {
    subtitle = "❌ " + unreachable.length + "个节点不可达";
  }
  if (recovered.length > 0) {
    subtitle += (subtitle ? " | " : "") + "✅ " + recovered.length + "个已恢复";
  }

  $notify("🔍 节点IP监控", subtitle, msg);
  $done();
}

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

NODES.forEach(function(node) {
  var start = Date.now();
  $task.fetch({
    url: "https://" + node.ip + ":" + node.port,
    headers: { "User-Agent": "Mozilla/5.0" }
  }).then(
    function(resp) {
      // Any response means reachable
      results.push({ name: node.name, ip: node.ip, port: node.port, reachable: true });
      checkDone();
    },
    function(error) {
      var elapsed = Date.now() - start;
      var errStr = String(error);
      // TLS errors mean port is reachable
      var isDown = (elapsed > 5000)
        || errStr.indexOf("refused") >= 0
        || errStr.indexOf("reset") >= 0
        || errStr.indexOf("No route") >= 0
        || errStr.indexOf("Network is unreachable") >= 0;

      if (isDown) {
        results.push({
          name: node.name, ip: node.ip, port: node.port,
          reachable: false, error: errStr
        });
      } else {
        // TLS/other errors but port responded
        results.push({ name: node.name, ip: node.ip, port: node.port, reachable: true });
      }
      checkDone();
    }
  );
});
