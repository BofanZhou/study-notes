/* ============================================================
   速度合成演示组件(可复用):旋转圆盘 + 径向滑块
   展示 v_r(相对)、v_e(牵连)、v_a(绝对)三者关系 va = ve + vr
   用法:<div class="demo" data-composition-demo></div> 并引入本脚本。
   ============================================================ */
(function () {
  function initDemo(root) {
    if (root._compInit) return;
    root._compInit = true;
    var style = document.createElement("style");
    style.textContent =
      ".cmp-row{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-bottom:10px;font-size:.95em}" +
      ".cmp-row label{display:inline-flex;align-items:center;gap:6px}" +
      ".cmp-canvas{width:100%;max-width:560px;height:auto;display:block;background:#fffdf6;" +
      "border:1px solid #e5dcc8;border-radius:8px;margin:0 auto}" +
      ".cmp-desc{margin-top:8px;font-size:.95em;color:#5a4632;line-height:1.7}";
    document.head.appendChild(style);

    root.innerHTML =
      '<div class="cmp-row">' +
      '<label>转速 ω <input type="range" class="cmp-w" min="0" max="2" step="0.1" value="1"> <span class="cmp-wv">1.0 rad/s</span></label>' +
      '<label>相对速度 v_r <input type="range" class="cmp-vr" min="-60" max="60" step="5" value="40"> <span class="cmp-vrv">40 px/s</span></label>' +
      '<label><input type="checkbox" class="cmp-pause"> 暂停</label>' +
      '</div>' +
      '<canvas class="cmp-canvas" width="560" height="420"></canvas>' +
      '<div class="cmp-desc">蓝点 = 动点(沿盘的径向槽滑动);<span style="color:#2b6cb0">蓝箭头 v_r</span> 相对速度,' +
      '<span style="color:#a0522d">棕箭头 v_e</span> = ω×r 牵连速度(盘上重合点),<span style="color:#b03030">红箭头 v_a</span> = 合成绝对速度。' +
      '试着把 ω 调成 0 或把 v_r 调成 0,观察极端情况。</div>';

    var cv = root.querySelector(".cmp-canvas"), ctx = cv.getContext("2d");
    var wIn = root.querySelector(".cmp-w"), vrIn = root.querySelector(".cmp-vr"), pause = root.querySelector(".cmp-pause");
    var ang = 0, rDist = 40, last = 0;

    function arrow(x1, y1, x2, y2, color, w) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w || 3;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      var a = Math.atan2(y2 - y1, x2 - x1), h = 10;
      ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45));
      ctx.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45));
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = 1;
    }
    function label(t, x, y, color) { ctx.fillStyle = color || "#3d3428"; ctx.font = "bold 15px sans-serif"; ctx.fillText(t, x, y); }

    function frame(ts) {
      var dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
      var w = parseFloat(wIn.value), vr = parseFloat(vrIn.value);
      if (!pause.checked) { ang += w * dt; rDist += vr * dt; }
      if (rDist > 150) rDist = 150; if (rDist < -150) rDist = -150;

      ctx.clearRect(0, 0, 560, 420);
      var cx = 280, cy = 210, R = 160;

      ctx.strokeStyle = "#e5dcc8"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#c9b99a";
      var px = Math.cos(ang), py = Math.sin(ang);
      ctx.beginPath(); ctx.moveTo(cx - px * R, cy - py * R); ctx.lineTo(cx + px * R, cy + py * R); ctx.stroke();

      var X = cx + px * rDist, Y = cy + py * rDist;

      ctx.strokeStyle = "#5a4632"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fillStyle = "#5a4632"; ctx.fill();

      var scale = 0.55;
      var evx = -w * rDist * py, evy = w * rDist * px;
      var rvx = vr * px, rvy = vr * py;
      var avx = evx + rvx, avy = evy + rvy;

      arrow(X, Y, X + rvx * scale, Y + rvy * scale, "#2b6cb0", 3);
      if (Math.abs(w) > 0.01) arrow(X, Y, X + evx * scale, Y + evy * scale, "#a0522d", 3);
      arrow(X, Y, X + avx * scale, Y + avy * scale, "#b03030", 3.5);

      ctx.beginPath(); ctx.arc(X, Y, 8, 0, Math.PI * 2); ctx.fillStyle = "#2b6cb0"; ctx.fill();

      label("v_r", X + rvx * scale + 6, Y + rvy * scale, "#2b6cb0");
      if (Math.abs(w) > 0.01) label("v_e", X + evx * scale + 6, Y + evy * scale, "#a0522d");
      label("v_a", X + avx * scale + 6, Y + avy * scale + 4, "#b03030");

      root.querySelector(".cmp-wv").textContent = w.toFixed(1) + " rad/s";
      root.querySelector(".cmp-vrv").textContent = vr + " px/s";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function boot() { document.querySelectorAll("[data-composition-demo]").forEach(initDemo); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
