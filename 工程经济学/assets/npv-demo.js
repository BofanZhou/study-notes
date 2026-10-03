/* ============================================================
   NPV–i 曲线与两方案比选演示(可复用)
   用法:<div class="demo" data-npv-demo></div>
   两方案:A 初投资 500 万/年净收益 120 万/8 年;B 750 万/170 万/8 年。
   画出两方案 NPV 随折现率 i 的曲线,滑块移动基准折现率,
   显示 NPV、IRR、Fisher 交点(=ΔIRR),演示「IRR 大 ≠ 方案好」。
   ============================================================ */
(function () {
  "use strict";

  var A = { K: 500, R: 120, n: 8, color: "#a0522d" };
  var B = { K: 750, R: 170, n: 8, color: "#1a5276" };
  var I_MAX = 25; // 横轴到 25%

  function pa(i, n) { // (P/A,i,n) 等额分付现值系数
    if (i <= 0) return n;
    return (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
  }
  function npv(s, i) { return -s.K + s.R * pa(i, s.n); }
  function irr(s) { // 二分求 IRR
    var lo = 0.0001, hi = 1;
    for (var k = 0; k < 60; k++) {
      var mid = (lo + hi) / 2;
      if (npv(s, mid) > 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  var IRR_A = irr(A), IRR_B = irr(B);
  var IRR_DELTA = irr({ K: B.K - A.K, R: B.R - A.R, n: 8 }); // Fisher 交点 = ΔIRR

  function mount(host) {
    var W = 640, H = 380, dpr = window.devicePixelRatio || 1;
    var canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    canvas.style.maxWidth = "100%";
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var controls = document.createElement("div");
    controls.className = "demo-controls";
    var lab = document.createElement("label");
    lab.setAttribute("for", "npv-i");
    lab.textContent = "基准折现率 ic(%)";
    var iSlider = document.createElement("input");
    iSlider.type = "range"; iSlider.id = "npv-i";
    iSlider.min = 0.5; iSlider.max = 25; iSlider.step = 0.5; iSlider.value = 10;
    controls.appendChild(lab); controls.appendChild(iSlider);

    var readout = document.createElement("div");
    readout.className = "readout";

    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "两条 NPV–i 曲线在 Fisher 交点(=ΔIRR≈11.8%)交叉:ic 低于交点时 B 的 NPV 更大(尽管 B 的 IRR 更小!);ic 高于交点后 A 反超。互斥方案请认准 NPV 或 ΔIRR 判据,别用 IRR 排序。";

    var L = 56, R = 14, T = 14, Bm = 42;
    var pw = W - L - R, ph = H - T - Bm;
    var Y0 = -300, Y1 = 700;
    function xpix(i) { return L + (i / I_MAX) * pw; }
    function ypix(v) { return T + ph - (v - Y0) / (Y1 - Y0) * ph; }

    function draw() {
      var ic = parseFloat(iSlider.value) / 100;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      for (var i = 0; i <= I_MAX; i += 5) {
        var x = xpix(i / 100);
        ctx.beginPath();
        ctx.moveTo(x, T + ph); ctx.lineTo(x, T + ph + 4); ctx.stroke();
        ctx.fillText(i + "%", x, T + ph + 16);
      }
      ctx.textAlign = "right";
      for (var v = Y0; v <= Y1; v += 100) {
        if (v === Y0) continue;
        var y = ypix(v);
        ctx.beginPath();
        ctx.moveTo(L - 4, y); ctx.lineTo(L, y); ctx.stroke();
        ctx.fillText(String(v), L - 7, y + 4);
      }
      ctx.save();
      ctx.translate(14, T + ph / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("NPV(万元)", 0, 0);
      ctx.restore();

      // 零线
      ctx.strokeStyle = "#c9c2b6";
      ctx.beginPath(); ctx.moveTo(L, ypix(0)); ctx.lineTo(L + pw, ypix(0)); ctx.stroke();

      function curve(s) {
        ctx.strokeStyle = s.color; ctx.lineWidth = 2;
        ctx.beginPath();
        var started = false;
        for (var ii = 0.5; ii <= I_MAX; ii += 0.1) {
          var vv = npv(s, ii / 100);
          var px = xpix(ii / 100), py = ypix(vv);
          if (!started) { ctx.moveTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      curve(A); curve(B);

      // IRR 交零点标记
      [[A, IRR_A], [B, IRR_B]].forEach(function (p) {
        var s = p[0], ir = p[1];
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(xpix(ir), ypix(0), 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.fillText("IRR=" + (ir * 100).toFixed(1) + "%", xpix(ir), ypix(0) + 24);
      });
      // Fisher 交点
      var vf = npv(A, IRR_DELTA);
      ctx.fillStyle = "#1e8449";
      ctx.beginPath();
      ctx.arc(xpix(IRR_DELTA), ypix(vf), 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("Fisher 交点 " + (IRR_DELTA * 100).toFixed(1) + "%", xpix(IRR_DELTA), ypix(vf) - 12);

      // 当前 ic 竖线与两方案点
      ctx.strokeStyle = "#922b21"; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xpix(ic), T); ctx.lineTo(xpix(ic), T + ph); ctx.stroke();
      ctx.setLineDash([]);
      [A, B].forEach(function (s) {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(xpix(ic), ypix(npv(s, ic)), 4, 0, Math.PI * 2);
        ctx.fill();
      });

      var va = npv(A, ic), vb = npv(B, ic);
      var better = va > vb ? "A" : "B";
      readout.innerHTML =
        "ic = <strong>" + (ic * 100).toFixed(1) + "%</strong>　" +
        "NPV(A) = <strong>" + va.toFixed(0) + "</strong> 万　" +
        "NPV(B) = <strong>" + vb.toFixed(0) + "</strong> 万<br>" +
        "IRR(A) = <strong>" + (IRR_A * 100).toFixed(1) + "%</strong>　" +
        "IRR(B) = <strong>" + (IRR_B * 100).toFixed(1) + "%</strong>　" +
        "ΔIRR = <strong>" + (IRR_DELTA * 100).toFixed(1) + "%</strong><br>" +
        "当前判据:ic " + (ic < IRR_DELTA ? "<" : ">") + " ΔIRR → 按 NPV 选 <strong>" + better + "</strong>" +
        (ic < IRR_DELTA ? "(注意:IRR 却是 A 更大!)" : "");
    }

    iSlider.addEventListener("input", draw);
    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-npv-demo]").forEach(mount);
  });
})();
