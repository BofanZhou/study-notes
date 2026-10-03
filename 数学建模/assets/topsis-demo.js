/* ============================================================
   TOPSIS 评价演示(可复用,服务第 4 课)
   用法:<div class="demo" data-topsis-demo></div>
   4 个冷热源方案 × 3 指标(成本/能效/风险),拖动权重滑块,
   实时计算 TOPSIS 贴近度并排序 —— 体验「权重一变,排序翻转」。
   ============================================================ */
(function () {
  "use strict";

  var NAMES = ["方案 A 燃气锅炉", "方案 B 空气源热泵", "方案 C 地源热泵", "方案 D 电制冷+燃气热"];
  var COST = [120, 90, 150, 100];   // 初投资(万元)——负向
  var EFF  = [82, 95, 88, 78];      // 综合能效(%)——正向
  var RISK = [4, 7, 3, 6];          // 运行风险(1-10,越高越险)——负向

  function mount(host) {
    var W = 620, H = 300, dpr = window.devicePixelRatio || 1;
    var canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    canvas.style.maxWidth = "100%";
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var controls = document.createElement("div");
    controls.className = "demo-controls";

    function slider(id, label, value) {
      var lab = document.createElement("label");
      lab.setAttribute("for", id);
      lab.textContent = label;
      var input = document.createElement("input");
      input.type = "range"; input.id = id;
      input.min = 5; input.max = 90; input.step = 5; input.value = value;
      controls.appendChild(lab); controls.appendChild(input);
      return input;
    }
    var wCost = slider("tw-cost", "权重 · 初投资(负向指标)", 40);
    var wEff  = slider("tw-eff", "权重 · 综合能效(正向指标)", 40);
    var wRisk = slider("tw-risk", "权重 · 运行风险(负向指标)", 20);

    var readout = document.createElement("div");
    readout.className = "readout";
    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "任务:先把「地源热泵」顶到第一,再把「能效」权重拉满看排序怎么变 —— 排序变了,你的推荐结论就得跟着辩护,这就是评价题的灵敏度检验。";

    // 极差标准化到 [0,1],正向越大越好,负向取反
    function norm(arr, positive) {
      var mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr);
      return arr.map(function (v) {
        var t = (v - mn) / (mx - mn);
        return positive ? t : 1 - t;
      });
    }
    var nCost = norm(COST, false), nEff = norm(EFF, true), nRisk = norm(RISK, false);

    function topsis(w) {
      var cols = [nCost, nEff, nRisk];
      var ws = w;
      var best = [], worst = [];
      cols.forEach(function (col, j) {
        var weighted = col.map(function (v) { return v * ws[j]; });
        best.push(Math.max.apply(null, weighted));
        worst.push(Math.min.apply(null, weighted));
      });
      var res = NAMES.map(function (name, i) {
        var dPlus = 0, dMinus = 0;
        cols.forEach(function (col, j) {
          var v = col[i] * ws[j];
          dPlus += Math.pow(v - best[j], 2);
          dMinus += Math.pow(v - worst[j], 2);
        });
        dPlus = Math.sqrt(dPlus); dMinus = Math.sqrt(dMinus);
        return { name: name, c: dMinus / (dPlus + dMinus) };
      });
      res.sort(function (a, b) { return b.c - a.c; });
      return res;
    }

    function draw() {
      var raw = [parseFloat(wCost.value), parseFloat(wEff.value), parseFloat(wRisk.value)];
      var sum = raw[0] + raw[1] + raw[2];
      var w = raw.map(function (v) { return v / sum; });
      var res = topsis(w);

      ctx.clearRect(0, 0, W, H);
      var barH = 46, gap = 22, x0 = 210, plotW = W - x0 - 60;
      res.forEach(function (r, i) {
        var y = 18 + i * (barH + gap);
        ctx.fillStyle = "#333";
        ctx.font = "12px 'Microsoft YaHei', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText((i + 1) + ". " + r.name, x0 - 12, y + barH / 2 + 4);
        ctx.fillStyle = "#e8e2d6";
        ctx.fillRect(x0, y, plotW, barH);
        ctx.fillStyle = "#a0522d";
        ctx.fillRect(x0, y, plotW * r.c, barH);
        ctx.fillStyle = "#333";
        ctx.textAlign = "left";
        ctx.fillText(r.c.toFixed(3), x0 + plotW * r.c + 8, y + barH / 2 + 4);
      });
      readout.innerHTML =
        "归一化权重:成本 <strong>" + w[0].toFixed(2) + "</strong> · 能效 <strong>" + w[1].toFixed(2) +
        "</strong> · 风险 <strong>" + w[2].toFixed(2) + "</strong> → 当前第一名:<strong>" + res[0].name + "</strong>";
    }

    [wCost, wEff, wRisk].forEach(function (s) { s.addEventListener("input", draw); });
    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-topsis-demo]").forEach(mount);
  });
})();
