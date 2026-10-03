/* ============================================================
   人口增长对比演示(可复用)
   用法:<div class="demo" data-growth-demo></div>
   两条解析曲线:Malthus 指数 P=P0·e^{rt} vs Logistic 阻滞增长
   P=K/(1+A·e^{-rt});叠加美国人口普查数据点(1790–2020,百万);
   滑块调 r(增长率)与 K(容纳量),实时显示残差平方和(SSE)。
   ============================================================ */
(function () {
  "use strict";

  var P0 = 3.9; // 1790 年人口(百万)
  var DATA = [
    [0, 3.9], [10, 5.3], [20, 7.2], [30, 9.6], [40, 12.9], [50, 17.1],
    [60, 23.2], [70, 31.4], [80, 38.6], [90, 50.2], [100, 62.9],
    [110, 76.0], [120, 92.0], [130, 105.7], [140, 122.8], [150, 131.7],
    [160, 150.7], [170, 179.3], [180, 203.2], [190, 226.5], [200, 248.7],
    [210, 281.4], [220, 308.7], [230, 331.5]
  ];
  var T_MAX = 260, Y_MAX = 420; // 横轴到 2050 年,纵轴 4.2 亿

  function malthus(r, t) { return P0 * Math.exp(r * t); }
  function logistic(r, K, t) {
    var A = (K - P0) / P0;
    return K / (1 + A * Math.exp(-r * t));
  }

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
    var rSlider = slider("growth-r", "增长率 r(内禀增长率,per year)",
      0.01, 0.06, 0.001, 0.031);
    var kSlider = slider("growth-k", "容纳量 K(环境容纳量,百万)",
      100, 420, 1, 197);

    var readout = document.createElement("div");
    readout.className = "readout";

    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "任务:拖动滑块,让赭色曲线尽量贴合灰色数据点,把「残差平方和」压到最小——这就是一次手工拟合。灰色虚线(指数模型)无论怎么调都压不下去,这就是「检验不达标 → 回炉假设」。";

    // 绘图区几何
    var L = 56, R = 14, T = 14, B = 42;
    var pw = W - L - R, ph = H - T - B;
    function xpix(t) { return L + (t / T_MAX) * pw; }
    function ypix(p) { return T + ph - (p / Y_MAX) * ph; }

    function draw() {
      var r = parseFloat(rSlider.value), K = parseFloat(kSlider.value);
      ctx.clearRect(0, 0, W, H);

      // 坐标轴与刻度
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      for (var yr = 1800; yr <= 2050; yr += 50) {
        var t = yr - 1790, x = xpix(t);
        ctx.beginPath();
        ctx.moveTo(x, T + ph); ctx.lineTo(x, T + ph + 4); ctx.stroke();
        ctx.fillText(String(yr), x, T + ph + 16);
      }
      ctx.textAlign = "right";
      for (var p = 0; p <= 400; p += 100) {
        var y = ypix(p);
        ctx.beginPath();
        ctx.moveTo(L - 4, y); ctx.lineTo(L, y); ctx.stroke();
        ctx.fillText(String(p), L - 7, y + 4);
      }
      ctx.save();
      ctx.translate(14, T + ph / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("人口(百万)", 0, 0);
      ctx.restore();

      function curve(fn, color, dash) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.setLineDash(dash || []);
        ctx.beginPath();
        var started = false;
        for (var t = 0; t <= T_MAX; t += 0.5) {
          var p = fn(t);
          if (p < 0 || p > Y_MAX) { started = false; continue; }
          var x = xpix(t), y = ypix(p);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      curve(function (t) { return malthus(r, t); }, "#8d8578", [5, 4]);
      curve(function (t) { return logistic(r, K, t); }, "#a0522d", []);

      // 数据点
      ctx.fillStyle = "#3d3a35";
      DATA.forEach(function (d) {
        ctx.beginPath();
        ctx.arc(xpix(d[0]), ypix(d[1]), 3.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 残差平方和(Logistic vs 数据)
      var sse = 0;
      DATA.forEach(function (d) {
        var e = logistic(r, K, d[0]) - d[1];
        sse += e * e;
      });
      var p2050 = logistic(r, K, 260);
      readout.innerHTML =
        "r = <strong>" + r.toFixed(3) + "</strong> /年　" +
        "K = <strong>" + K + "</strong> 百万　" +
        "残差平方和 SSE = <strong>" + Math.round(sse) + "</strong><br>" +
        "当前模型对 2050 年的预测:<strong>" + Math.round(p2050) + "</strong> 百万";
    }

    rSlider.addEventListener("input", draw);
    kSlider.addEventListener("input", draw);

    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-growth-demo]").forEach(mount);
  });
})();
