/**
 * HTML Sanitizer — Strip dangerous HTML while preserving safe content
 * AI Toolbox - Privacy-first browser-local tool
 *
 * Pure JS implementation using a whitelist-based approach.
 * All processing is local.
 */
(function () {
  'use strict';

  function init() {
    var input = document.getElementById('hs-input');
    var output = document.getElementById('hs-output');
    var msg = document.getElementById('hs-msg');
    var sanitizeBtn = document.getElementById('hs-sanitize');
    var copyBtn = document.getElementById('hs-copy');
    var clearBtn = document.getElementById('hs-clear');
    var modeRadios = document.getElementsByName('hs-mode');
    var isEN = document.documentElement.lang === 'en';

    if (!input || !output || !sanitizeBtn) return;

    var T = function (zh, en) { return isEN ? en : zh; };

    function showMsg(text, isError) {
      if (!msg) return;
      msg.textContent = text;
      msg.style.color = isError ? 'var(--error, #e74c3c)' : 'var(--success, #27ae60)';
    }

    function getMode() {
      for (var i = 0; i < modeRadios.length; i++) {
        if (modeRadios[i].checked) return modeRadios[i].value;
      }
      return 'safe';
    }

    // Whitelist of safe HTML tags
    var SAFE_TAGS = {
      'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
      'p': true, 'br': true, 'hr': true, 'pre': true, 'blockquote': true,
      'div': true, 'span': true, 'section': true, 'article': true,
      'header': true, 'footer': true, 'nav': true, 'main': true, 'aside': true,
      'a': true, 'abbr': true, 'b': true, 'strong': true, 'i': true, 'em': true,
      'u': true, 's': true, 'del': true, 'ins': true, 'mark': true, 'small': true,
      'sub': true, 'sup': true, 'code': true, 'kbd': true, 'samp': true,
      'var': true, 'q': true, 'cite': true, 'dfn': true, 'time': true,
      'bdo': true, 'bdi': true, 'ruby': true, 'rt': true, 'rp': true,
      'wbr': true,
      'ul': true, 'ol': true, 'li': true, 'dl': true, 'dt': true, 'dd': true,
      'table': true, 'caption': true, 'colgroup': true, 'col': true,
      'thead': true, 'tbody': true, 'tfoot': true,
      'tr': true, 'th': true, 'td': true,
      'form': true, 'fieldset': true, 'legend': true, 'label': true,
      'input': true, 'textarea': true, 'select': true, 'option': true,
      'optgroup': true, 'button': true, 'datalist': true, 'output': true,
      'progress': true, 'meter': true,
      'img': true, 'figure': true, 'figcaption': true,
      'audio': true, 'video': true, 'source': true, 'track': true,
      'picture': true, 'svg': true, 'canvas': true,
      'iframe': true, 'embed': true, 'object': true, 'param': true,
      'details': true, 'summary': true, 'dialog': true,
      'template': true, 'slot': true
    };

    // Attributes allowed for all tags
    var GLOBAL_ATTRS = {
      'id': true, 'class': true, 'style': true, 'title': true, 'lang': true,
      'dir': true, 'hidden': true, 'tabindex': true, 'accesskey': true,
      'contenteditable': true, 'draggable': true, 'spellcheck': true,
      'translate': true, 'slot': true, 'part': true, 'exportparts': true
    };

    // Attributes allowed for specific tags
    var TAG_ATTRS = {
      'a': { 'href': true, 'target': true, 'rel': true, 'download': true, 'hreflang': true, 'type': true },
      'img': { 'src': true, 'alt': true, 'width': true, 'height': true, 'loading': true, 'srcset': true, 'sizes': true, 'decoding': true },
      'video': { 'src': true, 'width': true, 'height': true, 'poster': true, 'autoplay': true, 'controls': true, 'loop': true, 'muted': true, 'preload': true },
      'audio': { 'src': true, 'controls': true, 'autoplay': true, 'loop': true, 'muted': true, 'preload': true },
      'source': { 'src': true, 'type': true, 'srcset': true, 'media': true, 'sizes': true },
      'track': { 'src': true, 'kind': true, 'srclang': true, 'label': true, 'default': true },
      'iframe': { 'src': true, 'width': true, 'height': true, 'allow': true, 'allowfullscreen': true, 'loading': true, 'sandbox': true },
      'input': { 'type': true, 'name': true, 'value': true, 'placeholder': true, 'required': true, 'disabled': true, 'readonly': true, 'checked': true, 'maxlength': true, 'minlength': true, 'pattern': true, 'min': true, 'max': true, 'step': true, 'autocomplete': true, 'accept': true, 'multiple': true, 'size': true, 'list': true },
      'textarea': { 'name': true, 'rows': true, 'cols': true, 'placeholder': true, 'required': true, 'disabled': true, 'readonly': true, 'maxlength': true, 'minlength': true, 'wrap': true },
      'select': { 'name': true, 'required': true, 'disabled': true, 'multiple': true, 'size': true },
      'option': { 'value': true, 'disabled': true, 'selected': true, 'label': true },
      'optgroup': { 'label': true, 'disabled': true },
      'button': { 'type': true, 'name': true, 'value': true, 'disabled': true, 'form': true, 'formaction': true, 'formenctype': true, 'formmethod': true, 'formnovalidate': true, 'formtarget': true },
      'form': { 'action': true, 'method': true, 'enctype': true, 'novalidate': true, 'target': true, 'name': true },
      'label': { 'for': true, 'form': true },
      'fieldset': { 'disabled': true, 'form': true, 'name': true },
      'details': { 'open': true },
      'dialog': { 'open': true },
      'col': { 'span': true, 'width': true },
      'colgroup': { 'span': true, 'width': true },
      'td': { 'colspan': true, 'rowspan': true, 'headers': true, 'scope': false },
      'th': { 'colspan': true, 'rowspan': true, 'headers': true, 'scope': true, 'abbr': true },
      'ol': { 'start': true, 'type': true, 'reversed': true },
      'li': { 'value': true },
      'blockquote': { 'cite': true },
      'q': { 'cite': true },
      'del': { 'cite': true, 'datetime': true },
      'ins': { 'cite': true, 'datetime': true },
      'time': { 'datetime': true },
      'progress': { 'value': true, 'max': true },
      'meter': { 'value': true, 'min': true, 'max': true, 'low': true, 'high': true, 'optimum': true },
      'canvas': { 'width': true, 'height': true },
      'object': { 'data': true, 'type': true, 'width': true, 'height': true, 'name': true },
      'param': { 'name': true, 'value': true },
      'embed': { 'src': true, 'type': true, 'width': true, 'height': true },
      'map': { 'name': true },
      'area': { 'shape': true, 'coords': true, 'href': true, 'alt': true, 'target': true, 'rel': true, 'download': true },
      'meta': { 'charset': true, 'content': true, 'http-equiv': true, 'name': true },
      'link': { 'rel': true, 'href': true, 'type': true, 'media': true },
      'svg': { 'width': true, 'height': true, 'viewbox': true, 'xmlns': true, 'fill': true, 'stroke': true, 'stroke-width': true }
    };

    // Dangerous URL schemes
    var DANGEROUS_SCHEMES = /^\s*(javascript|data|vbscript|file|jar):/i;

    // Dangerous event handler attributes
    var DANGEROUS_ATTRS = {
      'onabort': true, 'onblur': true, 'onchange': true, 'onclick': true,
      'oncontextmenu': true, 'ondblclick': true, 'ondrag': true, 'ondragend': true,
      'ondragenter': true, 'ondragexit': true, 'ondragleave': true, 'ondragover': true,
      'ondragstart': true, 'ondrop': true, 'onerror': true, 'onfocus': true,
      'oninput': true, 'oninvalid': true, 'onkeydown': true, 'onkeypress': true,
      'onkeyup': true, 'onload': true, 'onmousedown': true, 'onmouseenter': true,
      'onmouseleave': true, 'onmousemove': true, 'onmouseout': true,
      'onmouseover': true, 'onmouseup': true, 'onmousewheel': true,
      'onpause': true, 'onplay': true, 'onplaying': true, 'onprogress': true,
      'onreset': true, 'onresize': true, 'onscroll': true, 'onseeked': true,
      'onseeking': true, 'onselect': true, 'onsubmit': true, 'onsuspend': true,
      'ontimeupdate': true, 'ontoggle': true, 'onvolumechange': true,
      'onwaiting': true, 'onwheel': true, 'onpointerdown': true,
      'onpointermove': true, 'onpointerup': true, 'onpointercancel': true,
      'onpointerenter': true, 'onpointerleave': true, 'onpointerover': true,
      'onpointerout': true
    };

    function sanitizeHTML(html, mode) {
      var parser = new DOMParser();
      var doc = parser.parseFromString('<html><head></head><body>' + html + '</body></html>', 'text/html');
      var body = doc.body;

      function sanitizeNode(node) {
        if (node.nodeType === 3) return; // Text node
        if (node.nodeType === 8) { // Comment
          node.parentNode.removeChild(node);
          return;
        }

        if (node.nodeType === 1) {
          var tag = node.tagName.toLowerCase();

          // In strict mode, remove unknown tags (keep text content)
          if (mode === 'strict' && !SAFE_TAGS[tag]) {
            var parent = node.parentNode;
            var fragment = document.createDocumentFragment();
            while (node.firstChild) {
              fragment.appendChild(node.firstChild);
            }
            parent.replaceChild(fragment, node);
            var children = Array.from(fragment.childNodes);
            children.forEach(function (child) { sanitizeNode(child); });
            return;
          }

          // In strict mode, remove script/style/noscript entirely
          if (mode === 'strict' && (tag === 'script' || tag === 'noscript' || tag === 'style')) {
            node.parentNode.removeChild(node);
            return;
          }

          // In safe mode, empty script/style content
          if (mode === 'safe' && (tag === 'script' || tag === 'style')) {
            node.textContent = '';
          }

          // Sanitize attributes
          var attrs = Array.from(node.attributes);
          attrs.forEach(function (attr) {
            var attrName = attr.name.toLowerCase();
            var attrValue = attr.value;

            // Remove event handlers
            if (DANGEROUS_ATTRS[attrName]) {
              node.removeAttribute(attr.name);
              return;
            }

            // Check if attribute is allowed
            var tagSpecific = TAG_ATTRS[tag];
            var isGlobal = GLOBAL_ATTRS[attrName];
            var isAllowed = isGlobal;

            if (tagSpecific && tagSpecific[attrName] !== undefined) {
              isAllowed = tagSpecific[attrName];
            }

            if (!isAllowed) {
              node.removeAttribute(attr.name);
              return;
            }

            // Sanitize URL attributes
            if (attrName === 'href' || attrName === 'src' || attrName === 'action' ||
                attrName === 'formaction' || attrName === 'data') {
              if (DANGEROUS_SCHEMES.test(attrValue)) {
                node.removeAttribute(attr.name);
                return;
              }
            }
          });

          // Recursively sanitize children
          var children = Array.from(node.childNodes);
          children.forEach(function (child) { sanitizeNode(child); });
        }
      }

      sanitizeNode(body);
      return body.innerHTML;
    }

    function sanitize() {
      var html = input.value;
      if (!html.trim()) {
        showMsg(T('请输入 HTML 代码。', 'Please enter HTML code.'), true);
        return;
      }

      try {
        var mode = getMode();
        var result = sanitizeHTML(html, mode);
        output.value = result;
        showMsg(T('✓ 净化完成！' + (mode === 'strict' ? '（严格模式，已移除不安全标签）' : '（安全模式，已清空脚本内容）'), '✓ Sanitized! ' + (mode === 'strict' ? '(Strict mode, unsafe tags removed)' : '(Safe mode, scripts emptied)')));
      } catch (e) {
        showMsg(T('错误：' + e.message, 'Error: ' + e.message), true);
      }
    }

    function copyResult() {
      var code = output.value.trim();
      if (!code) {
        showMsg(T('请先净化 HTML。', 'Please sanitize HTML first.'), true);
        return;
      }
      navigator.clipboard.writeText(code).then(function () {
        showMsg(T('✓ 已复制到剪贴板！', '✓ Copied to clipboard!'));
      }).catch(function () {
        output.select();
        document.execCommand('copy');
        showMsg(T('✓ 已复制！', '✓ Copied!'));
      });
    }

    function clearAll() {
      input.value = '';
      output.value = '';
      showMsg('');
    }

    sanitizeBtn.addEventListener('click', sanitize);
    copyBtn.addEventListener('click', copyResult);
    clearBtn.addEventListener('click', clearAll);

    input.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        sanitize();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();