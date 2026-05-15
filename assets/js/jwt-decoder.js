// JWT Decoder
(() => {
  const input = document.getElementById("jwtInput");
  const headerOut = document.getElementById("jwtHeader");
  const payloadOut = document.getElementById("jwtPayload");
  const isValidOut = document.getElementById("jwtValid");
  const clearBtn = document.getElementById("jwtClear");

  function b64decode(s) {
    // JWT base64url encoding (no padding, + replaced by -, / by _)
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (s.length % 4) s += "=";
    return decodeURIComponent(atob(s).split("").map(c =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(""));
  }

  function decode() {
    const jwt = input.value.trim();
    if (!jwt) {
      headerOut.value = "";
      payloadOut.value = "";
      isValidOut.textContent = "—";
      return;
    }
    const parts = jwt.split(".");
    if (parts.length !== 3) {
      isValidOut.innerHTML = "<span style='color:#ef4444'>❌ 无效 JWT 格式</span>";
      return;
    }
    try {
      const header = JSON.parse(b64decode(parts[0]));
      const payload = JSON.parse(b64decode(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      let expNote = "";
      if (payload.exp) {
        expNote = payload.exp < now ? ` <span style='color:#ef4444'>(已过期 ${new Date(payload.exp * 1000).toLocaleString()})</span>` : ` <span style='color:#22c55e'>(有效至 ${new Date(payload.exp * 1000).toLocaleString()})</span>`;
      }
      isValidOut.innerHTML = `<span style='color:#22c55e'>✅ 有效签名格式</span>${expNote}`;
      headerOut.value = JSON.stringify(header, null, 2);
      payloadOut.value = JSON.stringify(payload, null, 2);
    } catch (e) {
      isValidOut.innerHTML = `<span style='color:#ef4444'>❌ 解码失败: ${e.message}</span>`;
    }
  }

  input.addEventListener("input", decode);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    decode();
  });

  // Sample JWT for demo
  input.placeholder = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
})();
