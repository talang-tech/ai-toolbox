// IP Subnet Calculator (IPv4
(() => {
  const cidrInput = document.getElementById('ipCidr');
  const output = document.getElementById('ipOutput');
  const calcBtn = document.getElementById('ipCalc');
  const isEN = document.documentElement.lang === 'en';

  function cidrToMask(cidr) {
    return -1 << (32 - cidr);
  }

  function ipToInt(ipStr) {
    return ipStr.split('.').reduce((acc, octet, i) => acc + (parseInt(octet) << ((3 - i) * 8)), 0) >>> 0;
  }

  function intToIp(int) {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join('.');
  }

  function calc() {
    try {
      const parts = cidrInput.value.trim().split('/');
      const ipStr = parts[0];
      const cidr = parseInt(parts[1] || 24);
      
      if (cidr < 0 || cidr > 32) throw new Error(isEN ? 'CIDR must be 0-32' : 'CIDR 必须是 0-32');
      
      const ipInt = ipToInt(ipStr);
      const maskInt = cidrToMask(cidr);
      const networkInt = ipInt & maskInt;
      const broadcastInt = networkInt | (~maskInt >>> 0);
      const firstUsableInt = networkInt + 1;
      const lastUsableInt = broadcastInt - 1;
      const totalHosts = Math.max(0, broadcastInt - networkInt - 1);
      
      const fields = [
        [isEN ? 'Network Address' : '网络地址', intToIp(networkInt) + '/' + cidr],
        [isEN ? 'Netmask' : '子网掩码', intToIp(maskInt)],
        [isEN ? 'Wildcard Mask' : '反掩码', intToIp(~maskInt >>> 0)],
        [isEN ? 'First Usable' : '第一个可用', cidr >= 31 ? '-' : intToIp(firstUsableInt)],
        [isEN ? 'Last Usable' : '最后一个可用', cidr >= 31 ? '-' : intToIp(lastUsableInt)],
        [isEN ? 'Broadcast' : '广播地址', cidr === 32 ? '-' : intToIp(broadcastInt)],
        [isEN ? 'Total Hosts' : '可用主机数', totalHosts.toString()],
        [isEN ? 'CIDR Notation' : 'CIDR 表示', '/' + cidr],
        [isEN ? 'Binary Mask' : '掩码二进制', maskInt.toString(2).padStart(32, '0').match(/.{8}/g).join('.')],
      ];
      
      let html = `<table style="width:100%;border-collapse:collapse;">`;
      for (const [label, value] of fields) {
        html += `<tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border);width:160px">${label}</th><td style="padding:6px 8px;border-bottom:1px solid var(--border)"><code>${value}</code></td></tr>`;
      }
      html += `</table>`;
      
      output.innerHTML = html;
      showToast(isEN ? 'Calculated!' : '已计算!');
    } catch (e) {
      output.innerHTML = `<div style="color:#ef4444">${e.message}</div>`;
    }
  }

  calcBtn.addEventListener('click', calc);
  cidrInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') calc(); });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
})();
