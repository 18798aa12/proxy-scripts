/*
 * 配置备份提醒 v1.1 (Quantumult X cron task)
 * 每周提醒一次同步配置到 Gist (7天内不重复提醒)
 * 兼容 QX 1.5.5-899
 * cron: 0 0 3 * * *
 */

var KEY = "last_backup_reminder_ts";
var now = Date.now();
var lastTs = parseInt($prefs.valueForKey(KEY) || "0");
var daysSinceLast = (now - lastTs) / 86400000;

// 7 天内提醒过则静默
if (daysSinceLast < 7) {
  $done();
} else {
  $prefs.setValueForKey(String(now), KEY);

  var today = new Date();
  var dateStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  var msg = "📅 " + dateStr + " (每周提醒)"
    + "\n━━━━━━━━━━━━━━━━━━"
    + "\n请在 Mac 终端执行:"
    + "\n"
    + "\ncd ~/vscode/ClaudeCodeMacAPP/QuantumultX"
    + "\ngh gist edit YOUR_GIST_ID \\"
    + "\n  -f quantumult_x.conf quantumult_x.conf \\"
    + "\n  -f surge.conf surge.conf \\"
    + "\n  -f clash.yaml clash.yaml"
    + "\n"
    + "\n━━━━━━━━━━━━━━━━━━"
    + "\n💡 或使用 git: git add -A && git commit -m 'backup' && git push";

  $notify("💾 配置备份提醒", "上次备份: " + Math.round(daysSinceLast) + "天前", msg);
  $done();
}
