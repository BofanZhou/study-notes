/* ============================================================
   单因素敏感性分析演示(可复用)
   用法:<div class="demo" data-sensitivity-demo></div>
   基准方案:投资 1000 万 / 年净收益 250 万 / 寿命 10 年 / ic=8%。
   四个因素(年净收益、投资、寿命、折现率)各自 ±40% 变动时 NPV 的响应直线;
   滑块移动变动幅度,读出各因素对应 NPV 与敏感度排序。
   ============================================================ */
(function () {
  "use strict";

  var K0 = 1000, R0 = 250, N0 = 10, IC0 = 0.08;

  function pa(i, n) {
    if (i <= 0) return n;
    return (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
  }
  var PA0 = pa(IC0, N0); // 6.7101

  var FACTORS = [
    { name: "年净收益", color: "#a0522d",
      npv: function (x) { return -K0 + R0 * (1 + x) * PA0; } },
    { name: "寿命", color: "#1e8449",
      npv: function (x) { return -K0 + R0 * pa(IC0, N0 * (1 + x)); } },
    { name: "投资", color: "#1a5276",
      npv: function (x) { return -K0 * (1 + x) + R0 * PA0; } },
    { name: "折现率", color: "#7d3c98",
      npv: function (x) { return -K0 + R0 * pa(IC0 * (1 + x), N0); } }
  ];
  var NPV0 = -K0 + R0 * PA0;

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
    lab.setAttribute("for", "sens-x");
    lab.textContent = "因素变动幅度 x(%,各因素独立地相对基准变动)";
    var xSlider = document.createElement("input");
    xSlider.type = "range"; xSlider.id = "sens-x";
    xSlider.min = -40; xSlider.max = 40; xSlider.step = 1; xSlider.value = 0;
    controls.appendChild(lab); controls.appendChild(xSlider);

    var readout = document.createElement("div");
    readout.className = "readout";

    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "直线越陡 = 该因素越敏感。斜率排序:年净收益 > 寿命 > 投资 > 折现率——节能改造该优先把「运行小时 × 电价」(决定年净收益)的数据摸准。年净收益直线约在 −40% 处击穿零线(临界点):收益缩水四成才翻车,方案相对稳健。";

    var L = 56, R = 14, T = 14, Bm = 42;
    var pw = W - L - R, ph = H - T - Bm;
    var X0 = -0.4, X1 = 0.4, Y0 = -150, Y1 = 1450;
    function xpix(x) { return L + (x - X0) / (X1 - X0) * pw; }
    function ypix(v) { return T + ph - (v - Y0) / (Y1 - Y0) * ph; }

    function draw() {
      var x = parseFloat(xSlider.value) / 100;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      for (var xx = -40; xx <= 40; xx += 10) {
        var xp = xpix(xx / 100);
        ctx.beginPath();
        ctx.moveTo(xp, T + ph); ctx.lineTo(xp, T + ph + 4); ctx.stroke();
        ctx.fillText((xx > 0 ? "+" : "") + xx + "%", xp, T + ph + 16);
      }
      ctx.textAlign = "right";
      for (var v = 0; v <= 1400; v += 200) {
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

      // 零线与基准 NPV 虚线
      ctx.strokeStyle = "#c9c2b6";
      ctx.beginPath(); ctx.moveTo(L, ypix(0)); ctx.lineTo(L + pw, ypix(0)); ctx.stroke();
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(L, ypix(NPV0)); ctx.lineTo(L + pw, ypix(NPV0)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8d8578"; ctx.textAlign = "left";
      ctx.fillText("基准 NPV=" + NPV0.toFixed(0) + " 万", L + 6, ypix(NPV0) - 6);

      function line(f, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var t = X0 * 100; t <= X1 * 100; t += 0.5) {
          var px = xpix(t / 100), py = ypix(f(t / 100));
          if (t === X0 * 100) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      FACTORS.forEach(function (f) { line(f.npv, f.color); });

      // 图例
      ctx.textAlign = "left";
      FACTORS.forEach(function (f, k) {
        ctx.fillStyle = f.color;
        ctx.fillRect(L + 8 + k * 88, T + 8, 12, 3);
        ctx.fillText(f.name, L + 24 + k * 88, T + 14);
      });

      // 当前变动幅度竖线与各因素取点
      ctx.strokeStyle = "#922b21"; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xpix(x), T); ctx.lineTo(xpix(x), T + ph); ctx.stroke();
      ctx.setLineDash([]);
      var rows = FACTORS.map(function (f) {
        var v = f.npv(x);
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(xpix(x), ypix(v), 4, 0, Math.PI * 2);
        ctx.fill();
        var s = (v - NPV0) / NPV0 / x; // 敏感度系数
        return "<span style='color:" + f.color + "'><strong>" + f.name +
               "→NPV " + v.toFixed(0) + " 万</strong>(S=" + (x === 0 ? "—" : s.toFixed(2)) + ")</span>";
      });
      readout.innerHTML =
        "变动 x = <strong>" + (x * 100 > 0 ? "+" : "") + (x * 100).toFixed(0) + "%</strong>　" +
        rows.join("　");
    }

    xSlider.addEventListener("input", draw);
    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-sensitivity-demo]").forEach(mount);
  });
})();
