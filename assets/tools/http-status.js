(function() {
  'use strict';

  const isEN = window.location.pathname.startsWith('/en/');

  const STATUS_CODES = [
    // 1xx Informational
    { code: 100, name_zh: '继续', name_en: 'Continue', category: '1xx', desc_zh: '服务器已收到请求头，客户端应继续发送请求体。', desc_en: 'The server has received the request headers and the client should proceed to send the body.' },
    { code: 101, name_zh: '切换协议', name_en: 'Switching Protocols', category: '1xx', desc_zh: '服务器同意客户端请求切换协议（如 WebSocket）。', desc_en: 'The server is switching protocols as requested by the client (e.g., WebSocket).' },
    { code: 102, name_zh: '处理中', name_en: 'Processing', category: '1xx', desc_zh: '服务器已收到请求但尚未完成（WebDAV）。', desc_en: 'The server has received and is processing the request, but no response yet (WebDAV).' },
    { code: 103, name_zh: '早期提示', name_en: 'Early Hints', category: '1xx', desc_zh: '服务器在最终响应前提前发送部分响应头，提示浏览器预加载资源。', desc_en: 'The server sends some response headers before the final response to help the browser preload resources.' },
    // 2xx Success
    { code: 200, name_zh: '成功', name_en: 'OK', category: '2xx', desc_zh: '请求成功。GET 返回资源，POST 返回处理结果。', desc_en: 'The request succeeded. GET returns the resource, POST returns the result.' },
    { code: 201, name_zh: '已创建', name_en: 'Created', category: '2xx', desc_zh: '请求成功并在服务器创建了新资源（通常用于 POST/PUT）。', desc_en: 'The request succeeded and a new resource was created (typically for POST/PUT).' },
    { code: 202, name_zh: '已接受', name_en: 'Accepted', category: '2xx', desc_zh: '请求已接受但尚未处理完成（异步任务）。', desc_en: 'The request has been accepted for processing, but is not yet complete (async task).' },
    { code: 203, name_zh: '非授权信息', name_en: 'Non-Authoritative Information', category: '2xx', desc_zh: '返回的元信息来自第三方副本而非原始服务器。', desc_en: 'The returned metadata is from a third-party copy, not the original server.' },
    { code: 204, name_zh: '无内容', name_en: 'No Content', category: '2xx', desc_zh: '请求成功但无返回内容（常用于 DELETE 或表单提交）。', desc_en: 'The request succeeded but there is no content to return (common for DELETE or form submissions).' },
    { code: 205, name_zh: '重置内容', name_en: 'Reset Content', category: '2xx', desc_zh: '请求成功，且应重置发送此请求的文档视图。', desc_en: 'The request succeeded and the user agent should reset the document view.' },
    { code: 206, name_zh: '部分内容', name_en: 'Partial Content', category: '2xx', desc_zh: '服务器返回了资源的部分内容（支持断点续传/分片下载）。', desc_en: 'The server is delivering only part of the resource (range requests, resume download).' },
    // 3xx Redirection
    { code: 300, name_zh: '多种选择', name_en: 'Multiple Choices', category: '3xx', desc_zh: '请求的资源有多种表示方式，客户端应选择其一。', desc_en: 'The requested resource has multiple representations; the client should choose one.' },
    { code: 301, name_zh: '永久移动', name_en: 'Moved Permanently', category: '3xx', desc_zh: '资源已永久移动到新 URL，搜索引擎会更新索引。', desc_en: 'The resource has been permanently moved to a new URL; search engines update their index.' },
    { code: 302, name_zh: '临时移动', name_en: 'Found', category: '3xx', desc_zh: '资源临时移动到新 URL，客户端应继续使用原 URL。', desc_en: 'The resource is temporarily located at a different URL; the client should keep using the original URL.' },
    { code: 303, name_zh: '查看其他位置', name_en: 'See Other', category: '3xx', desc_zh: '应使用 GET 方法到另一个 URL 获取资源（POST 后重定向）。', desc_en: 'The response can be found at another URL using GET (POST-redirect-GET pattern).' },
    { code: 304, name_zh: '未修改', name_en: 'Not Modified', category: '3xx', desc_zh: '资源自上次请求后未修改，客户端可使用缓存版本。', desc_en: 'The resource has not been modified since the last request; use the cached version.' },
    { code: 305, name_zh: '使用代理', name_en: 'Use Proxy', category: '3xx', desc_zh: '请求的资源必须通过指定代理访问（已弃用）。', desc_en: 'The requested resource must be accessed through the specified proxy (deprecated).' },
    { code: 307, name_zh: '临时重定向', name_en: 'Temporary Redirect', category: '3xx', desc_zh: '与 302 类似，但要求保持 HTTP 方法不变。', desc_en: 'Similar to 302, but the HTTP method must not change when following the redirect.' },
    { code: 308, name_zh: '永久重定向', name_en: 'Permanent Redirect', category: '3xx', desc_zh: '与 301 类似，但要求保持 HTTP 方法不变。', desc_en: 'Similar to 301, but the HTTP method must not change when following the redirect.' },
    // 4xx Client Error
    { code: 400, name_zh: '错误请求', name_en: 'Bad Request', category: '4xx', desc_zh: '服务器无法理解请求的语法，可能是请求格式错误或参数无效。', desc_en: 'The server cannot understand the request due to malformed syntax or invalid parameters.' },
    { code: 401, name_zh: '未授权', name_en: 'Unauthorized', category: '4xx', desc_zh: '需要身份验证。客户端未提供有效凭据。', desc_en: 'Authentication is required. The client has not provided valid credentials.' },
    { code: 402, name_zh: '需要付款', name_en: 'Payment Required', category: '4xx', desc_zh: '保留用于未来数字支付系统（目前未广泛使用）。', desc_en: 'Reserved for future digital payment systems (not widely used yet).' },
    { code: 403, name_zh: '禁止访问', name_en: 'Forbidden', category: '4xx', desc_zh: '服务器拒绝请求，客户端已认证但无权限访问资源。', desc_en: 'The server refuses the request. The client is authenticated but lacks permission.' },
    { code: 404, name_zh: '未找到', name_en: 'Not Found', category: '4xx', desc_zh: '服务器找不到请求的资源。URL 可能错误或资源已被删除。', desc_en: 'The server cannot find the requested resource. The URL may be wrong or the resource was deleted.' },
    { code: 405, name_zh: '方法不允许', name_en: 'Method Not Allowed', category: '4xx', desc_zh: '请求方法不被该资源支持（如对只读资源使用 POST）。', desc_en: 'The request method is not supported by the resource (e.g., POST on a read-only resource).' },
    { code: 406, name_zh: '不可接受', name_en: 'Not Acceptable', category: '4xx', desc_zh: '服务器无法生成客户端 Accept 头中指定的内容类型。', desc_en: 'The server cannot produce a response matching the Accept header sent by the client.' },
    { code: 407, name_zh: '需要代理认证', name_en: 'Proxy Authentication Required', category: '4xx', desc_zh: '客户端需要通过代理服务器进行身份验证。', desc_en: 'The client must authenticate with the proxy server first.' },
    { code: 408, name_zh: '请求超时', name_en: 'Request Timeout', category: '4xx', desc_zh: '服务器在等待客户端发送请求时超时。', desc_en: 'The server timed out while waiting for the client to send the request.' },
    { code: 409, name_zh: '冲突', name_en: 'Conflict', category: '4xx', desc_zh: '请求与服务器的当前状态冲突（如版本冲突、编辑冲突）。', desc_en: 'The request conflicts with the current state of the server (e.g., version conflict, edit conflict).' },
    { code: 410, name_zh: '已删除', name_en: 'Gone', category: '4xx', desc_zh: '请求的资源已永久删除，不会再有。', desc_en: 'The requested resource is permanently gone and will not be available again.' },
    { code: 411, name_zh: '需要长度', name_en: 'Length Required', category: '4xx', desc_zh: '请求缺少 Content-Length 头字段。', desc_en: 'The request is missing the required Content-Length header field.' },
    { code: 412, name_zh: '前提条件失败', name_en: 'Precondition Failed', category: '4xx', desc_zh: '请求头中的条件（如 If-Match）未满足。', desc_en: 'One or more conditions in the request header fields (e.g., If-Match) evaluated to false.' },
    { code: 413, name_zh: '请求实体过大', name_en: 'Payload Too Large', category: '4xx', desc_zh: '请求体超过服务器允许的大小限制。', desc_en: 'The request body is larger than the server is willing to process.' },
    { code: 414, name_zh: 'URI 过长', name_en: 'URI Too Long', category: '4xx', desc_zh: '请求的 URI 超过服务器允许的长度。', desc_en: 'The URI is longer than the server is willing to interpret.' },
    { code: 415, name_zh: '不支持的媒体类型', name_en: 'Unsupported Media Type', category: '4xx', desc_zh: '请求体的媒体类型不被服务器支持。', desc_en: 'The media type of the request body is not supported by the server.' },
    { code: 416, name_zh: '范围不满足', name_en: 'Range Not Satisfiable', category: '4xx', desc_zh: '请求的 Range 头字段无法满足（超出资源范围）。', desc_en: 'The Range header field cannot be satisfied (the range is outside the resource).' },
    { code: 417, name_zh: '期望失败', name_en: 'Expectation Failed', category: '4xx', desc_zh: '服务器无法满足 Expect 请求头中的要求。', desc_en: 'The server cannot meet the requirements of the Expect request header.' },
    { code: 418, name_zh: '我是茶壶', name_en: "I'm a Teapot", category: '4xx', desc_zh: '愚人节彩蛋——服务器拒绝煮咖啡，因为它是一个茶壶（RFC 2324）。', desc_en: "April Fools' joke — the server refuses to brew coffee because it is a teapot (RFC 2324)." },
    { code: 421, name_zh: '误定向请求', name_en: 'Misdirected Request', category: '4xx', desc_zh: '请求被发送到无法产生响应的服务器。', desc_en: 'The request was sent to a server that is not able to produce a response.' },
    { code: 422, name_zh: '不可处理的实体', name_en: 'Unprocessable Entity', category: '4xx', desc_zh: '请求格式正确但语义错误（WebDAV/REST API 校验失败）。', desc_en: 'The request is well-formed but semantically incorrect (WebDAV/REST API validation failure).' },
    { code: 423, name_zh: '已锁定', name_en: 'Locked', category: '4xx', desc_zh: '请求的资源被锁定（WebDAV）。', desc_en: 'The resource being accessed is locked (WebDAV).' },
    { code: 424, name_zh: '依赖失败', name_en: 'Failed Dependency', category: '4xx', desc_zh: '请求因前置请求失败而失败（WebDAV）。', desc_en: 'The request failed because a preceding request failed (WebDAV).' },
    { code: 425, name_zh: '太早', name_en: 'Too Early', category: '4xx', desc_zh: '服务器风险过高，拒绝重放请求。', desc_en: 'The server is unwilling to risk processing a request that might be replayed.' },
    { code: 426, name_zh: '需要升级', name_en: 'Upgrade Required', category: '4xx', desc_zh: '客户端应切换到其他协议（如 TLS/1.3）。', desc_en: 'The client should switch to a different protocol (e.g., TLS/1.3).' },
    { code: 428, name_zh: '需要前置条件', name_en: 'Precondition Required', category: '4xx', desc_zh: '服务器要求请求包含条件头（防止丢失更新）。', desc_en: 'The server requires the request to be conditional (to prevent lost updates).' },
    { code: 429, name_zh: '请求过多', name_en: 'Too Many Requests', category: '4xx', desc_zh: '客户端在指定时间内发送了过多请求（限流）。', desc_en: 'The client has sent too many requests in a given amount of time (rate limiting).' },
    { code: 431, name_zh: '请求头字段过大', name_en: 'Request Header Fields Too Large', category: '4xx', desc_zh: '请求头字段太大，服务器无法处理。', desc_en: 'The request header fields are too large for the server to process.' },
    { code: 451, name_zh: '因法律原因不可用', name_en: 'Unavailable For Legal Reasons', category: '4xx', desc_zh: '由于法律审查要求，资源不可用。', desc_en: 'The resource is unavailable due to legal censorship requirements.' },
    // 5xx Server Error
    { code: 500, name_zh: '服务器内部错误', name_en: 'Internal Server Error', category: '5xx', desc_zh: '服务器遇到意外情况，无法完成请求（通用错误）。', desc_en: 'The server encountered an unexpected condition that prevented it from fulfilling the request.' },
    { code: 501, name_zh: '未实现', name_en: 'Not Implemented', category: '5xx', desc_zh: '服务器不支持请求所需的功能。', desc_en: 'The server does not support the functionality required to fulfill the request.' },
    { code: 502, name_zh: '错误的网关', name_en: 'Bad Gateway', category: '5xx', desc_zh: '网关/代理服务器从上游收到无效响应（常见于 Nginx 后端宕机）。', desc_en: 'The gateway/proxy received an invalid response from the upstream server (common with Nginx backend crashes).' },
    { code: 503, name_zh: '服务不可用', name_en: 'Service Unavailable', category: '5xx', desc_zh: '服务器暂时无法处理请求（维护或过载）。', desc_en: 'The server is temporarily unable to handle the request (maintenance or overload).' },
    { code: 504, name_zh: '网关超时', name_en: 'Gateway Timeout', category: '5xx', desc_zh: '网关/代理服务器未及时从上游收到响应。', desc_en: 'The gateway/proxy did not receive a timely response from the upstream server.' },
    { code: 505, name_zh: 'HTTP 版本不支持', name_en: 'HTTP Version Not Supported', category: '5xx', desc_zh: '服务器不支持请求中使用的 HTTP 协议版本。', desc_en: 'The server does not support the HTTP protocol version used in the request.' },
    { code: 506, name_zh: '变体协商', name_en: 'Variant Also Negotiates', category: '5xx', desc_zh: '服务器内部配置错误，导致内容协商进入死循环。', desc_en: 'Internal server configuration error causing circular content negotiation.' },
    { code: 507, name_zh: '存储不足', name_en: 'Insufficient Storage', category: '5xx', desc_zh: '服务器存储空间不足，无法完成请求（WebDAV）。', desc_en: 'The server has insufficient storage to complete the request (WebDAV).' },
    { code: 508, name_zh: '检测到循环', name_en: 'Loop Detected', category: '5xx', desc_zh: '服务器在处理请求时检测到无限循环（WebDAV）。', desc_en: 'The server detected an infinite loop while processing the request (WebDAV).' },
    { code: 510, name_zh: '未扩展', name_en: 'Not Extended', category: '5xx', desc_zh: '服务器需要进一步扩展请求才能满足。', desc_en: 'The server requires further extensions to the request to fulfill it.' },
    { code: 511
, name_zh: '需要网络认证', name_en: 'Network Authentication Required', category: '5xx', desc_zh: '客户端需要网络认证（如强制门户登录页面）。', desc_en: 'The client needs network authentication (e.g., captive portal login page).' },
  ];

  const CATEGORIES = {
    '1xx': { icon: 'ℹ️', color: '#6366f1', label_zh: '信息响应', label_en: 'Informational' },
    '2xx': { icon: '✅', color: '#22c55e', label_zh: '成功', label_en: 'Success' },
    '3xx': { icon: '↗️', color: '#f59e0b', label_zh: '重定向', label_en: 'Redirection' },
    '4xx': { icon: '⚠️', color: '#ef4444', label_zh: '客户端错误', label_en: 'Client Error' },
    '5xx': { icon: '🚫', color: '#dc2626', label_zh: '服务器错误', label_en: 'Server Error' },
  };

  function render() {
    const searchVal = document.getElementById('statusSearch').value.trim();
    const filter = document.querySelector('#statusFilter .active')?.dataset?.filter || 'all';
    const result = document.getElementById('statusResult');

    let filtered = STATUS_CODES;
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.category === filter);
    }
    if (searchVal) {
      const num = parseInt(searchVal);
      if (!isNaN(num)) {
        filtered = filtered.filter(s => s.code === num);
      }
    }

    if (filtered.length === 0) {
      result.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-dim);font-size:15px">' + (isEN ? 'No status codes found' : '未找到匹配的状态码') + '</div>';
      return;
    }

    let html = '';
    filtered.forEach(function(s) {
      var cat = CATEGORIES[s.category] || { icon: '', color: '#666', label_zh: s.category, label_en: s.category };
      var catLabel = isEN ? cat.label_en : cat.label_zh;
      var name = isEN ? s.name_en : s.name_zh;
      var desc = isEN ? s.desc_en : s.desc_zh;
      html += '<div class="status-card" style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--card);transition:box-shadow 0.15s">';
      html += '<div style="flex-shrink:0;width:48px;height:48px;border-radius:10px;background:' + cat.color + '15;display:flex;flex-direction:column;align-items:center;justify-content:center;color:' + cat.color + ';font-weight:700;font-size:13px;line-height:1.2">';
      html += '<span style="font-size:11px;opacity:0.7">' + cat.icon + '</span>';
      html += '<span style="font-size:16px;font-weight:700">' + s.code + '</span></div>';
      html += '<div style="flex:1;min-width:0">';
      html += '<div style="font-weight:600;font-size:15px;margin-bottom:3px">' + name + '</div>';
      html += '<div style="font-size:13px;color:var(--text-dim);line-height:1.5">' + desc + '</div>';
      html += '<div style="margin-top:4px;display:inline-block;font-size:11px;padding:1px 8px;border-radius:4px;background:' + cat.color + '15;color:' + cat.color + '">' + catLabel + '</div></div>';
      html += '<button class="btn-icon" onclick="navigator.clipboard.writeText(\'' + s.code + '\')" title="' + (isEN ? 'Copy code' : '复制状态码') + '" style="flex-shrink:0;width:32px;height:32px;border:1px solid var(--border);border-radius:6px;background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;opacity:0.6">📋</button>';
      html += '</div>';
    });

    result.innerHTML = html;
    var countEl = document.getElementById('statusCount');
    if (countEl) countEl.textContent = filtered.length;
  }

  function init() {
    var search = document.getElementById('statusSearch');
    var filterBtns = document.querySelectorAll('#statusFilter .btn');
    var result = document.getElementById('statusResult');
    if (!search || !result) return;

    var countEl = document.createElement('div');
    countEl.style.cssText = 'font-size:13px;color:var(--text-dim);margin-bottom:12px';
    countEl.innerHTML = '<span id="statusCount">' + STATUS_CODES.length + '</span> ' + (isEN ? 'status codes' : '个状态码');
    result.parentNode.insertBefore(countEl, result);

    search.addEventListener('input', render);
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) {
          b.classList.remove('active');
          b.style.background = '';
          b.style.color = '';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
        render();
      });
    });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
