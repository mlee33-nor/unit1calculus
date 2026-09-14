// ================= algebra warm-up (Pearson format), expanded concept bank, topic + skill registration =================

// ---------- algebra warm-up ----------
PGEN.algSigns = () => {
  const pool = [
    () => { const a = R.nz(-5, 5); return { t: `-x^2 \\text{ at } x = ${a}`, a: q(-a * a), s: `-(${a})^2 = -(${a * a}) = ${-a * a}` }; },
    () => { const k = R.int(2, 7); return R.chance(0.5)
      ? { t: `-${k}^2`, a: q(-k * k), s: `-${k}^2 = -(${k} \\cdot ${k}) = ${-k * k} \\quad \\text{(square first, then the negative)}` }
      : { t: `(-${k})^2`, a: q(k * k), s: `(-${k})^2 = (-${k})(-${k}) = ${k * k}` }; },
    () => {
      const co = [-R.pick([1, 2]), R.nz(-5, 5), R.int(2, 9)], a = R.nz(-3, 3), v = evalPoly(co, a);
      const sub = co.map((c, i) => ({ c, deg: 2 - i })).reverse().map((o, i) => {
        const neg = o.c < 0, abs = Math.abs(o.c), body = o.deg === 0 ? `${abs}` : `${abs === 1 ? "" : abs}(${a})${o.deg === 2 ? "^2" : ""}`;
        return (i === 0 ? (neg ? "-" : "") : neg ? " - " : " + ") + body;
      }).join("");
      return { t: `${T.poly(co, "x", true)} \\text{ at } x = ${a}`, a: v, s: `${sub} = ${v.tex()}` };
    },
    () => { const a = R.int(-9, 9), b = R.nz(-9, 9); return { t: `${a} - (${b})`, a: q(a - b), s: `${a} - (${b}) = ${a} ${b < 0 ? "+" : "-"} ${Math.abs(b)} = ${a - b}` }; },
    () => { const p = R.nz(-4, 4), r = R.nz(-6, 6), a = R.nz(-3, 3), inner = p * a + r; return { t: `-(${T.poly([p, r])}) \\text{ at } x = ${a}`, a: q(-inner), s: `-\\left(${p}(${a}) ${r < 0 ? "-" : "+"} ${Math.abs(r)}\\right) = -(${inner}) = ${-inner}` }; },
    () => { const u = R.int(-9, 9), v = R.nz(-9, 9), w = R.int(-5, 5); let z; do { z = R.int(-5, 5); } while (z === w); return { t: `\\frac{${u} - (${v})}{${w} - (${z})}`, a: q(u - v, w - z), s: `\\frac{${u} - (${v})}{${w} - (${z})} = \\frac{${u - v}}{${w - z}} = ${q(u - v, w - z).tex()}` }; },
  ];
  const items = R.sample(pool, 4).map((f) => f());
  return {
    prompt: para(`Evaluate or simplify. These sign slips are what cost points on limit and derivative problems.`),
    parts: items.map((it) => PP.num($m(`${it.t} =`), it.a)),
    hint: "Put every substituted number in parentheses. −3² means −(3²) = −9, but (−3)² = 9. Subtracting a negative is adding.",
    solution: items.map((it, i) => para(`<b>${"abcd"[i]}.</b> ${$m(it.s)}`)).join(""),
  };
};

PGEN.algExpand = () => {
  const a = R.pick([1, 2, 3, -1, -2]), b = R.int(-6, 6), c = R.int(-6, 6);
  const full = sumTex([[a, "x^2"], [2 * a, "xh"], [a, "h^2"], [b, "x"], [b, "h"], [c, ""]]);
  const pool = [
    () => ({ label: $m("(x + h)^2 ="), fn: (e) => (e.x + e.h) ** 2, display: "x^2 + 2xh + h^2", s: `(x + h)(x + h) = x^2 + xh + xh + h^2 = x^2 + 2xh + h^2` }),
    () => ({ label: $m("(x + h)^3 ="), fn: (e) => (e.x + e.h) ** 3, display: "x^3 + 3x^2h + 3xh^2 + h^3", s: `(x^2 + 2xh + h^2)(x + h) = x^3 + 3x^2h + 3xh^2 + h^3` }),
    () => ({ label: `If ${$m(`f(x) = ${T.poly([a, b, c])}`)}, then ${$m("f(x + h) =")}`, fn: (e) => a * (e.x + e.h) ** 2 + b * (e.x + e.h) + c, display: full, s: `${sumTex([[a, "(x + h)^2"], [b, "(x + h)"], [c, ""]])} = ${full}` }),
    () => { const d = sumTex([[2 * a, "xh"], [a, "h^2"], [b, "h"]]); return { label: `If ${$m(`f(x) = ${T.poly([a, b, c])}`)}, then ${$m("f(x + h) - f(x) =")}`, fn: (e) => a * (e.x + e.h) ** 2 + b * (e.x + e.h) - (a * e.x * e.x + b * e.x), display: d, s: `\\left[${full}\\right] - \\left(${T.poly([a, b, c])}\\right) = ${d}` }; },
    () => { const k = R.nz(-5, 5); return { label: $m(`(x ${k < 0 ? "-" : "+"} ${Math.abs(k)})^2 =`), fn: (e) => (e.x + k) ** 2, display: T.poly([1, 2 * k, k * k]), s: `x^2 + 2(${k})x + (${k})^2 = ${T.poly([1, 2 * k, k * k])}`, vars: ["x"] }; },
  ];
  const items = R.sample(pool, 2).map((f) => f());
  return {
    prompt: para(`Expand and simplify completely. Your answer should have no parentheses.`),
    parts: items.map((it) => PP.expr(it.label, it.fn, it.display, it.vars || ["x", "h"], { expanded: true, forbid: [] })),
    hint: "(x + h)² is (x + h)(x + h), not x² + h². Every x becomes (x + h), including the x in bx.",
    solution: items.map((it, i) => para(`<b>${"ab"[i]}.</b>`) + $M(it.s)).join(""),
  };
};

PGEN.algFactor = () => {
  const r = R.nz(-6, 6); let s; do { s = R.nz(-6, 6); } while (s === r);
  const blank = PP.num($m(`${T.poly([1, -(r + s), r * s])} = ${T.fac(r)}(x + \\square) \\quad \\square =`), q(-s));
  const pool = [
    () => { const k = R.int(2, 9); return { label: `Factor completely: ${$m(`x^2 - ${k * k}`)}`, fn: (e) => e.x * e.x - k * k, display: `(x - ${k})(x + ${k})`, s: `a^2 - b^2 = (a - b)(a + b) \\;\\Rightarrow\\; (x - ${k})(x + ${k})` }; },
    () => ({ label: `Factor completely: ${$m(T.poly([1, -(r + s), r * s]))}`, fn: (e) => (e.x - r) * (e.x - s), display: `${T.fac(r)}${T.fac(s)}`, s: `\\text{two numbers that multiply to } ${r * s} \\text{ and add to } ${-(r + s)}: ${-r}, ${-s} \\;\\Rightarrow\\; ${T.fac(r)}${T.fac(s)}` }),
    () => { const p = R.pick([2, 3]); let t; do { t = R.nz(-5, 5); } while (t % p === 0); const co = [p, t - p * r, -t * r]; return { label: `Factor completely: ${$m(T.poly(co))}`, fn: (e) => co[0] * e.x * e.x + co[1] * e.x + co[2], display: `${T.fac(r)}${T.lin(p, t)}`, s: `${T.fac(r)}${T.lin(p, t)} \\quad \\text{(expand to check: } ${T.poly(co)}\\text{)}` }; },
    () => { const aa = R.pick([1, 2, 3, -1]), bb = R.nz(-9, 9); return { label: `Factor completely: ${$m(T.poly([aa, bb, 0]))}`, fn: (e) => aa * e.x * e.x + bb * e.x, display: `x${T.lin(aa, bb)}`, s: `x \\text{ is in every term: } x${T.lin(aa, bb)}` }; },
  ];
  const items = R.sample(pool, 2).map((f) => f());
  return {
    prompt: para(`Factoring is how you cancel the 0/0 in a limit. Fill in the blank, then factor completely.`),
    parts: [blank, ...items.map((it) => PP.expr(it.label, it.fn, it.display, ["x"], { factored: true, forbid: [] }))],
    hint: "For x² + bx + c, find two numbers that multiply to c and add to b. For a² − b², use (a − b)(a + b).",
    solution: para(`<b>a.</b> ${$m(`${T.poly([1, -(r + s), r * s])} = ${T.fac(r)}${T.fac(s)}`)}, so the blank is ${$m(q(-s).tex())}.`) + items.map((it, i) => para(`<b>${"bc"[i]}.</b>`) + $M(it.s)).join(""),
  };
};

PGEN.algFractions = () => {
  const pool = [
    () => { const p = R.nz(-7, 7), a = R.int(2, 9), r = R.nz(-7, 7), b = R.int(2, 9), plus = R.chance(0.5), v = plus ? q(p, a).add(q(r, b)) : q(p, a).sub(q(r, b));
      return { kind: "num", label: $m(`\\frac{${p}}{${a}} ${plus ? "+" : "-"} \\frac{${r}}{${b}} =`), ans: v, s: `\\frac{${p * b} ${plus ? "+" : "-"} (${r * a})}{${a * b}} = ${v.tex()}` }; },
    () => { const g = R.int(2, 6), n = R.nz(-9, 9); let d; do { d = R.int(2, 9); } while (gcd(n, d) !== 1); return { kind: "num", label: $m(`\\frac{${n * g}}{${d * g}} =`), ans: q(n, d), s: `\\text{divide top and bottom by } ${g}: \\frac{${n}}{${d}}` }; },
    () => { const a = R.nz(-6, 6), b = R.int(2, 6), c = R.nz(-6, 6), d = R.int(2, 6); return { kind: "num", label: $m(`\\dfrac{\\frac{${a}}{${b}}}{\\frac{${c}}{${d}}} =`), ans: q(a * d, b * c), s: `\\frac{${a}}{${b}} \\cdot \\frac{${d}}{${c}} = ${q(a * d, b * c).tex()}` }; },
    () => ({ kind: "expr", label: `Combine into one fraction: ${$m("\\frac{1}{x + h} - \\frac{1}{x} =")}`, fn: (e) => -e.h / (e.x * (e.x + e.h)), display: "\\frac{-h}{x(x + h)}", vars: ["x", "h"], avoid: (e) => Math.abs(e.x) < 0.3 || Math.abs(e.x + e.h) < 0.3, s: `\\frac{x}{x(x + h)} - \\frac{x + h}{x(x + h)} = \\frac{x - (x + h)}{x(x + h)} = \\frac{-h}{x(x + h)}` }),
    () => { const a = R.nz(-6, 6), b = R.nz(-6, 6); return { kind: "expr", label: `Combine into one fraction: ${$m(`\\frac{${a}}{x} + \\frac{${b}}{x^2} =`)}`, fn: (e) => (a * e.x + b) / (e.x * e.x), display: `\\frac{${T.poly([a, b])}}{x^2}`, vars: ["x"], avoid: (e) => Math.abs(e.x) < 0.3, s: `\\frac{${a}x}{x^2} + \\frac{${b}}{x^2} = \\frac{${T.poly([a, b])}}{x^2}` }; },
  ];
  const items = R.sample(pool, 3).map((f) => f());
  return {
    prompt: para(`Simplify. Fractions must be fully reduced.`),
    parts: items.map((it) => (it.kind === "num" ? PP.num(it.label, it.ans) : PP.expr(it.label, it.fn, it.display, it.vars, { forbid: [], avoid: it.avoid }))),
    hint: "Get a common denominator before adding or subtracting. Dividing by a fraction means multiplying by its reciprocal.",
    solution: items.map((it, i) => para(`<b>${"abc"[i]}.</b>`) + $M(it.s)).join(""),
  };
};

PGEN.algRadicals = () => {
  const rewrites = [["\\sqrt{x}", q(1, 2)], ["\\frac{1}{x^3}", q(-3)], ["\\frac{1}{\\sqrt{x}}", q(-1, 2)], ["\\sqrt[3]{x^2}", q(2, 3)], ["\\frac{1}{x}", q(-1)], ["x\\sqrt{x}", q(3, 2)], ["\\frac{1}{x^2}", q(-2)], ["\\sqrt[4]{x^3}", q(3, 4)]];
  const powers = [[8, q(2, 3), q(4)], [27, q(1, 3), q(3)], [16, q(3, 4), q(8)], [4, q(-1, 2), q(1, 2)], [9, q(3, 2), q(27)], [3, q(-2), q(1, 9)], [2, q(-3), q(1, 8)], [25, q(1, 2), q(5)]];
  const [w1, w2] = R.sample(rewrites, 2), pw = R.pick(powers), r = R.int(2, 9);
  const items = [
    { part: PP.num($m(`${w1[0]} = x^{\\square} \\quad \\square =`), w1[1]), s: `${w1[0]} = x^{${w1[1].tex()}}` },
    { part: PP.num($m(`${w2[0]} = x^{\\square} \\quad \\square =`), w2[1]), s: `${w2[0]} = x^{${w2[1].tex()}}` },
    { part: PP.num($m(`${pw[0]}^{${pw[1].tex()}} =`), pw[2]), s: `${pw[0]}^{${pw[1].tex()}} = ${pw[2].tex()}` },
    { part: PP.expr($m(`(\\sqrt{x} - ${r})(\\sqrt{x} + ${r}) =`), (e) => e.x - r * r, `x - ${r * r}`, ["x"], { expanded: true, forbid: [], positive: true }), s: `(\\sqrt{x})^2 - ${r}^2 = x - ${r * r} \\quad \\text{(the conjugate trick in limits)}` },
  ];
  return {
    prompt: para(`Exponents and radicals. Fractional exponents are how you'll handle ${$m("\\sqrt{x}")} and ${$m("\\frac{1}{x}")} in derivatives.`),
    parts: items.map((it) => it.part),
    hint: "ⁿ√(xᵐ) = x^(m/n). 1/xⁿ = x^(−n). A negative exponent flips; the denominator of a fractional exponent is a root.",
    solution: items.map((it, i) => para(`<b>${"abcd"[i]}.</b> ${$m(it.s)}`)).join(""),
  };
};

PGEN.algLines = () => {
  let x1, x2; do { x1 = R.int(-5, 5); x2 = R.int(-5, 5); } while (x1 === x2);
  const y1 = R.int(-8, 8), y2 = R.int(-8, 8), slope = q(y2 - y1, x2 - x1);
  const m = R.pick([q(R.nz(-5, 5)), q(1, 2), q(-2, 3), q(3, 4), q(-3, 2)]), px = R.nz(-4, 4), py = R.int(-8, 8), b = q(py).sub(m.mul(px));
  const m2 = q(R.nz(-6, 6)), qx = R.nz(-5, 5), qy = R.int(-9, 9), b2 = q(qy).sub(m2.mul(qx));
  return {
    prompt: para(`Every tangent line ends with this algebra: slope, point-slope, then slope-intercept.`),
    parts: [
      PP.num(`Slope of the line through ${$m(`(${x1}, ${y1})`)} and ${$m(`(${x2}, ${y2})`)}`, slope),
      { ...PP.line(`Rewrite in slope-intercept form: ${$m(T.pointSlope(m, px, py))}`, m, b), slopeIntercept: true },
      { ...PP.line(`The line through ${$m(`(${qx}, ${qy})`)} with slope ${$m(m2.tex())}`, m2, b2), slopeIntercept: true },
    ],
    hint: "Slope = (y₂ − y₁)/(x₂ − x₁). Point-slope: y − y₁ = m(x − x₁). Distribute m, then add y₁ to both sides.",
    solution: $M(`m = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = ${slope.tex()}`) +
      $M(`${T.pointSlope(m, px, py)} \\;\\Rightarrow\\; y = ${m.tex()}x ${m.mul(-px).n < 0 ? "-" : "+"} ${m.mul(px).abs().tex()} ${py < 0 ? "-" : "+"} ${Math.abs(py)} \\;\\Rightarrow\\; ${T.line(m, b)}`) +
      $M(`${T.pointSlope(m2, qx, qy)} \\;\\Rightarrow\\; ${T.line(m2, b2)}`),
  };
};

// ---------- expanded concept bank ----------
CONCEPTS["1.1"].push(
  { q: `As ${$m("x \\to 3^-")}, the inputs look like…`, c: ["2.9, 2.99, 2.999", "3.1, 3.01, 3.001", "−3.1, −3.01, −3.001", "3, 3, 3"], why: "3⁻ means approaching 3 from the left: values less than 3." },
  { q: `If ${$m("f(x) = 7")} for every ${$m("x")}, then ${$m(tx`\lim_{x\to 2} f(x)`)} is…`, c: ["7", "2", "0", "DNE"], why: "The limit of a constant is that constant." },
  { q: `A table shows f(1.99) = 5.98, f(1.999) = 5.998, f(2.001) = 6.002, f(2.01) = 6.02. The best estimate of ${$m(tx`\lim_{x\to2} f(x)`)} is…`, c: ["6", "5.998", "2", "DNE"], why: "Both sides close in on 6." },
  { q: `${$m(tx`\lim_{x\to\infty} \frac{5}{x^2}`)} is…`, c: ["0", "5", $m("\\infty"), "DNE"], why: "A constant over a growing power goes to 0." },
  { q: "An even-degree polynomial with a negative leading coefficient, as x → −∞, goes to…", c: [$m("-\\infty"), $m("\\infty"), "0", "It depends on the constant term"], why: "Even degree: both ends point the same way; negative leading coefficient: both point down." },
  { q: `${$m(tx`\lim_{x\to\infty} e^{-x}`)} is…`, c: ["0", $m("\\infty"), "1", $m("-\\infty")], why: "e^(−x) = 1/eˣ, and eˣ grows without bound." },
  { q: `${$m(tx`\lim_{x\to0^+} \frac{1}{x}`)} is…`, c: [$m("\\infty"), $m("-\\infty"), "0", "1"], why: "Just right of 0, x is a tiny positive number, so 1/x is huge and positive." },
  { q: "Can the limit as x → a exist when f(a) is undefined?", c: ["Yes — the limit only depends on values near a", "No, never", "Only for polynomials", "Only if f(a) = 0"], why: "Holes are the classic example: the limit exists even though the point is missing." },
  { q: "The left limit at x = a is ∞ and the right limit is −∞. The graph has…", c: ["a vertical asymptote at x = a", "a horizontal asymptote at y = a", "a hole at x = a", "a jump of finite size"], why: "Outputs blowing up near x = a means a vertical asymptote." },
  { q: `${$m(tx`\lim_{x\to -\infty} x^3`)} is…`, c: [$m("-\\infty"), $m("\\infty"), "0", "1"], why: "A negative number cubed is negative, and it grows in size." },
);
CONCEPTS["1.2"].push(
  { q: `${$m(tx`\lim_{x\to2} (3x^2 - x)`)} is…`, c: ["10", "14", "8", "DNE"], why: "Direct substitution: 3(4) − 2 = 10." },
  { q: `${$m(tx`\lim_{x\to4} \frac{x^2 - 16}{x - 4}`)} is…`, c: ["8", "0", "4", "DNE"], why: "(x − 4)(x + 4)/(x − 4) = x + 4 → 8." },
  { q: `${$m(tx`\lim_{x\to\infty} \frac{4x^2 + 1}{2x^2 - 3}`)} is…`, c: ["2", "4", "0", $m("\\infty")], why: "Equal degrees: ratio of leading coefficients, 4/2." },
  { q: `${$m(tx`\lim_{x\to\infty} \frac{x + 5}{x^2 + 1}`)} is…`, c: ["0", "1", "5", $m("\\infty")], why: "The bottom has the higher degree." },
  { q: `${$m(tx`\lim_{x\to\infty} \frac{3x^3}{x^2 + 7}`)} is…`, c: [$m("\\infty"), "3", "0", "3/7"], why: "The top has the higher degree, with a positive ratio of leading terms." },
  { q: `${$m(tx`\lim_{x\to9} \frac{\sqrt{x} - 3}{x - 9}`)} is…`, c: ["1/6", "1/3", "0", "DNE"], why: "x − 9 = (√x − 3)(√x + 3), leaving 1/(√x + 3) → 1/6." },
  { q: "Polynomials are continuous…", c: ["at every real number", "only where f(x) ≠ 0", "only for x ≥ 0", "only at integers"], why: "No division, no roots — nothing can break." },
  { q: `${$m(tx`f(x) = \frac{x + 2}{x^2 - 4}`)} is discontinuous at…`, c: ["x = 2 and x = −2", "x = 2 only", "x = −2 only", "no x-values"], why: "f is undefined wherever x² − 4 = 0, even where a factor cancels." },
  { q: `For ${$m(tx`f(x) = \frac{x + 2}{x^2 - 4}`)}, the discontinuity at x = −2 is…`, c: ["removable", "infinite", "jump", "not a discontinuity"], why: "(x + 2) cancels, leaving 1/(x − 2) → −1/4: the limit exists, so it's a hole." },
  { q: "For a piecewise function to be continuous at its break point a, you need…", c: ["both pieces to approach the same value at a, and f(a) to equal it", "both pieces to be polynomials", "the slopes of the pieces to match", "f(a) = 0"], why: "That's the three-part continuity test. Matching slopes is about differentiability." },
  { q: `If ${$m(tx`\lim_{x\to3} f(x) = -2`)}, then ${$m(tx`\lim_{x\to3} [f(x)]^2`)} is…`, c: ["4", "−4", "−2", "9"], why: "Power property: (−2)² = 4." },
);
CONCEPTS["1.3"].push(
  { q: "A car is at mile 40 at 1 p.m. and mile 190 at 4 p.m. The average rate of change is…", c: ["50 miles per hour", "150 miles per hour", "1/50 hour per mile", "63.3 miles per hour"], why: "(190 − 40)/(4 − 1) = 150/3 = 50." },
  { q: `The average rate of change of ${$m("f(x) = x^2")} on ${$m("[1, 3]")} is…`, c: ["4", "8", "2", "3"], why: "(9 − 1)/(3 − 1) = 8/2 = 4." },
  { q: "A negative average rate of change means the quantity…", c: ["decreased overall on the interval", "decreased at every moment of the interval", "was negative", "has no units"], why: "It compares only the endpoints." },
  { q: "The temperature rose from 71° at 3 p.m. to 77° at 5 p.m. The average rate is…", c: ["3 degrees per hour", "1/3 hour per degree", "6 degrees", "3 hours"], why: "(77 − 71)/(5 − 3) = 3 — output (degrees) per input (hour)." },
  { q: `The difference quotient of ${$m("f(x) = 5x + 2")} simplifies to…`, c: ["5", "5x", "5x + 5h + 2", "5h"], why: "[5(x + h) + 2 − (5x + 2)]/h = 5h/h = 5." },
  { q: `For ${$m("f(x) = x^2")}, ${$m(tx`\frac{f(x+h) - f(x)}{h}`)} simplifies to…`, c: [$m("2x + h"), $m("2x"), $m("h"), $m("x^2 + h")], why: "(x² + 2xh + h² − x²)/h = 2x + h." },
  { q: "Which gives the slope of the secant line from x = 2 to x = 2.1?", c: [$m(tx`\frac{f(2.1) - f(2)}{0.1}`), $m(tx`\frac{f(2.1) - f(2)}{2}`), $m("f(2.1) - f(2)"), $m("f'(2)")], why: "Rise over run, and the run is 2.1 − 2 = 0.1." },
  { q: "As the interval [a, a + h] shrinks (h → 0), the average rates of change approach…", c: ["the instantaneous rate of change at x = a", "0", "f(a)", "the average rate on [0, a]"], why: "That limit is exactly the derivative." },
  { q: "Profit rose from $1,200 to $2,000 over 4 months. The average rate of change is…", c: ["$200 per month", "$800 per month", "$500 per month", "4 months per $800"], why: "(2000 − 1200)/4 = 200." },
);
CONCEPTS["1.4"].push(
  { q: "If f′(3) = 0, the tangent line at x = 3 is…", c: ["horizontal", "vertical", "undefined", "always the x-axis"], why: "Slope 0 means horizontal (it's y = f(3), not necessarily the x-axis)." },
  { q: `${$m("f(x) = 3x^2")} gives ${$m("f'(x) =")}…`, c: [$m("6x"), $m("3x"), $m("6x^2"), $m("3")], why: "Limit definition: [3(x + h)² − 3x²]/h = 6x + 3h → 6x." },
  { q: `${$m(tx`f(x) = \frac{1}{x}`)} gives ${$m("f'(2) =")}…`, c: ["−1/4", "1/4", "−1/2", "1/2"], why: "f′(x) = −1/x², so f′(2) = −1/4." },
  { q: "If f′(a) > 0, then near x = a the graph is…", c: ["increasing", "decreasing", "flat", "undefined"], why: "A positive tangent slope means rising." },
  { q: `The derivative of a linear function ${$m("f(x) = mx + b")} is…`, c: [$m("m"), $m("b"), $m("mx"), "0"], why: "A line's slope is the same everywhere." },
  { q: "If C(q) is the cost in dollars of making q items, C′(q) is measured in…", c: ["dollars per item", "dollars", "items per dollar", "items"], why: "Derivative units: output per input." },
  { q: `${$m("f(x) = |x|")} at ${$m("x = 0")} is…`, c: ["continuous but not differentiable", "differentiable but not continuous", "both continuous and differentiable", "neither"], why: "There's no break, but there is a corner." },
  { q: "Which limit represents f′(4)?", c: [$m(tx`\lim_{h\to0} \frac{f(4 + h) - f(4)}{h}`), $m(tx`\lim_{h\to0} \frac{f(4 + h) - f(h)}{h}`), $m(tx`\lim_{x\to4} f(x)`), $m(tx`\frac{f(4) - f(0)}{4}`)], why: "Plug a = 4 into the limit definition." },
  { q: "The tangent line to f at (1, 5) has slope −2. Its equation is…", c: [$m("y = -2x + 7"), $m("y = -2x + 5"), $m("y = 5x - 2"), $m("y = -2x - 3")], why: "y − 5 = −2(x − 1) → y = −2x + 7." },
  { q: `For ${$m("f(x) = x^2 - 2x")}, what is f′(4) and what does it mean?`, c: ["6, the slope of the tangent line at x = 4", "8, the value of f at x = 4", "6, the average rate of change on [0, 4]", "2, the slope of the tangent line at x = 4"], why: "f′(x) = 2x − 2, so f′(4) = 6: an instantaneous slope, not f(4) = 8 or the average rate (2)." },
);

PGEN.conceptsAll = () => {
  const all = Object.entries(CONCEPTS).flatMap(([sec, arr]) => arr.map((it) => ({ ...it, sec })));
  const items = R.sample(all, 5);
  return {
    prompt: para(`Concept check across §1.1–1.4. On the exam, these ideas are what let you catch a wrong answer before you submit it.`),
    parts: items.map((it) => P.mc(`<span class="tag">§${it.sec}</span> ${it.q}`, it.c, 0)),
    hint: "Think about what the idea means, not just the procedure.",
    solution: items.map((it, i) => para(`<b>${"abcde"[i]}.</b> ${it.c[0]} — ${it.why}`)).join(""),
  };
};

// ---------- register topics and skills ----------
PTOPICS.push(
  { sec: "Algebra", name: "Warm-up", items: [["algSigns", "Signs & substitution"], ["algExpand", "Expanding (x + h)² and f(x + h)"], ["algFactor", "Factoring"], ["algFractions", "Fractions & combining"], ["algRadicals", "Exponents & radicals"], ["algLines", "Slope & line equations"]] },
  { sec: "Review", name: "Concepts", items: [["conceptsAll", "Concept check (all sections)"]] },
);
PTOPICS.slice(-2).forEach((s) => s.items.forEach(([id, name]) => { PTOPIC_BY_ID[id] = { id, name, sec: s.sec }; }));
if (typeof SKILLS !== "undefined") {
  [["algSigns", "Signs & substitution"], ["algExpand", "Expanding (x + h)² and f(x + h)"], ["algFactor", "Factoring"], ["algFractions", "Fractions & combining"], ["algRadicals", "Exponents & radicals"], ["algLines", "Slope & line equations"]].forEach(([id, name]) => {
    const s = { id, sec: "alg", name: `Algebra: ${name}`, topics: [id] };
    SKILLS.push(s); SKILL_OF[id] = s;
  });
  const cs = SKILLS.find((s) => s.id === "concepts");
  cs.topics.push("conceptsAll"); SKILL_OF.conceptsAll = cs;
}
