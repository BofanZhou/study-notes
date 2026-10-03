/* ============================================================
   单利 vs 复利演示(可复用)
   用法:<div class="demo" data-compound-demo></div>
   两条终值曲线:单利 F=P(1+i·t) vs 复利 F=P(1+i)^t;
   滑块调本金 P、年利率 i、年限 n,实时显示终值差与 72 法则倍增时间。
   ============================================================ */
(function () {
  "use strict";

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

    function slider(id, label, min, max, step, value, unit) {
      var lab = document.createElement("label");
      lab.setAttribute("for", id);
      lab.textContent = label;
      var input = document.createElement("input");
      input.type = "range"; input.id = id;
      input.min = min; input.max = max; input.step = step; input.value = value;
      input.dataset.unit = unit || "";
      controls.appendChild(lab); controls.appendChild(input);
      return input;
    }
    var pSlider = slider("cp-p", "本金 P(万元)", 1, 100, 1, 10);
    var iSlider = slider("cp-i", "年利率 i(%)", 1, 15, 0.5, 8);
    var nSlider = slider("cp-n", "年限 n(年)", 1, 30, 1, 20);

    var readout = document.createElement("div");
    readout.className = "readout";

    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "灰色虚线 = 单利(利息不再生息,直线);赭色实线 = 复利(利滚利,曲线)。差距随 n 指数放大——这就是「资金时间价值」的几何本体。工程经济一律按复利计算。";

    var L = 56, R = 14, T = 14, B = 42;

    function draw() {
      var P = parseFloat(pSlider.value);
      var i = parseFloat(iSlider.value) / 100;
      var n = parseFloat(nSlider.value);
      var fSimple = function (t) { return P * (1 + i * t); };
      var fComp = function (t) { return P * Math.pow(1 + i, t); };
      var fMax = fComp(n);
      var pw = W - L - R, ph = H - T - B;
      function xpix(t) { return L + (t / n) * pw; }
      function ypix(f) { return T + ph - (f / fMax) * ph; }

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      var yearStep = n > 20 ? 5 : (n > 10 ? 2 : 1);
      for (var t = 0; t <= n; t += yearStep) {
        var x = xpix(t);
        ctx.beginPath();
        ctx.moveTo(x, T + ph); ctx.lineTo(x, T + ph + 4); ctx.stroke();
        ctx.fillText(String(t), x, T + ph + 16);
      }
      ctx.textAlign = "right";
      var stepY = Math.pow(10, Math.floor(Math.log10(fMax / 4 || 1)));
      var nice = stepY;
      while (fMax / 4 / nice > 2) nice *= 2;
      for (var f = 0; f <= fMax; f += nice) {
        var y = ypix(f);
        ctx.beginPath();
        ctx.moveTo(L - 4, y); ctx.lineTo(L, y); ctx.stroke();
        ctx.fillText((Math.round(f * 10) / 10) + "万", L - 7, y + 4);
      }
      ctx.save();
      ctx.translate(14, T + ph / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("终值(万元)", 0, 0);
      ctx.restore();

      function curve(fn, color, dash) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.setLineDash(dash || []);
        ctx.beginPath();
        for (var tt = 0; tt <= n; tt += 0.25) {
          var px = xpix(tt), py = ypix(fn(tt));
          if (tt === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      curve(fSimple, "#8d8578", [5, 4]);
      curve(fComp, "#a0522d", []);

      var fs = fSimple(n), fc = fComp(n);
      var dbl = 72 / (i * 100);
      readout.innerHTML =
        "单利终值 = <strong>" + fs.toFixed(1) + "</strong> 万元　" +
        "复利终值 = <strong>" + fc.toFixed(1) + "</strong> 万元<br>" +
        "复利多赚 <strong>" + (fc - fs).toFixed(1) + "</strong> 万元　" +
        "72 法则:约 <strong>" + dbl.toFixed(1) + "</strong> 年翻一倍";
    }

    [pSlider, iSlider, nSlider].forEach(function (s) {
      s.addEventListener("input", draw);
    });

    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-compound-demo]").forEach(mount);
  });
})();
