// Color Name Finder
// 148 CSS named colors with RGB values
const CSS_COLORS = {
  "aliceblue": [240,248,255], "antiquewhite": [250,235,215], "aqua": [0,255,255],
  "aquamarine": [127,255,212], "azure": [240,255,255], "beige": [245,245,220],
  "bisque": [255,228,196], "black": [0,0,0], "blanchedalmond": [255,235,205],
  "blue": [0,0,255], "blueviolet": [138,43,226], "brown": [165,42,42],
  "burlywood": [222,184,135], "cadetblue": [95,158,160], "chartreuse": [127,255,0],
  "chocolate": [210,105,30], "coral": [255,127,80], "cornflowerblue": [100,149,237],
  "cornsilk": [255,248,220], "crimson": [220,20,60], "cyan": [0,255,255],
  "darkblue": [0,0,139], "darkcyan": [0,139,139], "darkgoldenrod": [184,134,11],
  "darkgray": [169,169,169], "darkgreen": [0,100,0], "darkgrey": [169,169,169],
  "darkkhaki": [189,183,107], "darkmagenta": [139,0,139], "darkolivegreen": [85,107,47],
  "darkorange": [255,140,0], "darkorchid": [153,50,204], "darkred": [139,0,0],
  "darksalmon": [233,150,122], "darkseagreen": [143,188,143], "darkslateblue": [72,61,139],
  "darkslategray": [47,79,79], "darkslategrey": [47,79,79], "darkturquoise": [0,206,209],
  "darkviolet": [148,0,211], "deeppink": [255,20,147], "deepskyblue": [0,191,255],
  "dimgray": [105,105,105], "dimgrey": [105,105,105], "dodgerblue": [30,144,255],
  "firebrick": [178,34,34], "floralwhite": [255,250,240], "forestgreen": [34,139,34],
  "fuchsia": [255,0,255], "gainsboro": [220,220,220], "ghostwhite": [248,248,255],
  "gold": [255,215,0], "goldenrod": [218,165,32], "gray": [128,128,128],
  "green": [0,128,0], "greenyellow": [173,255,47], "grey": [128,128,128],
  "honeydew": [240,255,240], "hotpink": [255,105,180], "indianred": [205,92,92],
  "indigo": [75,0,130], "ivory": [255,255,240], "khaki": [240,230,140],
  "lavender": [230,230,250], "lavenderblush": [255,240,245], "lawngreen": [124,252,0],
  "lemonchiffon": [255,250,205], "lightblue": [173,216,230], "lightcoral": [240,128,128],
  "lightcyan": [224,255,255], "lightgoldenrodyellow": [250,250,210], "lightgray": [211,211,211],
  "lightgreen": [144,238,144], "lightgrey": [211,211,211], "lightpink": [255,182,193],
  "lightsalmon": [255,160,122], "lightseagreen": [32,178,170], "lightskyblue": [135,206,250],
  "lightslategray": [119,136,153], "lightslategrey": [119,136,153], "lightsteelblue": [176,196,222],
  "lightyellow": [255,255,224], "lime": [0,255,0], "limegreen": [50,205,50],
  "linen": [250,240,230], "magenta": [255,0,255], "maroon": [128,0,0],
  "mediumaquamarine": [102,205,170], "mediumblue": [0,0,205], "mediumorchid": [186,85,211],
  "mediumpurple": [147,112,219], "mediumseagreen": [60,179,113], "mediumslateblue": [123,104,238],
  "mediumspringgreen": [0,250,154], "mediumturquoise": [72,209,204], "mediumvioletred": [199,21,133],
  "midnightblue": [25,25,112], "mintcream": [245,255,250], "mistyrose": [255,228,225],
  "moccasin": [255,228,181], "navajowhite": [255,222,173], "navy": [0,0,128],
  "oldlace": [253,245,230], "olive": [128,128,0], "olivedrab": [107,142,35],
  "orange": [255,165,0], "orangered": [255,69,0], "orchid": [218,112,214],
  "palegoldenrod": [238,232,170], "palegreen": [152,251,152], "paleturquoise": [175,238,238],
  "palevioletred": [219,112,147], "papayawhip": [255,239,213], "peachpuff": [255,218,185],
  "peru": [205,133,63], "pink": [255,192,203], "plum": [221,160,221],
  "powderblue": [176,224,230], "purple": [128,0,128], "rebeccapurple": [102,51,153],
  "red": [255,0,0], "rosybrown": [188,143,143], "royalblue": [65,105,225],
  "saddlebrown": [139,69,19], "salmon": [250,128,114], "sandybrown": [244,164,96],
  "seagreen": [46,139,87], "seashell": [255,245,238], "sienna": [160,82,45],
  "silver": [192,192,192], "skyblue": [135,206,235], "slateblue": [106,90,205],
  "slategray": [112,128,144], "slategrey": [112,128,144], "snow": [255,250,250],
  "springgreen": [0,255,127], "steelblue": [70,130,180], "tan": [210,180,140],
  "teal": [0,128,128], "thistle": [216,191,216], "tomato": [255,99,71],
  "transparent": [0,0,0], "turquoise": [64,224,208], "violet": [238,130,238],
  "wheat": [245,222,179], "white": [255,255,255], "whitesmoke": [245,245,245],
  "yellow": [255,255,0], "yellowgreen": [154,205,50]
};

(function() {
  const input = document.getElementById('cnfInput');
  const searchBtn = document.getElementById('cnfSearch');
  const copyBtn = document.getElementById('cnfCopyName');
  const result = document.getElementById('cnfResult');
  const preview = document.getElementById('cnfPreview');
  const filter = document.getElementById('cnfFilter');
  const palette = document.getElementById('cnfPalette');

  if (!input) return;

  // Parse hex or rgb string -> [r,g,b]
  function parseColor(str) {
    if (!str) return null;
    str = str.trim();
    // Hex
    let m = str.match(/^#?([0-9a-fA-F]{3,8})$/);
    if (m) {
      let h = m[1];
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      if (h.length === 6) return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
      return null;
    }
    // rgb/rgba
    m = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
    return null;
  }

  // Euclidean distance in RGB space
  function colorDistance(c1, c2) {
    return Math.sqrt((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2);
  }

  function findClosestColor(rgb) {
    let bestName = 'black', bestDist = Infinity;
    for (const [name, val] of Object.entries(CSS_COLORS)) {
      const d = colorDistance(rgb, val);
      if (d < bestDist) { bestDist = d; bestName = name; }
    }
    return bestName;
  }

  function toHex(r, g, b) {
    return '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
  }

  function lookup() {
    const rgb = parseColor(input.value);
    if (!rgb) {
      result.innerHTML = '<div style="color:var(--error)">⚠ 无法解析颜色值。请使用 Hex (#ff6347) 或 RGB (rgb(255,99,71)) 格式。</div>';
      return;
    }
    const name = findClosestColor(rgb);
    const hex = toHex(rgb[0], rgb[1], rgb[2]);
    preview.style.backgroundColor = hex;
    preview.textContent = name;
    const namedRgb = CSS_COLORS[name];
    const namedHex = toHex(namedRgb[0], namedRgb[1], namedRgb[2]);
    const dist = Math.round(colorDistance(rgb, namedRgb));
    result.innerHTML = '<div style="padding:16px;background:var(--bg-card);border-radius:12px;border:1px solid var(--border)">' +
      '<div style="display:flex;gap:16px;align-items:center">' +
      '<div style="width:48px;height:48px;border-radius:8px;background:' + namedHex + ';border:1px solid var(--border)"></div>' +
      '<div><strong style="font-size:18px;text-transform:capitalize">' + name + '</strong><br>' +
      '<span style="color:var(--text-dim);font-size:13px">' + namedHex + ' | RGB(' + namedRgb.join(',') + ')' +
      (dist > 0 ? ' | 偏差: ' + dist : '') + '</span></div></div></div>';
  }

  function renderPalette(query) {
    const q = (query || '').toLowerCase().trim();
    let items = '';
    let count = 0;
    for (const [name, rgb] of Object.entries(CSS_COLORS)) {
      if (q && !name.includes(q)) continue;
      if (count >= 300) break;
      const hex = toHex(rgb[0], rgb[1], rgb[2]);
      const textColor = (rgb[0]*0.299 + rgb[1]*0.587 + rgb[2]*0.114) > 128 ? '#1a1a1a' : '#fff';
      items += '<div style="background:' + hex + ';padding:8px 10px;border-radius:8px;color:' + textColor + ';font-size:13px;text-transform:capitalize;cursor:pointer;border:1px solid var(--border)" onclick="document.getElementById(\'cnfInput\').value=\'' + hex + '\';document.getElementById(\'cnfSearch\').click()">' +
        name + '<br><span style="opacity:0.7;font-size:11px;font-family:monospace">' + hex + '</span></div>';
      count++;
    }
    palette.innerHTML = items || '<div style="color:var(--text-dim);grid-column:1/-1">无匹配颜色</div>';
  }

  searchBtn.addEventListener('click', lookup);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') lookup(); });
  copyBtn.addEventListener('click', () => {
    const name = preview.textContent;
    if (name && name !== '输入颜色预览' && name !== 'Preview') {
      navigator.clipboard.writeText(name).then(() => toast('已复制: ' + name));
    }
  });
  filter.addEventListener('input', () => renderPalette(filter.value));

  // Initial render
  renderPalette('');
  // Set a default color
  input.value = '#6366f1';
  lookup();
})();