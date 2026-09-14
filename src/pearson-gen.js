// ================= Pearson-format questions (part 1): strict checks, converters, limits & continuity =================
var PGEN = window.PGEN || {}; window.PGEN = PGEN;

const INSTR = {
  frac: "(Type an integer or a simplified fraction.)",
  round4: "(Round to four decimal places as needed.)",
  round2: "(Round to two decimal places as needed.)",
  list: "(Use a comma to separate answers as needed.)",
  expr: (vars) => `(Type an expression using ${vars.join(" and ")} as the variable${vars.length > 1 ? "s" : ""}.)`,
};
const LIM_DNE = "The limit does not exist and is neither ∞ nor −∞.";

const UNIT_SYN = {
  degree: ["degree", "degrees", "deg", "degs", "°", "°f", "degreesf", "degreef", "degreesfahrenheit"],
  hour: ["hour", "hours", "hr", "hrs", "h"], minute: ["minute", "minutes", "min", "mins"], second: ["second", "seconds", "sec", "secs", "s"],
  mile: ["mile", "miles", "mi"], foot: ["foot", "feet", "ft"], inch: ["inch", "inches", "in"], centimeter: ["centimeter", "centimeters", "cm"],
  pound: ["pound", "pounds", "lb", "lbs"], dollar: ["dollar", "dollars", "$", "usd"], gallon: ["gallon", "gallons", "gal"],
  day: ["day", "days"], week: ["week", "weeks", "wk", "wks"], month: ["month", "months", "mo", "mos"], year: ["year", "years", "yr", "yrs"],
  item: ["item", "items", "unit", "units"], person: ["person", "people", "persons"],
};
function normUnits(s) {
  s = s.toLowerCase().trim();
  if (/^mph$/.test(s)) return "mile/hour";
  s = s.replace(/\s+per\s+/g, "/").replace(/\s*\/\s*/g, "/").replace(/\s+/g, "");
  const bits = s.split("/");
  if (bits.length !== 2) return null;
  return bits.map((b) => Object.keys(UNIT_SYN).find((k) => UNIT_SYN[k].includes(b)) || "?").join("/");
}

// DOM-free strict checks, modeled on how the online homework grades
const PCheck = {
  num(raw, part) {
    const exact = part.approx == null;
    const r = Check.num(raw, { ans: part.ans, approx: exact ? 1e-9 : part.approx });
    if (r.empty || r.err) return r;
    if (!r.ok && exact && part.ans instanceof Q && /\d*\.\d/.test(raw)) {
      const v = Number(raw.replace(/\s/g, ""));
      if (isFinite(v) && Math.abs(v - part.ans.val()) < 0.006) return { ok: false, err: "Close, but this box wants the exact value. Type a simplified fraction, not a rounded decimal." };
    }
    if (r.ok) {
      const m = raw.replace(/\s+/g, "").match(/^\(?(-?\d+)\)?\/\(?(-?\d+)\)?$/);
      if (m && gcd(+m[1], +m[2]) > 1) return { ok: false, err: "Equivalent, but not simplified. Unreduced fractions get marked wrong — reduce it." };
    }
    return { ok: r.ok, note: r.note };
  },
  list(raw, part) {
    if (!raw.trim()) return { empty: true };
    const vals = [];
    for (const piece of raw.split(/[,;]/)) {
      if (!piece.trim()) continue;
      try { vals.push(Parser.ev(Parser.parse(rhs(piece)), {})); } catch (e) { return { err: `Couldn't read "${piece.trim()}".` }; }
    }
    const want = part.ans.map((a) => Q.of(a).val());
    if (vals.length !== want.length) return { ok: false };
    const used = new Set();
    for (const v of vals) { const k = want.findIndex((w, i) => !used.has(i) && closeTo(v, w)); if (k < 0) return { ok: false }; used.add(k); }
    return { ok: true };
  },
  cf(st, part) {
    const none = part.ans === "DNE" || part.ans === "NONE";
    if (!st.choice) return st.text && st.text.trim() ? { err: "Select choice A or B first." } : { empty: true };
    if (st.choice === "B") return { ok: none };
    if (none) return { ok: false };
    return part.list ? PCheck.list(st.text, part) : PCheck.num(st.text, part);
  },
  multi(sel, part) { if (!sel.length) return { empty: true }; return { ok: [...part.ans].sort().join() === [...sel].sort().join() }; },
  units(raw, part) {
    if (!raw.trim()) return { empty: true };
    const n = normUnits(raw);
    if (n === part.canon) return { ok: true };
    const [o, i] = part.canon.split("/");
    if (n === `${i}/${o}`) return { ok: false, err: "Those units are flipped. A rate is (output units) per (input unit)." };
    if (n === null && normUnits(raw + "/x") !== null) return { ok: false, err: "A rate needs two units: something per something." };
    return { ok: false };
  },
  mc: (k, part) => (k < 0 ? { empty: true } : { ok: k === part.ans }),
  expr: (raw, part) => Check.expr(raw, part),
  line: (raw, part) => Check.line(raw, part),
};

function pAnswerText(part) {
  switch (part.type) {
    case "cf": return part.ans === "DNE" || part.ans === "NONE" ? `B. ${part.dneText}` : `A. ${part.prefix} ${part.list ? "x = " : "= "}${part.list ? part.ans.map((a) => $m(Q.of(a).tex())).join(", ") : $m(T.ans(part.ans))}`;
    case "num": return $m(T.ans(part.ans));
    case "units": return part.display;
    case "multi": return part.ans.length ? part.ans.map((i) => part.choices[i]).join(", ") : "none";
    case "mc": return part.choices[part.ans];
    default: return $m(part.display);
  }
}

const PP = {
  cf: (prefix, ans, dneText = LIM_DNE, extra = {}) => ({ type: "cf", prefix, ans, dneText, instr: extra.approx ? INSTR.round4 : INSTR.frac, ...extra }),
  num: (label, ans, extra = {}) => ({ type: "num", label, ans, instr: extra.approx ? INSTR.round4 : INSTR.frac, ...extra }),
  yn: (label, yes) => ({ type: "mc", label, choices: ["Yes", "No"], ans: yes ? 0 : 1 }),
  multi: (label, choices, ans) => ({ type: "multi", label, choices, ans }),
  units: (label, canon, display, example) => ({ type: "units", label, canon, display, instr: `(Type the units, for example ${example}.)` }),
  expr: (label, fn, display, vars = ["x"], extra = {}) => ({ type: "expr", label, fn, display, vars, instr: INSTR.expr(vars), forbid: noH, ...extra }),
  line: (label, m, b) => ({ type: "line", label, m, b, display: T.line(Q.of(m), Q.of(b)), prefix: "y =", instr: INSTR.expr(["x"]) }),
  list: (ans, noneText) => ({ type: "cf", list: true, prefix: "", ans, dneText: noneText, instr: INSTR.list }),
};

// Convert a practice-mode problem into the online-homework format
function pearsonize(pr, opts = {}) {
  const parts = pr.parts.map((p) => {
    if (p.type === "num") {
      const lab = p.label.trim();
      const isLim = lab.includes("\\lim");
      const isVal = /^\\\(\s*[A-Za-z]\s*(\\left)?\(/.test(lab);
      const extra = p.approx ? { approx: p.approx, instr: INSTR.round4 } : opts.round ? { approx: 0.0051, instr: INSTR.round2 } : {};
      if (isLim || isVal) {
        const prefix = lab.replace(/\s*=\s*\\\)$/, "\\)");
        return { ...PP.cf(prefix, p.ans, isLim ? LIM_DNE : `${prefix} is undefined.`), ...extra };
      }
      return { ...PP.num(lab, p.ans), ...extra };
    }
    if (p.type === "expr") return { ...p, instr: INSTR.expr(p.vars || ["x"]) };
    if (p.type === "line") return { ...p, prefix: "y =", instr: INSTR.expr(["x"]) };
    return p;
  });
  const prompt = pr.prompt.replace(/[^.>]*(<b>DNE<\/b>|<code>-?inf<\/code>)[^.]*\./g, "").replace(/<p>\s*<\/p>/g, "");
  return { ...pr, prompt, parts };
}

// ---------- §1.1–1.2 limits & continuity ----------
PGEN.limGraph = () => {
  const G = Graph.randomPiecewise(R.pick([["jump", "hole", "asym"], ["hole", "jump"], ["asym", "jump"], ["hole", "asym", "cont"], ["jump", "hole", "cont"]]));
  const n = R.shuffle(G.inner.filter((k) => k.type !== "continuous"))[0];
  const a = n.x;
  return {
    prompt: para(`Use the graph of ${$m("y = f(x)")} to find the limits and the function value at ${$m(`x = ${a}`)}.`),
    figure: G.svg,
    parts: [
      PP.cf($m(`${T.lim(a + "^-")} f(x)`), n.left),
      PP.cf($m(`${T.lim(a + "^+")} f(x)`), n.right),
      PP.cf($m(`${T.lim(a)} f(x)`), n.limit),
      PP.cf($m(`f(${a})`), n.value, `${$m(`f(${a})`)} is undefined.`),
    ],
    hint: "Heights the curve approaches give the limits (open dots count). The filled dot gives f(a). If a side shoots up, type ∞ in box A.",
    solution: annotatedGraph(G, a) + describeNode(n) + para(`On this format, an infinite limit goes in box A as ${$m("\\infty")} or ${$m("-\\infty")}. Choice B is only for a limit that doesn't settle anywhere, like left → 2 and right → 5.`),
  };
};

PGEN.limAlg = () => {
  const kind = R.pick(["V1", "V2", "V3", "V3", "V4", "V4b", "V5", "V5", "V7", "V6", "INF", "DIRECT"]);
  let it;
  if (kind === "INF") {
    const r = R.nz(-4, 4); let k; do { k = R.nz(-6, 6); } while (r + k === 0);
    const t = `${T.lim(r)} \\frac{${T.poly([1, k])}}{${T.fac(r)}^2}`, s = Math.sign(r + k);
    it = { t, a: s * Infinity, s: `${t}:\\ \\text{top} \\to ${r + k},\\ \\text{bottom} \\to 0 \\text{ through positive values on both sides} \\;\\Rightarrow\\; ${s > 0 ? "\\infty" : "-\\infty"}` };
  } else if (kind === "DIRECT") {
    let a, s; do { a = R.int(-4, 5); s = R.nz(-5, 5); } while (a + s === 0);
    const co = [1, R.int(-6, 6), R.int(-9, 9)], top = evalPoly(co, a), t = `${T.lim(a)} \\frac{${T.poly(co)}}{${T.poly([1, s])}}`;
    it = { t, a: top.div(a + s), s: `${t} = \\frac{${top.tex()}}{${a + s}} = ${top.div(a + s).tex()} \\quad \\text{(direct substitution)}` };
  } else it = factorVariants[kind]();
  return {
    prompt: para(`Find the limit, if it exists.`),
    parts: [PP.cf($m(it.t), it.a)],
    hint: "Try substituting first. 0/0 means factor/cancel or use a conjugate. Nonzero/0 means an infinite limit or no limit — check the sign on each side.",
    solution: $M(it.s) + para(it.a === "DNE" ? `The two sides disagree, so choose <b>B</b>.` : `Choose <b>A</b> and type ${$m(T.ans(it.a))}.`),
  };
};

PGEN.limInf = () => pearsonize(GEN.infRational());
PGEN.limInfinite = () => pearsonize(GEN.inverse());
PGEN.limPiecewise = () => pearsonize(GEN.pwLimit());

const REASONS = (a) => [`None — ${$m("f")} is continuous at ${$m(`x = ${a}`)}`, `${$m(`f(${a})`)} is not defined`, `${$m(`${T.lim(a)} f(x)`)} does not exist`, `${$m(`${T.lim(a)} f(x)`)} exists but does not equal ${$m(`f(${a})`)}`];
PGEN.contYN = () => {
  const v = R.pick(["pw", "pw", "hole", "holeDef", "poly", "rational"]);
  let ftex, a, yes, reason, sol;
  if (v === "pw") {
    a = R.int(-2, 3); const co = [R.pick([1, -1, 2, -2]), R.int(-4, 4), R.int(-6, 8)], low = R.chance(0.5), left = evalPoly(co, a), m = R.nz(-4, 4);
    yes = R.chance(0.5); const k = yes ? left.sub(m * a) : left.sub(m * a).add(R.pick([-3, -2, 2, 3])); const right = q(m * a).add(k);
    ftex = `f(x) = \\begin{cases} ${T.poly(co, "x", low)} & \\text{for } x \\le ${a} \\\\ ${T.poly([m, k])} & \\text{for } x > ${a} \\end{cases}`;
    reason = yes ? 0 : 2;
    sol = para(`${$m(`f(${a}) = ${left.tex()}`)} (top piece). Left limit ${$m(left.tex())}; right limit ${$m(`${m}(${a}) ${k.n < 0 ? "-" : "+"} ${k.abs().tex()} = ${right.tex()}`)}.`) + para(yes ? "All three match → continuous." : "Left ≠ right, so the limit doesn't exist → not continuous (jump).");
  } else if (v === "hole") {
    const r = R.nz(-4, 4); let s; do { s = R.nz(-5, 5); } while (s === r); a = r; yes = false; reason = 1;
    ftex = `f(x) = \\frac{${T.poly([1, -(r + s), r * s])}}{${T.fac(r).slice(1, -1)}}`;
    sol = para(`At ${$m(`x = ${r}`)} the denominator is 0, so ${$m(`f(${r})`)} is not defined — condition 1 already fails. (The limit does exist: it's ${r - s}. That makes it a removable discontinuity.)`);
  } else if (v === "holeDef") {
    const r = R.nz(-4, 4); let s; do { s = R.nz(-5, 5); } while (s === r); a = r; const L = r - s; yes = R.chance(0.4); const k = yes ? L : L + R.pick([-2, -1, 1, 2]); reason = yes ? 0 : 3;
    ftex = `f(x) = \\begin{cases} \\dfrac{${T.poly([1, -(r + s), r * s])}}{${T.fac(r).slice(1, -1)}} & \\text{for } x \\ne ${r} \\\\ ${k} & \\text{for } x = ${r} \\end{cases}`;
    sol = para(`${$m(`f(${r}) = ${k}`)}. The limit: factor and cancel → ${$m(`${T.lim(r)} ${T.fac(s)} = ${L}`)}.`) + para(yes ? "They match → continuous." : `The limit (${L}) ≠ ${$m(`f(${r})`)} (${k}) → not continuous.`);
  } else if (v === "poly") {
    a = R.int(-3, 4); const co = [R.nz(-3, 3), R.int(-5, 5), R.int(-6, 6), R.int(-5, 5)]; yes = true; reason = 0;
    ftex = `f(x) = ${T.poly(co)}`; sol = para(`Polynomials are continuous at every real number, so yes.`);
  } else {
    const c = R.nz(-4, 4); let s; do { s = R.int(-5, 5); } while (s === -c); a = c; yes = false; reason = 1;
    ftex = `f(x) = \\frac{${T.poly([1, s])}}{${T.fac(c).slice(1, -1)}}`;
    sol = para(`${$m(`f(${c})`)} would divide by 0, so it's not defined (and there's a vertical asymptote, so the limit doesn't exist either).`);
  }
  return {
    prompt: $M(ftex) + para(`Determine whether ${$m("f")} is continuous at ${$m(`x = ${a}`)}.`),
    parts: [PP.yn(`Is ${$m("f")} continuous at ${$m(`x = ${a}`)}?`, yes), P.mcFixed(`Which condition for continuity fails first?`, REASONS(a), reason)],
    hint: "Check in order: (1) is f(a) defined, (2) does the limit exist (left = right), (3) does the limit equal f(a)?",
    solution: sol,
  };
};

PGEN.discList = () => {
  const v = R.pick(["rat2", "rat2", "rat1", "poly", "pwJump", "pwCont", "noReal"]);
  let ftex, ans, sol;
  if (v === "rat2" || v === "rat1") {
    const r1 = R.nz(-5, 5); let r2; do { r2 = R.nz(-5, 5); } while (r2 === r1);
    const top = v === "rat1" ? T.fac(r1).slice(1, -1) : T.poly([1, R.int(-6, 6)]);
    ftex = `f(x) = \\frac{${top}}{${T.poly([1, -(r1 + r2), r1 * r2])}}`; ans = [q(r1), q(r2)].sort((x, y) => x.val() - y.val());
    sol = para(`Rational functions are discontinuous exactly where the denominator is 0: ${$m(`${T.poly([1, -(r1 + r2), r1 * r2])} = ${T.fac(r1)}${T.fac(r2)} = 0`)} → ${$m(`x = ${ans[0].tex()},\\ ${ans[1].tex()}`)}.`) +
      (v === "rat1" ? para(`Even though ${$m(T.fac(r1))} cancels, ${$m(`f(${r1})`)} is still undefined — that one is a removable discontinuity, but it still counts.`) : "");
  } else if (v === "poly") {
    ftex = `f(x) = ${T.poly([R.nz(-3, 3), R.int(-5, 5), R.int(-6, 6)])}`; ans = "NONE"; sol = para("Polynomials have no discontinuities.");
  } else if (v === "noReal") {
    const k = R.int(1, 9); ftex = `f(x) = \\frac{${R.nz(-5, 5)}}{x^2 + ${k}}`; ans = "NONE"; sol = para(`${$m(`x^2 + ${k}`)} is always at least ${k}, so the denominator is never 0 → no discontinuities.`);
  } else {
    const c = R.int(-3, 3), m = R.nz(-3, 3), p = R.int(-4, 4), left = c * c + p, jump = v === "pwJump";
    const b = left - m * c + (jump ? R.pick([-3, -2, 2, 3]) : 0);
    ftex = `f(x) = \\begin{cases} ${T.poly([1, 0, p])} & \\text{for } x < ${c} \\\\ ${T.poly([m, b])} & \\text{for } x \\ge ${c} \\end{cases}`;
    ans = jump ? [q(c)] : "NONE";
    sol = para(`Each piece is a polynomial, so only ${$m(`x = ${c}`)} can be a problem. Left: ${$m(`${T.par(c)}^2 ${p < 0 ? "-" : "+"} ${Math.abs(p)} = ${left}`)}. Right: ${$m(`${m}${T.par(c)} ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${m * c + b}`)}.`) +
      para(jump ? `They differ → discontinuous at ${$m(`x = ${c}`)}.` : "They match (and f(c) uses the bottom piece, which gives the same value) → no discontinuities.");
  }
  return {
    prompt: $M(ftex) + para(`Find all values of ${$m("x")} where ${$m("f")} is discontinuous.`),
    parts: [PP.list(ans, "There are no discontinuities.")],
    hint: "Rational function: set the denominator equal to 0. Piecewise: compare the pieces at the break point.",
    solution: sol,
  };
};
