/*
 * 网站可用性监控 v1.0 (Quantumult X cron task)
 * 定时检测重要网站是否可访问，不可用时推送通知
 * 兼容 QX 1.5.5-899
 *
 * 建议 cron: 每30分钟  0 */30 * * * *
 *           每小时      0 0 * * * *
 */

// ── 监控列表 (可自定义) ──
// status: 期望的 HTTP 状态码，timeout: 超时ms
var SITES = [
  // 金融
  { name: "Capital One",  url: "https://www.capitalone.com",   expect: 200 },
  { name: "Fidelity",     url: "https://www.fidelity.com",     expect: 200 },
  { name: "Schwab",       url: "https://www.schwab.com",       expect: 200 },
  { name: "Monzo",        url: "https://monzo.com",            expect: 200 },
  { name: "N26",          url: "https://n26.com",              expect: 200 },
  // AI 服务
  { name: "ChatGPT",      url: "https://chat.openai.com",      expect: 200 },
  { name: "Claude",       url: "https://claude.ai",            expect: 200 },
  // 常用
  { name: "GitHub",       url: "https://github.com",           expect: 200 },
  { name: "Google",       url: "https://www.google.com",       expect: 200 },
  { name: "Telegram",     url: "https://web.telegram.org",     expect: 200 }
];

var results = [];
var completed = 0;

function checkDone() {
  completed++;
  if (completed < SITES.length) return;

  // 分类结果
  var down = results.filter(function(r) { return !r.ok; });
  var up = results.filter(function(r) { return r.ok; });

  if (down.length === 0) {
    // 全部正常 → 静默，不推送通知 (避免打扰)
    // 如果需要每次都通知，取消下面注释:
    // $notify("✅ 网站监控", "全部正常", up.length + " 个网站均可访问");
    $done();
    return;
  }

  // 有不可用的网站 → 推送告警
  var downList = down.map(function(r) {
    return "❌ " + r.name + " (" + r.reason + ")";
  }).join("\n");

  var upList = up.map(function(r) {
    return "✅ " + r.name + " " + r.ms + "ms";
  }).join("\n");

  var msg = "━━━ 不可用 (" + down.length + ") ━━━\n"
    + downList + "\n\n"
    + "━━━ 正常 (" + up.length + ") ━━━\n"
    + upList;

  $notify("⚠️ 网站监控告警", down.length + " 个网站不可用", msg);
  $done();
}

// ── 逐个检测 ──
SITES.forEach(function(site, idx) {
  var start = Date.now();
  $task.fetch({
    url: site.url,
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" }
  }).then(function(resp) {
    var ms = Date.now() - start;
    var code = resp.statusCode;
    // 2xx 和 3xx 都算可用
    var ok = (code >= 200 && code < 400);
    results.push({
      name: site.name,
      ok: ok,
      ms: ms,
      reason: ok ? "" : "HTTP " + code
    });
    checkDone();
  }, function(error) {
    results.push({
      name: site.name,
      ok: false,
      ms: Date.now() - start,
      reason: "连接失败"
    });
    checkDone();
  });
});
