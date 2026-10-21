(function () {
  "use strict";
  var css = getComputedStyle(document.documentElement);
  function v(n, fb) { return css.getPropertyValue(n).trim() || fb; }
  var S = [v("--s1"), v("--s2"), v("--s3"), v("--s4"), v("--s5"), v("--s6"), v("--s7"), v("--s8")];
  // Gallery palettes: each chart takes one combination from Sanzo Wada's "A Dictionary of Color Combinations"
  // (number in brackets), with lightness and chroma nudged so it reads on the dark card and passes CVD checks.
  var P = {
    radial: ["#a6902f", "#379fbd", "#cd7080"],                       // [287] Pyrite Yellow, Pale King's Blue, Eosine Pink
    chord: ["#9b9533", "#27a4a8", "#b85e55", "#286fab", "#239267", "#a36aa5", "#b8872e", "#00978d"], // [257 + 306], one per state in ring order
    swarm: ["#a84f51", "#9b9533", "#286fab"],                         // [154] Carmine, Yellow, Blue
    stream: ["#26a4a8", "#ce755d", "#5282bc", "#928331", "#9c70ae"],   // [41 + 274]
    network: ["#a29140", "#417840", "#6593cf"],                       // [135] Sulpher Yellow, Cossack Green, Salvia Blue
    unit: ["#00978d", "#bb8531", "#a84f51"],                          // [122] Benzol Green, Cream Yellow, Carmine
    sankey: ["#b85e55", "#00978d", "#ae8b3f", "#a36aa5", "#839b52"],   // [266 + 301]
    bubble: ["#a85731", "#58a375", "#286fab"]                         // [333] Burnt Sienna, Cobalt Green, Blue
  };
  var INK = v("--ink"), INK2 = v("--ink-2"), MUTED = v("--muted"), GRID = v("--grid"), BG = v("--bg"), CARD = v("--card"), ACCENT = v("--accent");
  var SEQ = d3.interpolateRgb(v("--seq-0", "#1f2d47"), v("--seq-1", "#b7d3f6"));
  var SEQ_LOW = v("--seq-low", "#33507a"), DIV = [v("--div-neg", "#e66767"), v("--div-mid", "#383835"), v("--div-pos", "#3987e5")];
  // Colours are read once, so redraw when the device switches between light and dark
  if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { location.reload(); });
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = reduce ? 0 : 700;

  // Seeded random so the sample data is the same on every visit
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R = rng(20261016);
  function normal(r) { var u = 1 - r(), w = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); }

  // Tooltip
  var tip = document.getElementById("tip");
  function showTip(e, html) {
    tip.innerHTML = html; tip.style.opacity = 1;
    var x = e.clientX + 14, y = e.clientY + 14, w = tip.offsetWidth, h = tip.offsetHeight;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.style.opacity = 0; }
  function sw(c) { return '<span class="sw" style="background:' + c + '"></span>'; }
  var fmt$ = d3.format("$,.0f"), fmtK = function (n) { return n >= 1e6 ? "$" + d3.format(".2~f")(n / 1e6) + "M" : n >= 1e3 ? "$" + d3.format(".1~f")(n / 1e3) + "k" : fmt$(n); };
  var fmtN = d3.format(",.0f"), fmtD = d3.timeFormat("%a %e %b %Y"), fmtDs = d3.timeFormat("%e %b");

  /* ---------------- 01 Dashboard ---------------- */
  var END = new Date(2026, 8, 30);
  var DAYS = 730;
  var CHANNELS = ["Online store", "Marketplace", "Retail stores", "Wholesale", "Social"];
  var SEGMENTS = ["Members", "New customers", "Business"];
  var daily = d3.range(DAYS).map(function (i) {
    var date = d3.timeDay.offset(END, i - DAYS + 1);
    var t = i / DAYS, dow = date.getDay();
    var base = 9000 + 6000 * t + 1800 * Math.sin(2 * Math.PI * (i / 365) - 1.2) + (dow === 0 || dow === 6 ? 1600 : 0);
    var revenue = Math.max(2000, base + normal(R) * 1100);
    var aov = 82 + 10 * t + normal(R) * 4;
    var orders = Math.round(revenue / aov);
    var visitors = Math.round(orders / (0.028 + 0.006 * t + normal(R) * 0.002));
    var ch = [0.38 + 0.06 * t, 0.22, 0.2 - 0.05 * t, 0.12, 0.08 - 0.01 * t];
    var sg = [0.46 + 0.04 * t, 0.34 - 0.03 * t, 0.2 - 0.01 * t];
    return { date: date, revenue: revenue, orders: orders, visitors: visitors, members: Math.round(5200 + 4800 * t + normal(R) * 60), ch: ch, sg: sg };
  });

  function sumRange(rows, key) { return d3.sum(rows, function (d) { return d[key]; }); }
  function slice(days, offset) { var end = DAYS - (offset || 0); return daily.slice(Math.max(0, end - days), end); }

  function sparkline(el, vals, color) {
    var w = 200, h = 34, x = d3.scaleLinear([0, vals.length - 1], [2, w - 2]), y = d3.scaleLinear(d3.extent(vals), [h - 3, 3]);
    var svg = d3.select(el).append("svg").attr("viewBox", "0 0 " + w + " " + h).attr("preserveAspectRatio", "none").attr("aria-hidden", "true");
    svg.append("path").attr("d", d3.area().x(function (d, i) { return x(i); }).y0(h).y1(function (d) { return y(d); }).curve(d3.curveMonotoneX)(vals)).attr("fill", color).attr("opacity", 0.15);
    svg.append("path").attr("d", d3.line().x(function (d, i) { return x(i); }).y(function (d) { return y(d); }).curve(d3.curveMonotoneX)(vals)).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2).attr("vector-effect", "non-scaling-stroke");
  }

  function renderKpis(days) {
    var cur = slice(days), prev = slice(days, days);
    var bucket = Math.max(1, Math.round(days / 30));
    function series(key, agg) { var out = []; for (var i = 0; i < cur.length; i += bucket) { var g = cur.slice(i, i + bucket); out.push(agg ? agg(g) : d3.sum(g, function (d) { return d[key]; })); } return out; }
    var k = [
      { label: "Revenue", val: sumRange(cur, "revenue"), prev: sumRange(prev, "revenue"), f: fmtK, s: series("revenue") },
      { label: "Orders", val: sumRange(cur, "orders"), prev: sumRange(prev, "orders"), f: fmtN, s: series("orders") },
      { label: "Conversion rate", val: sumRange(cur, "orders") / sumRange(cur, "visitors"), prev: sumRange(prev, "orders") / sumRange(prev, "visitors"), f: d3.format(".2%"), s: series(null, function (g) { return d3.sum(g, function (d) { return d.orders; }) / d3.sum(g, function (d) { return d.visitors; }); }) },
      { label: "Active members", val: cur[cur.length - 1].members, prev: prev.length ? prev[prev.length - 1].members : cur[0].members, f: fmtN, s: series(null, function (g) { return g[g.length - 1].members; }) }
    ];
    var host = d3.select("#kpis").html("");
    k.forEach(function (d) {
      var ch = (d.val - d.prev) / d.prev, up = ch >= 0;
      var card = host.append("div").attr("class", "kpi");
      card.append("div").attr("class", "label").text(d.label);
      card.append("div").attr("class", "val").text(d.f(d.val));
      card.append("div").attr("class", "delta").html('<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ " : "▼ ") + d3.format(".1%")(Math.abs(ch)) + "</span> vs previous " + (days === 365 ? "12 months" : days + " days"));
      sparkline(card.node(), d.s, S[0]);
    });
  }

  function renderLine(days) {
    var data = slice(days);
    var agg = days > 120 ? d3.timeWeek : d3.timeDay;
    var rows = days > 120 ? d3.rollups(data, function (g) { return d3.sum(g, function (d) { return d.revenue; }); }, function (d) { return agg.floor(d.date); }).map(function (r) { return { date: r[0], revenue: r[1] }; }) : data.map(function (d) { return { date: d.date, revenue: d.revenue }; });
    var W = Math.max(320, Math.round(document.getElementById("d-line").clientWidth || 720)), H = W < 500 ? 220 : 260, m = { t: 12, r: 14, b: 26, l: 52 };
    var x = d3.scaleTime(d3.extent(rows, function (d) { return d.date; }), [m.l, W - m.r]);
    var y = d3.scaleLinear([0, d3.max(rows, function (d) { return d.revenue; }) * 1.1], [H - m.b, m.t]).nice();
    var host = d3.select("#d-line").html("");
    var svg = host.append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("role", "img").attr("aria-label", "Line chart of revenue over the selected period");
    svg.append("g").attr("class", "gridline").attr("transform", "translate(" + m.l + ",0)").call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r)).tickFormat(""));
    svg.append("g").attr("class", "ax").attr("transform", "translate(" + m.l + ",0)").call(d3.axisLeft(y).ticks(5).tickFormat(fmtK).tickSize(0).tickPadding(8)).select(".domain").remove();
    svg.append("g").attr("class", "ax").attr("transform", "translate(0," + (H - m.b) + ")").call(d3.axisBottom(x).ticks(W < 500 ? 3 : 6).tickSizeOuter(0));
    var area = d3.area().x(function (d) { return x(d.date); }).y0(y(0)).y1(function (d) { return y(d.revenue); }).curve(d3.curveMonotoneX);
    var line = d3.line().x(function (d) { return x(d.date); }).y(function (d) { return y(d.revenue); }).curve(d3.curveMonotoneX);
    var grad = svg.append("defs").append("linearGradient").attr("id", "lg").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 1);
    grad.append("stop").attr("offset", 0).attr("stop-color", S[0]).attr("stop-opacity", 0.35);
    grad.append("stop").attr("offset", 1).attr("stop-color", S[0]).attr("stop-opacity", 0);
    svg.append("path").attr("d", area(rows)).attr("fill", "url(#lg)");
    var p = svg.append("path").attr("d", line(rows)).attr("fill", "none").attr("stroke", S[0]).attr("stroke-width", 2);
    var len = p.node().getTotalLength();
    if (!reduce) p.attr("stroke-dasharray", len).attr("stroke-dashoffset", len).transition().duration(900).attr("stroke-dashoffset", 0);
    var last = rows[rows.length - 1];
    svg.append("circle").attr("cx", x(last.date)).attr("cy", y(last.revenue)).attr("r", 4.5).attr("fill", S[0]).attr("stroke", BG).attr("stroke-width", 2);
    var cross = svg.append("g").style("display", "none");
    cross.append("line").attr("y1", m.t).attr("y2", H - m.b).attr("stroke", MUTED).attr("stroke-dasharray", "3 3");
    var dot = cross.append("circle").attr("r", 5).attr("fill", S[0]).attr("stroke", BG).attr("stroke-width", 2);
    var bis = d3.bisector(function (d) { return d.date; }).center;
    svg.append("rect").attr("x", m.l).attr("y", m.t).attr("width", W - m.l - m.r).attr("height", H - m.t - m.b).attr("fill", "transparent")
      .on("pointermove", function (e) {
        var px = d3.pointer(e)[0], d = rows[bis(rows, x.invert(px))];
        cross.style("display", null).attr("transform", "translate(" + x(d.date) + ",0)"); dot.attr("cy", y(d.revenue));
        showTip(e, "<b>" + (days > 120 ? "Week of " + fmtDs(d.date) : fmtD(d.date)) + "</b><br>" + sw(S[0]) + "Revenue " + fmt$(d.revenue));
      })
      .on("pointerleave", function () { cross.style("display", "none"); hideTip(); });
  }

  function renderBar(days) {
    var data = slice(days);
    var rows = CHANNELS.map(function (c, i) { return { name: c, val: d3.sum(data, function (d) { return d.revenue * d.ch[i]; }) }; }).sort(function (a, b) { return b.val - a.val; });
    var W = Math.max(320, Math.round(document.getElementById("d-bar").clientWidth || 720)), H = 210, m = { t: 6, r: 70, b: 6, l: 110 };
    var y = d3.scaleBand(rows.map(function (d) { return d.name; }), [m.t, H - m.b]).padding(0.35);
    var x = d3.scaleLinear([0, d3.max(rows, function (d) { return d.val; })], [m.l, W - m.r]);
    var svg = d3.select("#d-bar").html("").append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("role", "img").attr("aria-label", "Bar chart of revenue by sales channel");
    var g = svg.selectAll("g.b").data(rows).join("g").attr("class", "b");
    g.append("text").attr("class", "lbl").attr("x", m.l - 10).attr("y", function (d) { return y(d.name) + y.bandwidth() / 2; }).attr("dy", "0.35em").attr("text-anchor", "end").text(function (d) { return d.name; });
    g.append("path").attr("fill", S[0]).attr("d", function (d) { return roundedBarH(m.l, y(d.name), 0, y.bandwidth()); })
      .transition().duration(DUR).attr("d", function (d) { return roundedBarH(m.l, y(d.name), x(d.val) - m.l, y.bandwidth()); });
    g.append("text").attr("class", "lbl-strong").attr("x", function (d) { return x(d.val) + 8; }).attr("y", function (d) { return y(d.name) + y.bandwidth() / 2; }).attr("dy", "0.35em").text(function (d) { return fmtK(d.val); });
    g.append("rect").attr("x", 0).attr("width", W).attr("y", function (d) { return y(d.name) - 4; }).attr("height", y.bandwidth() + 8).attr("fill", "transparent")
      .on("pointermove", function (e, d) { showTip(e, "<b>" + d.name + "</b><br>" + fmt$(d.val) + " · " + d3.format(".0%")(d.val / d3.sum(rows, function (r) { return r.val; })) + " of revenue"); })
      .on("pointerleave", hideTip);
  }
  function roundedBarH(x0, y0, w, h) { var r = Math.min(4, w); return "M" + x0 + "," + y0 + "h" + (w - r) + "a" + r + "," + r + " 0 0 1 " + r + "," + r + "v" + (h - 2 * r) + "a" + r + "," + r + " 0 0 1 " + (-r) + "," + r + "h" + (r - w) + "z"; }
  function roundedBarV(x0, yBase, w, h) { var r = Math.min(4, h, w / 2); return "M" + x0 + "," + yBase + "v" + (-(h - r)) + "a" + r + "," + r + " 0 0 1 " + r + "," + (-r) + "h" + (w - 2 * r) + "a" + r + "," + r + " 0 0 1 " + r + "," + r + "v" + (h - r) + "z"; }

  function renderDonut(days) {
    var data = slice(days);
    var rows = SEGMENTS.map(function (s, i) { return { name: s, val: d3.sum(data, function (d) { return d.revenue * d.sg[i]; }), c: S[i] }; });
    var total = d3.sum(rows, function (d) { return d.val; });
    var W = 300, H = 230, r = 100;
    var svg = d3.select("#d-donut").html("").append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("role", "img").attr("aria-label", "Donut chart of revenue share by customer segment");
    var g = svg.append("g").attr("transform", "translate(" + W / 2 + "," + H / 2 + ")");
    var arcs = d3.pie().value(function (d) { return d.val; }).sort(null).padAngle(0.02)(rows);
    var arc = d3.arc().innerRadius(r * 0.64).outerRadius(r).cornerRadius(4);
    var arcH = d3.arc().innerRadius(r * 0.64).outerRadius(r + 6).cornerRadius(4);
    g.selectAll("path").data(arcs).join("path").attr("fill", function (d) { return d.data.c; }).attr("d", arc)
      .on("pointermove", function (e, d) { d3.select(this).attr("d", arcH); showTip(e, sw(d.data.c) + "<b>" + d.data.name + "</b><br>" + fmt$(d.data.val) + " · " + d3.format(".1%")(d.data.val / total)); })
      .on("pointerleave", function () { d3.select(this).attr("d", arc); hideTip(); });
    g.append("text").attr("text-anchor", "middle").attr("dy", "-0.2em").attr("fill", INK).style("font", "800 22px var(--f-display)").text(fmtK(total));
    g.append("text").attr("text-anchor", "middle").attr("dy", "1.3em").attr("class", "lbl").text("total revenue");
    d3.select("#d-donut-legend").html(rows.map(function (d) { return '<span><i style="background:' + d.c + '"></i>' + d.name + " " + d3.format(".0%")(d.val / total) + "</span>"; }).join(""));
  }

  function renderWeek(days) {
    var data = slice(days);
    var names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var rows = names.map(function (n, i) { var dow = (i + 1) % 7; var g = data.filter(function (d) { return d.date.getDay() === dow; }); return { name: n, val: d3.mean(g, function (d) { return d.orders; }) }; });
    var W = 300, H = 210, m = { t: 22, r: 6, b: 24, l: 6 };
    var x = d3.scaleBand(names, [m.l, W - m.r]).padding(0.28);
    var y = d3.scaleLinear([0, d3.max(rows, function (d) { return d.val; })], [H - m.b, m.t]);
    var svg = d3.select("#d-week").html("").append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("role", "img").attr("aria-label", "Column chart of average orders per weekday");
    var peak = d3.max(rows, function (d) { return d.val; });
    svg.selectAll("path.c").data(rows).join("path").attr("class", "c").attr("fill", function (d) { return d.val === peak ? S[0] : SEQ_LOW; })
      .attr("d", function (d) { return roundedBarV(x(d.name), H - m.b, x.bandwidth(), H - m.b - y(d.val)); })
      .on("pointermove", function (e, d) { showTip(e, "<b>" + d.name + "</b><br>" + fmtN(d.val) + " orders on an average day"); }).on("pointerleave", hideTip);
    svg.selectAll("text.n").data(rows).join("text").attr("class", "lbl").attr("text-anchor", "middle").attr("x", function (d) { return x(d.name) + x.bandwidth() / 2; }).attr("y", H - 6).text(function (d) { return d.name; });
    var p = rows.find(function (d) { return d.val === peak; });
    svg.append("text").attr("class", "lbl-strong").attr("text-anchor", "middle").attr("x", x(p.name) + x.bandwidth() / 2).attr("y", y(p.val) - 6).text(fmtN(p.val));
  }

  function renderDash(days) { renderKpis(days); renderLine(days); renderBar(days); renderDonut(days); renderWeek(days); }
  document.querySelectorAll(".seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".seg button").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      curDays = +b.dataset.days; renderDash(curDays);
    });
  });
  var curDays = 90;
  renderDash(90);
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { renderLine(curDays); renderBar(curDays); }, 200); });

  /* ---------------- 02 Gallery ---------------- */
  var gallery = document.getElementById("gallery");
  var counter = 0;
  function NUM() { counter += 1; return (counter < 10 ? "0" : "") + counter; }
  function card(o) {
    var el = document.createElement("article");
    el.className = "viz" + (o.wide ? " wide" : "");
    el.innerHTML = '<div class="meta mono"><span>' + o.n + " · " + o.kind + "</span></div><h3>" + o.title + '</h3><p class="desc">' + o.desc + "</p>" + (o.chips ? '<div class="chips" role="group" aria-label="' + o.title + ' options">' + o.chips.map(function (c, i) { return '<button type="button" class="chip" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + c + "</button>"; }).join("") + "</div>" : "") + '<div class="stage"></div><p class="hint">' + o.hint + "</p>" + (o.note ? '<p class="hint src">' + o.note + "</p>" : "");
    gallery.appendChild(el);
    var stage = el.querySelector(".stage");
    var api = o.draw(stage);
    if (o.chips) el.querySelectorAll(".chip").forEach(function (b) { b.addEventListener("click", function () { el.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); }); api(+b.dataset.i); }); });
    return el;
  }
  function svgIn(stage, W, H, label) { return d3.select(stage).append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("role", "img").attr("aria-label", label); }
  function legendRow(svg, items, x, y) {
    var g = svg.append("g").attr("transform", "translate(" + x + "," + y + ")"), cx = 0;
    items.forEach(function (it) { var gi = g.append("g").attr("transform", "translate(" + cx + ",0)"); gi.append("rect").attr("width", 10).attr("height", 10).attr("rx", 2).attr("y", -9).attr("fill", it.c); var t = gi.append("text").attr("class", "lbl").attr("x", 15).text(it.name); cx += 22 + it.name.length * 6.4; });
    return g;
  }

  // 1. Radial year of automation runs
  card({ n: NUM(), kind: "Radial timeline", title: "A year of automation runs, wrapped into a circle", ref: "Searching for Birds", href: "https://searchingforbirds.visualcinnamon.com/",
    desc: "Every day's workflow runs as one spoke around a clock face. Quiet weekends, month-end reporting peaks, the end-of-financial-year rush and the Christmas shutdown all show up once the year wraps around.",
    hint: "Hover a spoke to see that day.",
    draw: function (stage) {
      var types = ["Scheduled", "Event-triggered", "Manual"];
      var days = d3.range(365).map(function (i) {
        var date = d3.timeDay.offset(new Date(2025, 0, 1), i), dow = date.getDay(), dom = date.getDate();
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        var growth = 0.6 + 0.4 * i / 364;                                          // more workflows go live through the year
        var weekend = dow === 0 || dow === 6 ? 0.35 : 1;
        var monthEnd = dom >= lastDay - 1 || dom === 1 ? 1.7 : 1;                   // month-end reporting
        var eofy = date.getMonth() === 5 && dom >= 20 ? 1.6 : 1;                    // end of financial year (June)
        var shutdown = (date.getMonth() === 11 && dom >= 23) || (date.getMonth() === 0 && dom <= 5) ? 0.3 : 1;
        var base = [60, 34, 10], k0 = growth * shutdown;
        return { date: date, v: [
          Math.max(0, base[0] * k0 * (dow === 0 || dow === 6 ? 0.7 : 1) * monthEnd * eofy + normal(R) * 4),
          Math.max(0, base[1] * k0 * weekend * (1 + 0.15 * Math.sin(2 * Math.PI * i / 91)) + normal(R) * 5),
          Math.max(0, base[2] * k0 * weekend * eofy + normal(R) * 2.5)
        ] };
      });
      var W = 560, H = 560, inner = 84, outer = 236;
      var svg = svgIn(stage, W, H, "Radial chart of daily automation runs over a year, split by how each run was started");
      var g = svg.append("g").attr("transform", "translate(" + W / 2 + "," + H / 2 + ")");
      var ang = d3.scaleLinear([0, 365], [0, 2 * Math.PI]);
      var rr = d3.scaleLinear([0, d3.max(days, function (d) { return d3.sum(d.v); })], [inner, outer]);
      [0.25, 0.5, 0.75, 1].forEach(function (f) { g.append("circle").attr("r", inner + (outer - inner) * f).attr("fill", "none").attr("stroke", GRID); });
      d3.range(12).forEach(function (mth) { var a = ang(d3.timeDay.count(new Date(2025, 0, 1), new Date(2025, mth, 1))) - Math.PI / 2; g.append("line").attr("x1", Math.cos(a) * (inner - 8)).attr("y1", Math.sin(a) * (inner - 8)).attr("x2", Math.cos(a) * (outer + 6)).attr("y2", Math.sin(a) * (outer + 6)).attr("stroke", GRID); var am = a + Math.PI / 12; g.append("text").attr("class", "lbl").attr("text-anchor", "middle").attr("dy", "0.35em").attr("x", Math.cos(am) * (outer + 18)).attr("y", Math.sin(am) * (outer + 18)).text(d3.timeFormat("%b")(new Date(2025, mth, 1))); });
      days.forEach(function (d, i) {
        var a = ang(i) - Math.PI / 2, acc = 0;
        var spoke = g.append("g").attr("class", "spoke");
        d.v.forEach(function (val, k) { var r0 = rr(acc), r1 = rr(acc + val); acc += val; spoke.append("line").attr("x1", Math.cos(a) * r0).attr("y1", Math.sin(a) * r0).attr("x2", Math.cos(a) * r0).attr("y2", Math.sin(a) * r0).attr("stroke", P.radial[k]).attr("stroke-width", 2.2).attr("stroke-linecap", "round").transition().delay(reduce ? 0 : i * 3).duration(DUR).attr("x2", Math.cos(a) * r1).attr("y2", Math.sin(a) * r1); });
        spoke.append("line").attr("x1", Math.cos(a) * inner).attr("y1", Math.sin(a) * inner).attr("x2", Math.cos(a) * (outer + 4)).attr("y2", Math.sin(a) * (outer + 4)).attr("stroke", "transparent").attr("stroke-width", 6)
          .on("pointermove", function (e) { spoke.attr("opacity", 1); g.selectAll(".spoke").attr("opacity", function () { return this === spoke.node() ? 1 : 0.35; }); showTip(e, "<b>" + d3.timeFormat("%a %-d %b")(d.date) + "</b><br>" + types.map(function (t, k) { return sw(P.radial[k]) + t + " " + Math.round(d.v[k]); }).join("<br>") + "<br>" + fmtN(d3.sum(d.v)) + " runs in total"); })
          .on("pointerleave", function () { g.selectAll(".spoke").attr("opacity", 1); hideTip(); });
      });
      g.append("text").attr("text-anchor", "middle").attr("dy", "-0.1em").attr("fill", INK).style("font", "800 26px var(--f-display)").text(fmtN(d3.sum(days, function (d) { return d3.sum(d.v); })));
      g.append("text").attr("text-anchor", "middle").attr("dy", "1.4em").attr("class", "lbl").text("workflow runs in 2025");
      legendRow(svg, types.map(function (t, k) { return { name: t, c: P.radial[k] }; }), 16, 24);
    } });

  // 10. Chord diagram
  card({ n: NUM(), kind: "Chord diagram", title: "Where Australians move when they change states", ref: "UNESCO Dive", href: "https://ich.unesco.org/en/dive?display=constellation#tabs",
    desc: "Interstate moves over a year. Each ribbon is a two-way flow between two states or territories, so the New South Wales to Queensland corridor stands out at once.",
    hint: "Hover a state to show only its flows.",
    note: "Arrival and departure totals for each state: ABS National, state and territory population, year to March 2026. Flows between each pair are modelled to match those totals.",
    draw: function (stage) {
      var regions = ["NSW", "ACT", "VIC", "TAS", "SA", "WA", "NT", "QLD"];
      var names = { NSW: "New South Wales", ACT: "Australian Capital Territory", VIC: "Victoria", TAS: "Tasmania", SA: "South Australia", WA: "Western Australia", NT: "Northern Territory", QLD: "Queensland" };
      // Rows = from, columns = to. Row sums match ABS departures and column sums match ABS arrivals (year to March 2026).
      var M = [[0, 8978, 28468, 3778, 5922, 9314, 3219, 47020], [8493, 0, 4822, 538, 834, 1182, 390, 4630], [24355, 4361, 0, 4820, 7600, 8776, 2608, 22979], [3229, 486, 4814, 0, 870, 1466, 412, 3380],
               [5198, 773, 7797, 894, 0, 3372, 955, 6412], [5876, 788, 6472, 1082, 2424, 0, 2461, 8711], [2884, 369, 2732, 432, 975, 3495, 0, 4991], [35844, 3731, 20475, 3015, 5568, 10524, 4245, 0]];
      var out = M.map(function (r) { return d3.sum(r); }), inn = regions.map(function (_, j) { return d3.sum(M, function (r) { return r[j]; }); });
      var W = 520, H = 520, or = 210, ir = 196;
      var svg = svgIn(stage, W, H, "Chord diagram of interstate migration between Australian states and territories");
      var g = svg.append("g").attr("transform", "translate(" + W / 2 + "," + H / 2 + ")");
      var chords = d3.chord().padAngle(0.035).sortSubgroups(d3.descending)(M);
      var arc = d3.arc().innerRadius(ir).outerRadius(or).cornerRadius(3);
      var rib = d3.ribbon().radius(ir - 2);
      var ribbons = g.append("g").selectAll("path").data(chords).join("path").attr("d", rib).attr("fill", function (d) { return P.chord[d.source.value >= d.target.value ? d.source.index : d.target.index]; }).attr("fill-opacity", 0.55).attr("stroke", BG).attr("stroke-width", 0.8);
      var groups = g.append("g").selectAll("g").data(chords.groups).join("g");
      groups.append("path").attr("d", arc).attr("fill", function (d) { return P.chord[d.index]; });
      groups.append("text").attr("class", "lbl-strong").attr("dy", "0.35em").attr("transform", function (d) { var a = (d.startAngle + d.endAngle) / 2; return "rotate(" + (a * 180 / Math.PI - 90) + ") translate(" + (or + 12) + ")" + (a > Math.PI ? " rotate(180)" : ""); }).attr("text-anchor", function (d) { return (d.startAngle + d.endAngle) / 2 > Math.PI ? "end" : "start"; }).text(function (d) { return regions[d.index]; });
      groups.on("pointermove", function (e, d) { ribbons.attr("fill-opacity", function (r) { return r.source.index === d.index || r.target.index === d.index ? 0.8 : 0.05; }); var i = d.index, net = inn[i] - out[i]; showTip(e, sw(P.chord[i]) + "<b>" + names[regions[i]] + "</b><br>" + fmtN(inn[i]) + " arrived · " + fmtN(out[i]) + " left<br>Net " + (net >= 0 ? "+" : "−") + fmtN(Math.abs(net))); }).on("pointerleave", function () { ribbons.attr("fill-opacity", 0.55); hideTip(); });
      ribbons.on("pointermove", function (e, d) { var a = regions[d.source.index], b = regions[d.target.index]; showTip(e, "<b>" + a + " ⇄ " + b + "</b><br>" + a + " → " + b + ": " + fmtN(M[d.source.index][d.target.index]) + "<br>" + b + " → " + a + ": " + fmtN(M[d.target.index][d.source.index])); }).on("pointerleave", hideTip);
    } });
  // 2. Beeswarm of releases
  card({ n: NUM(), kind: "Beeswarm timeline", title: "Every change to a product, as a swarm", ref: "ORCA commit history", href: "https://nbremer.github.io/ORCA/commit-history/",
    desc: "Each circle is one release, sized by how much changed and coloured by type. The swarm shows bursts of work and quiet spells across two years.",
    hint: "Hover a circle for its details.",
    draw: function (stage) {
      var types = ["Feature", "Fix", "Docs"];
      var start = new Date(2024, 9, 1), end = new Date(2026, 8, 30), span = end - start;
      var data = d3.range(220).map(function (i) { var t = R(); t = (t + (R() < 0.35 ? 0.25 * Math.sin(t * 20) : 0)); t = Math.min(0.999, Math.max(0, t)); var k = R() < 0.45 ? 0 : R() < 0.7 ? 1 : 2; return { date: new Date(+start + t * span), type: k, size: Math.round(Math.exp(2 + R() * 4.5)), id: i + 1 }; });
      var W = 640, H = 340, m = { l: 20, r: 20, b: 34 };
      var x = d3.scaleTime([start, end], [m.l, W - m.r]);
      var rs = d3.scaleSqrt([0, d3.max(data, function (d) { return d.size; })], [2.5, 13]);
      data.forEach(function (d) { d.x = x(d.date); d.y = (H - m.b) / 2 + 6; d.r = rs(d.size); });
      var sim = d3.forceSimulation(data).force("x", d3.forceX(function (d) { return x(d.date); }).strength(1)).force("y", d3.forceY((H - m.b) / 2 + 6).strength(0.06)).force("c", d3.forceCollide(function (d) { return d.r + 1; })).stop();
      for (var i = 0; i < 220; i++) sim.tick();
      var svg = svgIn(stage, W, H, "Beeswarm chart of product releases over two years, sized by change size and coloured by type");
      svg.append("g").attr("class", "ax").attr("transform", "translate(0," + (H - m.b) + ")").call(d3.axisBottom(x).ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%b %y")).tickSizeOuter(0));
      svg.selectAll("circle").data(data).join("circle").attr("cx", function (d) { return d.x; }).attr("cy", function (d) { return d.y; }).attr("r", 0).attr("fill", function (d) { return P.swarm[d.type]; }).attr("stroke", BG).attr("stroke-width", 1.5)
        .on("pointermove", function (e, d) { d3.select(this).attr("stroke", INK); showTip(e, sw(P.swarm[d.type]) + "<b>Release #" + d.id + "</b><br>" + types[d.type] + " · " + fmtN(d.size) + " lines changed<br>" + fmtD(d.date)); })
        .on("pointerleave", function () { d3.select(this).attr("stroke", BG); hideTip(); })
        .transition().delay(function (d) { return reduce ? 0 : (d.x / W) * 900; }).duration(DUR / 2).attr("r", function (d) { return d.r; });
      legendRow(svg, types.map(function (t, k) { return { name: t, c: P.swarm[k] }; }), 16, 22);
    } });

  // 7. Streamgraph
  card({ n: NUM(), kind: "Streamgraph", title: "Topics rising and falling over a year", ref: "Pitch Interactive", href: "https://pitchinteractive.com/",
    desc: "Weekly mentions of five topics stacked around a centre line. It shows both the total volume and which topic owned each moment.",
    hint: "Hover a stream to isolate it.",
    draw: function (stage) {
      var keys = ["Pricing", "Delivery", "Quality", "Support", "Range"];
      var weeks = d3.range(52).map(function (w) { var o = { w: w }; keys.forEach(function (k, i) { o[k] = Math.max(2, 20 + 14 * Math.sin((w + i * 9) / (6 + i)) + (i === 1 && w > 44 ? 30 : 0) + (i === 3 && w > 10 && w < 18 ? 22 : 0) + normal(R) * 3); }); return o; });
      var W = 640, H = 340, m = { l: 10, r: 10, b: 28, t: 34 };
      var stack = d3.stack().keys(keys).offset(d3.stackOffsetWiggle).order(d3.stackOrderInsideOut)(weeks);
      var x = d3.scaleLinear([0, 51], [m.l, W - m.r]);
      var y = d3.scaleLinear([d3.min(stack, function (l) { return d3.min(l, function (d) { return d[0]; }); }), d3.max(stack, function (l) { return d3.max(l, function (d) { return d[1]; }); })], [H - m.b, m.t]);
      var area = d3.area().x(function (d) { return x(d.data.w); }).y0(function (d) { return y(d[0]); }).y1(function (d) { return y(d[1]); }).curve(d3.curveBasis);
      var svg = svgIn(stage, W, H, "Streamgraph of weekly topic mentions over a year");
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach(function (mn, i) { var xx = x(i * 52 / 12); svg.append("line").attr("x1", xx).attr("x2", xx).attr("y1", m.t).attr("y2", H - m.b).attr("stroke", GRID); svg.append("text").attr("class", "lbl").attr("x", xx + 3).attr("y", H - 10).text(mn); });
      var paths = svg.append("g").selectAll("path").data(stack).join("path").attr("d", area).attr("fill", function (d, i) { return P.stream[i]; }).attr("stroke", BG).attr("stroke-width", 1.5);
      paths.on("pointermove", function (e, d) { var wk = Math.max(0, Math.min(51, Math.round(x.invert(d3.pointer(e, svg.node())[0])))); paths.attr("opacity", function (o) { return o === d ? 1 : 0.25; }); showTip(e, sw(P.stream[d.index]) + "<b>" + d.key + "</b><br>Week " + (wk + 1) + ": " + Math.round(weeks[wk][d.key]) + " mentions"); }).on("pointerleave", function () { paths.attr("opacity", 1); hideTip(); });
      legendRow(svg, keys.map(function (k, i) { return { name: k, c: P.stream[i] }; }), 12, 20);
    } });

  // 3. Constellation network
  card({ n: NUM(), kind: "Network", title: "A constellation of connected ideas", ref: "UNESCO Dive", href: "https://ich.unesco.org/en/dive?display=constellation#tabs",
    desc: "Topics as stars, links where they appear together. Clusters form on their own, and the brightest stars are the most connected.",
    hint: "Hover a star to light up its links. Drag to rearrange.",
    draw: function (stage) {
      var groups = ["Data", "Automation", "Apps"];
      var names = [["Dashboards","SQL","PostgreSQL","Data models","Looker Studio","KPIs","Forecasting","ETL","Data quality","Reporting","Analytics","Metrics"],["n8n","Webhooks","APIs","AI agents","LLMs","Email","Scheduling","Alerts","RPA","Integrations","Queues","Prompts"],["AppSheet","Forms","Mobile","Low-code","Web apps","UX","Bookings","Payments","Auth","Offline","Notifications","Profiles"]];
      var nodes = []; names.forEach(function (arr, gi) { arr.forEach(function (n) { nodes.push({ id: n, g: gi }); }); });
      var links = [];
      nodes.forEach(function (a, i) { nodes.forEach(function (b, j) { if (j <= i) return; var p = a.g === b.g ? 0.28 : 0.035; if (R() < p) links.push({ source: a.id, target: b.id }); }); });
      var deg = {}; links.forEach(function (l) { deg[l.source] = (deg[l.source] || 0) + 1; deg[l.target] = (deg[l.target] || 0) + 1; });
      nodes.forEach(function (n) { n.deg = deg[n.id] || 0; });
      var W = 640, H = 460;
      var svg = svgIn(stage, W, H, "Network chart of related topics in three clusters");
      var stars = svg.append("g"); d3.range(90).forEach(function () { stars.append("circle").attr("cx", R() * W).attr("cy", R() * H).attr("r", R() * 0.9 + 0.2).attr("fill", INK2).attr("opacity", 0.25); });
      var sim = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(46).strength(0.4)).force("charge", d3.forceManyBody().strength(-120)).force("center", d3.forceCenter(W / 2, H / 2 + 10)).force("x", d3.forceX(function (d) { return W / 2 + (d.g - 1) * 170; }).strength(0.08)).force("y", d3.forceY(H / 2).strength(0.06)).force("col", d3.forceCollide(16));
      var link = svg.append("g").selectAll("line").data(links).join("line").attr("stroke", INK2).attr("stroke-opacity", 0.18).attr("stroke-width", 1);
      var node = svg.append("g").selectAll("g").data(nodes).join("g").style("cursor", "grab");
      node.append("circle").attr("r", function (d) { return 3 + d.deg * 0.9; }).attr("fill", function (d) { return P.network[d.g]; }).attr("stroke", BG).attr("stroke-width", 2);
      node.append("circle").attr("r", function (d) { return 7 + d.deg * 1.4; }).attr("fill", function (d) { return P.network[d.g]; }).attr("opacity", 0.14);
      var lab = node.append("text").attr("class", "lbl").attr("dy", function (d) { return -(7 + d.deg); }).attr("text-anchor", "middle").text(function (d) { return d.id; }).attr("opacity", function (d) { return d.deg >= 5 ? 1 : 0; });
      function nb(a, b) { return links.some(function (l) { return (l.source === a && l.target === b) || (l.source === b && l.target === a); }); }
      node.on("pointerenter", function (e, d) {
        node.attr("opacity", function (o) { return o === d || nb(o, d) ? 1 : 0.2; }); lab.attr("opacity", function (o) { return o === d || nb(o, d) ? 1 : 0; });
        link.attr("stroke-opacity", function (l) { return l.source === d || l.target === d ? 0.8 : 0.05; }).attr("stroke", function (l) { return l.source === d || l.target === d ? P.network[d.g] : INK2; });
        showTip(e, sw(P.network[d.g]) + "<b>" + d.id + "</b><br>" + groups[d.g] + " · " + d.deg + " connections");
      }).on("pointermove", function (e, d) { showTip(e, sw(P.network[d.g]) + "<b>" + d.id + "</b><br>" + groups[d.g] + " · " + d.deg + " connections"); })
        .on("pointerleave", function () { node.attr("opacity", 1); lab.attr("opacity", function (d) { return d.deg >= 5 ? 1 : 0; }); link.attr("stroke-opacity", 0.18).attr("stroke", INK2); hideTip(); });
      node.call(d3.drag().on("start", function (e, d) { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }).on("drag", function (e, d) { d.fx = e.x; d.fy = e.y; }).on("end", function (e, d) { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
      sim.on("tick", function () {
        nodes.forEach(function (d) { d.x = Math.max(20, Math.min(W - 20, d.x)); d.y = Math.max(30, Math.min(H - 14, d.y)); });
        link.attr("x1", function (d) { return d.source.x; }).attr("y1", function (d) { return d.source.y; }).attr("x2", function (d) { return d.target.x; }).attr("y2", function (d) { return d.target.y; });
        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
      if (reduce) { sim.stop(); for (var i = 0; i < 300; i++) sim.tick(); sim.on("tick")(); }
      legendRow(svg, groups.map(function (t, k) { return { name: t, c: P.network[k] }; }), 16, 24);
    } });

  // 4. Unit chart regrouping
  card({ n: NUM(), kind: "Unit chart", title: "One dot per person, regrouped by what they said", ref: "NYT Privacy Project", href: "https://www.nytimes.com/interactive/2019/08/23/opinion/data-internet-privacy-tracking.html",
    desc: "600 survey answers, each a single dot. Switching the question makes every dot move to its new group, so the reader sees the people behind the percentages.",
    chips: ["All responses", "Would recommend?", "How often do they visit?"],
    hint: "Pick a question to watch the dots regroup.",
    draw: function (stage) {
      var N = 600, W = 640, H = 380;
      var people = d3.range(N).map(function (i) { var rec = R(); var freq = R(); return { i: i, a: [0, rec < 0.62 ? 0 : rec < 0.84 ? 1 : 2, freq < 0.3 ? 0 : freq < 0.75 ? 1 : 2] }; });
      var Q = [{ g: ["Everyone"] }, { g: ["Yes", "Not sure", "No"] }, { g: ["Weekly", "Monthly", "Rarely"] }];
      var svg = svgIn(stage, W, H, "Unit chart: 600 dots representing survey responses, grouped by answer");
      var dots = svg.append("g").selectAll("circle").data(people).join("circle").attr("r", 4.2).attr("cx", W / 2).attr("cy", H / 2).attr("fill", P.unit[0]);
      var labels = svg.append("g");
      function layout(qi) {
        var groups = Q[qi].g, cols = groups.length, colW = (W - 40) / cols;
        var counts = groups.map(function () { return 0; });
        var per = qi === 0 ? 40 : 14, gap = 10.5;
        dots.each(function (d) { d.k = d.a[qi]; d.n = counts[d.k]++; });
        dots.transition().duration(reduce ? 0 : 900).delay(function (d) { return reduce ? 0 : (d.i % 60) * 6; })
          .attr("cx", function (d) { var cx = 20 + colW * d.k + colW / 2; return cx - (per - 1) * gap / 2 + (d.n % per) * gap; })
          .attr("cy", function (d) { return H - 30 - Math.floor(d.n / per) * gap; })
          .attr("fill", function (d) { return qi === 0 ? P.unit[0] : P.unit[d.k]; });
        labels.selectAll("*").remove();
        groups.forEach(function (gname, k) {
          var cx = 20 + colW * k + colW / 2, rows = Math.ceil(counts[k] / per), top = H - 30 - rows * gap;
          labels.append("text").attr("class", "lbl-strong").attr("text-anchor", "middle").attr("x", cx).attr("y", top - 22).text(gname);
          labels.append("text").attr("class", "lbl").attr("text-anchor", "middle").attr("x", cx).attr("y", top - 8).text(counts[k] + " people · " + d3.format(".0%")(counts[k] / N));
        });
      }
      dots.on("pointermove", function (e, d) { showTip(e, "<b>Respondent " + (d.i + 1) + "</b><br>Recommend: " + Q[1].g[d.a[1]] + "<br>Visits: " + Q[2].g[d.a[2]]); }).on("pointerleave", hideTip);
      layout(0);
      return layout;
    } });

  // 8. Sankey
  card({ n: NUM(), wide: true, kind: "Sankey flow", title: "Where the data comes from and where it goes", ref: "Pitch Interactive", href: "https://pitchinteractive.com/",
    desc: "Records flowing from source systems through cleaning and into the places people use them. Band width is volume, so bottlenecks and leaks are easy to spot.",
    hint: "Hover a band or a box to follow the flow.",
    draw: function (stage) {
      var names = ["Web forms", "CRM", "Spreadsheets", "Event platform", "Cleaned", "Rejected", "Warehouse", "Dashboards", "Email campaigns", "Reports"];
      var col = [0, 0, 0, 0, 1, 1, 2, 3, 3, 3];
      var L = [[0, 4, 420], [0, 5, 60], [1, 4, 680], [1, 5, 30], [2, 4, 260], [2, 5, 110], [3, 4, 340], [3, 5, 25], [4, 6, 1700], [6, 7, 900], [6, 8, 500], [6, 9, 300]];
      var W = 1000, H = 400;
      var sk = d3.sankey().nodeWidth(12).nodePadding(16).extent([[10, 30], [W - 10, H - 10]]).nodeAlign(d3.sankeyLeft);
      var graph = sk({ nodes: names.map(function (n, i) { return { name: n, i: i }; }), links: L.map(function (l) { return { source: l[0], target: l[1], value: l[2] }; }) });
      var svg = svgIn(stage, W, H, "Sankey diagram of records flowing from sources through cleaning to destinations");
      function nodeColor(n) { return n.name === "Rejected" ? P.sankey[0] : P.sankey[[1, 1, 1, 1, 2, 0, 3, 4, 4, 4][n.i]]; }
      var link = svg.append("g").attr("fill", "none").selectAll("path").data(graph.links).join("path").attr("d", d3.sankeyLinkHorizontal()).attr("stroke", function (d) { return nodeColor(d.source); }).attr("stroke-opacity", 0.35).attr("stroke-width", function (d) { return Math.max(1, d.width); });
      var node = svg.append("g").selectAll("rect").data(graph.nodes).join("rect").attr("x", function (d) { return d.x0; }).attr("y", function (d) { return d.y0; }).attr("height", function (d) { return d.y1 - d.y0; }).attr("width", function (d) { return d.x1 - d.x0; }).attr("rx", 3).attr("fill", nodeColor);
      svg.append("g").selectAll("text").data(graph.nodes).join("text").attr("class", "lbl").attr("x", function (d) { return d.x0 < W / 2 ? d.x1 + 6 : d.x0 - 6; }).attr("y", function (d) { return (d.y0 + d.y1) / 2; }).attr("dy", "0.35em").attr("text-anchor", function (d) { return d.x0 < W / 2 ? "start" : "end"; }).text(function (d) { return d.name; });
      link.on("pointermove", function (e, d) { link.attr("stroke-opacity", function (o) { return o === d ? 0.75 : 0.12; }); showTip(e, "<b>" + d.source.name + " → " + d.target.name + "</b><br>" + fmtN(d.value) + " records a day"); }).on("pointerleave", function () { link.attr("stroke-opacity", 0.35); hideTip(); });
      node.on("pointermove", function (e, d) { link.attr("stroke-opacity", function (o) { return o.source === d || o.target === d ? 0.75 : 0.12; }); showTip(e, "<b>" + d.name + "</b><br>" + fmtN(d.value) + " records a day"); }).on("pointerleave", function () { link.attr("stroke-opacity", 0.35); hideTip(); });
      ["Sources", "Cleaning", "Storage", "Used in"].forEach(function (t, i) { var nd = graph.nodes; var xs = [nd[0].x0, (nd[4].x0 + nd[4].x1) / 2, (nd[6].x0 + nd[6].x1) / 2, nd[7].x1]; svg.append("text").attr("class", "mono").attr("fill", MUTED).style("font-size", "10px").attr("x", xs[i]).attr("y", 16).attr("text-anchor", i === 3 ? "end" : i === 0 ? "start" : "middle").text(t.toUpperCase()); });
    } });

  // 5. Circle packing
  card({ n: NUM(), kind: "Bubble pack", title: "What's inside the total, bubble by bubble", ref: "Unearthed pesticides", href: "https://unearthed.greenpeace.org/2020/02/20/pesticides-croplife-hazardous-bayer-syngenta-health-bees/",
    desc: "Product categories as clusters and each product as a bubble sized by sales. A sea of small bubbles beside a few giants makes the concentration obvious.",
    hint: "Hover a bubble to see the product and its share.",
    draw: function (stage) {
      var cats = ["Home", "Outdoor", "Kitchen"];
      var root = { name: "all", children: cats.map(function (c, ci) { return { name: c, ci: ci, children: d3.range(14 + ci * 4).map(function (j) { return { name: c + " item " + (j + 1), ci: ci, value: Math.round(Math.pow(R(), 3) * 90000 + 2000) }; }) }; }) };
      var W = 560, H = 520;
      var h = d3.hierarchy(root).sum(function (d) { return d.value || 0; }).sort(function (a, b) { return b.value - a.value; });
      d3.pack().size([W - 20, H - 50]).padding(function (d) { return d.depth === 0 ? 16 : 2.5; })(h);
      var svg = svgIn(stage, W, H, "Circle packing chart of product sales grouped by category");
      var g = svg.append("g").attr("transform", "translate(10,40)");
      var total = h.value;
      g.selectAll("circle.cat").data(h.children).join("circle").attr("class", "cat").attr("cx", function (d) { return d.x; }).attr("cy", function (d) { return d.y; }).attr("r", function (d) { return d.r; }).attr("fill", function (d) { return P.bubble[d.data.ci]; }).attr("fill-opacity", 0.08).attr("stroke", function (d) { return P.bubble[d.data.ci]; }).attr("stroke-opacity", 0.5);
      g.selectAll("circle.leaf").data(h.leaves()).join("circle").attr("class", "leaf").attr("cx", function (d) { return d.x; }).attr("cy", function (d) { return d.y; }).attr("r", 0).attr("fill", function (d) { return P.bubble[d.data.ci]; }).attr("stroke", BG).attr("stroke-width", 1.5)
        .on("pointermove", function (e, d) { d3.select(this).attr("stroke", INK); showTip(e, sw(P.bubble[d.data.ci]) + "<b>" + d.data.name + "</b><br>" + fmt$(d.value) + " · " + d3.format(".1%")(d.value / total) + " of all sales"); })
        .on("pointerleave", function () { d3.select(this).attr("stroke", BG); hideTip(); })
        .transition().delay(function (d, i) { return reduce ? 0 : i * 12; }).duration(DUR).attr("r", function (d) { return d.r; });
      g.selectAll("text.cl").data(h.children).join("text").attr("class", "lbl-strong").attr("text-anchor", "middle").attr("x", function (d) { return d.x; }).attr("y", function (d) { return d.y - d.r - 6; }).text(function (d) { return d.data.name + " · " + d3.format(".0%")(d.value / total); });
    } });

  // 6. Hex map with scenario toggle
  card({ n: NUM(), kind: "Hex map", title: "A map you can flip between today and tomorrow", ref: "VACS crop explorer", href: "https://vacs.theplotline.org/",
    desc: "Regions as equal hexagons so small areas aren't lost. Switch the scenario to compare today's demand with a 2035 projection.",
    chips: ["Today", "2035 projection", "Change"],
    hint: "Hover a hexagon. Switch scenarios to see where demand moves.",
    draw: function (stage) {
      var W = 600, H = 470, r = 17, dx = r * Math.sqrt(3), dy = r * 1.5;
      var cells = [];
      for (var row = 0; row < 15; row++) for (var col = 0; col < 18; col++) {
        var cx = 30 + col * dx + (row % 2 ? dx / 2 : 0), cy = 40 + row * dy;
        var nx = (cx - W / 2) / (W * 0.46), ny = (cy - H / 2) / (H * 0.44);
        var blob = nx * nx + ny * ny * 1.15 + 0.18 * Math.sin(nx * 5) - 0.12 * Math.cos(ny * 4);
        if (blob < 0.92) { var coast = 1 - Math.min(1, Math.sqrt(nx * nx + ny * ny)); var now = Math.max(0.05, 0.25 + 0.9 * Math.pow(1 - coast, 2) * (nx > 0.2 ? 1 : 0.6) + normal(R) * 0.05); var fut = Math.max(0.05, now * (1 + 0.55 * nx - 0.25 * ny + normal(R) * 0.06)); cells.push({ cx: cx, cy: cy, now: now, fut: fut, id: "R" + (cells.length + 1) }); }
      }
      var hex = d3.range(6).map(function (k) { var a = Math.PI / 3 * k + Math.PI / 6; return [Math.cos(a) * (r - 1.2), Math.sin(a) * (r - 1.2)]; });
      var svg = svgIn(stage, W, H, "Hexagon map of regional demand with scenario toggle");
      var maxV = d3.max(cells, function (c) { return Math.max(c.now, c.fut); });
      var seq = d3.scaleSequential([0, maxV], SEQ);
      var div = d3.scaleDiverging([-0.5, 0, 0.5], function (t) { return t < 0.5 ? d3.interpolateRgb(DIV[0], DIV[1])(t * 2) : d3.interpolateRgb(DIV[1], DIV[2])((t - 0.5) * 2); }).clamp(true);
      var hexes = svg.append("g").selectAll("path").data(cells).join("path").attr("transform", function (c) { return "translate(" + c.cx + "," + c.cy + ")"; }).attr("d", "M" + hex.join("L") + "Z").attr("stroke", BG).attr("stroke-width", 1.5);
      var mode = 0;
      var leg = svg.append("g").attr("transform", "translate(20," + (H - 22) + ")");
      function legend() {
        leg.selectAll("*").remove();
        var w = 180, n = 30;
        d3.range(n).forEach(function (i) { var t = i / (n - 1); leg.append("rect").attr("x", i * (w / n)).attr("width", w / n + 0.5).attr("height", 8).attr("fill", mode === 2 ? div(-0.5 + t) : seq(t * maxV)); });
        leg.append("text").attr("class", "lbl").attr("y", -6).text(mode === 2 ? "Falls" : "Low");
        leg.append("text").attr("class", "lbl").attr("x", w).attr("y", -6).attr("text-anchor", "end").text(mode === 2 ? "Grows" : "High");
      }
      function update(m) {
        mode = m;
        hexes.transition().duration(DUR).attr("fill", function (c) { return m === 0 ? seq(c.now) : m === 1 ? seq(c.fut) : div((c.fut - c.now) / c.now); });
        legend();
      }
      hexes.on("pointermove", function (e, c) { d3.select(this).attr("stroke", INK).raise(); showTip(e, "<b>Region " + c.id + "</b><br>Today: " + d3.format(".0f")(c.now * 100) + "<br>2035: " + d3.format(".0f")(c.fut * 100) + "<br>Change: " + d3.format("+.0%")((c.fut - c.now) / c.now)); }).on("pointerleave", function () { d3.select(this).attr("stroke", BG); hideTip(); });
      update(0);
      return update;
    } });

  // 9. Calendar heatmap
  card({ n: NUM(), wide: true, kind: "Calendar heatmap", title: "Every day of the year in one glance", ref: "ORCA commit history", href: "https://nbremer.github.io/ORCA/commit-history/",
    desc: "One square per day, darker for busier. Weekly habits, holidays and the end-of-year rush all show up without a single axis label.",
    hint: "Hover any day.",
    draw: function (stage) {
      var start = new Date(2025, 0, 1);
      var days = d3.timeDays(start, new Date(2026, 0, 1)).map(function (d, i) { var dow = d.getDay(); var v0 = (dow === 0 || dow === 6 ? 2 : 9) + 6 * Math.sin(i / 58) + (d.getMonth() === 11 ? 8 : 0) + normal(R) * 2.5; if (d.getMonth() === 0 && d.getDate() < 6) v0 = 0.5; return { d: d, v: Math.max(0, Math.round(v0)) }; });
      var cs = 12, gap = 2, W = 53 * (cs + gap) + 40, H = 7 * (cs + gap) + 60;
      var svg = svgIn(stage, W, H, "Calendar heatmap of daily activity across 2025").style("max-width", "860px").style("margin", "0 auto");
      var max = d3.max(days, function (d) { return d.v; });
      var col = d3.scaleSequential([0, max], SEQ);
      var g = svg.append("g").attr("transform", "translate(30,26)");
      g.selectAll("rect").data(days).join("rect").attr("width", cs).attr("height", cs).attr("rx", 2.5).attr("x", function (d) { return d3.timeWeek.count(start, d.d) * (cs + gap); }).attr("y", function (d) { return d.d.getDay() * (cs + gap); }).attr("fill", function (d) { return col(d.v); })
        .on("pointermove", function (e, d) { d3.select(this).attr("stroke", INK); showTip(e, "<b>" + fmtD(d.d) + "</b><br>" + d.v + " tasks completed"); }).on("pointerleave", function () { d3.select(this).attr("stroke", null); hideTip(); });
      d3.range(12).forEach(function (mth) { var d = new Date(2025, mth, 1); g.append("text").attr("class", "lbl").attr("x", d3.timeWeek.count(start, d) * (cs + gap)).attr("y", -8).text(d3.timeFormat("%b")(d)); });
      ["Mon", "Wed", "Fri"].forEach(function (t, i) { g.append("text").attr("class", "lbl").attr("x", -6).attr("text-anchor", "end").attr("y", (1 + i * 2) * (cs + gap) + cs - 2).text(t); });
      var leg = svg.append("g").attr("transform", "translate(" + (W - 170) + "," + (H - 14) + ")");
      leg.append("text").attr("class", "lbl").attr("x", -6).attr("y", 9).attr("text-anchor", "end").text("Less");
      d3.range(6).forEach(function (i) { leg.append("rect").attr("x", i * 16).attr("width", cs).attr("height", cs).attr("rx", 2.5).attr("fill", col(i / 5 * max)); });
      leg.append("text").attr("class", "lbl").attr("x", 6 * 16 + 2).attr("y", 9).text("More");
    } });

})();
