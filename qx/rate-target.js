/*
 * 汇率目标提醒 v1.0 (Quantumult X cron)
 * 每4小时检测汇率，达到目标时推送通知
 * 未达标时静默
 * 兼容 QX 1.5.5-899
 */

// 设置目标汇率 (direction: "below" = 低于目标时提醒, "above" = 高于目标时提醒)
// 目标基于 2026-03-24 汇率设定 (USD/CNY=6.90, GBP=0.745, EUR=0.862, JPY=158.6, PHP=59.7)
// 根据你的需求自行调整 target 值
var TARGETS = [
  { pair: "USD/CNY", from: "USD", to: "CNY", target: 6.75, direction: "below", note: "美元兑人民币跌破6.75，购汇好时机" },
  { pair: "USD/CNY", from: "USD", to: "CNY", target: 7.15, direction: "above", note: "美元兑人民币升破7.15，结汇好时机" },
  { pair: "GBP/CNY", from: "GBP", to: "CNY", target: 9.50, direction: "above", note: "英镑升破9.50，英镑结汇好时机" },
  { pair: "GBP/CNY", from: "GBP", to: "CNY", target: 8.80, direction: "below", note: "英镑跌破8.80，购入英镑好时机" },
  { pair: "USD/GBP", from: "USD", to: "GBP", target: 0.72, direction: "below", note: "美元兑英镑跌破0.72，美元转英镑好时机" },
  { pair: "USD/JPY", from: "USD", to: "JPY", target: 165.0, direction: "above", note: "日元贬值破165，购入日元好时机" },
  { pair: "USD/JPY", from: "USD", to: "JPY", target: 145.0, direction: "below", note: "日元升值破145，日元结汇好时机" },
  { pair: "USD/PHP", from: "USD", to: "PHP", target: 62.0, direction: "above", note: "比索贬值破62，向菲律宾转账好时机" },
  { pair: "EUR/CNY", from: "EUR", to: "CNY", target: 8.30, direction: "above", note: "欧元升破8.30，欧元结汇好时机" }
];

var KEY_PREFIX = "rate_target_notified_";

$task.fetch({
  url: "https://open.er-api.com/v6/latest/USD",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    if (!d.rates) { $done(); return; }

    var rates = d.rates;
    var triggered = [];

    for (var i = 0; i < TARGETS.length; i++) {
      var t = TARGETS[i];
      var fromRate = t.from === "USD" ? 1 : rates[t.from];
      var toRate = rates[t.to];
      if (!fromRate || !toRate) continue;

      var currentRate = toRate / fromRate;
      var hit = false;

      if (t.direction === "below" && currentRate <= t.target) hit = true;
      if (t.direction === "above" && currentRate >= t.target) hit = true;

      if (hit) {
        // 检查是否已通知过 (24小时内不重复)
        var lastNotified = $prefs.valueForKey(KEY_PREFIX + t.pair);
        var now = Date.now();
        if (lastNotified && (now - parseInt(lastNotified)) < 86400000) continue;

        $prefs.setValueForKey(String(now), KEY_PREFIX + t.pair);
        triggered.push({
          pair: t.pair,
          current: currentRate.toFixed(4),
          target: t.target,
          note: t.note
        });
      } else {
        // 未达标时清除通知记录，下次达标可再通知
        $prefs.setValueForKey("", KEY_PREFIX + t.pair);
      }
    }

    if (triggered.length === 0) {
      $done();
      return;
    }

    var L = [];
    L.push("💱 汇率目标达成!");
    L.push("━━━━━━━━━━━━━━━━━━");
    L.push("");

    for (var j = 0; j < triggered.length; j++) {
      var tr = triggered[j];
      L.push("🎯 " + tr.pair + ": " + tr.current);
      L.push("   目标: " + tr.target + " ✅ 已达成");
      L.push("   💡 " + tr.note);
      L.push("");
    }

    L.push("━━━━━━━━━━━━━━━━━━");
    L.push("⏰ 24小时内同一目标不重复提醒");

    var msg = L.join("\n");
    $notify("💱 汇率目标提醒", triggered.length + "个目标达成", msg);
  } catch(e) {}
  $done();
}, function(error) {
  $done();
});
