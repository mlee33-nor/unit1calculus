// ================= variety: table-limit families, shrinking-interval families, no-repeat guard =================
const kx = (k) => (k === 1 ? "x" : k === -1 ? "-x" : `${k}x`);
const TABLE_FAMILIES = [
  () => { const r = R.nz(-6, 6); return { a: r, tex: `\\frac{x^2 - ${r * r}}{${T.fac(r).slice(1, -1)}}`, fn: (x) => (x * x - r * r) / (x - r), L: q(2 * r), why: `\\frac{${T.fac(r)}${T.fac(-r)}}{${T.fac(r)}} = ${T.fac(-r).slice(1, -1)} \\to ${2 * r}` }; },
  () => { const r = R.nz(-5, 5); let s; do { s = R.nz(-6, 6); } while (s === r); return { a: r, tex: `\\frac{${T.poly([1, -(r + s), r * s])}}{${T.fac(r).slice(1, -1)}}`, fn: (x) => (x * x - (r + s) * x + r * s) / (x - r), L: q(r - s), why: `\\frac{${T.fac(r)}${T.fac(s)}}{${T.fac(r)}} = ${T.fac(s).slice(1, -1)} \\to ${r - s}` }; },
  () => { const r = R.nz(-4, 4), p = R.pick([2, 3, -1, -2]), t = R.nz(-5, 5), co = [p, t - p * r, -t * r]; return { a: r, tex: `\\frac{${T.poly(co)}}{${T.fac(r).slice(1, -1)}}`, fn: (x) => (co[0] * x * x + co[1] * x + co[2]) / (x - r), L: q(p * r + t), why: `\\frac{${T.fac(r)}${T.lin(p, t)}}{${T.fac(r)}} = ${T.poly([p, t])} \\to ${p * r + t}` }; },
  () => { const r = R.int(1, 5); return { a: r * r, tex: `\\frac{\\sqrt{x} - ${r}}{x - ${r * r}}`, fn: (x) => (Math.sqrt(x) - r) / (x - r * r), L: q(1, 2 * r), why: `\\frac{\\sqrt{x} - ${r}}{(\\sqrt{x} - ${r})(\\sqrt{x} + ${r})} = \\frac{1}{\\sqrt{x} + ${r}} \\to \\frac{1}{${2 * r}}` }; },
  () => { const r = R.int(1, 5); return { a: r * r, tex: `\\frac{x - ${r * r}}{\\sqrt{x} - ${r}}`, fn: (x) => (x - r * r) / (Math.sqrt(x) - r), L: q(2 * r), why: `\\frac{(\\sqrt{x} - ${r})(\\sqrt{x} + ${r})}{\\sqrt{x} - ${r}} = \\sqrt{x} + ${r} \\to ${2 * r}` }; },
  () => { const r = R.pick([1, 2, 3, -1, -2]); return { a: r, tex: `\\frac{x^3 ${r ** 3 < 0 ? "+" : "-"} ${Math.abs(r ** 3)}}{${T.fac(r).slice(1, -1)}}`, fn: (x) => (x ** 3 - r ** 3) / (x - r), L: q(3 * r * r), why: `\\frac{${T.fac(r)}(${T.poly([1, r, r * r])})}{${T.fac(r)}} = ${T.poly([1, r, r * r])} \\to ${3 * r * r}` }; },
  () => { const k = R.pick([1, 2, 3, 4, -1, -2]); return { a: 0, tex: `\\frac{e^{${kx(k)}} - 1}{x}`, fn: (x) => (Math.exp(k * x) - 1) / x, L: q(k), approx: 0.011, why: `\\text{no algebra trick here: the table values settle at } ${k}` }; },
  () => { const b = R.pick([2, 3, 5, 10]); return { a: 0, tex: `\\frac{${b}^{x} - 1}{x}`, fn: (x) => (Math.pow(b, x) - 1) / x, L: Math.log(b), approx: 0.011, why: `\\text{the values settle at } \\ln ${b} \\approx ${fmtDec(Math.log(b), 4)}` }; },
  () => { const r = R.pick([1, 2, 3, 4, -1, -2]); return { a: r, tex: `\\frac{\\frac{1}{x} - \\frac{1}{${r}}}{${T.fac(r).slice(1, -1)}}`, fn: (x) => (1 / x - 1 / r) / (x - r), L: q(-1, r * r), why: `\\frac{\\frac{${r} - x}{${r}x}}{x - ${T.par(r)}} = \\frac{-1}{${r}x} \\to ${q(-1, r * r).tex()}` }; },
  () => { const k = R.pick([1, 4, 9, 16, 25]), s = Math.sqrt(k); return { a: 0, tex: `\\frac{\\sqrt{x + ${k}} - ${s}}{x}`, fn: (x) => (Math.sqrt(x + k) - s) / x, L: q(1, 2 * s), why: `\\text{multiply by the conjugate: } \\frac{1}{\\sqrt{x + ${k}} + ${s}} \\to \\frac{1}{${2 * s}}` }; },
  () => { const r = R.nz(-4, 4); let t; do { t = R.nz(-5, 5); } while (t === r || t === -r); return { a: r, tex: `\\frac{x^2 - ${r * r}}{${T.poly([1, -(r + t), r * t])}}`, fn: (x) => (x * x - r * r) / (x * x - (r + t) * x + r * t), L: q(2 * r, r - t), why: `\\frac{${T.fac(r)}${T.fac(-r)}}{${T.fac(r)}${T.fac(t)}} = \\frac{${T.fac(-r).slice(1, -1)}}{${T.fac(t).slice(1, -1)}} \\to ${q(2 * r, r - t).tex()}` }; },
  () => { const c = R.nz(-5, 5); return { a: 0, tex: `\\frac{(${c} + x)^2 - ${c * c}}{x}`, fn: (x) => ((c + x) ** 2 - c * c) / x, L: q(2 * c), why: `\\frac{${2 * c}x + x^2}{x} = ${2 * c} + x \\to ${2 * c}` }; },
  () => { const r = R.nz(-4, 4), inner = T.fac(r).slice(1, -1); return { a: r, tex: `\\frac{\\left|${inner}\\right|}{${inner}}`, fn: (x) => Math.abs(x - r) / (x - r), L: "DNE", left: q(-1), right: q(1), why: `\\text{left of } ${r}: \\frac{-(${inner})}{${inner}} = -1; \\quad \\text{right of } ${r}: \\frac{${inner}}{${inner}} = 1` }; },
  () => { const r = R.nz(-4, 4), k = R.pick([1, 2, 3]); return R.chance(0.5)
    ? { a: r, big: true, tex: `\\frac{${k}}{${T.fac(r)}^2}`, fn: (x) => k / (x - r) ** 2, L: Infinity, left: Infinity, right: Infinity, why: `\\text{the bottom is a tiny positive number on both sides, so the outputs grow without bound}` }
    : { a: r, big: true, tex: `\\frac{${k}}{${T.fac(r).slice(1, -1)}}`, fn: (x) => k / (x - r), L: "DNE", left: -Infinity, right: Infinity, why: `\\text{left side: tiny negative bottom} \\to -\\infty; \\text{ right side: tiny positive bottom} \\to \\infty` }; },
  () => { const co = [R.nz(-3, 3), R.int(-6, 6), R.int(-8, 8)], a = R.int(-3, 3), v = evalPoly(co, a); return { a, noHole: true, tex: T.poly(co), fn: (x) => co[0] * x * x + co[1] * x + co[2], L: v, why: `\\text{a polynomial, so the limit is just } f(${a}) = ${v.tex()}` }; },
];
function tableXs(fam) {
  const offs = fam.big ? [0.1, 0.01, 0.001] : R.pick([[0.1, 0.01, 0.001], [0.5, 0.1, 0.01], [0.01, 0.001, 0.0001]]);
  return [-offs[0], -offs[1], -offs[2], offs[2], offs[1], offs[0]].map((d) => +(fam.a + d).toFixed(4));
}
const tableHead = (fam, xs) => xs.slice(0, 3).map((x) => `<td>${fmtDec(x, 4)}</td>`).join("") + `<td class="qmark">${fam.a}</td>` + xs.slice(3).map((x) => `<td>${fmtDec(x, 4)}</td>`).join("");
const tableReading = (fam) => {
  const left = fam.left ?? fam.L, right = fam.right ?? fam.L;
  return para(`Reading the left three columns, the outputs head toward ${$m(T.ans(left))}; the right three head toward ${$m(T.ans(right))}.`) +
    para(fam.L === "DNE" ? "The two sides disagree (or run off in opposite directions), so the two-sided limit does not exist." : `Both sides agree, so the limit is ${$m(T.ans(fam.L))}.`);
};

GEN.numTable = () => {
  const fam = R.pick(TABLE_FAMILIES)(), xs = tableXs(fam), a = fam.a;
  const left = fam.left ?? fam.L, right = fam.right ?? fam.L, tol = { approx: 0.011 };
  const vals = xs.slice(0, 3).map((x) => `<td>${fmtDec(fam.fn(x), 6)}</td>`).join("") + `<td class="qmark">?</td>` + xs.slice(3).map((x) => `<td>${fmtDec(fam.fn(x), 6)}</td>`).join("");
  const table = `<div class="tbl-wrap"><table class="vt"><tr><th>${$m("x")}</th>${tableHead(fam, xs)}</tr><tr><th>${$m("f(x)")}</th>${vals}</tr></table></div>`;
  return {
    prompt: para(`Let ${$m(`f(x) = ${fam.tex}`)}. Use the table to see what the outputs do as ${$m("x")} approaches ${$m(a)}.`) + table,
    parts: [
      P.mc(`Can you find ${$m(`${T.lim(a)} f(x)`)} just by plugging in ${$m(`x = ${a}`)}?`, [
        `Yes — ${$m(`f(${a})`)} is defined, so substitute`,
        `No — ${$m(`x = ${a}`)} makes a denominator 0, so ${$m(`f(${a})`)} is undefined`,
      ], fam.noHole ? 0 : 1),
      P.num(`As ${$m(`x \\to ${a}^-`)}, ${$m("f(x)")} approaches…`, left, tol),
      P.num(`As ${$m(`x \\to ${a}^+`)}, ${$m("f(x)")} approaches…`, right, tol),
      P.num($m(`${T.lim(a)} f(x) =`), fam.L, { ...tol, dneOk: true }),
    ],
    hint: "Left three columns → left-hand limit. Right three → right-hand limit. Same value on both sides → that's the limit. Opposite directions or different values → DNE.",
    solution: tableReading(fam) + $M(`${T.lim(a)} ${fam.tex} = ${T.ans(fam.L)}`) + para(`Why: ${$m(fam.why)}`),
  };
};

if (typeof PGEN !== "undefined") {
  PGEN.limTable = () => {
    const fam = R.pick(TABLE_FAMILIES)(), xs = tableXs(fam), a = fam.a;
    const blanks = xs.slice(0, 3).map((_, i) => `<td>(${"abc"[i]})</td>`).join("") + `<td class="qmark">?</td>` + xs.slice(3).map((_, i) => `<td>(${"def"[i]})</td>`).join("");
    const table = `<div class="tbl-wrap"><table class="vt"><tr><th>${$m("x")}</th>${tableHead(fam, xs)}</tr><tr><th>${$m("f(x)")}</th>${blanks}</tr></table></div>`;
    const exactOk = fam.L === "DNE" || fam.L === Infinity || (fam.L instanceof Q && fam.L.isInt());
    return {
      prompt: para(`Complete the table and use the result to find the indicated limit.`) + $M(`f(x) = ${fam.tex}, \\qquad ${T.lim(a)} f(x)`) + table,
      parts: [
        ...xs.map((x) => { const v = fam.fn(x); return PP.num($m(`f(${fmtDec(x, 4)})`), v, { approx: Math.max(0.00051, Math.abs(v) * 1e-7), instr: INSTR.round4 }); }),
        PP.cf($m(`${T.lim(a)} f(x)`), fam.L, LIM_DNE, exactOk ? {} : { approx: 0.0051, instr: INSTR.round4 }),
      ],
      hint: "Evaluate f at each x with a calculator and round to four decimal places. Then decide what both sides approach.",
      solution: para(`Values: ${xs.map((x) => $m(`f(${fmtDec(x, 4)}) \\approx ${fmtDec(fam.fn(x), 4)}`)).join(", ")}.`) + tableReading(fam) + para(`Why: ${$m(fam.why)}`),
    };
  };
}

GEN.arcShrink = () => {
  const fams = [
    () => { const k = R.pick([1, 2, 3, 4, 6, -2]), a = R.pick([1, 2, 3]); return { tex: `\\frac{${k}}{x}`, a, f: (x) => q(k).div(x), d: q(-k, a * a), dWhy: `-\\frac{${k}}{x^2}` }; },
    () => { const c = R.pick([q(1), q(2), q(-1), q(1, 2), q(3)]), dd = R.int(-4, 6), a = R.pick([1, 2, 3, -1, -2]); return { tex: T.poly([c, 0, dd]), a, f: (x) => c.mul(Q.of(x).mul(x)).add(dd), d: c.mul(2 * a), dWhy: T.poly([c.mul(2), 0]) }; },
    () => { const a = R.pick([1, -1, 2]); return { tex: "x^3", a, f: (x) => Q.of(x).pow(3), d: q(3 * a * a), dWhy: "3x^2" }; },
    () => { const r = R.int(1, 4); return { tex: "\\sqrt{x}", a: r * r, fnum: (x) => Math.sqrt(x), d: q(1, 2 * r), dWhy: "\\frac{1}{2\\sqrt{x}}" }; },
  ];
  const F = R.pick(fams)();
  const deltas = R.pick([[3, 1, 0.5, 0.05], [2, 1, 0.1, 0.01], [1, 0.5, 0.1, 0.001]]);
  const arcs = deltas.map((dl) => (F.f ? F.f(q(F.a).add(q(dl))).sub(F.f(F.a)).div(q(dl)) : (F.fnum(F.a + dl) - F.fnum(F.a)) / dl));
  const L = F.d, seen = new Set(), choices = [];
  [L, L.neg(), L.mul(2), L.add(1), L.sub(1)].forEach((c) => { if (!seen.has(c.txt())) { seen.add(c.txt()); choices.push(c); } });
  const show = (v) => (v instanceof Q ? `${v.tex()}${v.isInt() ? "" : ` \\approx ${fmtDec(v.val(), 4)}`}` : `\\approx ${fmtDec(v, 4)}`);
  return {
    prompt: para(`Let ${$m(`f(x) = ${F.tex}`)}. Calculate the average rate of change of ${$m("f")} over each interval. (Rounded answers to 2+ decimal places are fine.)`),
    parts: [
      ...deltas.map((dl, i) => P.num($m(`[${F.a},\\ ${fmtDec(F.a + dl, 4)}]`), arcs[i], { approx: 0.0051 })),
      P.mc(`As the interval shrinks toward ${$m(`x = ${F.a}`)}, these values approach…`, choices.slice(0, 4).map((c) => $m(c.tex())), 0),
    ],
    hint: `ARC on [a, b] = (f(b) − f(a)) / (b − a). Start with f(${F.a}).`,
    solution: deltas.map((dl, i) => $M(`[${F.a},\\ ${fmtDec(F.a + dl, 4)}]:\\quad \\frac{f(${fmtDec(F.a + dl, 4)}) - f(${F.a})}{${fmtDec(dl, 4)}} ${show(arcs[i]).startsWith("\\approx") ? "" : "="} ${show(arcs[i])}`)).join("") +
      para(`Each value is the slope of a secant line through ${$m(`(${F.a}, f(${F.a}))`)}. As the interval shrinks they approach the slope of the <b>tangent line</b>: ${$m(`f'(x) = ${F.dWhy}`)}, so ${$m(`f'(${F.a}) = ${L.tex()}`)}.`),
  };
};

// Don't repeat any of the last few questions for a topic in practice
const recentPrompts = {};
function freshProblem(make, id) {
  const sig = (p) => (p.prompt + (p.figure || "")).replace(/clip\d+/g, "");
  const seen = recentPrompts[id] || (recentPrompts[id] = []);
  let pr;
  for (let i = 0; i < 10; i++) { pr = make(id); if (!seen.includes(sig(pr))) break; }
  seen.push(sig(pr));
  if (seen.length > 6) seen.shift();
  return pr;
}
