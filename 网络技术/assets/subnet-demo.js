/* ============================================================
   子网计算演示组件(可复用):输入 IP/掩码 → 网络地址/广播/可用主机
   用法:<div class="demo" data-subnet-demo></div> 并引入本脚本。
   IIFE + DOMContentLoaded + data- 属性,兼容单课与合并手册两种环境。
   ============================================================ */
(function () {
  function initDemo(root) {
    if (root._subnetInit) return;
    root._subnetInit = true;

    var style = document.createElement("style");
    style.textContent =
      ".sub-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px}" +
      ".sub-row input{font:inherit;padding:6px 10px;border:1px solid #c9b99a;border-radius:6px;width:150px}" +
      ".sub-btn{font:inherit;padding:6px 16px;border:1px solid #a0522d;border-radius:6px;" +
      "background:#a0522d;color:#fff;cursor:pointer}" +
      ".sub-out{font-family:monospace;font-size:.95em;background:#fbf7ee;border:1px solid #e5dcc8;" +
      "border-radius:8px;padding:10px 14px;line-height:1.8;white-space:pre-wrap}" +
      ".sub-err{color:#b03030}";
    document.head.appendChild(style);

    root.innerHTML =
      '<div class="sub-row">' +
      'IP <input class="sub-ip" value="192.168.1.130">' +
      '前缀 <select class="sub-pfx"></select>' +
      ' <button type="button" class="sub-btn">计算</button></div>' +
      '<div class="sub-out">输入 IP 与前缀长度,点"计算"。</div>';

    var sel = root.querySelector(".sub-pfx");
    for (var p = 8; p <= 30; p++) {
      var o = document.createElement("option");
      o.value = p; o.textContent = "/" + p;
      if (p === 26) o.selected = true;
      sel.appendChild(o);
    }

    function parseIp(s) {
      var m = s.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      if (!m) return null;
      var b = [m[1], m[2], m[3], m[4]].map(Number);
      if (b.some(function (x) { return x < 0 || x > 255; })) return null;
      return b;
    }
    function fmt(b) { return b.join("."); }

    function run() {
      var ip = parseIp(root.querySelector(".sub-ip").value);
      var pfx = Number(sel.value);
      var out = root.querySelector(".sub-out");
      if (!ip) { out.textContent = "IP 格式不对:应为 a.b.c.d,每段 0–255。"; out.className = "sub-out sub-err"; return; }
      out.className = "sub-out";
      var mask = [], i;
      for (i = 0; i < 4; i++) {
        var z = pfx - i * 8;
        mask.push(z <= 0 ? 0 : z >= 8 ? 255 : 256 - Math.pow(2, 8 - z));
      }
      var net = ip.map(function (x, k) { return x & mask[k]; });
      var bc = net.slice();
      var hostBits = 32 - pfx;
      if (hostBits >= 8) bc[3] = 255; else bc[3] |= Math.pow(2, hostBits) - 1;
      if (hostBits >= 16) bc[2] = 255;
      if (hostBits >= 24) bc[1] = 255;
      if (hostBits >= 32) bc[0] = 255;
      var total = Math.pow(2, hostBits);
      var usable = Math.max(0, total - 2);
      var first = net.slice(); first[3] += 1;
      var last = bc.slice(); last[3] -= 1;
      var cls = ip[0] < 127 ? "A" : ip[0] < 128 ? "A" : ip[0] < 192 ? "B" : ip[0] < 224 ? "C" : "D/E";
      var priv = (ip[0] === 10) || (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31) || (ip[0] === 192 && ip[1] === 168);
      out.textContent =
        "IP 地址      : " + fmt(ip) + "  (" + cls + " 类" + (priv ? ", 私有地址" : "") + ")\n" +
        "子网掩码     : " + fmt(mask) + "  (/" + pfx + ")\n" +
        "网络地址     : " + fmt(net) + "\n" +
        "广播地址     : " + fmt(bc) + "\n" +
        "可用主机范围 : " + fmt(first) + " ~ " + fmt(last) + "\n" +
        "可用主机数   : 2^" + hostBits + " − 2 = " + usable + " 台";
    }
    root.querySelector(".sub-btn").addEventListener("click", run);
    sel.addEventListener("change", run);
    run();
  }

  function boot() { document.querySelectorAll("[data-subnet-demo]").forEach(initDemo); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
