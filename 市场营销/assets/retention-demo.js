/* ============================================================
   复购留存与 LTV 演示(可复用,服务第 5 课)
   用法:<div class="demo" data-retention-demo></div>
   100 个新客,滑块调月留存率/客单价/获客成本 CAC,
   实时画 12 个月留存曲线,算 12 个月 LTV 与 LTV/CAC —— 体验「复购是命脉」。
   ============================================================ */
(function () {
  "use strict";

  var N0 = 100, MONTHS = 12;

  function mount(host) {
    var W = 560, H = 380, dpr = window.devicePixelRatio || 1;
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
    var rSlider = slider("ret-rate", "月留存率(每月还回来的老客比例)", 30, 90, 1, 60);
    var pSlider = slider("ret-price", "客单价(元)", 50, 500, 10, 150);
    var cSlider = slider("ret-cac", "获客成本 CAC(元/人)", 10, 300, 5, 50);

    var readout = document.createElement("div");
    readout.className = "readout";
    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "任务:① 留存率 40% 与 80% 各看一眼 —— 曲线形状天差地别,这就是「流量是水,复购是池」;② 固定留存率,把客单价或 CAC 调到 LTV/CAC < 3,体验这门生意为什么不成立。";

    var L = 50, R = 14, T = 14, B = 40;
    var pw = W - L - R, ph = H - T - B;
    function xp(m) { return L + (m / MONTHS) * pw; }
    function yp(v) { return T + ph - (v / N0) * ph; }

    function draw() {
      var r = parseFloat(rSlider.value) / 100;
      var price = parseFloat(pSlider.value);
      var cac = parseFloat(cSlider.value);
      var series = [];
      for (var m = 0; m <= MONTHS; m++) series.push(N0 * Math.pow(r, m));

      var ltv = 0;
      for (m = 0; m <= MONTHS; m++) ltv += series[m] / N0 * price; // 每客期望累计消费
      var ratio = cac > 0 ? ltv / cac : 0;

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555";
      ctx.lineWidth = 1; ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.textAlign = "center";
      for (var d = 0; d <= MONTHS; d += 3) ctx.fillText(d + " 月", xp(d), T + ph + 16);
      ctx.textAlign = "right";
      for (var v = 0; v <= N0; v += 25) ctx.fillText(String(v), L - 6, yp(v) + 4);

      ctx.strokeStyle = "#a0522d"; ctx.lineWidth = 2.5;
      ctx.beginPath();
      series.forEach(function (val, m) {
        if (m === 0) ctx.moveTo(xp(m), yp(val));
        else ctx.lineTo(xp(m), yp(val));
      });
      ctx.stroke();
      ctx.fillStyle = "#a0522d";
      ctx.beginPath();
      ctx.arc(xp(MONTHS), yp(series[MONTHS]), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = "left";
      ctx.fillText(Math.round(series[MONTHS]) + " 人还活跃", xp(MONTHS) - 90, yp(series[MONTHS]) - 10);

      readout.innerHTML =
        "12 个月 LTV(每客累计消费)≈ <strong>" + Math.round(ltv) + "</strong> 元 · CAC = <strong>" + cac +
        "</strong> 元 · LTV/CAC ≈ <strong>" + (Math.round(ratio * 10) / 10) + "</strong><br>" +
        (ratio >= 3
          ? "<strong style='color:#2f6f2f'>≥ 3,生意结构健康</strong>(通用经验线)"
          : "<strong style='color:#b85450'>&lt; 3,获客太贵或复购太弱</strong> —— 先修产品与留存,别急着买流量");
    }

    [rSlider, pSlider, cSlider].forEach(function (s) { s.addEventListener("input", draw); });
    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-retention-demo]").forEach(mount);
  });
})();
