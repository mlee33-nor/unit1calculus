// ================= Section 1.4 — The limit definition of the derivative =================
const LH = `\\lim_{h \\to 0}`;
const noH = [{ v: "h", msg: "Your answer still contains h — take the limit as h → 0 (let h become 0 after cancelling)." }];

function derivSteps(kind, d) {
  if (kind === "quad") {
    const { a, b, c } = d;
    return $M(`f'(x) = ${LH} \\frac{f(x + h) - f(x)}{h} = ${LH} \\frac{\\left[${sumTex([[a, "(x + h)^2"], [b, "(x + h)"], [c, ""]])}\\right] - \\left(${T.poly([a, b, c])}\\right)}{h}`) +
      $M(`= ${LH} \\frac{${sumTex([[a, "x^2"], [2 * a, "xh"], [a, "h^2"], [b, "x"], [b, "h"], [c, ""]])} ${sumTex([[-a, "x^2"], [-b, "x"], [-c, ""]]).replace(/^(?!-)/, "+ ").replace(/^-/, "- ")}}{h}`) +
      $M(`= ${LH} \\frac{${sumTex([[2 * a, "xh"], [a, "h^2"], [b, "h"]])}}{h} = ${LH} \\frac{h\\left(${sumTex([[2 * a, "x"], [a, "h"], [b, ""]])}\\right)}{h}`) +
      $M(`= ${LH} \\left(${sumTex([[2 * a, "x"], [a, "h"], [b, ""]])}\\right) = ${sumTex([[2 * a, "x"], [b, ""]])}`);
  }
  if (kind === "recip") {
    const { k } = d;
    return $M(`f'(x) = ${LH} \\frac{\\frac{${k}}{x + h} - \\frac{${k}}{x}}{h} = ${LH} \\frac{\\frac{${k}x - ${k}(x + h)}{x(x + h)}}{h}`) +
      $M(`= ${LH} \\frac{${-k}h}{x(x + h)} \\cdot \\frac{1}{h} = ${LH} \\frac{${-k}}{x(x + h)} = \\frac{${-k}}{x^2}`);
  }
  if (kind === "sqrt") {
    return $M(`f'(x) = ${LH} \\frac{\\sqrt{x + h} - \\sqrt{x}}{h} \\cdot \\frac{\\sqrt{x + h} + \\sqrt{x}}{\\sqrt{x + h} + \\sqrt{x}} = ${LH} \\frac{(x + h) - x}{h\\left(\\sqrt{x + h} + \\sqrt{x}\\right)}`) +
      $M(`= ${LH} \\frac{1}{\\sqrt{x + h} + \\sqrt{x}} = \\frac{1}{2\\sqrt{x}}`);
  }
  const { b } = d;
  const bx = b ? ` ${b < 0 ? "-" : "+"} ${Math.abs(b)}` : "";
  return $M(`f'(x) = ${LH} \\frac{\\left[(x + h)^3${b ? `${bx}(x + h)` : ""}\\right] - \\left(${T.poly([1, 0, b, 0])}\\right)}{h}`) +
    $M(`= ${LH} \\frac{3x^2h + 3xh^2 + h^3${b ? `${bx}h` : ""}}{h} = ${LH} \\left(3x^2 + 3xh + h^2${bx}\\right) = ${T.poly([3, 0, b])}`);
}

function randFn(kinds) {
  const kind = R.pick(kinds);
  if (kind === "quad") { const a = R.pick([1, -1, 2, -2, 3]), b = R.int(-6, 6), c = R.int(-6, 6); return { kind, d: { a, b, c }, tex: T.poly([a, b, c]), f: (x) => evalPoly([a, b, c], x), fp: (x) => q(2 * a).mul(x).add(b), fpFn: (e) => 2 * a * e.x + b, fpTex: T.poly([2 * a, b]), extra: {} }; }
  if (kind === "recip") { const k = R.pick([1, 2, 3, 4, 6, -2, -4]); return { kind, d: { k }, tex: `\\frac{${k}}{x}`, f: (x) => q(k).div(x), fp: (x) => q(-k).div(Q.of(x).mul(x)), fpFn: (e) => -k / (e.x * e.x), fpTex: `\\frac{${-k}}{x^2}`, extra: { avoid: (e) => Math.abs(e.x) < 0.3 } }; }
  if (kind === "sqrt") return { kind, d: {}, tex: `\\sqrt{x}`, f: null, fp: null, fpFn: (e) => 1 / (2 * Math.sqrt(e.x)), fpTex: `\\frac{1}{2\\sqrt{x}}`, extra: { positive: true } };
  const b = R.int(-5, 5); return { kind: "cubic", d: { b }, tex: T.poly([1, 0, b, 0]), f: (x) => evalPoly([1, 0, b, 0], x), fp: (x) => q(3).mul(Q.of(x).mul(x)).add(b), fpFn: (e) => 3 * e.x * e.x + b, fpTex: T.poly([3, 0, b]), extra: {} };
}

GEN.deriv = () => {
  const F = randFn(["quad", "quad", "quad", "recip", "sqrt", "cubic"]);
  let p;
  if (F.kind === "sqrt") p = R.pick([1, 4, 9, 16, 25]);
  else if (F.kind === "recip") p = R.pick([1, 2, -2, 3]);
  else do { p = R.nz(-3, 4); } while (F.f(p).eq(F.fp(p)));
  const fpP = F.kind === "sqrt" ? q(1, 2 * Math.sqrt(p)) : F.fp(p);
  const r = F.kind === "sqrt" ? R.pick([1, 4, 9, 16].filter((z) => z !== p)) : p === 2 ? -1 : 2;
  const fpR = F.kind === "sqrt" ? q(1, 2 * Math.sqrt(r)) : F.fp(r);
  const V = fpP.tex();
  return {
    prompt: para(`Let ${$m(`f(x) = ${F.tex}`)}. Use the <b>limit definition</b> ${$m(`f'(x) = ${LH} \\frac{f(x + h) - f(x)}{h}`)} to find ${$m("f'(x)")}.`),
    parts: [
      P.expr($m("f'(x) ="), F.fpFn, F.fpTex, { vars: ["x"], forbid: noH, ...F.extra }),
      P.num($m(`f'(${p}) =`), fpP),
      P.num(`Slope of the tangent line to ${$m("f")} at ${$m(`x = ${r}`)}`, fpR),
      P.mc(`What does ${$m(`f'(${p}) = ${V}`)} mean?`, [
        `The instantaneous rate of change of ${$m("f")} at ${$m(`x = ${p}`)} is ${$m(V)} — the slope of the tangent line there.`,
        `The value of ${$m("f")} at ${$m(`x = ${p}`)} is ${$m(V)}.`,
        `The average rate of change of ${$m("f")} from ${$m(`x = 0`)} to ${$m(`x = ${p}`)} is ${$m(V)}.`,
        `The slope of the secant line from ${$m(`x = ${p}`)} to ${$m(`x = ${p} + 1`)} is ${$m(V)}.`,
      ], 0),
    ],
    hint: "Write f(x + h) by replacing every x with (x + h). After subtracting f(x), every surviving term on top has an h — factor it out and cancel.",
    solution: derivSteps(F.kind, F.d) +
      para(`Then ${$m(`f'(${p}) = ${V}`)} and the slope of the tangent at ${$m(`x = ${r}`)} is ${$m(`f'(${r}) = ${fpR.tex()}`)}.`) +
      para(`${$m(`f'(${p})`)} is the <i>instantaneous</i> rate of change at one input — the slope of the tangent line, not the height of the graph and not an average over an interval.`),
  };
};

GEN.tangent = () => {
  const v = R.pick(["P", "P", "X", "K", "S", "V", "I"]);
  const lineSol = (m, x0, y0) => {
    const b = Q.of(y0).sub(Q.of(m).mul(x0));
    return $M(`${T.pointSlope(m, x0, y0)} \\;\\Rightarrow\\; ${T.line(Q.of(m), b)}`);
  };
  if (v === "P" || v === "X") {
    const F = randFn(["quad", "quad", "cubic"]); const x0 = R.int(-3, 3), y0 = F.f(x0), m = F.fp(x0), b = y0.sub(m.mul(x0));
    const given = v === "P" ? `at the point ${$m(`(${x0}, ${y0.tex()})`)}` : `at ${$m(`x = ${x0}`)}`;
    const parts = v === "P"
      ? [P.expr($m("f'(x) ="), F.fpFn, F.fpTex, { forbid: noH }), P.num(`Slope at ${$m(`x = ${x0}`)}`, m), P.line(`Tangent line`, m, b)]
      : [P.num($m(`f(${x0})`), y0), P.num($m(`f'(${x0})`), m), P.line(`Tangent line`, m, b)];
    return {
      prompt: para(`Let ${$m(`f(x) = ${F.tex}`)}. Find the equation of the tangent line to the graph of ${$m("f")} ${given}.`),
      parts,
      hint: v === "P" ? "You have the point. The slope is f'(x₀). Then use y − y₀ = m(x − x₀)." : "You only have x. Get the y-coordinate from f(x₀) and the slope from f'(x₀).",
      solution: derivSteps(F.kind, F.d) +
        para(`${v === "X" ? `Point: ${$m(`f(${x0}) = ${y0.tex()}`)}, so the point is ${$m(`(${x0}, ${y0.tex()})`)}. ` : ""}Slope: ${$m(`m = f'(${x0}) = ${m.tex()}`)}.`) + lineSol(m, x0, y0) +
        para(`Answers in point-slope form are accepted too.`),
    };
  }
  if (v === "K") {
    const k = R.pick([2, 4, 6, -4, -6, 8]); const divs = [1, 2, -1, -2].filter((z) => Math.abs(k) % Math.abs(z) === 0);
    const x0 = R.pick(divs), y0 = q(k, x0), m = q(-k, x0 * x0), b = y0.sub(m.mul(x0));
    return {
      prompt: para(`Let ${$m(`f(x) = \\frac{${k}}{x}`)}. Find the equation of the tangent line at ${$m(`(${x0}, ${y0.tex()})`)}.`),
      parts: [P.expr($m("f'(x) ="), (e) => -k / (e.x * e.x), `\\frac{${-k}}{x^2}`, { forbid: noH, avoid: (e) => Math.abs(e.x) < 0.3 }), P.num(`Slope`, m), P.line(`Tangent line`, m, b)],
      hint: "Combine the two fractions in the numerator over the common denominator x(x + h).",
      solution: derivSteps("recip", { k }) + para(`Slope: ${$m(`f'(${x0}) = \\frac{${-k}}{${T.par(x0)}^2} = ${m.tex()}`)}.`) + lineSol(m, x0, y0),
    };
  }
  if (v === "S") {
    const r = R.int(1, 5), x0 = r * r, m = q(1, 2 * r), b = q(r).sub(m.mul(x0));
    return {
      prompt: para(`Let ${$m("f(x) = \\sqrt{x}")}. Find the equation of the tangent line at ${$m(`(${x0}, ${r})`)}.`),
      parts: [P.num(`Slope`, m), P.line(`Tangent line`, m, b)],
      hint: "Multiply the difference quotient by the conjugate (√(x+h) + √x) over itself.",
      solution: derivSteps("sqrt", {}) + para(`Slope: ${$m(`f'(${x0}) = \\frac{1}{2\\sqrt{${x0}}} = ${m.tex()}`)}.`) + lineSol(m, x0, r),
    };
  }
  if (v === "V") {
    const a = R.int(-3, 4), y0 = R.int(-6, 8), m = R.nz(-5, 5), c = R.int(-2, 3), m2 = R.nz(-4, 5), b2 = R.int(-6, 6);
    return {
      prompt: para(`<b>(a)</b> Suppose ${$m(`f(${a}) = ${y0}`)} and ${$m(`f'(${a}) = ${m}`)}. Write the equation of the tangent line to ${$m("f")} at ${$m(`x = ${a}`)}.`) +
        para(`<b>(b)</b> The tangent line to the graph of ${$m("g")} at ${$m(`x = ${c}`)} is ${$m(T.line(q(m2), q(b2)))}. Find ${$m(`g(${c})`)} and ${$m(`g'(${c})`)}.`),
      parts: [P.line(`(a) Tangent line`, m, q(y0 - m * a)), P.num(`(b) ${$m(`g(${c})`)}`, q(m2 * c + b2)), P.num(`(b) ${$m(`g'(${c})`)}`, q(m2))],
      hint: "f(a) gives the point (a, f(a)); f'(a) gives the slope. A tangent line touches the curve, so it shares the point, and its slope IS the derivative.",
      solution: para(`<b>(a)</b> Point ${$m(`(${a}, ${y0})`)}, slope ${m}:`) + lineSol(q(m), a, y0) +
        para(`<b>(b)</b> The tangent line touches ${$m("g")} at ${$m(`x = ${c}`)}, so ${$m(`g(${c})`)} is the line's height there: ${$m(`${m2}${T.par(c)} ${b2 < 0 ? "-" : "+"} ${Math.abs(b2)} = ${m2 * c + b2}`)}. Its slope is the derivative: ${$m(`g'(${c}) = ${m2}`)}.`),
    };
  }
  // I: where is the slope a given value?
  const a = R.pick([1, -1, 2, -2]), b = R.int(-8, 8), c = R.int(-5, 5), s = R.nz(-6, 6);
  const xh = q(-b, 2 * a), yh = evalPoly([a, b, c], xh), xs = q(s - b, 2 * a);
  return {
    prompt: para(`Let ${$m(`f(x) = ${T.poly([a, b, c])}`)}, so ${$m(`f'(x) = ${T.poly([2 * a, b])}`)}.`),
    parts: [
      P.num(`At what ${$m("x")} is the tangent line horizontal?`, xh),
      P.num(`What is the ${$m("y")}-coordinate of that point?`, yh),
      P.num(`At what ${$m("x")} does the tangent line have slope ${$m(s)}?`, xs),
    ],
    hint: "Horizontal tangent ⇔ slope 0 ⇔ f'(x) = 0. Set f'(x) equal to the slope you want and solve.",
    solution: $M(`f'(x) = 0: \\quad ${T.poly([2 * a, b])} = 0 \\;\\Rightarrow\\; x = ${xh.tex()}`) + $M(`f\\left(${xh.tex()}\\right) = ${yh.tex()}`) +
      $M(`f'(x) = ${s}: \\quad ${T.poly([2 * a, b])} = ${s} \\;\\Rightarrow\\; x = \\frac{${s - b}}{${2 * a}} = ${xs.tex()}`),
  };
};

const INT_CTX = [
  { f: "D", desc: "the distance, in miles, a car has traveled after t hours", what: "the distance traveled", unit: "miles per hour", outU: "miles", inU: "hours", gen: () => [R.int(1, 4), R.int(20, 50), 0], ps: [1, 2, 3] },
  { f: "h", desc: "the height, in feet, of a rocket t seconds after launch", what: "the height of the rocket", unit: "feet per second", outU: "feet", inU: "seconds", gen: () => [-16, R.pick([96, 128, 160]), 0], ps: [1, 2, 4, 5] },
  { f: "T", desc: "the temperature, in °F, of an oven t minutes after it is turned on", what: "the oven's temperature", unit: "degrees Fahrenheit per minute", outU: "degrees Fahrenheit", inU: "minutes", gen: () => [-1, R.pick([30, 36, 40]), 70], ps: [5, 10, 12] },
  { f: "W", desc: "the number of gallons of water in a pool t hours after draining begins", what: "the amount of water", unit: "gallons per hour", outU: "gallons", inU: "hours", gen: () => [2, -R.pick([80, 100]), 1200], ps: [2, 5, 10] },
];

GEN.interp = () => {
  if (R.chance(0.3)) {
    const k = R.int(1, 6), p = R.nz(-3, 3), V = 2 * p;
    return {
      prompt: para(`Let ${$m(`f(x) = x^2 - ${k}`)}. Complete the limit definition, then interpret ${$m(`f'(${p})`)}.`) +
        $M(`${LH} \\frac{f(x + h) - f(x)}{h} = ${LH} \\frac{\\left((x + h)^2 - ${k}\\right) - \\left(x^2 - ${k}\\right)}{h} = \\;?`),
      parts: [
        P.expr($m("f'(x) ="), (e) => 2 * e.x, "2x", { forbid: noH }),
        P.num($m(`f'(${p})`), q(V)),
        P.mc(`What does ${$m(`f'(${p}) = ${V}`)} tell you?`, [
          `The slope of the tangent line to the graph of ${$m("f")} at ${$m(`x = ${p}`)} is ${V}.`,
          `The slope of the secant line from ${$m("x = 0")} to ${$m(`x = ${p}`)} is ${V}.`,
          `The point ${$m(`(${p}, ${V})`)} is on the graph of ${$m("f")}.`,
          `The graph of ${$m("f")} crosses the ${$m("y")}-axis at ${V}.`,
        ], 0),
      ],
      hint: "Expand (x + h)², distribute the minus sign, and watch the constants cancel.",
      solution: $M(`${LH} \\frac{x^2 + 2xh + h^2 - ${k} - x^2 + ${k}}{h} = ${LH} \\frac{h(2x + h)}{h} = ${LH} (2x + h) = 2x`) +
        para(`${$m(`f'(${p}) = 2${T.par(p)} = ${V}`)}. The graph of ${$m("f")} has an instantaneous rate of change of ${V} at ${$m(`x = ${p}`)}: the tangent line there has slope ${V}${V > 0 ? " (f is increasing)" : " (f is decreasing)"}.`),
    };
  }
  let ctx, co, p, V;
  do { ctx = R.pick(INT_CTX); co = ctx.gen(); p = R.pick(ctx.ps); V = 2 * co[0] * p + co[1]; } while (V === 0 || co[0] * p + co[1] === V);
  const up = V > 0, A = Math.abs(V), fx = T.poly(co, "t");
  return {
    prompt: para(`Let ${$m(`${ctx.f}(t) = ${fx}`)} be ${ctx.desc}.`),
    parts: [
      P.expr($m(`${ctx.f}'(t) =`), (e) => 2 * co[0] * e.t + co[1], T.poly([2 * co[0], co[1]], "t"), { vars: ["t"], forbid: noH }),
      P.num($m(`${ctx.f}'(${p})`), q(V)),
      P.mc(`Interpret ${$m(`${ctx.f}'(${p}) = ${V}`)}.`, [
        `At ${$m(`t = ${p}`)} ${ctx.inU}, ${ctx.what} is ${up ? "increasing" : "decreasing"} at a rate of ${A} ${ctx.unit}.`,
        `At ${$m(`t = ${p}`)} ${ctx.inU}, ${ctx.what} is ${up ? "decreasing" : "increasing"} at a rate of ${A} ${ctx.unit}.`,
        `At ${$m(`t = ${p}`)} ${ctx.inU}, ${ctx.what} is ${A} ${ctx.outU}.`,
        `Over the first ${p} ${ctx.inU}, ${ctx.what} changed at an average rate of ${A} ${ctx.unit}.`,
      ], 0),
    ],
    hint: "The derivative's units are (output units) per (input unit). Its sign says increasing (+) or decreasing (−).",
    solution: derivSteps("quad", { a: co[0], b: co[1], c: co[2] }).replace(/f'\(x\)/g, `${ctx.f}'(t)`).replace(/x/g, "t") +
      $M(`${ctx.f}'(${p}) = ${2 * co[0]}${T.par(p)} ${co[1] < 0 ? "-" : "+"} ${Math.abs(co[1])} = ${V}`) +
      para(`Positive/negative tells the direction, and the units are ${ctx.outU} per ${ctx.inU.replace(/s$/, "")}: at that instant ${ctx.what} is ${up ? "increasing" : "decreasing"} at ${A} ${ctx.unit}. (The value ${$m(`${ctx.f}(${p}) = ${evalPoly(co, p).tex()}`)} is a different quantity.)`),
  };
};

const DIFF_CHOICES = ["Continuous and differentiable", "Continuous but NOT differentiable", "Not continuous (so not differentiable)"];
GEN.diffGraph = () => {
  const G = Graph.randomPiecewise(R.pick([["corner", "jump", "cont", "hole"], ["corner", "asym", "cont", "hole"], ["corner", "jump", "hole", "cont"], ["corner", "corner", "jump", "cont"]]));
  return {
    prompt: para(`At each labeled ${$m("x")}-value, decide whether the graph of ${$m("f")} is continuous there and whether it is differentiable there.`),
    figure: G.svg,
    parts: G.inner.map((n) => P.mcFixed(`At ${$m(`x = ${n.x}`)}`, DIFF_CHOICES, n.differentiable ? 0 : n.continuous ? 1 : 2)),
    hint: "A function is NOT differentiable at corners, at discontinuities (holes, jumps, asymptotes), and at vertical tangents. Differentiable ⇒ continuous.",
    solution: G.inner.map((n) => para(`<b>${$m(`x = ${n.x}`)}:</b> ${
      n.differentiable ? "Smooth and unbroken — a single tangent line fits → continuous and differentiable."
        : n.corner ? "No break, but the curve comes to a sharp point (corner): the slopes from the left and right disagree → continuous, not differentiable."
          : n.type === "infinite" ? "Vertical asymptote → not continuous, so not differentiable."
            : n.type === "jump" ? "The graph jumps → not continuous, so not differentiable."
              : "There's a hole (the dot isn't on the curve) → not continuous, so not differentiable."}`)).join(""),
  };
};

GEN.rateGraph = () => {
  if (R.chance(0.55)) {
    const L = R.pick([200, 250, 300]), ti = R.int(4, 6), k = R.pick([0.7, 0.8, 0.9]), A = Math.exp(k * ti);
    const h = (t) => L / (1 + A * Math.exp(-k * t)), hp = (t) => k * h(t) * (1 - h(t) / L);
    const ymax = Math.ceil((L * 1.15) / 50) * 50;
    const svg = Graph.fnPlot({ fn: h, xmin: 0, xmax: 13, ymin: 0, ymax, gy: 25, ly: 50, edgeLabels: true, xName: "t (weeks)", yName: "h (cm)" });
    const clear = (u, w) => Math.max(u, w) / Math.max(1e-9, Math.min(u, w)) > 1.35;
    const stm = [];
    { const s = R.chance(0.5) ? ti : ti + R.pick([-3, 3]); stm.push({ t: `The slopes of the tangent lines get steeper up to ${$m(`t = ${s}`)}, and then the slopes start to flatten out.`, v: s === ti, why: `The graph is steepest at about ${$m(`t = ${ti}`)} (where it changes from bending up to bending down).` }); }
    for (let i = 0; i < 20; i++) { const T2 = R.pick([10, 12]), t1 = R.int(ti - 1, ti + 1), arc = (h(T2) - h(0)) / T2, ins = hp(t1); if (clear(arc, ins)) { stm.push({ t: `The average rate of change over ${$m(`[0, ${T2}]`)} is greater than the instantaneous rate of change at ${$m(`t = ${t1}`)}.`, v: arc > ins, why: `ARC ${$m(`\\approx \\frac{${fmtDec(h(T2), 1)} - ${fmtDec(h(0), 1)}}{${T2}} \\approx ${fmtDec(arc, 1)}`)} cm/week; the tangent slope at ${$m(`t = ${t1}`)} is about ${fmtDec(ins, 1)} cm/week.` }); break; } }
    for (let i = 0; i < 40; i++) { const t1 = R.int(1, 12), t2 = R.int(1, 12); if (t1 !== t2 && clear(hp(t1), hp(t2))) { stm.push({ t: `The seedling grows faster (instantaneous rate) at week ${t1} than at week ${t2}.`, v: hp(t1) > hp(t2), why: `Tangent slopes: about ${fmtDec(hp(t1), 1)} cm/week at ${$m(`t = ${t1}`)} vs. ${fmtDec(hp(t2), 1)} at ${$m(`t = ${t2}`)}.` }); break; } }
    for (let i = 0; i < 40; i++) { const a = R.int(0, 10), b = R.int(0, 10), ra = (h(a + 2) - h(a)) / 2, rb = (h(b + 2) - h(b)) / 2; if (Math.abs(a - b) >= 3 && clear(ra, rb)) { stm.push({ t: `The average rate of change over ${$m(`[${a}, ${a + 2}]`)} is less than over ${$m(`[${b}, ${b + 2}]`)}.`, v: ra < rb, why: `${$m(`[${a},${a + 2}]`)}: ≈ ${fmtDec(ra, 1)} cm/week; ${$m(`[${b},${b + 2}]`)}: ≈ ${fmtDec(rb, 1)} cm/week.` }); break; } }
    return {
      prompt: para(`A sunflower seedling is planted and its height ${$m("h")} (in centimeters) after ${$m("t")} weeks is graphed below. Decide whether each statement is true or false.`),
      figure: svg,
      parts: stm.map((s) => P.tf(s.t, s.v)),
      hint: "Average rate = slope of the secant line between two points. Instantaneous rate = slope of the tangent line at one point. Compare steepness.",
      solution: stm.map((s, i) => para(`<b>${"abcd"[i]}. ${s.v ? "True" : "False"}.</b> ${s.why}`)).join(""),
    };
  }
  const T0 = R.pick([180, 190, 200]), kk = R.pick([0.1, 0.12, 0.15]);
  const Tf = (t) => 70 + (T0 - 70) * Math.exp(-kk * t), Tp = (t) => -kk * (T0 - 70) * Math.exp(-kk * t);
  const svg = Graph.fnPlot({ fn: Tf, xmin: 0, xmax: 30, ymin: 60, ymax: 210, gx: 5, lx: 5, gy: 10, ly: 30, edgeLabels: true, xName: "t (min)", yName: "T (°F)" });
  const t1 = R.int(1, 8), t2 = t1 + R.int(10, 18), arc = (Tf(10) - Tf(0)) / 10;
  const stm = [
    { t: `The coffee is cooling faster at ${$m(`t = ${t1}`)} minutes than at ${$m(`t = ${t2}`)} minutes.`, v: true, why: `The graph is steeper at ${$m(`t = ${t1}`)} (slope ≈ ${fmtDec(Tp(t1), 1)} °F/min) than at ${$m(`t = ${t2}`)} (≈ ${fmtDec(Tp(t2), 1)} °F/min).` },
    { t: `The average rate of change over ${$m("[0, 10]")} is positive.`, v: false, why: `The temperature drops from ${fmtDec(Tf(0), 0)} to about ${fmtDec(Tf(10), 1)}, so the ARC ≈ ${fmtDec(arc, 1)} °F/min — negative.` },
    { t: `The tangent lines get steeper as ${$m("t")} increases.`, v: false, why: `The curve levels off toward 70 °F, so the tangent lines flatten (slopes move toward 0).` },
    { t: `The instantaneous rate of change at ${$m("t = 25")} is closer to 0 than the average rate of change over ${$m("[0, 10]")}.`, v: Math.abs(Tp(25)) < Math.abs(arc), why: `${$m("T'(25)")} ≈ ${fmtDec(Tp(25), 2)} °F/min vs. ARC ≈ ${fmtDec(arc, 1)} °F/min.` },
  ];
  const order = R.shuffle(stm);
  return {
    prompt: para(`A cup of coffee is left on a counter. Its temperature ${$m("T")} (in °F) after ${$m("t")} minutes is graphed below. Decide whether each statement is true or false.`),
    figure: svg,
    parts: order.map((s) => P.tf(s.t, s.v)),
    hint: "A decreasing graph has negative rates. 'Cooling faster' means a steeper (more negative) slope.",
    solution: order.map((s, i) => para(`<b>${"abcd"[i]}. ${s.v ? "True" : "False"}.</b> ${s.why}`)).join(""),
  };
};
