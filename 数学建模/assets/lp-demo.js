/* ============================================================
   线性规划图解演示(可复用,服务第 2、3 课)
   用法:<div class="demo" data-lp-demo></div>
   实例:max z = 5x + 4y  s.t. 2x+y≤50, x+2y≤60, y≤15, x,y≥0
   LP 最优在顶点 (17.5,15),z=147.5;
   整数最优 (18,14),z=146;四舍五入点 (18,15) 不可行 —— 教学要点。
   ============================================================ */
(function () {
  "use strict";

  var CX = 35, CY = 35;           // 坐标范围
  var POLY = [[0, 0], [25, 0], [17.5, 15], [0, 15]]; // 可行域顶点
  var CONS = [
    { a: 2, b: 1, c: 50, label: "2x+y≤50" },
    { a: 1, b: 2, c: 60, label: "x+2y≤60" },
    { a: 0, b: 1, c: 15, label: "y≤15" }
  ];
  var C1 = 5, C2 = 4;             // 目标系数
  var LP_OPT = [17.5, 15, 147.5];
  var IP_OPT = [18, 14, 146];
  var ROUND_PT = [18, 15];        // 四舍五入点,不可行

  function feasible(x, y) {
    for (var i = 0; i < CONS.length; i++) {
      var k = CONS[i];
      if (k.a * x + k.b * y > k.c + 1e-9) return false;
    }
    return true;
  }

  function mount(host) {
    var W = 560, H = 460, dpr = window.devicePixelRatio || 1;
    var canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    canvas.style.maxWidth = "100%";
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var controls = document.createElement("div");
    controls.className = "demo-controls";

    var lab = document.createElement("label");
    lab.setAttribute("for", "lp-z");
    lab.textContent = "等值线 z = 5x + 4y 的水平(拖动滑动,让直线扫过可行域)";
    var zSlider = document.createElement("input");
    zSlider.type = "range"; zSlider.id = "lp-z";
    zSlider.min = 0; zSlider.max = 200; zSlider.step = 2; zSlider.value = 80;

    var intChk = document.createElement("input");
    intChk.type = "checkbox"; intChk.id = "lp-int";
    var labWrap = document.createElement("label");
    labWrap.style.display = "flex";
    labWrap.style.alignItems = "center";
    labWrap.style.gap = "8px";
    labWrap.textContent = "显示整数格点(第 3 课:整数规划视角)";
    labWrap.setAttribute("for", "lp-int");
    controls.appendChild(lab); controls.appendChild(zSlider);
    controls.appendChild(labWrap); controls.appendChild(intChk);

    var readout = document.createElement("div");
    readout.className = "readout";

    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "最优解一定出现在可行域的「顶点」上(线性目标 + 凸可行域)。观察:等值线离原点越远 z 越大,最后离开可行域的那一刻接触的正是顶点。";

    var L = 46, R = 14, T = 12, B = 40;
    var pw = W - L - R, ph = H - T - B;
    function xp(x) { return L + (x / CX) * pw; }
    function yp(y) { return T + ph - (y / CY) * ph; }

    function draw() {
      var z = parseFloat(zSlider.value);
      var showInt = intChk.checked;
      ctx.clearRect(0, 0, W, H);

      // 坐标轴
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555";
      ctx.lineWidth = 1; ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.textAlign = "center";
      for (var gx = 0; gx <= CX; gx += 5) {
        ctx.fillText(String(gx), xp(gx), T + ph + 16);
      }
      ctx.textAlign = "right";
      for (var gy = 0; gy <= CY; gy += 5) {
        ctx.fillText(String(gy), L - 6, yp(gy) + 4);
      }

      // 可行域(浅色填充)
      ctx.beginPath();
      POLY.forEach(function (p, i) {
        if (i === 0) ctx.moveTo(xp(p[0]), yp(p[1]));
        else ctx.lineTo(xp(p[0]), yp(p[1]));
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(160,82,45,.14)";
      ctx.fill();

      // 约束直线
      CONS.forEach(function (k) {
        ctx.strokeStyle = "#8d8578"; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        var p1, p2;
        if (k.b !== 0) { p1 = [0, k.c / k.b]; p2 = [CX, (k.c - k.a * CX) / k.b]; }
        else { p1 = [k.c / k.a, 0]; p2 = [k.c / k.a, CY]; }
        ctx.moveTo(xp(p1[0]), yp(p1[1]));
        ctx.lineTo(xp(p2[0]), yp(p2[1]));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#777";
        ctx.textAlign = "left";
        ctx.fillText(k.label, xp(p2[0]) - 70, yp(p2[1]) + 14);
      });

      // 等值线 z = C1 x + C2 y
      var x0 = 0, y0 = z / C2;
      var x1 = z / C1, y1 = 0;
      ctx.strokeStyle = "#a0522d"; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xp(0), yp(y0));
      ctx.lineTo(xp(x1), yp(y1));
      ctx.stroke();
      ctx.fillStyle = "#a0522d";
      ctx.textAlign = "left";
      ctx.fillText("z=" + z, xp(0) + 6, yp(y0) - 6);

      // LP 最优点(顶点)
      ctx.fillStyle = "#a0522d";
      ctx.beginPath();
      ctx.arc(xp(LP_OPT[0]), yp(LP_OPT[1]), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("LP 顶点最优 (17.5, 15)", xp(LP_OPT[0]) + 10, yp(LP_OPT[1]) - 8);

      // 整数格点
      if (showInt) {
        for (var ix = 0; ix <= CX; ix++) {
          for (var iy = 0; iy <= CY; iy++) {
            if (feasible(ix, iy)) {
              ctx.fillStyle = "#4a7a4a";
              ctx.fillRect(xp(ix) - 2, yp(iy) - 2, 4, 4);
            }
          }
        }
        // 整数最优
        ctx.strokeStyle = "#2f6f2f"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(xp(IP_OPT[0]), yp(IP_OPT[1]), 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#2f6f2f";
        ctx.fillText("整数最优 (18,14) z=146", xp(IP_OPT[0]) + 12, yp(IP_OPT[1]) + 4);
        // 四舍五入点:不可行
        ctx.strokeStyle = "#b85450"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(xp(ROUND_PT[0]), yp(ROUND_PT[1]), 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#b85450";
        ctx.fillText("(18,15) 四舍五入 → 不可行!", xp(ROUND_PT[0]) + 12, yp(ROUND_PT[1]) - 10);
      }

      readout.innerHTML =
        "当前等值线 z = <strong>" + z + "</strong>;" +
        "可行域内 LP 最大 z = <strong>147.5</strong>(顶点 17.5, 15);" +
        (showInt ? "整数最优 z = <strong>146</strong>(18, 14) —— 比 LP 少 1.5" : "勾选「整数格点」进入第 3 课视角");
    }

    zSlider.addEventListener("input", draw);
    intChk.addEventListener("change", draw);
    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-lp-demo]").forEach(mount);
  });
})();
