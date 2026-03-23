/*
 * 市场行情面板 v1.0 (Quantumult X event-interaction)
 * 汇率 + 贵金属(多单位) + 原油(走势) + 加密货币
 * 兼容 QX 1.5.5-899
 *
 * 数据源:
 *   汇率  → open.er-api.com (免费无Key)
 *   金银  → data-asg.goldprice.org (免费)
 *   原油  → Yahoo Finance v8 chart (免费，可能不稳定)
 *   加密  → CoinGecko (免费)
 */

var TROY_OZ_G = 31.1035;   // 1 金衡盎司 = 31.1035 克
var completed = 0;
var totalTasks = 5;         // forex + metals + crypto + WTI + Brent
var R = {};                 // 结果容器

// ── 工具函数 ──
function fmtNum(n, d) {
  if (n == null || isNaN(n)) return "--";
  d = (d != null) ? d : 2;
  var s = n.toFixed(d);
  var parts = s.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function chgIcon(pct) {
  if (pct > 0) return "↑" + fmtNum(Math.abs(pct), 2) + "%";
  if (pct < 0) return "↓" + fmtNum(Math.abs(pct), 2) + "%";
  return "→0%";
}

function sparkline(prices) {
  if (!prices || prices.length < 2) return "";
  var clean = prices.filter(function(p) { return p != null && !isNaN(p); });
  if (clean.length < 2) return "";
  var min = Math.min.apply(null, clean);
  var max = Math.max.apply(null, clean);
  var range = max - min || 1;
  var bars = "▁▂▃▄▅▆▇█";
  return clean.map(function(p) {
    var idx = Math.min(7, Math.round((p - min) / range * 7));
    return bars[idx];
  }).join("");
}

// ── 渲染输出 ──
function render() {
  var L = [];
  var fx = R.forex || {};
  var cny = fx.CNY || 7.25;
  var gbp = fx.GBP || 0.79;
  var eur = fx.EUR || 0.92;

  // 汇率
  if (R.forex) {
    L.push("━━━ 💱 汇率 (1 USD) ━━━");
    L.push("🇨🇳 CNY " + fmtNum(fx.CNY, 4) + "  🇬🇧 GBP " + fmtNum(fx.GBP, 4));
    L.push("🇪🇺 EUR " + fmtNum(fx.EUR, 4) + "  🇯🇵 JPY " + fmtNum(fx.JPY, 2));
    L.push("🇭🇰 HKD " + fmtNum(fx.HKD, 4) + "  🇷🇺 RUB " + fmtNum(fx.RUB, 2));
    L.push("🇰🇷 KRW " + fmtNum(fx.KRW, 0) + "  🇸🇬 SGD " + fmtNum(fx.SGD, 4));
    L.push("");
  } else {
    L.push("⚠️ 汇率数据获取失败");
    L.push("");
  }

  // 黄金
  if (R.metals && R.metals.gold != null) {
    var g = R.metals.gold;
    var gChg = R.metals.goldChg;
    L.push("━━━ 🥇 黄金 XAU " + chgIcon(gChg) + " ━━━");
    L.push("  盎司  $" + fmtNum(g, 2) + "  £" + fmtNum(g * gbp, 2) + "  €" + fmtNum(g * eur, 2));
    L.push("  克    $" + fmtNum(g / TROY_OZ_G, 2) + "  ¥" + fmtNum(g / TROY_OZ_G * cny, 2) + "  £" + fmtNum(g / TROY_OZ_G * gbp, 2));
    L.push("  公斤  $" + fmtNum(g / TROY_OZ_G * 1000, 0) + "  ¥" + fmtNum(g / TROY_OZ_G * 1000 * cny, 0));
    L.push("");
  }

  // 白银
  if (R.metals && R.metals.silver != null) {
    var s = R.metals.silver;
    var sChg = R.metals.silverChg;
    L.push("━━━ 🥈 白银 XAG " + chgIcon(sChg) + " ━━━");
    L.push("  盎司  $" + fmtNum(s, 2) + "  £" + fmtNum(s * gbp, 2) + "  €" + fmtNum(s * eur, 2));
    L.push("  克    $" + fmtNum(s / TROY_OZ_G, 4) + "  ¥" + fmtNum(s / TROY_OZ_G * cny, 4) + "  £" + fmtNum(s / TROY_OZ_G * gbp, 4));
    L.push("  公斤  $" + fmtNum(s / TROY_OZ_G * 1000, 2) + "  ¥" + fmtNum(s / TROY_OZ_G * 1000 * cny, 2));
    L.push("");
  }

  if (!R.metals) {
    L.push("⚠️ 贵金属数据获取失败");
    L.push("");
  }

  // 原油
  var hasOil = (R.wti || R.brent);
  if (hasOil) {
    L.push("━━━ 🛢️ 原油 ━━━");
    if (R.wti) {
      var wSpark = sparkline(R.wti.history);
      var wChg = R.wti.change;
      L.push("  WTI   $" + fmtNum(R.wti.price, 2) + "/桶 " + chgIcon(wChg) + (wSpark ? " " + wSpark : ""));
      L.push("        ¥" + fmtNum(R.wti.price * cny, 2) + "/桶  £" + fmtNum(R.wti.price * gbp, 2) + "/桶");
    }
    if (R.brent) {
      var bSpark = sparkline(R.brent.history);
      var bChg = R.brent.change;
      L.push("  Brent $" + fmtNum(R.brent.price, 2) + "/桶 " + chgIcon(bChg) + (bSpark ? " " + bSpark : ""));
      L.push("        ¥" + fmtNum(R.brent.price * cny, 2) + "/桶  £" + fmtNum(R.brent.price * gbp, 2) + "/桶");
    }
    L.push("");
  }

  // 加密货币
  if (R.crypto) {
    L.push("━━━ ₿ 加密货币 ━━━");
    var btc = R.crypto.bitcoin;
    var eth = R.crypto.ethereum;
    if (btc) L.push("  BTC $" + fmtNum(btc.usd, 0) + " " + chgIcon(btc.chg) + "  ¥" + fmtNum(btc.usd * cny, 0));
    if (eth) L.push("  ETH $" + fmtNum(eth.usd, 0) + " " + chgIcon(eth.chg) + "  ¥" + fmtNum(eth.usd * cny, 0));
    L.push("");
  }

  // 时间戳
  var now = new Date();
  var timeStr = now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate()) + " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());
  L.push("🕐 " + timeStr);

  var msg = L.join("\n");
  $notify("📊 市场行情", "汇率·黄金·白银·原油·加密货币", msg);
  $done({ title: "📊 市场行情面板", message: msg });
}

function pad2(n) { return n < 10 ? "0" + n : "" + n; }

// ── 完成计数 ──
function done() {
  completed++;
  if (completed >= totalTasks) render();
}

// ── Fetch 1: 汇率 ──
$task.fetch({ url: "https://open.er-api.com/v6/latest/USD" }).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    R.forex = d.rates;
  } catch(e) {}
  done();
}, function() { done(); });

// ── Fetch 2: 黄金/白银 ──
$task.fetch({
  url: "https://data-asg.goldprice.org/dbXRates/USD",
  headers: { "Referer": "https://goldprice.org/" }
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    if (d.items && d.items.length > 0) {
      var item = d.items[0];
      R.metals = {
        gold: item.xauPrice,
        silver: item.xagPrice,
        goldChg: item.pcXau,
        silverChg: item.pcXag
      };
    }
  } catch(e) {}
  done();
}, function() { done(); });

// ── Fetch 3: 加密货币 ──
$task.fetch({
  url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
}).then(function(resp) {
  try {
    var d = JSON.parse(resp.body);
    R.crypto = {
      bitcoin: { usd: d.bitcoin.usd, chg: d.bitcoin.usd_24h_change },
      ethereum: { usd: d.ethereum.usd, chg: d.ethereum.usd_24h_change }
    };
  } catch(e) {}
  done();
}, function() { done(); });

// ── Fetch 4: WTI 原油 (Yahoo Finance v8 chart) ──
function parseYahooChart(body) {
  var d = JSON.parse(body);
  var result = d.chart.result[0];
  var price = result.meta.regularMarketPrice;
  var prevClose = result.meta.chartPreviousClose || result.meta.previousClose;
  var change = prevClose ? ((price - prevClose) / prevClose * 100) : 0;
  var closes = result.indicators.quote[0].close;
  return { price: price, change: change, history: closes };
}

$task.fetch({
  url: "https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?range=5d&interval=1d",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try { R.wti = parseYahooChart(resp.body); } catch(e) {}
  done();
}, function() { done(); });

// ── Fetch 5: Brent 原油 ──
$task.fetch({
  url: "https://query1.finance.yahoo.com/v8/finance/chart/BZ%3DF?range=5d&interval=1d",
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(function(resp) {
  try { R.brent = parseYahooChart(resp.body); } catch(e) {}
  done();
}, function() { done(); });
