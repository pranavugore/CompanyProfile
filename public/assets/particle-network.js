/*
 * Particle network background
 * Dots drift slowly; nearby dots are joined by thin lines. Over the header the
 * cursor becomes a node too: it links to nearby dots and gently pulls them in.
 * Plain <canvas>, no library. Usage: <canvas data-particle-network></canvas>
 * inside a positioned element; the canvas fills that element.
 */
(function () {
  "use strict";

  // ---- Settings: change these to tune the look --------------------------------
  var SETTINGS = {
    // Colours. "css:--name" reads a CSS variable, so light and dark mode follow the
    // site's theme. Any CSS colour works too, e.g. "#0071e3" or "rgb(0,113,227)".
    particleColor: "css:--muted",      // the dots
    lineColor: "css:--accent-text",    // lines between dots
    cursorLineColor: "css:--accent-text", // lines from the cursor to dots

    // Number of nodes: one dot per this many square pixels, capped at maxNodes.
    // Lower areaPerNode = denser network.
    areaPerNode: 11000,
    maxNodes: 110,

    linkDistance: 130,     // px: dots closer than this get a line between them
    lineOpacity: 0.32,     // strongest line opacity (fades out with distance)
    lineWidth: 1,          // px
    dotRadius: [1.2, 2.4], // px: smallest and largest dot
    speed: 0.25,           // px per frame at 60fps: how fast dots drift

    // Interaction distance: how far from the cursor dots link to it and feel its pull
    cursorDistance: 180,
    cursorPull: 0.012,     // 0 = links only, no pull; around 0.02 is a strong pull
    cursorLineOpacity: 0.55
  };
  // -------------------------------------------------------------------------------

  var canvases = document.querySelectorAll("canvas[data-particle-network]");
  if (!canvases.length) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resolve(c, el) {
    if (c.indexOf("css:") !== 0) return c;
    return getComputedStyle(el).getPropertyValue(c.slice(4)).trim() || "#888";
  }
  // Turn any CSS colour into "r,g,b" so lines can carry their own opacity
  var probe = document.createElement("canvas").getContext("2d");
  function rgb(c) {
    probe.fillStyle = "#000"; probe.fillStyle = c;
    var v = probe.fillStyle;
    if (v[0] === "#") return [1, 3, 5].map(function (i) { return parseInt(v.substr(i, 2), 16); }).join(",");
    var m = v.match(/[\d.]+/g); return m ? m.slice(0, 3).join(",") : "128,128,128";
  }

  Array.prototype.forEach.call(canvases, function (canvas) {
    var host = canvas.parentElement, ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1, nodes = [], colors = {}, raf = 0, visible = true;
    var mouse = { x: 0, y: 0, on: false };

    function readColors() {
      colors.dot = resolve(SETTINGS.particleColor, canvas);
      colors.line = rgb(resolve(SETTINGS.lineColor, canvas));
      colors.cursor = rgb(resolve(SETTINGS.cursorLineColor, canvas));
    }

    function size() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var want = Math.min(SETTINGS.maxNodes, Math.round(w * h / SETTINGS.areaPerNode));
      while (nodes.length < want) nodes.push(make());
      nodes.length = want;
      nodes.forEach(function (n) { n.x = Math.min(n.x, w); n.y = Math.min(n.y, h); });
    }

    function make() {
      var a = Math.random() * Math.PI * 2, s = SETTINGS.speed * (0.4 + Math.random() * 0.6);
      var r = SETTINGS.dotRadius;
      return { x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: r[0] + Math.random() * (r[1] - r[0]) };
    }

    function step(dt) {
      var cd = SETTINGS.cursorDistance;
      nodes.forEach(function (n) {
        if (mouse.on && SETTINGS.cursorPull) {
          var dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
          if (d < cd && d > 1) { var f = SETTINGS.cursorPull * (1 - d / cd); n.x += dx * f * dt; n.y += dy * f * dt; }
        }
        n.x += n.vx * dt; n.y += n.vy * dt;
        // Wrap around the edges so the field never empties out
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var ld = SETTINGS.linkDistance, ld2 = ld * ld, i, j, a, b, dx, dy, d2;
      ctx.lineWidth = SETTINGS.lineWidth;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 < ld2) {
            ctx.strokeStyle = "rgba(" + colors.line + "," + (SETTINGS.lineOpacity * (1 - Math.sqrt(d2) / ld)).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      if (mouse.on) {
        var cd = SETTINGS.cursorDistance;
        nodes.forEach(function (n) {
          var d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < cd) {
            ctx.strokeStyle = "rgba(" + colors.cursor + "," + (SETTINGS.cursorLineOpacity * (1 - d / cd)).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
        });
      }
      ctx.fillStyle = colors.dot;
      nodes.forEach(function (n) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill(); });
    }

    var last = 0;
    function frame(t) {
      var dt = last ? Math.min((t - last) / 16.67, 3) : 1; last = t;
      step(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !still.matches && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    host.addEventListener("pointermove", function (e) {
      var r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
      if (still.matches) draw();
    });
    host.addEventListener("pointerleave", function () { mouse.on = false; if (still.matches) draw(); });

    // Pause when the header is off screen or the tab is hidden
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(host);
    }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    window.addEventListener("resize", function () { size(); draw(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { readColors(); draw(); });
    still.addEventListener("change", function () { still.matches ? stop() : start(); draw(); });

    readColors(); size(); draw(); start();
  });
})();
