/* ============================================================
   最小二乘拟合演示(可复用,服务第 5 课)
   用法:<div class="demo" data-lsq-demo></div>
   点击画布加点,实时最小二乘拟合;可选 1/2/3 次多项式,
   观察高阶项的「过拟合」与离群点的「拽动」效应;SSE 与 R² 实时显示。
   ============================================================ */
(function () {
  "use strict";

  var SEED = [
    [1, 3.1], [3, 4.2], [5, 5.4], [7, 6.1], [9, 7.4], [11, 8.6],
    [13, 9.3], [15, 10.6], [17, 11.2], [19, 12.5], [21, 13.4], [23, 14.8]
  ];

  function solve(A, b) {
    var n = A.length;
    for (var i = 0; i < n; i++) {
      var piv = i;
      for (var r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
      var t = A[i]; A[i] = A[piv]; A[piv] = t;
      t = b[i]; b[i] = b[piv]; b[piv] = t;
      for (r = i + 1; r < n; r++) {
        var f = A[r][i] / A[i][i];
        for (var c = i; c < n; c++) A[r][c] -= f * A[i][c];
        b[r] -= f * b[i];
      }
    }
    var x = new Array(n).fill(0);
    for (i = n - 1; i >= 0; i--) {
      var s = b[i];
      for (c = i + 1; c < n; c++) s -= A[i][c] * x[c];
      x[i] = s / A[i][i];
    }
    return x;
  }

  function polyfit(pts, deg) {
    var n = deg + 1, A = [], b = [];
    for (var i = 0; i < n; i++) {
      A.push(new Array(n).fill(0)); b.push(0);
      for (var j = 0; j < n; j++)
        for (var k = 0; k < pts.length; k++) A[i][j] += Math.pow(pts[k][0], i + j);
      for (k = 0; k < pts.length; k++) b[i] += pts[k][1] * Math.pow(pts[k][0], i);
    }
    return solve(A, b);
  }
  function evalPoly(c, x) {
    var s = 0;
    for (var i = c.length - 1; i >= 0; i--) s = s * x + c[i];
    return s;
  }

  function mount(host) {
    var W = 560, H = 400, dpr = window.devicePixelRatio || 1;
    var X_MAX = 30, Y_MAX = 20;
    var pts = SEED.slice();
    var canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    canvas.style.maxWidth = "100%";
    canvas.style.cursor = "crosshair";
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var controls = document.createElement("div");
    controls.className = "demo-controls";
    var lab = document.createElement("label");
    lab.textContent = "拟合阶数";
    var sel = document.createElement("select");
    [1, 2, 3].forEach(function (d) {
      var o = document.createElement("option");
      o.value = d; o.textContent = d + " 次(直线/抛物线/三次)";
      if (d === 1) o.selected = true;
      sel.appendChild(o);
    });
    controls.appendChild(lab); controls.appendChild(sel);

    var row = document.createElement("div");
    row.style.marginTop = "0.6rem";
    function btn(text) {
      var b = document.createElement("button");
      b.className = "btn"; b.type = "button"; b.textContent = text;
      row.appendChild(b);
      return b;
    }
    var outlierBtn = btn("加一个离群点");
    var resetBtn = btn("重置数据");

    var readout = document.createElement("div");
    readout.className = "readout";
    var caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = "任务:① 点击画布任意处加点,看直线怎么走;② 按一下「离群点」,看它怎么绑架整条直线 —— 这就是为什么检验环节必须画残差;③ 切到 3 次,训练集 R² 上升,但两端翘起 —— 这就是过拟合。";

    var L = 46, R = 14, T = 12, B = 40;
    var pw = W - L - R, ph = H - T - B;
    function xp(x) { return L + (x / X_MAX) * pw; }
    function yp(y) { return T + ph - (y / Y_MAX) * ph; }

    function draw() {
      var deg = parseInt(sel.value, 10);
      var coef = polyfit(pts, deg);
      var meanY = pts.reduce(function (s, p) { return s + p[1]; }, 0) / pts.length;
      var ssTot = 0, ssRes = 0;
      pts.forEach(function (p) {
        var e = p[1] - evalPoly(coef, p[0]);
        ssRes += e * e; ssTot += (p[1] - meanY) * (p[1] - meanY);
      });
      var r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#b9b2a6"; ctx.fillStyle = "#555";
      ctx.lineWidth = 1; ctx.font = "11px 'Microsoft YaHei', sans-serif";
      ctx.beginPath();
      ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph);
      ctx.stroke();
      ctx.textAlign = "center";
      for (var gx = 0; gx <= X_MAX; gx += 5) ctx.fillText(String(gx), xp(gx), T + ph + 16);
      ctx.textAlign = "right";
      for (var gy = 0; gy <= Y_MAX; gy += 5) ctx.fillText(String(gy), L - 6, yp(gy) + 4);

      // 拟合曲线
      ctx.strokeStyle = "#a0522d"; ctx.lineWidth = 2.5;
      ctx.beginPath();
      var started = false;
      for (var t = 0; t <= X_MAX; t += 0.25) {
        var v = evalPoly(coef, t);
        if (v < -5 || v > Y_MAX + 5) { started = false; continue; }
        if (!started) { ctx.moveTo(xp(t), yp(v)); started = true; }
        else ctx.lineTo(xp(t), yp(v));
      }
      ctx.stroke();

      // 数据点
      ctx.fillStyle = "#3d3a35";
      pts.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(xp(p[0]), yp(p[1]), 4, 0, Math.PI * 2);
        ctx.fill();
      });

      readout.innerHTML = "样本 n = <strong>" + pts.length + "</strong> · 阶数 = <strong>" + deg +
        "</strong> · SSE = <strong>" + ssRes.toFixed(1) + "</strong> · R² = <strong>" + r2.toFixed(3) + "</strong>";
    }

    canvas.addEventListener("click", function (ev) {
      var rect = canvas.getBoundingClientRect();
      var px = (ev.clientX - rect.left) * (W / rect.width);
      var py = (ev.clientY - rect.top) * (H / rect.height);
      var x = (px - L) / pw * X_MAX, y = (T + ph - py) / ph * Y_MAX;
      if (x < 0 || x > X_MAX || y < 0 || y > Y_MAX) return;
      pts.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
      draw();
    });
    outlierBtn.addEventListener("click", function () {
      pts.push([29, 2.5]);
      draw();
    });
    resetBtn.addEventListener("click", function () { pts = SEED.slice(); draw(); });
    sel.addEventListener("change", draw);

    host.appendChild(canvas);
    host.appendChild(controls);
    host.appendChild(row);
    host.appendChild(readout);
    host.appendChild(caption);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-lsq-demo]").forEach(mount);
  });
})();
