/*
 * 多币种汇率换算 v1.0 (Quantumult X event-interaction)
 * 实时汇率查询，覆盖 USD/GBP/EUR/JPY/PHP/CNY
 * 兼容 QX 1.5.5-899
 */

var API_URL = "https://open.er-api.com/v6/latest/USD";

var CURRENCIES = [
  { code: "USD", flag: "🇺🇸", name: "美元", symbol: "$" },
  { code: "GBP", flag: "🇬🇧", name: "英镑", symbol: "£" },
  { code: "EUR", flag: "🇩🇪", name: "欧元", symbol: "€" },
  { code: "JPY", flag: "🇯🇵", name: "日元", symbol: "¥" },
  { code: "PHP", flag: "🇵🇭", name: "菲律宾比索", symbol: "₱" },
  { code: "CNY", flag: "🇨🇳", name: "人民币", symbol: "¥" }
];

function formatNum(n, decimals) {
  if (typeof decimals === "undefined") decimals = 4;
  return Number(n).toFixed(decimals);
}

function padRight(str, len) {
  while (str.length < len) str += " ";
  return str;
}

$task.fetch({ url: API_URL, headers: { "User-Agent": "Mozilla/5.0" } }).then(
  function(resp) {
    var data = JSON.parse(resp.body);

    if (data.result !== "success") {
      $notify("汇率换算", "❌ API 错误", "无法获取汇率数据");
      $done({"title": "汇率换算", "message": "❌ API 错误"});
      return;
    }

    var rates = data.rates;
    var updateTime = data.time_last_update_utc || "";
    // Trim to date only
    if (updateTime.length > 16) {
      updateTime = updateTime.substring(0, 16);
    }

    var msg = "━━━ 💱 实时汇率换算 ━━━\n";
    msg += "📅 更新: " + updateTime + "\n";
    msg += "━━━━━━━━━━━━━━━━━━━━\n";

    // Section 1: 100 USD to all currencies
    msg += "\n💵 100 USD 换算:\n";
    for (var i = 0; i < CURRENCIES.length; i++) {
      var c = CURRENCIES[i];
      if (c.code === "USD") continue;
      var val = 100 * rates[c.code];
      var decimals = c.code === "JPY" ? 0 : 2;
      msg += "  " + c.flag + " " + c.code + ": " + c.symbol + formatNum(val, decimals) + "\n";
    }

    // Section 2: 100 of each currency to CNY
    msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
    msg += "🇨🇳 各币种 → 人民币 (100单位):\n";
    var cnyRate = rates["CNY"];
    for (var j = 0; j < CURRENCIES.length; j++) {
      var c2 = CURRENCIES[j];
      if (c2.code === "CNY") continue;
      // Convert 100 of currency to CNY
      // rate[X] = how many X per 1 USD
      // So 1 unit of X = 1/rate[X] USD = cnyRate/rate[X] CNY
      var toCNY = 100 * (cnyRate / rates[c2.code]);
      msg += "  " + c2.flag + " 100 " + c2.code + " = ¥" + formatNum(toCNY, 2) + "\n";
    }

    // Section 3: Cross rates table
    msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
    msg += "📊 主要交叉汇率 (1单位):\n";
    var pairs = [
      ["USD", "CNY"], ["USD", "JPY"], ["USD", "GBP"],
      ["EUR", "USD"], ["GBP", "USD"], ["EUR", "CNY"],
      ["GBP", "CNY"], ["JPY", "CNY"], ["PHP", "CNY"]
    ];
    for (var k = 0; k < pairs.length; k++) {
      var from = pairs[k][0];
      var to = pairs[k][1];
      // 1 FROM in TO = rates[TO] / rates[FROM]
      var crossRate = rates[to] / rates[from];
      var dec = (to === "JPY" || from === "JPY") ? 4 : 4;
      if (to === "JPY") dec = 2;
      msg += "  " + from + "/" + to + ": " + formatNum(crossRate, dec) + "\n";
    }

    // Section 4: Buy/sell context
    msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
    msg += "💡 提示:\n";
    msg += "  汇率为中间价，实际买卖有价差\n";
    msg += "  银行买入价通常低1-3%\n";
    msg += "  数据来源: open.er-api.com";

    $notify("💱 汇率换算", "1 USD = ¥" + formatNum(cnyRate, 4) + " CNY", msg);
    $done({"title": "💱 汇率换算", "message": msg});
  },
  function(error) {
    $notify("💱 汇率换算", "❌ 获取失败", "网络错误: " + String(error));
    $done({"title": "💱 汇率换算", "message": "❌ 网络错误"});
  }
);
