// ================= Section 1.1 — Limits: numerical & graphical =================
var GEN = window.GEN || {}; window.GEN = GEN;
const tx = String.raw;
const para = (s) => `<p>${s}</p>`;
const infWord = (v) => (v === Infinity ? "∞" : "−∞");

function describeNode(n, fname = "f") {
  const a = n.x, out = [];
  const val = n.value === "DNE"
    ? `There is no filled dot on the line ${$m(`x = ${a}`)}, so ${$m(`${fname}(${a})`)} is undefined → <b>DNE</b>.`
    : n.type === "continuous"
      ? `The curve passes straight through ${$m(`(${a}, ${n.value})`)}, so ${$m(`${fname}(${a}) = ${n.value}`)}.`
      : `The <b>filled</b> dot at ${$m(`x = ${a}`)} sits at height ${n.value}, so ${$m(`${fname}(${a}) = ${n.value}`)}.`;
  out.push(val);
  const side = (v, dir) => isFinite(v)
    ? `Tracing the curve toward ${$m(`x = ${a}`)} from the ${dir}, the heights approach <b>${v}</b> (open or closed dot doesn't matter).`
    : `From the ${dir}, the curve runs along the asymptote ${$m(`x = ${a}`)} ${v > 0 ? "upward" : "downward"}, so the limit is ${$m(T.ans(v))}.`;
  out.push(side(n.left, "left"), side(n.right, "right"));
  if (n.limit === "DNE") out.push(`The left and right limits don't match, so ${$m(`${T.lim(a)} ${fname}(x)`)} <b>DNE</b>.`);
  else if (!isFinite(n.limit)) out.push(`Both sides go to ${$m(T.ans(n.limit))}, so ${$m(`${T.lim(a)} ${fname}(x) = ${T.ans(n.limit)}`)} (unbounded, so no finite limit exists).`);
  else out.push(`Both one-sided limits equal ${n.limit}, so ${$m(`${T.lim(a)} ${fname}(x) = ${n.limit}`)}${n.value !== n.limit ? ` — even though ${$m(`${fname}(${a})`)} ${n.value === "DNE" ? "is undefined" : `= ${n.value}`}. The limit ignores the value AT the point.` : "."}`);
  return `<h4>At ${$m(`x = ${a}`)}</h4>` + out.map(para).join("");
}

GEN.graphRead = () => {
  const types = R.pick([["jump", "hole"], ["jump", "asym"], ["hole", "cont", "jump"], ["jump", "hole", "asym"], ["hole", "jump"], ["asym", "hole"]]);
  const G = Graph.randomPiecewise(types);
  const pickN = R.shuffle(G.inner).sort((a, b) => (a.type === "continuous") - (b.type === "continuous")).slice(0, 2).sort((a, b) => a.x - b.x);
  const parts = [];
  pickN.forEach((n) => {
    parts.push(P.num($m(`f(${n.x})`), n.value));
    parts.push(P.num($m(`${T.lim(n.x + "^-")} f(x)`), n.left, { dneOk: true }));
    parts.push(P.num($m(`${T.lim(n.x + "^+")} f(x)`), n.right, { dneOk: true }));
    parts.push(P.num($m(`${T.lim(n.x)} f(x)`), n.limit, { dneOk: true }));
  });
  return {
    prompt: para(`Use the graph of ${$m("y = f(x)")} to state the value of each quantity, if it exists. If it does not exist, write <b>DNE</b>. Use <code>inf</code> / <code>-inf</code> for ${$m("\\pm\\infty")}.`),
    figure: G.svg,
    parts,
    hint: "Limits ask where the curve is heading (open dots count). Function values ask where the filled dot is.",
    solution: pickN.map((n) => describeNode(n)).join(""),
  };
};

GEN.numTable = () => {
  const v = R.int(1, 6);
  let a, ftex, fn, L, approx = 0.0061, extra = "";
  if (v === 1) { const r = R.nz(-5, 5); a = r; ftex = tx`\frac{x^2 - ${r * r}}{${T.fac(r).slice(1, -1)}}`; fn = (x) => (x * x - r * r) / (x - r); L = q(2 * r); extra = tx`\frac{(x - ${r})(x + ${r})}{x - ${r}} = x + ${r} \to ${2 * r}`.replace(/- -/g, "+ ").replace(/\+ -/g, "- "); }
  if (v === 2) { const r = R.nz(-4, 4); let s; do { s = R.nz(-5, 5); } while (s === r); a = r; ftex = tx`\frac{${T.poly([1, -(r + s), r * s])}}{${T.fac(r).slice(1, -1)}}`; fn = (x) => (x * x - (r + s) * x + r * s) / (x - r); L = q(r - s); extra = tx`\frac{${T.fac(r)}${T.fac(s)}}{${T.fac(r)}} = ${T.fac(s).slice(1, -1)} \to ${r} ${r - s - r < 0 ? "-" : "+"} ${Math.abs(s)} = ${r - s}`; }
  if (v === 3) { const r = R.int(2, 4); a = r * r; ftex = tx`\frac{\sqrt{x} - ${r}}{x - ${r * r}}`; fn = (x) => (Math.sqrt(x) - r) / (x - r * r); L = q(1, 2 * r); extra = tx`\frac{\sqrt{x} - ${r}}{(\sqrt{x} - ${r})(\sqrt{x} + ${r})} = \frac{1}{\sqrt{x} + ${r}} \to \frac{1}{${2 * r}}`; }
  if (v === 4) { a = 0; ftex = tx`\frac{e^{x} - 1}{x}`; fn = (x) => (Math.exp(x) - 1) / x; L = q(1); extra = "(This one can't be simplified with algebra — the table is the tool.)"; }
  if (v === 5) { a = 0; ftex = tx`\frac{2^{x} - 1}{x}`; fn = (x) => (Math.pow(2, x) - 1) / x; L = Math.LN2; approx = 0.011; extra = tx`\text{(The exact value is } \ln 2 \approx 0.693\text{.)}`; }
  if (v === 6) { const r = R.pick([1, 2, -1, -2]); a = r; ftex = tx`\frac{x^3 ${r ** 3 < 0 ? "+" : "-"} ${Math.abs(r ** 3)}}{${T.fac(r).slice(1, -1)}}`; fn = (x) => (x ** 3 - r ** 3) / (x - r); L = q(3 * r * r); extra = tx`\frac{${T.fac(r)}(${T.poly([1, r, r * r])})}{${T.fac(r)}} = ${T.poly([1, r, r * r])} \to ${3 * r * r}`; }
  const offs = [-0.1, -0.01, -0.001, 0, 0.001, 0.01, 0.1];
  const rows = offs.map((d) => {
    const x = a + d;
    return `<td>${fmtDec(x, 4)}</td>`;
  }).join("");
  const vals = offs.map((d) => (d === 0 ? "<td class='qmark'>?</td>" : `<td>${fmtDec(fn(a + d), 6)}</td>`)).join("");
  const table = `<div class="tbl-wrap"><table class="vt"><tr><th>${$m("x")}</th>${rows}</tr><tr><th>${$m("f(x)")}</th>${vals}</tr></table></div>`;
  const Lt = L instanceof Q ? L : L;
  return {
    prompt: para(`Let ${$m(`f(x) = ${ftex}`)}. We want to know what happens to the outputs when ${$m("x")} is near ${$m(a)}.`) + table,
    parts: [
      P.mc(`Can you find ${$m(`${T.lim(a)} f(x)`)} by plugging in ${$m(`x = ${a}`)}?`, [
        `No — substituting gives ${$m("\\frac{0}{0}")}, which is undefined`,
        `Yes — just compute ${$m(`f(${a})`)}`,
        `No — ${$m("f")} is undefined for every ${$m("x")} near ${$m(a)}`,
      ], 0),
      P.num(`As ${$m(`x \\to ${a}^-`)}, ${$m("f(x)")} approaches…`, L, { approx }),
      P.num(`As ${$m(`x \\to ${a}^+`)}, ${$m("f(x)")} approaches…`, L, { approx }),
      P.num($m(`${T.lim(a)} f(x) =`), L, { approx }),
    ],
    hint: "Read the left three columns for the left-hand limit and the right three for the right-hand limit. If they approach the same value, that's the limit.",
    solution: para(`Plugging in ${$m(`x = ${a}`)} makes both the top and bottom 0, so we can't substitute.`) +
      para(`Reading the table left to right, the outputs close in on ${$m(T.ans(Lt))} from both sides (the values at ${$m(`${a} \\pm 0.001`)} are the closest).`) +
      $M(`${T.lim(a)} ${ftex} = ${T.ans(Lt)}`) + para(`Algebra check: ${extra.startsWith("(") ? extra : $m(extra)}`),
  };
};

GEN.inverse = () => {
  const c = R.int(-4, 4), k = R.pick([1, 2, 3, -1, -2, -3]), p = R.pick([1, 2, 2]);
  const base = T.fac(c);
  const den = p === 1 ? (c === 0 ? "x" : base.slice(1, -1)) : c === 0 ? "x^2" : `${base}^2`;
  const ftex = tx`\frac{${k}}{${den}}`;
  const sk = Math.sign(k);
  const left = p === 1 ? -sk * Infinity : sk * Infinity, right = sk * Infinity, two = limVal(left, right);
  const near = (s) => `${c === 0 ? "x" : `x ${c > 0 ? "-" : "+"} ${Math.abs(c)}`}`;
  return {
    prompt: para(`Let ${$m(`f(x) = ${ftex}`)}. Answer with a number, <code>inf</code>, <code>-inf</code>, or <b>DNE</b>.`),
    parts: [
      P.num($m(`${T.lim(c + "^-")} f(x)`), left),
      P.num($m(`${T.lim(c + "^+")} f(x)`), right),
      P.num($m(`${T.lim(c)} f(x)`), two, { dneOk: true }),
      P.num($m(`${T.lim("\\infty")} f(x)`), q(0)),
      P.num(`The vertical asymptote is ${$m("x =")}`, q(c)),
    ],
    hint: `Test a number just left of ${c} and just right of ${c} and look only at the SIGN of the bottom.`,
    solution:
      para(`Near ${$m(`x = ${c}`)} the denominator ${$m(den)} is tiny, so ${$m("f(x)")} is huge in size. Only the sign needs work.`) +
      (p === 1
        ? para(`Left of ${c} (try ${$m(`x = ${c - 0.01}`)}): ${$m(near())} is a small <b>negative</b> number, so ${$m(`\\frac{${k}}{\\text{small negative}}`)} → ${$m(T.ans(left))}.`) +
          para(`Right of ${c} (try ${$m(`x = ${c + 0.01}`)}): ${$m(near())} is a small <b>positive</b> number → ${$m(T.ans(right))}.`) +
          para(`The sides disagree, so the two-sided limit <b>DNE</b>.`)
        : para(`Squaring makes the denominator a small <b>positive</b> number on both sides, so both one-sided limits are ${$m(T.ans(right))}. Since both sides agree we write ${$m(`${T.lim(c)} f(x) = ${T.ans(two)}`)} (it still has no finite value).`)) +
      para(`As ${$m("x \\to \\infty")}, the denominator grows without bound while the top stays ${k}, so ${$m("f(x) \\to 0")}. The vertical asymptote is ${$m(`x = ${c}`)}.`),
  };
};

GEN.endBehavior = () => {
  const makePoly = () => {
    const n = R.int(2, 5), a = R.nz(-4, 4), dir = R.sign();
    const coefs = [a]; for (let i = 0; i < n; i++) coefs.push(R.chance(0.5) ? 0 : R.int(-6, 6));
    const s = Math.sign(a) * (dir < 0 && n % 2 === 1 ? -1 : 1);
    const to = dir > 0 ? "\\infty" : "-\\infty";
    return { label: $m(`${T.lim(to)} \\left(${T.poly(coefs)}\\right)`), ans: s * Infinity,
      why: `Leading term ${$m(T.poly([a, ...Array(n).fill(0)]))}: degree ${n} (${n % 2 ? "odd" : "even"}), leading coefficient ${a > 0 ? "positive" : "negative"}. As ${$m(`x \\to ${to}`)}, ${$m(`x^{${n}}`)} ${n % 2 === 0 ? "is positive" : dir > 0 ? "is positive" : "is negative"}, times ${a} → ${$m(T.ans(s * Infinity))}.` };
  };
  const makeExp = () => {
    const c = R.int(-5, 5), k = R.nz(-4, 4), neg = R.chance(0.5), dir = R.sign();
    const e = neg ? "e^{-x}" : "e^{x}";
    const grows = (neg && dir < 0) || (!neg && dir > 0);
    const ans = grows ? Math.sign(k) * Infinity : q(c);
    const to = dir > 0 ? "\\infty" : "-\\infty";
    const kt = k === 1 ? "" : k === -1 ? "-" : String(k);
    const expr = c === 0 ? `${kt}${e}` : `${c} ${k < 0 ? "-" : "+"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}${e}`;
    return { label: $m(`${T.lim(to)} \\left(${expr}\\right)`), ans,
      why: `As ${$m(`x \\to ${to}`)}, ${$m(e)} ${grows ? "grows without bound" : "shrinks to 0"}${grows ? `, and multiplying by ${k} gives ${$m(T.ans(ans))}` : `, so the expression approaches ${c}`}.` };
  };
  const makeRecip = () => {
    const c = R.int(-6, 6), k = R.nz(-9, 9), pw = R.int(1, 3), dir = R.sign();
    const to = dir > 0 ? "\\infty" : "-\\infty";
    return { label: $m(`${T.lim(to)} \\left(${c} + \\frac{${k}}{x^{${pw}}}\\right)`.replace("+ \\frac{-", "- \\frac{")), ans: q(c),
      why: `${$m(`\\frac{${Math.abs(k)}}{x^{${pw}}} \\to 0`)} as ${$m(`x \\to ${to}`)}, leaving ${c}.` };
  };
  const items = R.shuffle([makePoly(), makePoly(), makeExp(), makeRecip()]);
  return {
    prompt: para(`Find each limit (end behavior). Use <code>inf</code> or <code>-inf</code> when the outputs grow without bound.`),
    parts: items.map((it) => P.num(it.label, it.ans)),
    hint: "For polynomials only the leading term matters: its degree (even/odd) and the sign of its coefficient.",
    solution: items.map((it, i) => para(`<b>${"abcd"[i]}.</b> ${it.why}`)).join(""),
  };
};

GEN.bigPiecewise = () => {
  const c = R.int(-2, 3), qa = R.pick([1, -1]), d = R.int(-4, 4), m = R.nz(-3, 3);
  const leftAt = qa * c * c + d;
  const equal = R.chance(0.4);
  const b = equal ? leftAt - m * c : leftAt - m * c + R.pick([-3, -2, 2, 3]);
  const right = m * c + b, dd = c + R.int(1, 3);
  const Lt = T.poly([qa, 0, d]), Rt = T.poly([m, b]);
  const gtex = tx`G(x) = \begin{cases} ${Lt} & x < ${c} \\ ${Rt} & x > ${c} \end{cases}`;
  const lim = limVal(q(leftAt), q(right));
  return {
    prompt: para(`Let`) + $M(gtex) + para(`Find each quantity. If it does not exist, write <b>DNE</b>.`),
    parts: [
      P.num($m(`G(${c})`), "DNE"),
      P.num($m(`${T.lim(c + "^-")} G(x)`), q(leftAt)),
      P.num($m(`${T.lim(c + "^+")} G(x)`), q(right)),
      P.num($m(`${T.lim(c)} G(x)`), lim),
      P.num($m(`G(${dd})`), q(m * dd + b)),
      P.num($m(`${T.lim("-\\infty")} G(x)`), qa * Infinity),
      P.num($m(`${T.lim("\\infty")} G(x)`), Math.sign(m) * Infinity),
    ],
    hint: `Neither piece includes x = ${c} (both inequalities are strict). Left limits use the top piece; right limits use the bottom piece.`,
    solution:
      para(`<b>${$m(`G(${c})`)}:</b> the pieces cover ${$m(`x < ${c}`)} and ${$m(`x > ${c}`)} only, so ${$m(`G(${c})`)} is undefined → DNE.`) +
      para(`<b>Left:</b> use ${$m(Lt)}: ${$m(`${qa < 0 ? "-" : ""}${T.par(c)}^2 ${d < 0 ? "-" : "+"} ${Math.abs(d)} = ${leftAt}`)}.`) +
      para(`<b>Right:</b> use ${$m(Rt)}: ${$m(`${m}${T.par(c)} ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${right}`)}.`) +
      para(`<b>Two-sided:</b> ${leftAt === right ? `both sides give ${leftAt}, so the limit is ${leftAt} (even though ${$m(`G(${c})`)} is undefined).` : `${leftAt} ≠ ${right}, so the limit DNE.`}`) +
      para(`<b>${$m(`G(${dd})`)}:</b> ${dd} > ${c}, so use ${$m(Rt)}: ${$m(`${m}(${dd}) ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${m * dd + b}`)}.`) +
      para(`<b>End behavior:</b> as ${$m("x \\to -\\infty")} we're on the ${$m(Lt)} piece — an even-degree term with ${qa > 0 ? "positive" : "negative"} leading coefficient → ${$m(T.ans(qa * Infinity))}. As ${$m("x \\to \\infty")} we're on the line with slope ${m} → ${$m(T.ans(Math.sign(m) * Infinity))}.`),
  };
};
