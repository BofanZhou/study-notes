/* ============================================================
   拓扑结构演示组件（可复用）：五种常见网络拓扑可视化
   用法：<div class="demo" data-topology-demo></div> 并引入本脚本。
   组件 JS 用 IIFE + DOMContentLoaded + data- 属性初始化，
   以便在「单课（../assets/x.js）」与「合并手册（内联脚本）」两种环境都能跑。
   ============================================================ */
(function () {
  var W = 640, H = 240;

  var TOPOS = {
    star: {
      name: "星型 star",
      desc: "所有节点都连到中心节点。中心一坏，全网瘫痪（单点故障）——但故障好定位、加机器最方便。你家路由器就是中心。",
      nodes: [
        { x: 320, y: 40, label: "路由器(中心)" },
        { x: 110, y: 130, label: "手机" }, { x: 240, y: 175, label: "笔记本" },
        { x: 400, y: 175, label: "平板" }, { x: 530, y: 130, label: "台式机" },
        { x: 320, y: 125, label: "打印机" }
      ],
      links: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]
    },
    bus: {
      name: "总线型 bus",
      desc: "一条主干电缆挂所有节点（两端需终结器）。省线便宜，但主干一断全网瘫痪，且节点越多冲突越多。早期以太网用，已淘汰。",
      nodes: [
        { x: 90, y: 60, label: "PC1" }, { x: 210, y: 60, label: "PC2" },
        { x: 330, y: 60, label: "PC3" }, { x: 450, y: 60, label: "PC4" },
        { x: 570, y: 60, label: "PC5" },
        { x: 320, y: 150, label: "", bar: true }
      ],
      links: [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5]]
    },
    ring: {
      name: "环型 ring",
      desc: "节点首尾相连成环，沿环依次传令牌。单环任何一处断开，全网瘫痪。",
      nodes: [
        { x: 320, y: 35, label: "PC1" }, { x: 480, y: 90, label: "PC2" },
        { x: 440, y: 185, label: "PC3" }, { x: 200, y: 185, label: "PC4" },
        { x: 160, y: 90, label: "PC5" }
      ],
      links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
    },
    tree: {
      name: "树型 tree",
      desc: "分层展开：核心—汇聚—接入。适合分级管理、易扩展；越靠近根部的设备越关键。校园网/企业网的标准画法。",
      nodes: [
        { x: 320, y: 40, label: "核心交换机" },
        { x: 160, y: 130, label: "楼层交换机" }, { x: 480, y: 130, label: "楼层交换机" },
        { x: 90, y: 205, label: "PC" }, { x: 230, y: 205, label: "PC" },
        { x: 410, y: 205, label: "PC" }, { x: 550, y: 205, label: "PC" }
      ],
      links: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]
    },
    mesh: {
      name: "网状 mesh",
      desc: "节点之间多多互连，任一条链路断了还有备路——可靠性最高，成本也最高。运营商骨干网/广域网核心长这样。",
      nodes: [
        { x: 320, y: 35, label: "A" }, { x: 500, y: 100, label: "B" },
        { x: 420, y: 200, label: "C" }, { x: 220, y: 200, label: "D" },
        { x: 140, y: 100, label: "E" }
      ],
      links: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 4], [2, 3], [3, 4], [1, 3]]
    }
  };

  function initDemo(root) {
    if (root._topologyInit) return;
    root._topologyInit = true;

    var style = document.createElement("style");
    style.textContent =
      ".topo-btns{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}" +
      ".topo-btn{font:inherit;padding:6px 14px;border:1px solid #c9b99a;border-radius:6px;" +
      "background:#fbf7ee;color:#5a4632;cursor:pointer}" +
      ".topo-btn.on{background:#a0522d;border-color:#a0522d;color:#fff}" +
      ".topo-canvas{width:100%;max-width:" + W + "px;height:auto;display:block;" +
      "background:#fffdf6;border:1px solid #e5dcc8;border-radius:8px;margin:0 auto}" +
      ".topo-desc{margin-top:10px;font-size:.95em;color:#5a4632}";
    document.head.appendChild(style);

    var btns = document.createElement("div");
    btns.className = "topo-btns";
    var canvas = document.createElement("canvas");
    canvas.className = "topo-canvas";
    canvas.width = W; canvas.height = H;
    var desc = document.createElement("div");
    desc.className = "topo-desc";
    root.appendChild(btns); root.appendChild(canvas); root.appendChild(desc);

    var current = "star";
    Object.keys(TOPOS).forEach(function (key) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "topo-btn"; b.textContent = TOPOS[key].name;
      b.addEventListener("click", function () { current = key; draw(); });
      b._key = key;
      btns.appendChild(b);
    });

    function draw() {
      var t = TOPOS[current];
      Array.prototype.forEach.call(btns.children, function (b) {
        b.className = "topo-btn" + (b._key === current ? " on" : "");
      });
      desc.textContent = t.desc;

      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 2; ctx.strokeStyle = "#a0522d";
      t.links.forEach(function (l) {
        var a = t.nodes[l[0]], b = t.nodes[l[1]];
        ctx.beginPath();
        if (a.bar || b.bar) {
          var bar = a.bar ? a : b, leaf = a.bar ? b : a;
          ctx.moveTo(50, bar.y); ctx.lineTo(W - 50, bar.y);
          ctx.moveTo(leaf.x, leaf.y + 14); ctx.lineTo(leaf.x, bar.y);
        } else {
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      });
      t.nodes.forEach(function (n) {
        ctx.beginPath();
        ctx.fillStyle = n.bar ? "none" : (n.label.indexOf("路由") > -1 || n.label.indexOf("交换") > -1 || n.label.indexOf("中心") > -1 ? "#a0522d" : "#7a6a52");
        if (n.bar) {
          ctx.lineWidth = 5; ctx.strokeStyle = "#5a4632";
          ctx.beginPath(); ctx.moveTo(50, n.y); ctx.lineTo(W - 50, n.y); ctx.stroke();
          ctx.lineWidth = 2;
        } else {
          ctx.arc(n.x, n.y, 13, 0, Math.PI * 2);
          ctx.fill();
        }
        if (n.label) {
          ctx.fillStyle = "#3d3428";
          ctx.font = "13px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y - (n.bar ? 24 : 22));
        }
      });
    }
    draw();
  }

  function boot() { document.querySelectorAll("[data-topology-demo]").forEach(initDemo); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
