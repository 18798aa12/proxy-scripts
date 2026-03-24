/*
 * 订阅节点变动监控 v1.0 (Quantumult X cron)
 * 每日检测订阅更新后节点数量变化
 * 新增/减少节点时推送通知，无变化时静默
 * 兼容 QX 1.5.5-899
 */

var SUBS = [
  { name: "DlerCloud", url: "https://YOUR_SUB_URL_1" },
  { name: "Linka", url: "https://YOUR_SUB_URL_2" },
  { name: "Rama", url: "https://YOUR_SUB_URL_3" },
  { name: "CheckHere", url: "https://YOUR_SUB_URL_4" }
];

var completed = 0;
var changes = [];
var KEY_PREFIX = "sub_node_count_";

function checkDone() {
  completed++;
  if (completed < SUBS.length) return;

  if (changes.length === 0) {
    // 无变化，静默
    $done();
    return;
  }

  var L = [];
  L.push("📡 订阅节点变动检测");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");

  for (var i = 0; i < changes.length; i++) {
    var c = changes[i];
    L.push(c.icon + " " + c.name);
    L.push("  " + c.detail);
    L.push("");
  }

  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("💡 节点数减少可能表示机场下架节点");
  L.push("   节点数增加可能有新地区/新线路");

  var msg = L.join("\n");
  $notify("📡 订阅节点变动", changes.length + "个订阅有变化", msg);
  $done();
}

function countNodes(body) {
  if (!body) return 0;
  // QX 格式: 每行一个节点 (trojan=, vmess=, ss=, vless=, http=)
  var lines = body.split("\n");
  var count = 0;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.indexOf("trojan=") === 0 ||
        line.indexOf("vmess=") === 0 ||
        line.indexOf("ss=") === 0 ||
        line.indexOf("vless=") === 0 ||
        line.indexOf("http=") === 0 ||
        line.indexOf("shadowsocks=") === 0) {
      count++;
    }
  }
  // Clash 格式: 检测 "- {name:" 或 "proxies:" 后的 "- name:" 行
  if (count === 0) {
    for (var j = 0; j < lines.length; j++) {
      var l2 = lines[j].trim();
      if (l2.indexOf("- name:") === 0 || l2.indexOf("- {name:") === 0) {
        count++;
      }
    }
  }
  // Base64 编码检测
  if (count === 0 && body.length > 100) {
    try {
      // 尝试 Base64 解码后的行数
      count = -1; // 标记为无法解析
    } catch(e) {}
  }
  return count;
}

for (var s = 0; s < SUBS.length; s++) {
  (function(sub) {
    $task.fetch({
      url: sub.url,
      headers: { "User-Agent": "Quantumult%20X/1.5.5" }
    }).then(function(resp) {
      try {
        var currentCount = countNodes(resp.body || "");
        var key = KEY_PREFIX + sub.name;
        var storedStr = $prefs.valueForKey(key);
        var storedCount = storedStr ? parseInt(storedStr) : -1;

        if (currentCount > 0) {
          // 保存当前数量
          $prefs.setValueForKey(String(currentCount), key);

          if (storedCount >= 0 && currentCount !== storedCount) {
            var diff = currentCount - storedCount;
            var icon, detail;
            if (diff > 0) {
              icon = "🟢";
              detail = storedCount + " → " + currentCount + " (+" + diff + " 新节点)";
            } else {
              icon = "🔴";
              detail = storedCount + " → " + currentCount + " (" + diff + " 节点减少)";
            }
            changes.push({ name: sub.name, icon: icon, detail: detail });
          } else if (storedCount < 0) {
            // 首次记录
            $prefs.setValueForKey(String(currentCount), key);
          }
        }
      } catch(e) {}
      checkDone();
    }, function(error) {
      changes.push({
        name: sub.name,
        icon: "⚠️",
        detail: "请求失败，无法检测"
      });
      checkDone();
    });
  })(SUBS[s]);
}
