// SemVer Compare
(function () {
  'use strict';

  const isEN = document.documentElement.lang === 'en';

  const semverRe = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;

  function parseSemver(v) {
    const m = v.trim().match(semverRe);
    if (!m) return null;
    return {
      major: parseInt(m[1], 10),
      minor: parseInt(m[2], 10),
      patch: parseInt(m[3], 10),
      prerelease: m[4] || '',
      build: m[5] || ''
    };
  }

  function compareSemver(a, b) {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    if (a.patch !== b.patch) return a.patch - b.patch;
    // Pre-release: has pre-release < no pre-release
    if (a.prerelease && !b.prerelease) return -1;
    if (!a.prerelease && b.prerelease) return 1;
    if (!a.prerelease && !b.prerelease) return 0;
    // Compare pre-release identifiers
    const ap = a.prerelease.split('.');
    const bp = b.prerelease.split('.');
    for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
      if (i >= ap.length) return -1;
      if (i >= bp.length) return 1;
      const ai = /^\d+$/.test(ap[i]) ? parseInt(ap[i], 10) : ap[i];
      const bi = /^\d+$/.test(bp[i]) ? parseInt(bp[i], 10) : bp[i];
      if (typeof ai === 'number' && typeof bi === 'string') return -1;
      if (typeof ai === 'string' && typeof bi === 'number') return 1;
      if (ai < bi) return -1;
      if (ai > bi) return 1;
    }
    return 0;
  }

  function formatSemver(p) {
    let s = `${p.major}.${p.minor}.${p.patch}`;
    if (p.prerelease) s += `-${p.prerelease}`;
    if (p.build) s += `+${p.build}`;
    return s;
  }

  function bumpVersion(v, type) {
    const p = parseSemver(v);
    if (!p) return null;
    if (type === 'major') { p.major++; p.minor = 0; p.patch = 0; p.prerelease = ''; }
    else if (type === 'minor') { p.minor++; p.patch = 0; p.prerelease = ''; }
    else if (type === 'patch') { p.patch++; p.prerelease = ''; }
    else if (type === 'prerelease') {
      if (p.prerelease) {
        const m = p.prerelease.match(/^(.*?)(\d+)$/);
        if (m) p.prerelease = m[1] + (parseInt(m[2], 10) + 1);
        else p.prerelease = p.prerelease + '.1';
      } else {
        p.prerelease = 'alpha.1';
      }
    }
    return formatSemver(p);
  }

  // --- UI Elements ---
  const input = document.getElementById('sv-input');
  const validateBtn = document.getElementById('sv-validate-btn');
  const validateResult = document.getElementById('sv-validate-result');
  const bumpBtns = {
    major: document.getElementById('sv-bump-major'),
    minor: document.getElementById('sv-bump-minor'),
    patch: document.getElementById('sv-bump-patch'),
    prerelease: document.getElementById('sv-bump-prerelease')
  };
  const aEl = document.getElementById('sv-a');
  const bEl = document.getElementById('sv-b');
  const compareBtn = document.getElementById('sv-compare-btn');
  const compareResult = document.getElementById('sv-compare-result');
  const listEl = document.getElementById('sv-list');
  const sortAsc = document.getElementById('sv-sort-asc');
  const sortDesc = document.getElementById('sv-sort-desc');
  const sortCopy = document.getElementById('sv-sort-copy');
  const sortResult = document.getElementById('sv-sort-result');

  function setResult(el, text, ok) {
    el.textContent = text;
    el.style.background = ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
    el.style.color = ok ? 'var(--success)' : 'var(--error)';
  }

  function setNeutral(el, text) {
    el.textContent = text;
    el.style.background = 'transparent';
    el.style.color = 'var(--text-secondary)';
  }

  // Validate
  validateBtn.addEventListener('click', () => {
    const v = input.value.trim();
    if (!v) { setNeutral(validateResult, isEN ? 'Enter a version number' : '输入版本号'); return; }
    const p = parseSemver(v);
    if (p) {
      setResult(validateResult, isEN ? `Valid: major=${p.major}, minor=${p.minor}, patch=${p.patch}${p.prerelease ? ', pre=' + p.prerelease : ''}${p.build ? ', build=' + p.build : ''}` : `有效: major=${p.major}, minor=${p.minor}, patch=${p.patch}${p.prerelease ? ', pre=' + p.prerelease : ''}${p.build ? ', build=' + p.build : ''}`, true);
    } else {
      setResult(validateResult, isEN ? 'Invalid SemVer format (expected X.Y.Z or X.Y.Z-pre+build)' : '无效的 SemVer 格式（应为 X.Y.Z 或 X.Y.Z-pre+build）', false);
    }
  });

  // Bump
  Object.keys(bumpBtns).forEach(type => {
    bumpBtns[type].addEventListener('click', () => {
      const v = input.value.trim() || '0.0.0';
      const bumped = bumpVersion(v, type);
      if (bumped) {
        input.value = bumped;
        setResult(validateResult, isEN ? `Bumped to ${bumped}` : `已升级到 ${bumped}`, true);
      } else {
        setResult(validateResult, isEN ? 'Invalid version for bump' : '版本号无效，无法升级', false);
      }
    });
  });

  // Compare
  compareBtn.addEventListener('click', () => {
    const va = aEl.value.trim();
    const vb = bEl.value.trim();
    if (!va || !vb) { setNeutral(compareResult, isEN ? 'Enter both versions' : '请输入两个版本号'); return; }
    const pa = parseSemver(va);
    const pb = parseSemver(vb);
    if (!pa || !pb) { setResult(compareResult, isEN ? 'Invalid version format' : '版本号格式无效', false); return; }
    const c = compareSemver(pa, pb);
    let text;
    if (c === 0) text = isEN ? `${va} == ${vb}` : `${va} 等于 ${vb}`;
    else if (c < 0) text = isEN ? `${va} < ${vb} (${va} is older)` : `${va} < ${vb}（${va} 更旧）`;
    else text = isEN ? `${va} > ${vb} (${va} is newer)` : `${va} > ${vb}（${va} 更新）`;
    setResult(compareResult, text, true);
  });

  // Sort
  function sortVersions(asc) {
    const lines = listEl.value.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) { setNeutral(sortResult, isEN ? 'Enter versions (one per line)' : '请输入版本号（每行一个）'); return; }
    const parsed = lines.map(l => ({ raw: l, parsed: parseSemver(l) }));
    const invalid = parsed.filter(p => !p.parsed);
    if (invalid.length > 0) {
      setResult(sortResult, isEN ? `Invalid versions: ${invalid.map(p => p.raw).join(', ')}` : `无效版本号: ${invalid.map(p => p.raw).join(', ')}`, false);
      return;
    }
    parsed.sort((a, b) => asc ? compareSemver(a.parsed, b.parsed) : compareSemver(b.parsed, a.parsed));
    const result = parsed.map(p => p.raw).join('\n');
    sortResult.textContent = result;
    sortResult.style.background = 'rgba(34,197,94,0.08)';
    sortResult.style.color = 'var(--success)';
    sortResult.style.whiteSpace = 'pre-wrap';
    sortResult.style.fontFamily = 'monospace';
    sortResult.style.fontSize = '13px';
  }

  sortAsc.addEventListener('click', () => sortVersions(true));
  sortDesc.addEventListener('click', () => sortVersions(false));

  sortCopy.addEventListener('click', () => {
    const text = sortResult.textContent;
    if (text && text !== sortResult.getAttribute('data-placeholder')) {
      copyToClipboard(text);
    }
  });

  // Initial state
  setNeutral(validateResult, isEN ? 'Enter a version to validate' : '输入版本号进行校验');
  setNeutral(compareResult, isEN ? 'Enter two versions to compare' : '输入两个版本号进行比较');
  setNeutral(sortResult, isEN ? 'Enter versions above to sort' : '在上方输入版本号进行排序');
  sortResult.setAttribute('data-placeholder', sortResult.textContent);
})();