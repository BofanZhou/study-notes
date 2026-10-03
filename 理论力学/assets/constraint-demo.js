/* ============================================================
   约束类型演示组件(可复用):六种常见约束 + 约束力方向
   用法:<div class="demo" data-constraint-demo></div> 并引入本脚本。
   IIFE + DOMContentLoaded + data- 属性,兼容单课与合并手册两种环境。
   ============================================================ */
(function () {
  var CS = [
    { key: "rope", name: "柔索", desc: "绳/链/皮带:只能受拉,约束力沿索背离物体(拉力)。",
      draw: function (ctx) { line(ctx, 200, 40, 200, 140); ball(ctx, 200, 170); arrow(ctx, 200, 150, 200, 90, "#b03030"); label(ctx, "T", 214, 100); label(ctx, "绳不可推,只能拉", 320, 60); } },
    { key: "surface", name: "光滑面", desc: "光滑接触面:约束力沿公法线指向物体(法向支持力)。",
      draw: function (ctx) { line(ctx, 80, 220, 320, 150); ball(ctx, 200, 150); arrow(ctx, 200, 165, 245, 152, "#b03030"); label(ctx, "FN", 250, 135); label(ctx, "沿公法线,无摩擦", 320, 60); } },
    { key: "pin", name: "固定铰支座", desc: "圆柱铰链:方向未知,用水平+竖直两个分量表示(可合成任意方向)。",
      draw: function (ctx) { beam(ctx); pinGlyph(ctx, 120, 200); arrow(ctx, 120, 200, 200, 200, "#b03030"); arrow(ctx, 120, 200, 120, 110, "#b03030"); label(ctx, "Fx", 205, 205); label(ctx, "Fy", 130, 100); label(ctx, "两个正交分量", 330, 60); } },
    { key: "roller", name: "活动铰支座(滚动支座)", desc: "可滚动:约束力垂直于支承面,过铰心,指向可假定。",
      draw: function (ctx) { beam(ctx); rollerGlyph(ctx, 280, 200); arrow(ctx, 280, 200, 280, 110, "#b03030"); label(ctx, "FN⊥支承面", 300, 100); label(ctx, "只能挡一个方向", 330, 60); } },
    { key: "twoforce", name: "二力杆", desc: "只在两端受力而平衡的杆件:两端约束力必沿两铰连线、等值反向。",
      draw: function (ctx) { ctx.save(); ctx.strokeStyle = "#5a4632"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(140, 220); ctx.lineTo(300, 100); ctx.stroke(); ctx.restore(); pinGlyph(ctx, 140, 220); pinGlyph(ctx, 300, 100); arrow(ctx, 140, 220, 230, 156, "#b03030"); arrow(ctx, 300, 100, 210, 164, "#b03030"); label(ctx, "沿杆轴线", 330, 60); } },
    { key: "fixed", name: "固定端(插入端)", desc: "埋入墙体的约束:两个力分量 + 一个约束力偶,共 3 个未知量。",
      draw: function (ctx) { beam(ctx); hatch(ctx, 60, 140, 60, 260); arrow(ctx, 80, 200, 170, 200, "#b03030"); arrow(ctx, 80, 200, 80, 110, "#b03030"); arcArrow(ctx, 170, 200, 40); label(ctx, "Fx, Fy, M", 300, 80); label(ctx, "不许移动也不许转动", 280, 60); } }
  ];

  function initDemo(root) {
    if (root._constraintInit) return;
    root._constraintInit = true;
    var style = document.createElement("style");
    style.textContent =
      ".cst-btns{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}" +
      ".cst-btn{font:inherit;padding:6px 12px;border:1px solid #c9b99a;border-radius:6px;background:#fbf7ee;color:#5a4632;cursor:pointer}" +
      ".cst-btn.on{background:#a0522d;border-color:#a0522d;color:#fff}" +
      ".cst-canvas{width:100%;max-width:640px;height:auto;display:block;background:#fffdf6;border:1px solid #e5dcc8;border-radius:8px;margin:0 auto}" +
      ".cst-desc{margin-top:10px;font-size:.95em;color:#5a4632}";
    document.head.appendChild(style);
    var btns = document.createElement("div"); btns.className = "cst-btns";
    var canvas = document.createElement("canvas"); canvas.className = "cst-canvas"; canvas.width = 640; canvas.height = 280;
    var desc = document.createElement("div"); desc.className = "cst-desc";
    root.appendChild(btns); root.appendChild(canvas); root.appendChild(desc);
    var current = "pin";
    CS.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.className = "cst-btn"; b.textContent = c.name;
      b._c = c; b.addEventListener("click", function () { current = c.key; draw(); });
      btns.appendChild(b);
    });
    function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    function ball(ctx, x, y) { ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fillStyle = "#d9c9a8"; ctx.fill(); ctx.stroke(); }
    function beam(ctx) { ctx.fillStyle = "#d9c9a8"; ctx.fillRect(80, 190, 300, 20); ctx.strokeRect(80, 190, 300, 20); }
    function pinGlyph(ctx, x, y) { ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = "#8a7a5a"; ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 16, y + 22); ctx.lineTo(x, y + 2); ctx.lineTo(x + 16, y + 22); ctx.closePath(); ctx.stroke(); }
    function rollerGlyph(ctx, x, y) { ctx.beginPath(); ctx.arc(x - 10, y + 20, 8, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 10, y + 20, 8, 0, Math.PI * 2); ctx.stroke(); pinGlyph(ctx, x, y); }
    function hatch(ctx, x, y1, x2, y2) { line(ctx, x, y1, x, y2); for (var yy = y1; yy < y2; yy += 16) line(ctx, x, yy, x - 14, yy + 12); }
    function arrow(ctx, x1, y1, x2, y2, color) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      var a = Math.atan2(y2 - y1, x2 - x1), h = 10;
      line(ctx, x1, y1, x2, y2);
      ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
      ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#5a4632"; ctx.lineWidth = 2;
    }
    function arcArrow(ctx, x, y, r) {
      ctx.strokeStyle = "#b03030"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, r, -0.5, 3.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + r * Math.cos(-0.5), y + r * Math.sin(-0.5), 4, 0, Math.PI * 2); ctx.fillStyle = "#b03030"; ctx.fill();
      ctx.strokeStyle = "#5a4632"; ctx.lineWidth = 2;
    }
    function label(ctx, t, x, y) { ctx.fillStyle = "#3d3428"; ctx.font = "14px sans-serif"; ctx.textAlign = "left"; ctx.fillText(t, x, y); }
    function draw() {
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 640, 280);
      ctx.strokeStyle = "#5a4632"; ctx.lineWidth = 2;
      Array.prototype.forEach.call(btns.children, function (b) { b.className = "cst-btn" + (b._c.key === current ? " on" : ""); });
      var c = CS.filter(function (x) { return x.key === current; })[0];
      c.draw(ctx); desc.textContent = c.desc;
    }
    draw();
  }
  function boot() { document.querySelectorAll("[data-constraint-demo]").forEach(initDemo); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
