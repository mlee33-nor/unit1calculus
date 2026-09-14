// ================= Section 1.3 — Average rate of change & the difference quotient =================
const sumTex = (items) => {
  let out = "";
  items.forEach(([c, body]) => {
    c = Q.of(c); if (c.isZero()) return;
    const neg = c.n < 0, a = neg ? c.neg() : c;
    const s = (body && a.eq(1) ? "" : a.tex()) + body;
    out += out === "" ? (neg ? "-" : "") + s : (neg ? " - " : " + ") + s;
  });
  return out || "0";
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const ARC_CTX = [
  { f: "f", v: "x", inU: "hours", outU: "miles", outOne: "mile", what: "the distance driven", desc: (v) => `the number of miles driven after ${$m(v)} hours`, unit: "miles per hour", gen: () => [R.int(1, 5), R.int(-3, 8), R.int(0, 6)], lo: 0, hi: 8 },
  { f: "C", v: "q", inU: "items", outU: "dollars", outOne: "dollar", what: "the cost", desc: (v) => `the cost, in dollars, of producing ${$m(v)} items`, unit: "dollars per item", gen: () => [R.int(1, 3), R.int(2, 15), R.int(40, 200)], lo: 0, hi: 12 },
  { f: "s", v: "t", inU: "seconds", outU: "feet", outOne: "foot", what: "the height of the ball", desc: (v) => `the height, in feet, of a ball ${$m(v)} seconds after it is thrown upward`, unit: "feet per second", gen: () => [-16, R.pick([64, 80, 96]), R.int(4, 40)], lo: 0, hi: 4 },
  { f: "V", v: "t", inU: "minutes", outU: "gallons", outOne: "gallon", what: "the amount of water in the tank", desc: (v) => `the number of gallons of water in a tank ${$m(v)} minutes after a drain is opened`, unit: "gallons per minute", gen: () => [1, -R.pick([30, 40, 50]), R.pick([300, 400, 600])], lo: 0, hi: 12 },
  { f: "P", v: "t", inU: "years", outU: "thousand people", outOne: "thousand people", what: "the population", desc: (v) => `the population of a town, in thousands of people, ${$m(v)} years after 2020`, unit: "thousand people per year", gen: () => [R.int(1, 2), R.int(1, 6), R.int(20, 60)], lo: 0, hi: 10 },
];

GEN.arcFunc = () => {
  let ctx, co, p, qq, fp, fq, V;
  do {
    ctx = R.pick(ARC_CTX); co = ctx.gen();
    p = R.int(ctx.lo, ctx.hi - 2); qq = p + R.int(2, Math.min(4, ctx.hi - p));
    fp = evalPoly(co, p); fq = evalPoly(co, qq); V = fq.sub(fp).div(qq - p);
  } while (V.isZero());
  const { f, v } = ctx, ftex = T.poly(co, v), Vt = V.tex();
  return {
    prompt: para(`Let ${$m(`${f}(${v}) = ${ftex}`)}, where ${$m(`${f}(${v})`)} represents ${ctx.desc(v)}. Find the average rate of change over ${$m(`[${p}, ${qq}]`)}.`),
    parts: [
      P.num($m(`${f}(${p})`), fp),
      P.num($m(`${f}(${qq})`), fq),
      P.num(`Average rate of change (number only)`, V),
      P.mc(`Which sentence correctly states the result <b>with units</b>?`, [
        `Between ${$m(`${v} = ${p}`)} and ${$m(`${v} = ${qq}`)} ${ctx.inU}, ${ctx.what} changes at an average rate of ${$m(Vt)} ${ctx.unit}.`,
        `At exactly ${$m(`${v} = ${qq}`)} ${ctx.inU}, ${ctx.what} is changing at a rate of ${$m(Vt)} ${ctx.unit}.`,
        `${cap(ctx.what)} changes by a total of ${$m(Vt)} ${ctx.outU} from ${$m(`${v} = ${p}`)} to ${$m(`${v} = ${qq}`)}.`,
        `Between ${$m(`${v} = ${p}`)} and ${$m(`${v} = ${qq}`)}, ${ctx.what} changes at an average rate of ${$m(Vt)} ${ctx.inU} per ${ctx.outOne}.`,
      ], 0),
    ],
    hint: "Average rate of change = [f(b) − f(a)] / (b − a). Units are (output units) per (input unit).",
    solution:
      $M(`${f}(${p}) = ${fp.tex()}, \\qquad ${f}(${qq}) = ${fq.tex()}`) +
      $M(`\\frac{${f}(${qq}) - ${f}(${p})}{${qq} - ${p}} = \\frac{${fq.tex()} - ${T.par(fp)}}{${qq - p}} = \\frac{${fq.sub(fp).tex()}}{${qq - p}} = ${Vt}\\ \\text{${ctx.unit}}`) +
      para(`It's an <i>average</i> over an interval (not an instant), and the units are ${ctx.outU} per ${ctx.inU.replace(/s$/, "")} — ${ctx.unit}. The total change would be ${fq.sub(fp).tex()} ${ctx.outU}.`),
  };
};

GEN.arcData = () => {
  if (R.chance(0.5)) {
    const ctx = R.pick([
      { name: "U.S. unemployment rate", row: "Rate, %", dec: 1, lo: 3.4, hi: 10, start: () => 4 + Math.random() * 2, step: 1.3, unit: "percentage points per year", units: ["percentage points per year", "years per percentage point", "percent", "percentage points"] },
      { name: "average price of a gallon of regular gas", row: "Price, $", dec: 2, lo: 1.9, hi: 5.2, start: () => 2.3 + Math.random() * 0.6, step: 0.45, unit: "dollars per year", units: ["dollars per year", "years per dollar", "dollars", "dollars per gallon"] },
    ]);
    const sc = 10 ** ctx.dec, yrs = Array.from({ length: 11 }, (_, i) => 2016 + i);
    let x = ctx.start(); const vals = yrs.map(() => { const out = Math.round(x * sc); x = Math.min(ctx.hi, Math.max(ctx.lo, x + (Math.random() - 0.45) * ctx.step)); return out; });
    const i1 = R.int(0, 3), j1 = i1 + R.int(3, 5), i2 = R.int(5, 7), j2 = Math.min(10, i2 + R.int(3, 4));
    const arc = (i, j) => q(vals[j] - vals[i], sc * (yrs[j] - yrs[i]));
    const show = (vv) => (vv / sc).toFixed(ctx.dec);
    const table = `<div class="tbl-wrap"><table class="vt"><tr><th>Year</th>${yrs.map((y) => `<td>${y}</td>`).join("")}</tr><tr><th>${ctx.row}</th>${vals.map((vv) => `<td>${show(vv)}</td>`).join("")}</tr></table></div>`;
    const a1 = arc(i1, j1), a2 = arc(i2, j2);
    const line = (i, j, a) => $M(`\\frac{${show(vals[j])} - ${show(vals[i])}}{${yrs[j]} - ${yrs[i]}} = \\frac{${fmtDec((vals[j] - vals[i]) / sc, 2)}}{${yrs[j] - yrs[i]}} ${a.isInt() ? "=" : "\\approx"} ${fmtDec(a.val(), 3)}`);
    return {
      prompt: para(`The table shows the ${ctx.name}.`) + table + para(`Rounded answers (2+ decimal places) are accepted.`),
      parts: [
        P.num(`Average rate of change from ${yrs[i1]} to ${yrs[j1]}`, a1),
        P.num(`Average rate of change from ${yrs[i2]} to ${yrs[j2]}`, a2),
        P.mcFixed(`The units of these answers are…`, ctx.units, 0),
      ],
      hint: "Rate = change in output ÷ change in years. Keep the sign: a decrease gives a negative rate.",
      solution: para(`<b>${yrs[i1]}–${yrs[j1]}:</b>`) + line(i1, j1, a1) + para(`<b>${yrs[i2]}–${yrs[j2]}:</b>`) + line(i2, j2, a2) +
        para(`Units: output units per input unit → <b>${ctx.unit}</b>.`),
    };
  }
  // line chart (stock-price style)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  let pts, best, arcs;
  const ivs = [[0, 2], [2, 4], [4, 6]];
  do {
    let y = R.int(19, 25); pts = months.map((_, i) => { const out = [i, y]; y = Math.max(16, Math.min(34, y + R.int(-3, 4))); return out; });
    arcs = ivs.map(([a, b]) => q(pts[b][1] - pts[a][1], b - a));
    const mx = Math.max(...arcs.map((a) => a.val()));
    best = arcs.findIndex((a) => a.val() === mx);
    if (arcs.filter((a) => a.val() === mx).length > 1) best = -1;
  } while (best < 0);
  const ymin = Math.floor((Math.min(...pts.map((p) => p[1])) - 2) / 2) * 2, ymax = Math.ceil((Math.max(...pts.map((p) => p[1])) + 2) / 2) * 2;
  const a = R.int(0, 2), b = a + R.int(3, 4);
  const Vab = q(pts[b][1] - pts[a][1], b - a);
  const svg = Graph.lineChart({ pts, xLabel: (x) => `${x}`, ymin, ymax, gy: 2, xName: "", yName: "" });
  return {
    prompt: para(`The graph shows the closing price (in dollars) of a stock at the start of each month in 2026, where ${$m("x = 0")} is January, ${$m("x = 1")} is February, and so on.`),
    figure: svg,
    parts: [
      P.num(`Average rate of change on ${$m(`[${a}, ${b}]`)} (dollars per month)`, Vab),
      P.mcFixed(`On which interval is the average rate of change greatest?`, ivs.map(([p1, p2]) => $m(`[${p1}, ${p2}]`)), best),
    ],
    hint: "Read the heights at the ×'s at each endpoint, then compute rise over run.",
    solution:
      $M(`\\frac{f(${b}) - f(${a})}{${b} - ${a}} = \\frac{${pts[b][1]} - ${pts[a][1]}}{${b - a}} = ${Vab.tex()}\\ \\text{dollars per month}`) +
      para(`Between ${months[a]} and ${months[b]} the price changed by ${Vab.tex().includes("frac") ? $m(Vab.tex()) : Vab.tex()} dollars per month on average — the slope of the secant line joining those two points.`) +
      para(`Greatest-rate check: ${ivs.map(([p1, p2], i) => `${$m(`[${p1},${p2}]`)}: ${$m(arcs[i].tex())}`).join(", ")} → ${$m(`[${ivs[best][0]}, ${ivs[best][1]}]`)}.`),
  };
};

GEN.dq = () => {
  const v = R.pick(["Q", "Q", "Q", "R", "R", "C"]);
  const hs = v === "R" ? [1, 0.5, 0.05] : [1, 0.1, 0.01];
  let ftex, expr, fn, disp, steps, x0, at, extra = {}, lim;
  if (v === "Q") {
    const a = R.pick([1, -1, 2, -2, 3]), b = R.int(-6, 6), c = R.int(-5, 5);
    ftex = T.poly([a, b, c]); x0 = R.int(-3, 3);
    fn = (e) => 2 * a * e.x + a * e.h + b;
    disp = sumTex([[2 * a, "x"], [a, "h"], [b, ""]]);
    at = (h) => q(2 * a * x0 + b).add(q(h).mul(a));
    lim = q(2 * a * x0 + b);
    extra = { simplifyH: true };
    steps =
      $M(`f(x + h) = ${sumTex([[a, "(x + h)^2"], [b, "(x + h)"], [c, ""]])} = ${sumTex([[a, "x^2"], [2 * a, "xh"], [a, "h^2"], [b, "x"], [b, "h"], [c, ""]])}`) +
      $M(`f(x + h) - f(x) = ${sumTex([[2 * a, "xh"], [a, "h^2"], [b, "h"]])}`) +
      $M(`\\frac{f(x + h) - f(x)}{h} = \\frac{h\\left(${disp}\\right)}{h} = ${disp}`);
  } else if (v === "R") {
    const k = R.pick([1, 2, 3, 4, -2]);
    ftex = `\\frac{${k}}{x}`; x0 = R.pick([1, 2]);
    fn = (e) => -k / (e.x * (e.x + e.h));
    disp = `\\frac{${-k}}{x(x + h)}`;
    at = (h) => q(-k).div(q(x0).mul(q(x0).add(q(h))));
    lim = q(-k, x0 * x0);
    extra = { avoid: (e) => Math.abs(e.x) < 0.3 || Math.abs(e.x + e.h) < 0.3 };
    steps =
      $M(`\\frac{f(x + h) - f(x)}{h} = \\frac{\\frac{${k}}{x + h} - \\frac{${k}}{x}}{h} = \\frac{\\frac{${k}x - ${k}(x + h)}{x(x + h)}}{h}`) +
      $M(`= \\frac{${-k}h}{x(x + h)} \\cdot \\frac{1}{h} = ${disp}`);
  } else {
    const b = R.int(-5, 5);
    ftex = T.poly([1, 0, b, 0]); x0 = R.pick([1, -1, 2]);
    fn = (e) => 3 * e.x * e.x + 3 * e.x * e.h + e.h * e.h + b;
    disp = sumTex([[3, "x^2"], [3, "xh"], [1, "h^2"], [b, ""]]);
    at = (h) => { const H = q(h); return q(3 * x0 * x0 + b).add(H.mul(3 * x0)).add(H.mul(H)); };
    lim = q(3 * x0 * x0 + b);
    extra = { simplifyH: true };
    steps =
      $M(`f(x + h) = (x + h)^3 ${b ? T.sgn(b).replace(/ (\d+)$/, " $1") + "(x + h)" : ""} = x^3 + 3x^2h + 3xh^2 + h^3 ${b ? `${b < 0 ? "-" : "+"} ${Math.abs(b)}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}h` : ""}`) +
      $M(`\\frac{f(x + h) - f(x)}{h} = \\frac{3x^2h + 3xh^2 + h^3 ${b ? `${b < 0 ? "-" : "+"} ${Math.abs(b)}h` : ""}}{h} = ${disp}`);
  }
  const table = hs.map((h) => [x0, h, at(h)]);
  return {
    prompt: para(`Let ${$m(`f(x) = ${ftex}`)}. Find and simplify the difference quotient ${$m("\\frac{f(x + h) - f(x)}{h}")}, then use it to fill in the table.`),
    parts: [
      P.expr(`Simplified difference quotient (in terms of ${$m("x")} and ${$m("h")})`, fn, disp, { vars: ["x", "h"], ...extra }),
      ...table.map(([x, h, val]) => P.num(`${$m(`x = ${x},\\ h = ${fmtDec(h, 2)}`)}`, val)),
      P.num(`As ${$m("h \\to 0")}, what value do these approach?`, lim),
    ],
    hint: "Expand f(x + h) carefully (every x becomes (x + h)), subtract f(x), then factor h out of the top and cancel.",
    solution: steps + para(`Now substitute:`) + table.map(([x, h, val]) => $M(`x = ${x},\\ h = ${fmtDec(h, 2)}: \\quad ${val.tex()}${val.isInt() ? "" : ` = ${fmtDec(val.val(), 4)}`}`)).join("") +
      para(`Letting ${$m("h \\to 0")} leaves ${$m(lim.tex())}: the instantaneous rate of change (slope of the tangent line) at ${$m(`x = ${x0}`)}. That's exactly what section 1.4 formalizes.`),
  };
};
