/*
 * 配置备份提醒 v1.0 (Quantumult X cron task)
 * 每日提醒同步配置到 Gist
 * 兼容 QX 1.5.5-899
 * cron: 0 0 3 * * *
 */

var KEY = "last_backup_reminder";
var today = new Date();
var dateStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
var lastDate = $prefs.valueForKey(KEY);

function pad(n) { return n < 10 ? "0" + n : "" + n; }

if (lastDate === dateStr) {
  // Already reminded today
  $done();
} else {
  $prefs.setValueForKey(dateStr, KEY);

  var msg = "📅 " + dateStr
    + "\n━━━━━━━━━━━━━━━━━━"
    + "\n请在 Mac 终端执行:"
    + "\n"
    + "\ncd ~/path/to/your/QuantumultX"
    + "\ngh gist edit YOUR_GIST_ID \\"
    + "\n  -f quantumult_x.conf quantumult_x.conf \\"
    + "\n  -f surge.conf surge.conf \\"
    + "\n  -f clash.yaml clash.yaml"
    + "\n"
    + "\n━━━━━━━━━━━━━━━━━━"
    + "\n💡 或使用 git: git add -A && git commit -m 'backup' && git push";

  $notify("💾 配置备份提醒", "请同步配置到 Gist", msg);
  $done();
}
