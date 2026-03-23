/*
 * IP Info Panel for Surge
 */
$httpClient.get("http://ip-api.com/json/?lang=zh-CN", function(error, response, data) {
    if (error) {
        $done({ title: "IP 信息", content: "查询失败: " + error, icon: "globe.asia.australia.fill", "icon-color": "#06a4d8" });
        return;
    }
    try {
        const d = JSON.parse(data);
        $done({
            title: "IP 信息",
            content: `IP: ${d.query}\n位置: ${d.country} ${d.regionName} ${d.city}\nISP: ${d.isp}\nOrg: ${d.org}`,
            icon: "globe.asia.australia.fill",
            "icon-color": "#06a4d8"
        });
    } catch(e) {
        $done({ title: "IP 信息", content: "解析失败", icon: "globe.asia.australia.fill", "icon-color": "#06a4d8" });
    }
});
