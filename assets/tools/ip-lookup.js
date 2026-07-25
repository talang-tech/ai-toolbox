/**
 * IP Address Lookup - Show current IP, geolocation, and ISP details
 * Uses the free ip-api.com JSON API. Runs entirely in the browser.
 * Zero dependencies, bilingual (zh/en).
 */
(function () {
'use strict';

function init() {
    var isEN = document.documentElement.lang === "en";
    function T(zh, en) { return isEN ? en : zh; }

    var lookupBtn = document.getElementById("ipl-lookup");
    var queryInput = document.getElementById("ipl-query");
    var resultsEl = document.getElementById("ipl-results");
    var copyBtn = document.getElementById("ipl-copy");
    var statusEl = document.getElementById("ipl-status");

    if (!lookupBtn || !resultsEl) return;

    var lastData = null;

    // Fields to display: [apiKey, zhLabel, enLabel]
    var FIELDS = [
        ["query", "IP 地址", "IP Address"],
        ["country", "国家", "Country"],
        ["countryCode", "国家代码", "Country Code"],
        ["regionName", "省 / 州", "Region"],
        ["city", "城市", "City"],
        ["zip", "邮政编码", "ZIP Code"],
        ["lat", "纬度", "Latitude"],
        ["lon", "经度", "Longitude"],
        ["timezone", "时区", "Timezone"],
        ["isp", "ISP 运营商", "ISP"],
        ["org", "组织", "Organization"],
        ["as", "ASN", "ASN"]
    ];

    function setStatus(msg, isError) {
        if (!statusEl) return;
        statusEl.textContent = msg || "";
        statusEl.style.color = isError ? "#e74c3c" : "var(--text-light, #888)";
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function render(data) {
        var rows = "";
        FIELDS.forEach(function (f) {
            var val = data[f[0]];
            if (val === undefined || val === null || val === "") return;
            rows += '<tr><td style="padding:8px 12px;font-weight:600;white-space:nowrap;border-bottom:1px solid var(--border,#eee)">' +
                esc(T(f[1], f[2])) +
                '</td><td style="padding:8px 12px;border-bottom:1px solid var(--border,#eee);word-break:break-all">' +
                esc(val) + '</td></tr>';
        });

        var mapLink = "";
        if (data.lat != null && data.lon != null) {
            var mUrl = "https://www.openstreetmap.org/?mlat=" + encodeURIComponent(data.lat) +
                "&mlon=" + encodeURIComponent(data.lon) + "#map=10/" + data.lat + "/" + data.lon;
            mapLink = '<p style="margin-top:12px"><a href="' + mUrl + '" target="_blank" rel="noopener">' +
                T("在地图上查看位置 ↗", "View location on map ↗") + '</a></p>';
        }

        resultsEl.innerHTML =
            '<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px">' + rows + '</table>' + mapLink;
        if (copyBtn) copyBtn.style.display = "inline-block";
    }

    function buildCopyText(data) {
        var lines = [];
        FIELDS.forEach(function (f) {
            var val = data[f[0]];
            if (val === undefined || val === null || val === "") return;
            lines.push(T(f[1], f[2]) + ": " + val);
        });
        return lines.join("\n");
    }

    function lookup() {
        var q = queryInput ? queryInput.value.trim() : "";
        setStatus(T("查询中…", "Looking up…"), false);
        resultsEl.innerHTML = "";
        if (copyBtn) copyBtn.style.display = "none";
        lastData = null;

        // ip-api.com free endpoint. lang param for localized country/region names.
        var langParam = isEN ? "en" : "zh-CN";
        var base = "https://ip-api.com/json/";
        var url = base + (q ? encodeURIComponent(q) : "") +
            "?fields=status,message,query,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as&lang=" + langParam;

        fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error("HTTP " + r.status);
                return r.json();
            })
            .then(function (data) {
                if (data.status !== "success") {
                    throw new Error(data.message || T("查询失败", "Lookup failed"));
                }
                lastData = data;
                render(data);
                setStatus(T("查询成功", "Success"), false);
            })
            .catch(function (err) {
                setStatus(
                    T("查询失败：", "Lookup failed: ") + err.message +
                    T("（免费接口对 HTTPS 页面可能有请求频率限制，请稍后再试）",
                      " (the free API may rate-limit HTTPS requests; please try again later)"),
                    true
                );
            });
    }

    function copyResults() {
        if (!lastData) return;
        var text = buildCopyText(lastData);
        var done = function () {
            var orig = copyBtn.textContent;
            copyBtn.textContent = T("已复制 ✓", "Copied ✓");
            setTimeout(function () { copyBtn.textContent = orig; }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
        } else {
            fallbackCopy(text, done);
        }
    }

    function fallbackCopy(text, done) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
    }

    lookupBtn.addEventListener("click", lookup);
    if (queryInput) {
        queryInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") lookup();
        });
    }
    if (copyBtn) copyBtn.addEventListener("click", copyResults);

    // Auto-lookup current IP on load.
    lookup();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
})();
