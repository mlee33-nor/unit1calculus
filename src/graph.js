// ================= graph engine: SVG graph paper, piecewise curves, dots, charts =================
const Graph = (() => {
  let uid = 0;

  function frame(o) {
    const W = o.W || 400, H = o.H || 320;
    const pl = o.padL ?? 34, pr = 14, pt = 14, pb = o.padB ?? 30;
    const X = (x) => pl + ((x - o.xmin) / (o.xmax - o.xmin)) * (W - pl - pr);
    const Y = (y) => pt + ((o.ymax - y) / (o.ymax - o.ymin)) * (H - pt - pb);
    const id = "clip" + ++uid;
    const parts = [];
    const gx = o.noGrid ? Infinity : o.gx || 1, gy = o.noGrid ? Infinity : o.gy || 1;
    for (let x = Math.ceil(o.xmin / gx) * gx; x <= o.xmax + 1e-9; x += gx) parts.push(`<line class="gp-grid" x1="${X(x)}" y1="${Y(o.ymin)}" x2="${X(x)}" y2="${Y(o.ymax)}"/>`);
    for (let y = Math.ceil(o.ymin / gy) * gy; y <= o.ymax + 1e-9; y += gy) parts.push(`<line class="gp-grid" x1="${X(o.xmin)}" y1="${Y(y)}" x2="${X(o.xmax)}" y2="${Y(y)}"/>`);
    const xAxisY = o.ymin <= 0 && o.ymax >= 0 && !o.edgeLabels ? Y(0) : Y(o.ymin);
    const yAxisX = o.xmin <= 0 && o.xmax >= 0 && !o.edgeLabels ? X(0) : X(o.xmin);
    parts.push(`<line class="gp-axis" x1="${X(o.xmin)}" y1="${xAxisY}" x2="${X(o.xmax)}" y2="${xAxisY}"/>`);
    parts.push(`<line class="gp-axis" x1="${yAxisX}" y1="${Y(o.ymin)}" x2="${yAxisX}" y2="${Y(o.ymax)}"/>`);
    const lx = o.noLabels ? Infinity : o.lx || gx, ly = o.noLabels ? Infinity : o.ly || gy;
    for (let x = Math.ceil(o.xmin / lx) * lx; x <= o.xmax + 1e-9; x += lx) {
      if (!o.edgeLabels && Math.abs(x) < 1e-9) continue;
      const label = o.xLabel ? o.xLabel(x) : fmtDec(x, 2);
      parts.push(`<text class="gp-lab" x="${X(x)}" y="${xAxisY + 15}" text-anchor="middle">${label}</text>`);
    }
    for (let y = Math.ceil(o.ymin / ly) * ly; y <= o.ymax + 1e-9; y += ly) {
      if (!o.edgeLabels && Math.abs(y) < 1e-9) continue;
      parts.push(`<text class="gp-lab" x="${yAxisX - 6}" y="${Y(y) + 4}" text-anchor="end">${fmtDec(y, 2)}</text>`);
    }
    if (!o.edgeLabels && !o.noLabels) parts.push(`<text class="gp-lab" x="${yAxisX - 6}" y="${xAxisY + 15}" text-anchor="end">0</text>`);
    parts.push(`<text class="gp-name" x="${X(o.xmax) - 2}" y="${xAxisY - 6}" text-anchor="end">${o.xName || "x"}</text>`);
    parts.push(`<text class="gp-name" x="${yAxisX + 6}" y="${Y(o.ymax) + 12}">${o.yName || "y"}</text>`);
    const defs = `<defs><clipPath id="${id}"><rect x="${X(o.xmin)}" y="${Y(o.ymax)}" width="${X(o.xmax) - X(o.xmin)}" height="${Y(o.ymin) - Y(o.ymax)}"/></clipPath></defs>`;
    const top = [];
    return {
      X, Y, W, H,
      curve(fn, a, b, n = 320, cls = "gp-curve") {
        let d = "", pen = false;
        for (let i = 0; i <= n; i++) {
          const x = a + ((b - a) * i) / n, y = fn(x);
          if (!isFinite(y) || Math.abs(y) > (o.ymax - o.ymin) * 6) { pen = false; continue; }
          d += (pen ? "L" : "M") + X(x).toFixed(2) + " " + Y(y).toFixed(2);
          pen = true;
        }
        parts.push(`<path class="${cls}" clip-path="url(#${id})" d="${d}"/>`);
      },
      poly(pts, cls = "gp-curve") { parts.push(`<polyline class="${cls}" points="${pts.map(([x, y]) => X(x) + "," + Y(y)).join(" ")}"/>`); },
      cross(x, y) { const a = X(x), b = Y(y), s = 4; top.push(`<path class="gp-cross" d="M${a - s} ${b - s}L${a + s} ${b + s}M${a - s} ${b + s}L${a + s} ${b - s}"/>`); },
      dot(x, y, filled) { top.push(`<circle class="${filled ? "gp-closed" : "gp-open"}" cx="${X(x)}" cy="${Y(y)}" r="${filled ? 5.6 : 5.8}"/>`); },
      raw(svg) { top.push(svg); },
      guideV(x) { parts.push(`<line class="gp-guide" x1="${X(x)}" y1="${Y(o.ymin)}" x2="${X(x)}" y2="${Y(o.ymax)}"/>`); },
      guideH(x, y) { const x0 = o.xmin <= 0 && o.xmax >= 0 ? X(0) : X(o.xmin); parts.push(`<line class="gp-guide" x1="${x0}" y1="${Y(y)}" x2="${X(x)}" y2="${Y(y)}"/>`); },
      vline(x) { parts.push(`<line class="gp-asym" x1="${X(x)}" y1="${Y(o.ymin)}" x2="${X(x)}" y2="${Y(o.ymax)}"/>`); },
      svg(label) { return `<svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label || "graph"}">${defs}${parts.join("")}${top.join("")}</svg>`; },
    };
  }

  // ----- piecewise curve through nodes -----
  function segFn(a, b) {
    const y0 = a.yR, y1 = b.yL, K = 1.1;
    if (isFinite(y0) && isFinite(y1)) {
      const dx = b.x - a.x, m0 = a.sR, m1 = b.sL;
      return (x) => { const t = (x - a.x) / dx, t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * dx * m0 + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * dx * m1; };
    }
    if (!isFinite(y1)) { const s = Math.sign(y1); return (x) => y0 + s * K * (1 / (b.x - x) - 1 / (b.x - a.x)); }
    const s = Math.sign(y0); return (x) => y1 + s * K * (1 / (x - a.x) - 1 / (b.x - a.x));
  }

  function info(nd) {
    const fin = isFinite(nd.yL) && isFinite(nd.yR);
    const type = !fin ? "infinite" : nd.yL !== nd.yR ? "jump" : nd.val !== nd.yL ? "removable" : "continuous";
    return {
      x: nd.x, left: nd.yL, right: nd.yR,
      value: nd.val == null ? "DNE" : nd.val,
      limit: fin ? (nd.yL === nd.yR ? nd.yL : "DNE") : nd.yL === nd.yR ? nd.yL : "DNE",
      type, continuous: type === "continuous",
      differentiable: type === "continuous" && Math.abs(nd.sL - nd.sR) < 1e-9,
      corner: type === "continuous" && Math.abs(nd.sL - nd.sR) >= 1e-9,
    };
  }

  function drawPiecewise(nodes, view, label) {
    const g = frame(view);
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1], f = segFn(a, b), eps = isFinite(a.yR) && isFinite(b.yL) ? 0 : 0.002;
      g.curve(f, a.x + eps, b.x - eps);
    }
    if (view.highlight != null) {
      const k = nodes.findIndex((nd) => nd.x === view.highlight), hx = view.highlight;
      if (k > 0 && k < nodes.length - 1) {
        const Ln = nodes[k - 1], Rn = nodes[k + 1];
        g.curve(segFn(Ln, nodes[k]), Math.max(Ln.x, hx - 1.8), hx - 0.004, 140, "gp-hl gp-hl-left");
        g.curve(segFn(nodes[k], Rn), hx + 0.004, Math.min(Rn.x, hx + 1.8), 140, "gp-hl gp-hl-right");
      }
    }
    nodes.slice(1, -1).forEach((nd) => {
      const L = nd.yL, Rr = nd.yR, v = nd.val;
      if (view.guides) { g.guideV(nd.x); if (view.guides !== "v") [L, Rr, v].forEach((yy) => { if (yy != null && isFinite(yy)) g.guideH(nd.x, yy); }); }
      if (!isFinite(L) || !isFinite(Rr)) { g.vline(nd.x); if (v != null) g.dot(nd.x, v, true); return; }
      if (L === Rr) { if (v !== L) { g.dot(nd.x, L, false); if (v != null) g.dot(nd.x, v, true); } else if (view.dotContinuous) g.dot(nd.x, L, true); return; }
      g.dot(nd.x, L, v === L); g.dot(nd.x, Rr, v === Rr);
      if (v != null && v !== L && v !== Rr) g.dot(nd.x, v, true);
    });
    if (view.extras) view.extras(g);
    return g.svg(label);
  }

  const SLOPES = [-1, -0.5, 0, 0.5, 1];
  // types: array like ["jump","hole","cont","corner","asym"]
  function randomPiecewise(types, opts = {}) {
    const half = types.length >= 4 ? 7 : 6;
    const view = { xmin: -half, xmax: half, ymin: -5, ymax: 5, W: 520, H: 440, guides: opts.guides ?? (types.length >= 4 ? "v" : true) };
    for (let attempt = 0; attempt < 400; attempt++) {
      const n = types.length;
      // readable layouts: features spread out and at least 2 grid units from the edges
      const layouts = n === 1 ? [[0], [-1], [1]] : n === 2 ? [[-3, 2], [-2, 3], [-3, 3], [-2, 2]] : n === 3 ? [[-4, 0, 4], [-3, 0, 3], [-4, -1, 3], [-3, 1, 4]] : [[-5, -2, 1, 4], [-4, -1, 2, 5], [-5, -1, 2, 5]];
      const xs = R.pick(layouts);
      const ts = R.shuffle(types);
      // no two asymptotes adjacent
      let bad = false;
      for (let i = 1; i < n; i++) if (ts[i] === "asym" && ts[i - 1] === "asym") bad = true;
      if (bad) continue;
      const nodes = [{ x: view.xmin - 0.6, yR: R.int(-2, 3), sR: R.pick(SLOPES) }];
      ts.forEach((t, i) => {
        const y = R.int(-2, 3), s = R.pick(SLOPES), nd = { x: xs[i], t };
        if (t === "cont") Object.assign(nd, { yL: y, yR: y, val: y, sL: s, sR: s });
        else if (t === "corner") { const sl = R.pick([-2, -1.5, 1.5, 2]); Object.assign(nd, { yL: y, yR: y, val: y, sL: sl, sR: -sl * R.pick([0.5, 1]) }); }
        else if (t === "jump") {
          const y2 = y + R.pick([-3, -2, 2, 3]); const r = Math.random();
          Object.assign(nd, { yL: y, yR: y2, sL: R.pick(SLOPES), sR: R.pick(SLOPES), val: r < 0.42 ? y : r < 0.84 ? y2 : null });
        } else if (t === "hole") {
          Object.assign(nd, { yL: y, yR: y, sL: s, sR: s, val: R.chance(0.65) ? y + R.pick([-3, -2, 2, 3]) : null });
        } else if (t === "asym") {
          Object.assign(nd, { yL: R.pick([Infinity, -Infinity]), yR: R.pick([Infinity, -Infinity]), sL: 0, sR: 0, val: null });
        }
        nodes.push(nd);
      });
      nodes.push({ x: view.xmax + 0.6, yL: R.int(-2, 3), sL: R.pick(SLOPES) });
      // validate ranges
      let ok = true;
      for (let i = 0; i < nodes.length - 1 && ok; i++) {
        const a = nodes[i], b = nodes[i + 1];
        if (!isFinite(a.yR) && !isFinite(b.yL)) { ok = false; break; }
        const f = segFn(a, b);
        const fin = isFinite(a.yR) && isFinite(b.yL);
        for (let k = 1; k < 60; k++) {
          const x = a.x + ((b.x - a.x) * k) / 60, y = f(x);
          if (fin && (y > 4.2 || y < -4.2)) { ok = false; break; }
        }
      }
      nodes.forEach((nd) => { if (nd.val != null && (nd.val > 4 || nd.val < -4)) ok = false; if (isFinite(nd.yR) && (nd.yR > 4 || nd.yR < -4)) ok = false; if (isFinite(nd.yL) && (nd.yL > 4 || nd.yL < -4)) ok = false; });
      if (!ok) continue;
      if (opts.requireDistinct) {
        const inner = nodes.slice(1, -1);
        if (new Set(inner.map((nd) => info(nd).type + (info(nd).corner ? "c" : ""))).size < Math.min(inner.length, opts.requireDistinct)) continue;
      }
      return { nodes, view, svg: drawPiecewise(nodes, view, "piecewise graph"), inner: nodes.slice(1, -1).map(info) };
    }
    throw new Error("graph generation failed");
  }

  // ----- line chart (data points joined) -----
  function lineChart({ pts, xLabel, ymin, ymax, gy, xName, yName }) {
    const g = frame({ xmin: 0, xmax: pts.length - 1, ymin, ymax, gy, ly: gy, edgeLabels: true, xLabel, xName, yName, W: 420, H: 300, padL: 40, padB: 32 });
    g.poly(pts);
    pts.forEach(([x, y]) => g.cross(x, y));
    return g.svg("data chart");
  }

  function fnPlot(o) {
    const g = frame({ ...o, W: o.W || 420, H: o.H || 300, padL: o.padL ?? 42 });
    g.curve(o.fn, o.xmin, o.xmax, 400);
    return g.svg(o.label || "function graph");
  }

  return { frame, randomPiecewise, drawPiecewise, lineChart, fnPlot, info, segFn };
})();
