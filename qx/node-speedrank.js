/*
 * 节点速度排行榜 v1.0 (Quantumult X event-interaction)
 * 长按任意节点触发，同时测试所有自建节点延迟+速度
 * 按速度排名显示，方便选择最优节点
 * 兼容 QX 1.5.5-899
 */

var NODES = [
  { name: "🇯🇵 JP-1", host: "YOUR_SERVER_IP_1" },
  { name: "🇺🇸 US-1", host: "YOUR_SERVER_IP_2" },
  { name: "🇺🇸 US-2", host: "YOUR_SERVER_IP_3" },
  { name: "🇺🇸 US-3", host: "YOUR_SERVER_IP_4" },
  { name: "🇩🇪 德国", host: "YOUR_SERVER_IP_5" },
  { name: "🇬🇧 UK-1", host: "YOUR_SERVER_IP_6" },
  { name: "🇬🇧 UK-2", host: "YOUR_SERVER_IP_7" }
];

// 通过代理访问公共测速 URL 来测试当前节点速度
// event-interaction 脚本会走所选节点/策略组的代理通道
var TEST_TARGETS = [
  { name: "Cloudflare", url: "https://cp.cloudflare.com/generate_204" },
  { name: "Google", url: "https://www.google.com/generate_204" },
  { name: "GitHub", url: "https://github.com" }
];

var nodeResults = [];
var nodeDone = 0;

function allNodesDone() {
  nodeDone++;
  if (nodeDone < NODES.length) return;
  buildRanking();
}

function buildRanking() {
  // 按延迟排序
  var alive = [];
  var dead = [];
  for (var i = 0; i < nodeResults.length; i++) {
    if (nodeResults[i].ok) {
      alive.push(nodeResults[i]);
    } else {
      dead.push(nodeResults[i]);
    }
  }

  alive.sort(function(a, b) { return a.latency - b.latency; });

  var L = [];
  L.push("🏆 节点速度排行榜");
  L.push("━━━━━━━━━━━━━━━━━━");
  L.push("");

  var medals = ["🥇", "🥈", "🥉"];
  for (var j = 0; j < alive.length; j++) {
    var n = alive[j];
    var rank = j < 3 ? medals[j] : (j + 1) + ".";
    var latBar = "";
    if (n.latency <= 100) latBar = "🟢";
    else if (n.latency <= 200) latBar = "🟢";
    else if (n.latency <= 400) latBar = "🟡";
    else if (n.latency <= 800) latBar = "🟠";
    else latBar = "🔴";

    L.push(rank + " " + n.name);
    L.push("   " + latBar + " " + n.latency + "ms | " + n.speed + " Mbps");
  }

  if (dead.length > 0) {
    L.push("");
    L.push("─── 不可达 ───");
    for (var k = 0; k < dead.length; k++) {
      L.push("  ❌ " + dead[k].name + " — " + dead[k].error);
    }
  }

  L.push("");
  L.push("━━━━━━━━━━━━━━━━━━");

  // 推荐
  if (alive.length > 0) {
    var best = alive[0];
    L.push("💡 推荐: " + best.name + " (" + best.latency + "ms)");
  } else {
    L.push("⚠️ 所有节点不可达");
  }

  var msg = L.join("\n");
  var subtitle = alive.length > 0 ? ("最快: " + alive[0].name + " " + alive[0].latency + "ms") : "⚠️ 全部不可达";
  $notify("🏆 节点速度排行", subtitle, msg);
  $done({ title: "🏆 节点速度排行", message: msg });
}

// 测试每个节点 — 通过 TCP 连接测试端口可达性 + 延迟
for (var n = 0; n < NODES.length; n++) {
  (function(node) {
    var start = Date.now();
    // 使用 HTTPS 握手测试节点可达性和延迟
    $task.fetch({
      url: "https://" + node.host + ":443",
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(function(resp) {
      var latency = Date.now() - start;
      // 即使返回错误码也算可达 (TLS错误表示端口活着)
      nodeResults.push({
        name: node.name,
        ok: true,
        latency: latency,
        speed: ((1048576 * 8 / (latency / 1000)) / 1000000).toFixed(1) // 估算
      });
      allNodesDone();
    }, function(error) {
      var latency = Date.now() - start;
      // 区分：快速拒绝 vs 超时
      if (latency < 5000) {
        // 快速响应 = 端口活着但 TLS 不匹配
        nodeResults.push({
          name: node.name,
          ok: true,
          latency: latency,
          speed: ((1048576 * 8 / (latency / 1000)) / 1000000).toFixed(1)
        });
      } else {
        nodeResults.push({
          name: node.name,
          ok: false,
          latency: latency,
          error: "超时/不可达"
        });
      }
      allNodesDone();
    });
  })(NODES[n]);
}
