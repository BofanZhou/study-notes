/* ============================================================
   转化漏斗演示(可复用,服务第 6 课)
   用法:<div class="demo" data-funnel-demo></div>
   固定曝光 10000,滑块调点击率/咨询率/成交率/客单价,
   实时算各层人数、成交额、CAC 与盈亏 —— 体验「漏斗乘法」。
   ============================================================ */
(function () {
  "use strict";

  var EXPOSURE = 10000;   // 固定曝光
  var BUDGET = 5000;      // 固定推广预算(元)
  var MARGIN = 0.5;       // 固定毛利率 50%

  function mount(host) {
    var W = 560, H = 330, dpr = window.devicePixelRatio || 1;
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
    var cSlider = slider("fun-ctr", "点击率(曝光 → 兴趣)", 2, 20, 1, 8);
    var eSlider = slider("fun-consult", "咨询率(兴趣 → 咨询)", 5, 50, 1, 25);
    var dSlider = slider("fun-close", "成交率(咨询 → 成交)", 10, 60, 1, 30);
    var pSlider = slider("fun-price", "客单价(元)", 50, 500, 10, 150);

    var readout = document.createElement("div");
    readout.className = "readout";
    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "任务:① 分别只把点击率、咨询率、成交率翻一倍,看哪个对成交数帮助最大 —— 漏斗是乘法,越往下的层越金贵;② 把客单价拉高,看 CAC 不变时盈亏怎么翻转。";

    var STAGES = [
      { name: "曝光", color: "#6c8ebf" },
      { name: "兴趣(点击)", color: "#4a7a9b" },
      { name: "咨询", color: "#a0522d" },
      { name: "成交", color: "#2f6f2f" }
    ];

    function draw() {
      var ctr = parseFloat(cSlider.value) / 100;
      var consult = parseFloat(eSlider.value) / 100;
      var close = parseFloat(dSlider.value) / 100;
      var price = parseFloat(pSlider.value);
      var vals = [
        EXPOSURE,
        EXPOSURE * ctr,
        EXPOSURE * ctr * consult,
        EXPOSURE * ctr * consult * close
      ];
      var deals = vals[3];
      var revenue = deals * price;
      var gross = revenue * MARGIN - BUDGET;
      var cac = deals > 0 ? BUDGET / deals : 0;

      ctx.clearRect(0, 0, W, H);
      ctx.font = "12px 'Microsoft YaHei', sans-serif";
      var barMaxW = 320, minW = 90, x0 = 150;
      STAGES.forEach(function (st, i) {
        var y = 18 + i * 76;
        var w = minW + (barMaxW - minW) * (Math.sqrt(vals[i]) / Math.sqrt(EXPOSURE));
        ctx.fillStyle = st.color;
        ctx.fillRect(x0, y, w, 56);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(st.name + "  " + Math.round(vals[i]).toLocaleString() + " 人", x0 + 10, y + 32);
        if (i > 0) {
          ctx.fillStyle = "#555";
          ctx.textAlign = "right";
          var rate = vals[i] / vals[i - 1] * 100;
          ctx.fillText(rate.toFixed(1) + "%", x0 - 10, y + 32);
        }
      });
      ctx.fillStyle = "#333";
      ctx.textAlign = "left";
      ctx.fillText("← 转化率", x0 - 10, 18);

      readout.innerHTML =
        "成交 <strong>" + Math.round(deals) + "</strong> 单 · 成交额 <strong>" + Math.round(revenue).toLocaleString() +
        "</strong> 元 · CAC = 预算/成交 = <strong>" + (Math.round(cac * 10) / 10) + "</strong> 元/单<br>" +
        "毛利(50%) = <strong>" + Math.round(gross).toLocaleString() + "</strong> 元 → " +
        (gross >= 0
          ? "<strong style='color:#2f6f2f'>这波投放是赚的</strong>"
          : "<strong style='color:#b85450'>这波投放亏了</strong>(提高转化率或客单价再试)");
    }

    [cSlider, eSlider, dSlider, pSlider].forEach(function (s) { s.addEventListener("input", draw); });
    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-funnel-demo]").forEach(mount);
  });
})();
