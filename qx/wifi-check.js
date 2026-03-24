/*
 * WiFi 安全速检 v1.0 (Quantumult X event-interaction)
 * 连接新WiFi后一键检测安全性:
 *   1. 网络类型 + WiFi名称
 *   2. DNS劫持检测
 *   3. 代理节点可达性
 *   4. 延迟基准
 * 兼容 QX 1.5.5-899
 */

var completed = 0;
var totalChecks = 3;
var results = {};

function checkDone() {
  completed++;
  if (completed < totalChecks) return;
  buildReport();
}

function buildReport() {
  var L = [];
  var issues = [];

  // ── 网络信息 ──
  var netType = "未知";
  var ssid = "未知";
  try {
    if ($environment && $environment.ssid) {
      ssid = $environment.ssid;
      netType = "WiFi";
    } else if ($environment && $environment.cellularOperator) {
      netType = "蜂窝 (" + $environment.cellularOperator + ")";
      ssid = "—";
    }
  } catch(e) {}

  L.push("📶 WiFi 安全速检");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("  网络: " + netType);
  if (ssid !== "—") L.push("  WiFi: " + ssid);
  L.push("");

  // ── 1. DNS 劫持检测 ──
  L.push("1️⃣ DNS安全:");
  if (results.dnsOk === true) {
    L.push("  ✅ DNS解析正常");
    L.push("  Google: " + (results.googleIP || "OK"));
  } else if (results.dnsOk === false) {
    L.push("  ❌ DNS可能被劫持!");
    L.push("  " + (results.dnsError || "异常"));
    issues.push("DNS可能被劫持");
  } else {
    L.push("  ⚠️ 检测失败");
  }

  // ── 2. 代理可达性 ──
  L.push("");
  L.push("2️⃣ 代理连通:");
  if (results.proxyTargets) {
    for (var i = 0; i < results.proxyTargets.length; i++) {
      var pt = results.proxyTargets[i];
      if (pt.ok) {
        L.push("  ✅ " + pt.name + " — " + pt.ms + "ms");
      } else {
        L.push("  ❌ " + pt.name + " — 不可达");
        issues.push(pt.name + "不可达");
      }
    }
  }

  // ── 3. 延迟基准 ──
  L.push("");
  L.push("3️⃣ 延迟基准:");
  if (results.latency) {
    var lat = results.latency;
    var latIcon = lat <= 100 ? "🟢" : lat <= 300 ? "🟡" : "🟠";
    L.push("  " + latIcon + " " + lat + "ms (Cloudflare)");
    if (lat > 500) issues.push("延迟过高(" + lat + "ms)");
  } else {
    L.push("  ❌ 测速失败");
    issues.push("无法测速");
  }

  // ── 综合 ──
  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");

  if (issues.length === 0) {
    L.push("🟢 网络安全，可放心使用");
  } else if (issues.length <= 1) {
    L.push("🟡 存在" + issues.length + "个问题:");
    for (var j = 0; j < issues.length; j++) L.push("  • " + issues[j]);
  } else {
    L.push("🔴 存在" + issues.length + "个问题:");
    for (var k = 0; k < issues.length; k++) L.push("  • " + issues[k]);
    L.push("");
    L.push("💡 建议切换到安全网络或检查代理设置");
  }

  var msg = L.join("\n");
  var icon = issues.length === 0 ? "🟢" : (issues.length <= 1 ? "🟡" : "🔴");
  $notify("📶 WiFi安全速检", icon + " " + ssid, msg);
  $done({ title: "📶 WiFi安全速检", message: msg });
}

// ── 检查 1: DNS 劫持检测 ──
// 请求一个已知域名，检查是否被重定向到劫持页面
$task.fetch({
  url: "https://dns.google/resolve?name=www.google.com&type=A",
  headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/dns-json" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    if (d.Status === 0 && d.Answer && d.Answer.length > 0) {
      results.dnsOk = true;
      results.googleIP = d.Answer[0].data || "resolved";
    } else {
      results.dnsOk = false;
      results.dnsError = "DNS返回异常状态: " + d.Status;
    }
  } catch(e) {
    results.dnsOk = false;
    results.dnsError = "DNS响应解析失败";
  }
  checkDone();
}, function(error) {
  results.dnsOk = false;
  results.dnsError = "无法访问dns.google (可能被劫持)";
  checkDone();
});

// ── 检查 2: 代理可达性 (多目标) ──
var PROXY_TARGETS = [
  { name: "Google", url: "https://www.google.com/generate_204" },
  { name: "GitHub", url: "https://github.com" },
  { name: "Cloudflare", url: "https://cp.cloudflare.com/generate_204" }
];

var proxyDone = 0;
results.proxyTargets = [];

function proxyCheckDone() {
  proxyDone++;
  if (proxyDone < PROXY_TARGETS.length) return;
  checkDone();
}

for (var pi = 0; pi < PROXY_TARGETS.length; pi++) {
  (function(target) {
    var start = Date.now();
    $task.fetch({
      url: target.url,
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp) {
      results.proxyTargets.push({ name: target.name, ok: true, ms: Date.now() - start });
      proxyCheckDone();
    }, function() {
      results.proxyTargets.push({ name: target.name, ok: false, ms: 0 });
      proxyCheckDone();
    });
  })(PROXY_TARGETS[pi]);
}

// ── 检查 3: 延迟基准 ──
var latStart = Date.now();
$task.fetch({
  url: "https://cp.cloudflare.com/generate_204",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  results.latency = Date.now() - latStart;
  checkDone();
}, function() {
  checkDone();
});
