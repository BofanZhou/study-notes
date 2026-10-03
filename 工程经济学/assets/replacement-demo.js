/* ============================================================
   设备经济寿命演示(可复用)
   用法:<div class="demo" data-replacement-demo></div>
   年均总成本 AC(n) = (K−V)/n + C1 + (n−1)λ/2:
   资产成本(递减)+ 年均运行费(劣化,递增)= U 形曲线,最低点即经济寿命。
   滑块调购置费 K、残值 V、首年运行费 C1、年劣化额 λ。
   ============================================================ */
(function () {
  "use strict";

  var N_MAX = 20;

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

    function slider(id, label, min, max, step, value) {
      var lab = document.createElement("label");
      lab.setAttribute("for", id);
      lab.textContent = label;
      var input = document.createElement("input");
      input.type = "range"; input.id = id;
      input.min = min; input.max = max; input.step = step; input.value = value;
      controls.appendChild(lab); controls.appendChild(input);
      return input;
    }
    var kSlider = slider("rp-k", "购置费 K(万元)", 10, 100, 1, 40);
    var vSlider = slider("rp-v", "期末残值 V(万元)", 0, 20, 1, 4);
    var cSlider = slider("rp-c", "首年运行费 C₁(万元/年)", 2, 20, 0.5, 6);
    var lSlider = slider("rp-l", "年劣化额 λ(万元/年²)", 0.2, 3, 0.1, 1.2);

    var readout = document.createElement("div");
    readout.className = "readout";

    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "蓝色虚线 = 年均资产成本 (K−V)/n(越用越摊薄);绿色虚线 = 年均运行费 C₁+(n−1)λ/2(越用越贵);赭色实线 = 两者之和,呈 U 形——最低点就是经济寿命 n*。「设备越旧越该将就用」只对了一半,旧到运行费飙升就该换。";

    var L = 56, R = 14, T = 14, Bm = 42;
    var pw = W - L - R, ph = H - T - Bm;

    function acParts(n, K, V, C1, lam) {
      var asset = (K - V) / n;
      var op = C1 + (n - 1) * lam / 2;
      return [asset, op, asset + op];
    }

    function draw() {
      var K = parseFloat(kSlider.value), V = parseFloat(vSlider.value);
      var C1 = parseFloat(cSlider.value), lam = parseFloat(lSlider.value);
      var pts = [], yMax = 0, best = 1, bestV = Infinity;
      for (var n = 1; n <= N_MAX; n++) {
        var p = acParts(n, K, V, C1, lam);
        pts.push(p);
        if (p[2] > yMax) yMax = p[2];
        if (p[2] < bestV) { bestV = p[2]; best = n; }
      }
      yMax = Math.ceil(yMax / 5) * 5;
      function xpix(n) { return L + (n - 0.5) / N_MAX * pw; }
      function ypix(v) { return T + ph - v / yMax * ph; }

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      for (var nn = 0; nn <= N_MAX; nn += 2) {
        var x = L + nn / N_MAX * pw;
        ctx.beginPath();
        ctx.moveTo(x, T + ph); ctx.lineTo(x, T + ph + 4); ctx.stroke();
        ctx.fillText(String(nn), x, T + ph + 16);
      }
      ctx.textAlign = "right";
      var stepY = yMax > 40 ? 10 : 5;
      for (var v = 0; v <= yMax; v += stepY) {
        var y = ypix(v);
        ctx.beginPath();
        ctx.moveTo(L - 4, y); ctx.lineTo(L, y); ctx.stroke();
        ctx.fillText(String(v), L - 7, y + 4);
      }
      ctx.save();
      ctx.translate(14, T + ph / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("年均成本(万元/年)", 0, 0);
      ctx.restore();

      function line(idx, color, dash) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.setLineDash(dash || []);
        ctx.beginPath();
        pts.forEach(function (p, k) {
          var px = xpix(k + 1), py = ypix(p[idx]);
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
      line(0, "#1a5276", [5, 4]);   // 资产成本
      line(1, "#1e8449", [5, 4]);   // 运行费
      line(2, "#a0522d", []);       // AC(n)

      // 经济寿命标记
      ctx.fillStyle = "#922b21";
      ctx.beginPath();
      ctx.arc(xpix(best), ypix(bestV), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = "center";
      ctx.fillText("n*=" + best + " 年", xpix(best), ypix(bestV) - 12);

      var analytic = Math.sqrt(2 * (K - V) / lam);
      readout.innerHTML =
        "经济寿命 n* = <strong>" + best + "</strong> 年　" +
        "最低年均总成本 AC(n*) = <strong>" + bestV.toFixed(2) + "</strong> 万元/年<br>" +
        "连续近似 n* ≈ √(2(K−V)/λ) = <strong>" + analytic.toFixed(1) + "</strong> 年";
    }

    [kSlider, vSlider, cSlider, lSlider].forEach(function (s) {
      s.addEventListener("input", draw);
    });

    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-replacement-demo]").forEach(mount);
  });
})();
