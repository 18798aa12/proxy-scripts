/*
 * 一键网络诊断 v1.0 (Quantumult X event-interaction)
 * 全面测试网络连通性和延迟
 * 兼容 QX 1.5.5-899
 */

var TARGETS = [
  { name: "Google", url: "https://www.google.com/generate_204", icon: "🔍" },
  { name: "Cloudflare", url: "https://1.1.1.1/cdn-cgi/trace", icon: "☁️" },
  { name: "GitHub", url: "https://github.com", icon: "🐙" },
  { name: "CapitalOne", url: "https://www.capitalone.com", icon: "🏦" },
  { name: "Baidu", url: "https://www.baidu.com", icon: "🔎" },
  { name: "YouTube", url: "https://www.youtube.com", icon: "▶️" },
  { name: "ChatGPT", url: "https://chat.openai.com", icon: "🤖" }
];

var results = [];
var completed = 0;

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

function getLatencyLevel(ms) {
  if (ms < 200) return { icon: "🟢", text: "极速" };
  if (ms < 500) return { icon: "🟢", text: "快" };
  if (ms < 1000) return { icon: "🟡", text: "一般" };
  if (ms < 2000) return { icon: "🟠", text: "慢" };
  return { icon: "🔴", text: "很慢" };
}

function checkDone() {
  completed++;
  if (completed < TARGETS.length) return;

  // Sort by original order
  results.sort(function(a, b) { return a.index - b.index; });

  var now = new Date();
  var timeStr = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
    + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());

  var msg = "━━━ 🌐 网络诊断报告 ━━━\n";
  msg += "🕐 " + timeStr + "\n";

  // Network type
  if (typeof $environment !== "undefined" && $environment.params) {
    msg += "📶 网络: " + ($environment.params.sessionName || "未知") + "\n";
  }

  msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

  var fastCount = 0;
  var slowCount = 0;
  var failCount = 0;
  var totalLatency = 0;
  var successCount = 0;

  for (var i = 0; i < results.length; i++) {
    var r = results[i];

    if (r.ok) {
      var level = getLatencyLevel(r.latency);
      msg += r.icon + " " + r.name + "\n";
      msg += "   " + level.icon + " " + r.latency + "ms · HTTP " + r.status + " · " + level.text + "\n";

      totalLatency += r.latency;
      successCount++;

      if (r.latency < 500) fastCount++;
      else if (r.latency < 2000) slowCount++;
      else failCount++;
    } else {
      msg += r.icon + " " + r.name + "\n";
      msg += "   🔴 不可达 · " + r.error.substring(0, 40) + "\n";
      failCount++;
    }
  }

  // Summary
  msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
  msg += "📊 诊断摘要:\n";
  msg += "  ✅ 快速: " + fastCount + " | 🟡 较慢: " + slowCount + " | ❌ 失败: " + failCount + "\n";

  if (successCount > 0) {
    var avgLatency = Math.round(totalLatency / successCount);
    msg += "  ⏱ 平均延迟: " + avgLatency + "ms\n";
  }

  // Overall status
  var overallIcon, overallText;
  if (failCount === 0 && slowCount === 0) {
    overallIcon = "🟢";
    overallText = "网络状态极佳";
  } else if (failCount === 0) {
    overallIcon = "🟡";
    overallText = "网络基本正常，部分较慢";
  } else if (failCount < results.length) {
    overallIcon = "🟠";
    overallText = "部分服务不可达";
  } else {
    overallIcon = "🔴";
    overallText = "网络异常，请检查连接";
  }

  msg += "  " + overallIcon + " " + overallText + "\n";

  // Check specific scenarios
  var googleOk = false;
  var baiduOk = false;
  for (var j = 0; j < results.length; j++) {
    if (results[j].name === "Google" && results[j].ok) googleOk = true;
    if (results[j].name === "Baidu" && results[j].ok) baiduOk = true;
  }

  if (!googleOk && baiduOk) {
    msg += "\n  💡 Google不可达但百度正常\n  可能代理未生效或节点异常";
  } else if (googleOk && !baiduOk) {
    msg += "\n  💡 百度不可达但Google正常\n  可能直连规则或国内DNS异常";
  } else if (!googleOk && !baiduOk) {
    msg += "\n  💡 国内外均不可达\n  请检查基础网络连接";
  }

  var subtitle = overallIcon + " " + overallText;
  if (successCount > 0) {
    subtitle += " · 均延" + Math.round(totalLatency / successCount) + "ms";
  }

  $notify("🌐 网络诊断", subtitle, msg);
  $done({"title": "🌐 网络诊断", "message": msg});
}

for (var t = 0; t < TARGETS.length; t++) {
  (function(target, idx) {
    var start = Date.now();
    $task.fetch({
      url: target.url,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(
      function(resp) {
        var latency = Date.now() - start;
        results.push({
          index: idx,
          name: target.name,
          icon: target.icon,
          ok: true,
          latency: latency,
          status: resp.statusCode || resp.status || "OK"
        });
        checkDone();
      },
      function(error) {
        var latency = Date.now() - start;
        // Some sites may error but still be "reachable" (TLS issues etc)
        // If we got a fast error, might still count
        results.push({
          index: idx,
          name: target.name,
          icon: target.icon,
          ok: false,
          latency: latency,
          error: String(error)
        });
        checkDone();
      }
    );
  })(TARGETS[t], t);
}
