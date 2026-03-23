/*
 * 全球时区仪表盘 v1.0 (Quantumult X event-interaction)
 * 显示各金融区域时间、银行营业状态、股市状态
 * 兼容 QX 1.5.5-899
 */

var ZONES = [
  { flag: "🇨🇳", name: "中国", offset: 8, market: null },
  { flag: "🇺🇸", name: "美东", offset: -5, market: { name: "NYSE", open: 9.5, close: 16, lunchStart: -1, lunchEnd: -1 } },
  { flag: "🇺🇸", name: "美西", offset: -8, market: null },
  { flag: "🇬🇧", name: "英国", offset: 0, market: { name: "LSE", open: 8, close: 16.5, lunchStart: -1, lunchEnd: -1 } },
  { flag: "🇩🇪", name: "德国", offset: 1, market: { name: "FSE", open: 9, close: 17.5, lunchStart: -1, lunchEnd: -1 } },
  { flag: "🇯🇵", name: "日本", offset: 9, market: { name: "TSE", open: 9, close: 15, lunchStart: 11.5, lunchEnd: 12.5 } },
  { flag: "🇵🇭", name: "菲律宾", offset: 8, market: { name: "PSE", open: 9.5, close: 15.5, lunchStart: 12, lunchEnd: 13.5 } }
];

// Check DST for US and UK/EU (simplified)
function isDST_US(utcDate) {
  // US DST: 2nd Sunday Mar - 1st Sunday Nov
  var m = utcDate.getUTCMonth(); // 0-indexed
  if (m > 2 && m < 10) return true;
  if (m < 2 || m > 10) return false;
  var day = utcDate.getUTCDate();
  var dow = utcDate.getUTCDay();
  if (m === 2) {
    var secondSun = 14 - ((new Date(Date.UTC(utcDate.getUTCFullYear(), 2, 1)).getUTCDay() + 6) % 7);
    return day >= secondSun;
  }
  if (m === 10) {
    var firstSun = 7 - ((new Date(Date.UTC(utcDate.getUTCFullYear(), 10, 1)).getUTCDay() + 6) % 7);
    return day < firstSun;
  }
  return false;
}

function isDST_EU(utcDate) {
  // EU DST: last Sunday Mar - last Sunday Oct
  var m = utcDate.getUTCMonth();
  if (m > 2 && m < 9) return true;
  if (m < 2 || m > 9) return false;
  var day = utcDate.getUTCDate();
  if (m === 2) {
    var lastSun = 31 - (new Date(Date.UTC(utcDate.getUTCFullYear(), 2, 31)).getUTCDay());
    return day >= lastSun;
  }
  if (m === 9) {
    var lastSun2 = 31 - (new Date(Date.UTC(utcDate.getUTCFullYear(), 9, 31)).getUTCDay());
    return day < lastSun2;
  }
  return false;
}

function getAdjustedOffset(zone, utcDate) {
  var off = zone.offset;
  // Apply DST adjustments
  if (zone.name === "美东" || zone.name === "美西") {
    if (isDST_US(utcDate)) off += 1;
  }
  if (zone.name === "英国" || zone.name === "德国") {
    if (isDST_EU(utcDate)) off += 1;
  }
  return off;
}

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

function getLocalTime(utcDate, offset) {
  var ts = utcDate.getTime() + offset * 3600000;
  return new Date(ts);
}

function formatTime(d) {
  return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds());
}

function formatDate(d) {
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}

function getWeekday(d) {
  var days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[d.getUTCDay()];
}

function isBankOpen(localDate) {
  var dow = localDate.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  var h = localDate.getUTCHours();
  return h >= 9 && h < 17;
}

function isMarketOpen(market, localDate) {
  if (!market) return null;
  var dow = localDate.getUTCDay();
  if (dow === 0 || dow === 6) return "休市";
  var h = localDate.getUTCHours() + localDate.getUTCMinutes() / 60;
  if (market.lunchStart > 0 && h >= market.lunchStart && h < market.lunchEnd) {
    return "午休";
  }
  if (h >= market.open && h < market.close) {
    return "开盘";
  }
  return "休市";
}

function isForexOpen(utcDate) {
  // Forex: 24/5, closed from Fri 22:00 UTC to Sun 22:00 UTC
  var dow = utcDate.getUTCDay();
  var h = utcDate.getUTCHours();
  if (dow === 6) return false;
  if (dow === 5 && h >= 22) return false;
  if (dow === 0 && h < 22) return false;
  return true;
}

var now = new Date();
var msg = "";

// Header
msg += "━━━ 🌍 全球时区仪表盘 ━━━\n";
msg += "UTC: " + formatTime(now) + " " + formatDate(now) + "\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";

for (var i = 0; i < ZONES.length; i++) {
  var z = ZONES[i];
  var offset = getAdjustedOffset(z, now);
  var local = getLocalTime(now, offset);
  var timeStr = formatTime(local);
  var dateStr = formatDate(local);
  var weekday = getWeekday(local);

  var sign = offset >= 0 ? "+" : "";
  msg += "\n" + z.flag + " " + z.name + " (UTC" + sign + offset + ")\n";
  msg += "   🕐 " + timeStr + " " + weekday + " " + dateStr + "\n";

  // Bank status
  var bankStatus = isBankOpen(local) ? "🟢 营业中" : "🔴 休息";
  msg += "   🏦 银行: " + bankStatus + "\n";

  // Market status
  if (z.market) {
    var mStatus = isMarketOpen(z.market, local);
    var mIcon = mStatus === "开盘" ? "🟢" : (mStatus === "午休" ? "🟡" : "🔴");
    msg += "   📈 " + z.market.name + ": " + mIcon + " " + mStatus + "\n";
  }
}

// Forex status
msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
var forexOpen = isForexOpen(now);
msg += "💱 外汇市场: " + (forexOpen ? "🟢 交易中 (24/5)" : "🔴 休市 (周末)") + "\n";

// Session info
var utcH = now.getUTCHours();
var session = "";
if (utcH >= 0 && utcH < 9) session = "🌏 亚太时段";
else if (utcH >= 7 && utcH < 16) session = "🌍 欧洲时段";
else if (utcH >= 13 && utcH < 22) session = "🌎 美洲时段";
else session = "🌏 亚太时段";
msg += "📊 当前主力: " + session;

$notify("🌍 全球时区仪表盘", formatTime(getLocalTime(now, 8)) + " 北京时间", msg);
$done({"title": "🌍 全球时区仪表盘", "message": msg});
