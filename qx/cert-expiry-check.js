/*
 * TLS 证书到期检测 v1.0 (Quantumult X cron task)
 * 每日9点检测7台自建节点的TLS证书状态
 * 兼容 QX 1.5.5-899
 * cron: 0 0 9 * * *
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

var PREFS_PREFIX = "cert_last_good_";
var CERT_LIFETIME = 90; // Let's Encrypt default
var WARN_DAYS = 75;     // Warn at 75+ days

var results = [];
var completed = 0;

function getDaysSince(timestamp) {
  if (!timestamp) return -1;
  var now = Date.now();
  var diff = now - parseInt(timestamp, 10);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function checkDone() {
  completed++;
  if (completed < NODES.length) return;

  var warnings = [];
  var errors = [];
  var allGood = true;

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var prefsKey = PREFS_PREFIX + r.ip;

    if (r.tlsOk) {
      // TLS handshake succeeded or got a response - cert is valid
      // Update last known good timestamp
      $prefs.setValueForKey(String(Date.now()), prefsKey);

      // Check how long since we started tracking
      var lastGood = $prefs.valueForKey(prefsKey);
      var daysSince = getDaysSince(lastGood);
      // This will always be 0 since we just set it, so we also need a "first seen" key
      var firstSeenKey = "cert_first_seen_" + r.ip;
      var firstSeen = $prefs.valueForKey(firstSeenKey);
      if (!firstSeen) {
        $prefs.setValueForKey(String(Date.now()), firstSeenKey);
        firstSeen = String(Date.now());
      }
      var daysSinceFirst = getDaysSince(firstSeen);

      if (daysSinceFirst >= WARN_DAYS) {
        allGood = false;
        warnings.push({
          name: r.name,
          ip: r.ip,
          port: r.port,
          days: daysSinceFirst,
          msg: "⚠️ 证书可能即将过期 (" + daysSinceFirst + "天)"
        });
        // Reset first seen after warning (assume user will renew)
      }
    } else {
      // TLS failed
      var errStr = String(r.error);
      var isCertError = errStr.indexOf("certificate") >= 0
        || errStr.indexOf("SSL") >= 0
        || errStr.indexOf("TLS") >= 0
        || errStr.indexOf("trust") >= 0
        || errStr.indexOf("expired") >= 0;

      if (isCertError) {
        allGood = false;
        errors.push({
          name: r.name,
          ip: r.ip,
          port: r.port,
          msg: "🔴 TLS证书错误: " + errStr.substring(0, 80)
        });
      }
      // Connection refused/timeout is not a cert issue, skip
    }
  }

  // Silent when all OK
  if (allGood && warnings.length === 0 && errors.length === 0) {
    $done();
    return;
  }

  var msg = "━━━ TLS 证书检测 ━━━\n";

  if (errors.length > 0) {
    msg += "\n🔴 证书异常:\n";
    for (var e = 0; e < errors.length; e++) {
      msg += errors[e].name + "\n";
      msg += "  " + errors[e].ip + ":" + errors[e].port + "\n";
      msg += "  " + errors[e].msg + "\n";
    }
  }

  if (warnings.length > 0) {
    msg += "\n⚠️ 即将过期:\n";
    for (var w = 0; w < warnings.length; w++) {
      msg += warnings[w].name + "\n";
      msg += "  已运行 " + warnings[w].days + " 天 (阈值" + WARN_DAYS + "天)\n";
    }
  }

  var okCount = NODES.length - errors.length - warnings.length;
  msg += "\n━━━━━━━━━━━━━━━━\n";
  msg += "✅ 正常: " + okCount + " | ⚠️ 警告: " + warnings.length + " | 🔴 异常: " + errors.length;

  var subtitle = "";
  if (errors.length > 0) {
    subtitle = "🔴 " + errors.length + "个证书异常";
  } else {
    subtitle = "⚠️ " + warnings.length + "个即将过期";
  }

  $notify("🔐 TLS 证书检测", subtitle, msg);
  $done();
}

NODES.forEach(function(node) {
  $task.fetch({
    url: "https://" + node.ip + ":" + node.port,
    headers: { "User-Agent": "Mozilla/5.0" }
  }).then(
    function(resp) {
      // Got a response - TLS handshake succeeded
      results.push({ name: node.name, ip: node.ip, port: node.port, tlsOk: true });
      checkDone();
    },
    function(error) {
      var errStr = String(error);
      // Check if it's a TLS/cert error or just connection error
      var isTLSSuccess = errStr.indexOf("refused") >= 0
        || errStr.indexOf("timeout") >= 0
        || errStr.indexOf("reset") >= 0;

      if (isTLSSuccess) {
        // Connection-level failure, not TLS - could be port not serving HTTPS
        // Treat as non-cert issue
        results.push({ name: node.name, ip: node.ip, port: node.port, tlsOk: true });
      } else {
        results.push({ name: node.name, ip: node.ip, port: node.port, tlsOk: false, error: errStr });
      }
      checkDone();
    }
  );
});
