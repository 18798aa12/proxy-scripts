/*
 * Speed Test Panel for Surge
 */
const url = "http://cp.cloudflare.com/generate_204";
const start = Date.now();
$httpClient.get(url, function(error, response, data) {
    const delay = Date.now() - start;
    if (error) {
        $done({ title: "网速测试", content: "测试失败: " + error, icon: "bolt.horizontal.circle.fill", "icon-color": "#f7ce46" });
        return;
    }
    $done({
        title: "网速测试",
        content: `延迟: ${delay}ms\n状态: ${response.status}`,
        icon: "bolt.horizontal.circle.fill",
        "icon-color": delay < 200 ? "#2ecc71" : delay < 500 ? "#f7ce46" : "#e74c3c"
    });
});
