// MIME Type Lookup - browser-local, no dependencies
(() => {
  const el = document.getElementById('mt-search');
  const tb = document.getElementById('mt-tbody');
  const ct = document.getElementById('mt-count');
  const msg = document.getElementById('mt-msg');
  const isEN = document.documentElement.lang === 'en';
  if (!el || !tb) return;

  const DB = [
    [".html","text/html","text","HTML文档","HTML document"],
    [".htm","text/html","text","HTML文档","HTML document"],
    [".css","text/css","text","CSS样式表","CSS stylesheet"],
    [".js","text/javascript","text","JavaScript脚本","JavaScript script"],
    [".mjs","text/javascript","text","ES模块","ES module"],
    [".ts","text/typescript","text","TypeScript源码","TypeScript source"],
    [".json","application/json","application","JSON数据","JSON data"],
    [".xml","application/xml","application","XML文档","XML document"],
    [".txt","text/plain","text","纯文本","Plain text"],
    [".csv","text/csv","text","CSV表格数据","CSV data"],
    [".tsv","text/tab-separated-values","text","TSV数据","TSV data"],
    [".md","text/markdown","text","Markdown文档","Markdown document"],
    [".yaml","application/x-yaml","application","YAML配置文件","YAML config"],
    [".yml","application/x-yaml","application","YAML配置文件","YAML config"],
    [".toml","application/toml","application","TOML配置文件","TOML config"],
    [".ini","text/plain","text","INI配置文件","INI config"],
    [".log","text/plain","text","日志文件","Log file"],
    [".rtf","text/rtf","text","富文本格式","Rich Text Format"],
    [".sql","text/x-sql","text","SQL脚本","SQL script"],
    [".sh","text/x-shellscript","text","Shell脚本","Shell script"],
    [".bat","text/x-bat","text","批处理脚本","Batch script"],
    [".ps1","text/x-powershell","text","PowerShell脚本","PowerShell script"],
    [".py","text/x-python","text","Python源码","Python source"],
    [".java","text/x-java-source","text","Java源码","Java source"],
    [".go","text/x-go","text","Go源码","Go source"],
    [".rs","text/x-rust","text","Rust源码","Rust source"],
    [".c","text/x-c","text","C源码","C source"],
    [".cpp","text/x-c++","text","C++源码","C++ source"],
    [".h","text/x-c","text","C/C++头文件","C/C++ header"],
    [".php","text/x-php","text","PHP源码","PHP source"],
    [".rb","text/x-ruby","text","Ruby源码","Ruby source"],
    [".swift","text/x-swift","text","Swift源码","Swift source"],
    [".kt","text/x-kotlin","text","Kotlin源码","Kotlin source"],
    [".vue","text/html","text","Vue组件","Vue component"],
    [".jsx","text/jsx","text","JSX组件","JSX component"],
    [".tsx","text/typescript","text","TSX组件","TSX component"],
    [".sass","text/x-sass","text","SASS样式","SASS stylesheet"],
    [".scss","text/x-scss","text","SCSS样式","SCSS stylesheet"],
    [".less","text/x-less","text","LESS样式","LESS stylesheet"],
    [".coffee","text/coffeescript","text","CoffeeScript源码","CoffeeScript source"],
    [".dart","text/x-dart","text","Dart源码","Dart source"],
    [".lua","text/x-lua","text","Lua源码","Lua source"],
    [".pl","text/x-perl","text","Perl源码","Perl source"],
    [".svg","image/svg+xml","image","SVG矢量图","SVG vector image"],
    [".png","image/png","image","PNG图片","PNG image"],
    [".jpg","image/jpeg","image","JPEG图片","JPEG image"],
    [".jpeg","image/jpeg","image","JPEG图片","JPEG image"],
    [".gif","image/gif","image","GIF图片","GIF image"],
    [".webp","image/webp","image","WebP图片","WebP image"],
    [".bmp","image/bmp","image","BMP位图","BMP bitmap"],
    [".ico","image/x-icon","image","图标文件","Icon file"],
    [".avif","image/avif","image","AVIF图片","AVIF image"],
    [".tiff","image/tiff","image","TIFF图片","TIFF image"],
    [".tif","image/tiff","image","TIFF图片","TIFF image"],
    [".heic","image/heic","image","HEIC图片","HEIC image"],
    [".heif","image/heif","image","HEIF图片","HEIF image"],
    [".mp3","audio/mpeg","audio","MP3音频","MP3 audio"],
    [".wav","audio/wav","audio","WAV音频","WAV audio"],
    [".ogg","audio/ogg","audio","OGG音频","OGG audio"],
    [".flac","audio/flac","audio","FLAC无损音频","FLAC audio"],
    [".aac","audio/aac","audio","AAC音频","AAC audio"],
    [".opus","audio/opus","audio","Opus音频","Opus audio"],
    [".midi","audio/midi","audio","MIDI音乐","MIDI music"],
    [".mid","audio/midi","audio","MIDI音乐","MIDI music"],
    [".wma","audio/x-ms-wma","audio","WMA音频","WMA audio"],
    [".m4a","audio/mp4","audio","M4A音频","M4A audio"],
    [".mp4","video/mp4","video","MP4视频","MP4 video"],
    [".webm","video/webm","video","WebM视频","WebM video"],
    [".avi","video/x-msvideo","video","AVI视频","AVI video"],
    [".mov","video/quicktime","video","QuickTime视频","QuickTime video"],
    [".mkv","video/x-matroska","video","MKV视频","MKV video"],
    [".flv","video/x-flv","video","FLV视频","FLV video"],
    [".wmv","video/x-ms-wmv","video","WMV视频","WMV video"],
    [".m4v","video/x-m4v","video","M4V视频","M4V video"],
    [".3gp","video/3gpp","video","3GP视频","3GP video"],
    [".ogv","video/ogg","video","OGV视频","OGV video"],
    [".mpeg","video/mpeg","video","MPEG视频","MPEG video"],
    [".mpg","video/mpeg","video","MPEG视频","MPEG video"],
    [".pdf","application/pdf","application","PDF文档","PDF document"],
    [".zip","application/zip","application","ZIP压缩包","ZIP archive"],
    [".rar","application/vnd.rar","application","RAR压缩包","RAR archive"],
    [".7z","application/x-7z-compressed","application","7z压缩包","7z archive"],
    [".tar","application/x-tar","application","TAR压缩包","TAR archive"],
    [".gz","application/gzip","application","GZip压缩包","GZip archive"],
    [".bz2","application/x-bzip2","application","BZip2压缩包","BZip2 archive"],
    [".xz","application/x-xz","application","XZ压缩包","XZ archive"],
    [".zst","application/zstd","application","Zstd压缩包","Zstd archive"],
    [".wasm","application/wasm","application","WebAssembly二进制","WebAssembly binary"],
    [".apk","application/vnd.android.package-archive","application","Android安装包","Android APK"],
    [".dmg","application/x-apple-diskimage","application","macOS磁盘映像","macOS disk image"],
    [".iso","application/x-iso9660-image","application","ISO光盘映像","ISO disc image"],
    [".ttf","font/ttf","application","TTF字体","TTF font"],
    [".otf","font/otf","application","OTF字体","OTF font"],
    [".woff","font/woff","application","WOFF字体","WOFF font"],
    [".woff2","font/woff2","application","WOFF2字体","WOFF2 font"],
    [".eot","application/vnd.ms-fontobject","application","EOT字体","EOT font"],
    [".doc","application/msword","application","Word文档","Word document"],
    [".docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application","Word文档","Word document"],
    [".xls","application/vnd.ms-excel","application","Excel表格","Excel spreadsheet"],
    [".xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application","Excel表格","Excel spreadsheet"],
    [".ppt","application/vnd.ms-powerpoint","application","PPT演示","PowerPoint presentation"],
    [".pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation","application","PPT演示","PowerPoint presentation"],
    [".exe","application/x-msdownload","application","可执行文件","Executable"],
    [".dll","application/x-msdownload","application","DLL动态链接库","DLL library"],
    [".msi","application/x-msi","application","MSI安装包","MSI installer"],
    [".bin","application/octet-stream","application","二进制文件","Binary file"],
    [".dat","application/octet-stream","application","数据文件","Data file"],
    [".csv","text/csv","text","CSV数据","CSV data"],
    [".ics","text/calendar","text","日历文件","Calendar file"],
    [".vcf","text/vcard","text","电子名片","vCard contact"],
    [".rss","application/rss+xml","application","RSS订阅","RSS feed"],
    [".atom","application/atom+xml","application","Atom订阅","Atom feed"],
    [".wsdl","application/wsdl+xml","application","WSDL描述","WSDL description"],
    [".wadl","application/wadl+xml","application","WADL描述","WADL description"],
    [".mathml","application/mathml+xml","application","MathML公式","MathML formula"],
    [".epub","application/epub+zip","application","EPUB电子书","EPUB ebook"],
    [".swf","application/x-shockwave-flash","application","Flash动画","Flash animation"],
    [".crx","application/x-chrome-extension","application","Chrome扩展","Chrome extension"],
    [".xpi","application/x-xpinstall","application","Firefox扩展","Firefox addon"],
    [".map","application/json","application","Source Map","Source Map"],
    [".srt","text/plain","text","字幕文件","Subtitle file"],
    [".vtt","text/vtt","text","WebVTT字幕","WebVTT subtitle"],
    [".m3u8","application/x-mpegURL","application","M3U8播放列表","M3U8 playlist"],
    [".pls","audio/x-scpls","audio","PLS播放列表","PLS playlist"],
    [".manifest","text/cache-manifest","text","离线缓存清单","Cache manifest"],
    [".webmanifest","application/manifest+json","application","PWA清单","Web Manifest"]
  ];

  let currentCat = 'all';
  let currentQuery = '';

  function render() {
    const q = currentQuery.toLowerCase().trim();
    let items = DB;
    if (currentCat !== 'all') {
      items = items.filter(d => d[2] === currentCat);
    }
    if (q) {
      items = items.filter(d => d[0].toLowerCase().includes(q) || d[1].toLowerCase().includes(q) || d[3].toLowerCase().includes(q) || d[4].toLowerCase().includes(q));
    }
    if (ct) ct.textContent = '\u5171 ' + items.length + ' \u6761';
    if (!items.length) {
      tb.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--text-dim)">' + (isEN ? 'No results found' : '\u672a\u627e\u5230\u7ed3\u679c') + '</td></tr>';
      return;
    }
    tb.innerHTML = items.map(d => '<tr><td style="padding:8px 12px;border-bottom:1px solid var(--border);font-family:Consolas,monospace;font-size:13px">' + d[0] + '</td><td style="padding:8px 12px;border-bottom:1px solid var(--border);font-family:Consolas,monospace;font-size:13px">' + d[1] + '</td><td style="padding:8px 12px;border-bottom:1px solid var(--border);font-size:13px;color:var(--text-dim)">' + (isEN ? d[4] : d[3]) + '</td><td style="padding:8px 12px;border-bottom:1px solid var(--border);text-align:center"><button class="btn btn-sm" data-copy="' + d[1] + '">' + (isEN ? 'Copy' : '\u590d\u5236') + '</button></td></tr>').join('');
    tb.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', function() {
        const val = this.getAttribute('data-copy');
        navigator.clipboard.writeText(val).then(() => {
          if (msg) { msg.textContent = isEN ? 'Copied: ' + val : '\u5df2\u590d\u5236: ' + val; msg.style.color = 'var(--success,#27ae60)'; setTimeout(() => msg.textContent = '', 2000); }
        }).catch(() => {});
      });
    });
  }

  el.addEventListener('input', function() { currentQuery = this.value; render(); });
  document.querySelectorAll('[data-mt-cat]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-mt-cat]').forEach(b => b.classList.remove('btn-primary'));
      this.classList.add('btn-primary');
      currentCat = this.getAttribute('data-mt-cat');
      render();
    });
  });
  render();
})();
