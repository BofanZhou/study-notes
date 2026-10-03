/* ============================================================
   SIR 传染病模型演示(可复用,服务第 6 课)
   用法:<div class="demo" data-sir-demo></div>
   Euler 数值积分:滑块调传播速率 β 与恢复率 γ;
   实时显示基本再生数 R0 = β/γ、疫情峰值与时间 —— 体验阈值效应。
   ============================================================ */
(function () {
  "use strict";

  var N = 1000, I0 = 5, DAYS = 120;

  function mount(host) {
    var W = 560, H = 400, dpr = window.devicePixelRatio || 1;
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
    var bSlider = slider("sir-beta", "传播速率 β(每人每天有效接触数 × 概率)", 0.05, 0.6, 0.01, 0.3);
    var gSlider = slider("sir-gamma", "恢复率 γ(1/平均传染期)", 0.05, 0.6, 0.01, 0.1);

    var readout = document.createElement("div");
    readout.className = "readout";
    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "任务:把 R0 调到 1 以下(β<γ)再看曲线 —— 疫情根本起不来;调回 β>γ,峰值触顶后才回落。这个「阈值」就是 R0 的建模价值:防控的目标就是把有效再生数压到 1 以下。";

    var L = 46, R = 14, T = 12, B = 40;
    var pw = W - L - R, ph = H - T - B;
    function xp(t) { return L + (t / DAYS) * pw; }
    function yp(v) { return T + ph - (v / N) * ph; }

    function draw() {
      var beta = parseFloat(bSlider.value), gamma = parseFloat(gSlider.value);
      var S = N - I0, I = I0, R = 0;
      var series = { s: [], i: [], r: [] };
      var peak = 0, peakDay = 0;
      for (var t = 0; t <= DAYS; t++) {
        series.s.push(S); series.i.push(I); series.r.push(R);
        if (I > peak) { peak = I; peakDay = t; }
        var dS = -beta * S * I / N;
        var dI = beta * S * I / N - gamma * I;
        var dR = gamma * I;
        var h = 0.5;                    // 半步长 Euler
        S += dS * h; I += dI * h; R += dR * h;
        S += (-beta * S * I / N) * h; I += (beta * S * I / N - gamma * I) * h; R += gamma * I * h;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555";
      ctx.lineWidth = 1; ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.textAlign = "center";
      for (var d = 0; d <= DAYS; d += 20) ctx.fillText(String(d) + " 天", xp(d), T + ph + 16);
      ctx.textAlign = "right";
      for (var v = 0; v <= N; v += 200) ctx.fillText(String(v), L - 6, yp(v) + 4);

      function curve(arr, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2.2;
        ctx.beginPath();
        arr.forEach(function (val, t) {
          if (t === 0) ctx.moveTo(xp(t), yp(val));
          else ctx.lineTo(xp(t), yp(val));
        });
        ctx.stroke();
      }
      curve(series.s, "#4a7a4a");
      curve(series.i, "#b85450");
      curve(series.r, "#6c8ebf");

      ctx.textAlign = "left";
      ctx.fillStyle = "#4a7a4a"; ctx.fillText("易感 S", L + 8, T + 14);
      ctx.fillStyle = "#b85450"; ctx.fillText("感染 I", L + 62, T + 14);
      ctx.fillStyle = "#6c8ebf"; ctx.fillText("移出 R", L + 116, T + 14);

      readout.innerHTML =
        "R0 = β/γ = <strong>" + (beta / gamma).toFixed(2) + "</strong> · " +
        (beta / gamma > 1
          ? "R0 &gt; 1 → 疫情爆发:峰值约 <strong>" + Math.round(peak) + "</strong> 人(第 <strong>" + peakDay + "</strong> 天)"
          : "R0 ≤ 1 → 疫情不起势,无需等峰值");
    }

    bSlider.addEventListener("input", draw);
    gSlider.addEventListener("input", draw);
    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-sir-demo]").forEach(mount);
  });
})();
