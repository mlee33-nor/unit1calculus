// ================= Section 1.2 — Limits: algebraic viewpoint & continuity =================

GEN.properties = () => {
  const c = R.int(-3, 5), A = R.nz(-6, 6), B = R.nz(-6, 6), C = R.pick([4, 9, 16, 25, 36]), rc = Math.sqrt(C);
  const L = (s) => `${T.lim(c)} ${s}`;
  const pool = [
    () => { const p = R.int(2, 5), k = R.int(2, 5); return { t: L(`\\left[${p}f(x) - ${k}g(x)\\right]`), a: q(p * A - k * B), s: `${p}${T.par(A)} - ${k}${T.par(B)} = ${p * A - k * B}` }; },
    () => { const k = R.int(1, 4); return { t: L(`\\frac{g(x) - ${k}}{f(x)}`), a: q(B - k, A), s: `\\frac{${B} - ${k}}{${A}} = ${q(B - k, A).tex()}` }; },
    () => { const p = R.int(2, 3); return { t: L(`\\left[${p}f(x) + g(x)\\right]^2`), a: q((p * A + B) ** 2), s: `\\left[${p}${T.par(A)} + ${T.par(B)}\\right]^2 = (${p * A + B})^2 = ${(p * A + B) ** 2}` }; },
    () => ({ t: L(`\\sqrt{h(x)}\\, f(x)`), a: q(rc * A), s: `\\sqrt{${C}}\\cdot${T.par(A)} = ${rc}\\cdot${T.par(A)} = ${rc * A}` }),
    () => { const k = R.int(1, 5); return { t: L(`\\frac{f(x)\\,g(x)}{h(x) + ${k}}`), a: q(A * B, C + k), s: `\\frac{${T.par(A)}${T.par(B)}}{${C} + ${k}} = ${q(A * B, C + k).tex()}` }; },
    () => ({ t: L(`x^2 f(x)`), a: q(c * c * A), s: `${T.par(c)}^2\\cdot${T.par(A)} = ${c * c * A}` }),
    () => { const a3 = A ** 3; return { t: L(`\\left(\\left[f(x)\\right]^3 - g(x)\\right)`), a: q(a3 - B), s: `${T.par(A)}^3 - ${T.par(B)} = ${a3} ${B < 0 ? "+" : "-"} ${Math.abs(B)} = ${a3 - B}` }; },
  ];
  const items = R.sample(pool, 4).map((f) => f());
  return {
    prompt: para(`Suppose`) + $M(`${T.lim(c)} f(x) = ${A}, \\qquad ${T.lim(c)} g(x) = ${B}, \\qquad ${T.lim(c)} h(x) = ${C}`) + para(`Use the properties of limits to find each limit.`),
    parts: items.map((it) => P.num($m(it.t), it.a)),
    hint: "The sum, difference, constant multiple, product, quotient, power, and root properties let you replace each limit by its value.",
    solution: items.map((it, i) => para(`<b>${"abcd"[i]}.</b> ${$m(`${it.t} = ${it.s}`)}`)).join("") +
      para(`The quotient property works here because the bottom limit isn't 0.`),
  };
};

GEN.directSub = () => {
  const items = [];
  { const a = R.int(-4, 4), co = [R.nz(-3, 3), R.int(-6, 6), R.int(-9, 9)]; const v = evalPoly(co, a);
    items.push({ t: `${T.lim(a)} \\left(${T.poly(co)}\\right)`, a: v, s: `${co[0]}${T.par(a)}^2 ${co[1] < 0 ? "-" : "+"} ${Math.abs(co[1])}${T.par(a)} ${co[2] < 0 ? "-" : "+"} ${Math.abs(co[2])} = ${v.tex()}` }); }
  { let a, s; do { a = R.int(-4, 5); s = R.int(-5, 5); } while (a + s === 0 || s === 0);
    const co = [1, R.int(-6, 6), R.int(-9, 9)]; const top = evalPoly(co, a);
    items.push({ t: `${T.lim(a)} \\frac{${T.poly(co)}}{${T.poly([1, s])}}`, a: top.div(a + s), s: `\\frac{${T.par(a)}^2 ${co[1] < 0 ? "-" : "+"} ${Math.abs(co[1])}${T.par(a)} ${co[2] < 0 ? "-" : "+"} ${Math.abs(co[2])}}{${a} ${s < 0 ? "-" : "+"} ${Math.abs(s)}} = \\frac{${top.tex()}}{${a + s}} = ${top.div(a + s).tex()}` }); }
  { const a = R.nz(-4, 4), m = Math.abs(a) + R.int(1, 3), k = m * m - a * a;
    items.push({ t: `${T.lim(a)} \\sqrt{x^2 + ${k}}`, a: q(m), s: `\\sqrt{${T.par(a)}^2 + ${k}} = \\sqrt{${m * m}} = ${m}` }); }
  if (R.chance(0.5)) { const a = R.int(-9, 9), k = R.nz(-9, 9); items.push({ t: `${T.lim(a)} ${k}`, a: q(k), s: `${k}` + "\\quad\\text{(the limit of a constant is that constant)}" }); }
  return {
    prompt: para(`Calculate each limit algebraically.`),
    parts: items.map((it) => P.num($m(it.t), it.a)),
    hint: "If the input is in the domain (no zero denominator, no negative under a root), just substitute.",
    solution: para(`Each input is in the domain of its function, so direct substitution works.`) + items.map((it, i) => para(`<b>${"abcd"[i]}.</b> ${$m(`${it.t} = ${it.s}`)}`)).join(""),
  };
};

const factorVariants = {
  V1() { const r = R.nz(-5, 5); let s; do { s = R.nz(-6, 6); } while (s === r);
    const t = `${T.lim(r)} \\frac{${T.poly([1, -(r + s), r * s])}}{${T.fac(r).slice(1, -1)}}`;
    return { t, a: q(r - s), s: `${t} = ${T.lim(r)} \\frac{${T.fac(r)}${T.fac(s)}}{${T.fac(r)}} = ${T.lim(r)} ${T.fac(s)} = ${r} ${s < 0 ? "+" : "-"} ${Math.abs(s)} = ${r - s}` }; },
  V2() { const r = R.nz(-5, 5); let tt; do { tt = R.nz(-5, 5); } while (tt === r || tt === -r);
    const t = `${T.lim(r)} \\frac{x^2 - ${r * r}}{${T.poly([1, -(r + tt), r * tt])}}`;
    return { t, a: q(2 * r, r - tt), s: `${t} = ${T.lim(r)} \\frac{${T.fac(r)}${T.fac(-r)}}{${T.fac(r)}${T.fac(tt)}} = ${T.lim(r)} \\frac{${T.fac(-r).slice(1, -1)}}{${T.fac(tt).slice(1, -1)}} = \\frac{${2 * r}}{${r - tt}} = ${q(2 * r, r - tt).tex()}` }; },
  V3() { let p, s, qq, u, r;
    do { p = R.int(1, 3); s = R.int(1, 3); qq = R.nz(-5, 5); u = R.nz(-5, 5); r = R.nz(-3, 3); } while ((p === 1 && s === 1) || s * r + u === 0 || p * u === qq * s || p * r + qq === 0);
    const num = [p, qq - p * r, -qq * r], den = [s, u - s * r, -u * r];
    const t = `${T.lim(r)} \\frac{${T.poly(num)}}{${T.poly(den)}}`;
    return { t, a: q(p * r + qq, s * r + u), s: `${t} = ${T.lim(r)} \\frac{${T.fac(r)}${T.lin(p, qq)}}{${T.fac(r)}${T.lin(s, u)}} = ${T.lim(r)} \\frac{${T.poly([p, qq])}}{${T.poly([s, u])}} = \\frac{${p * r + qq}}{${s * r + u}} = ${q(p * r + qq, s * r + u).tex()}` }; },
  V4() { const a = R.nz(-5, 5); const t = `${T.lim(0, "h")} \\frac{(${a} + h)^2 - ${a * a}}{h}`;
    return { t, a: q(2 * a), s: `${t} = ${T.lim(0, "h")} \\frac{${a * a} ${2 * a < 0 ? "-" : "+"} ${Math.abs(2 * a)}h + h^2 - ${a * a}}{h} = ${T.lim(0, "h")} \\frac{h(${2 * a} + h)}{h} = ${T.lim(0, "h")} (${2 * a} + h) = ${2 * a}` }; },
  V4b() { const a = R.pick([1, 2, 3, 4, -2]); const t = `${T.lim(0, "h")} \\frac{\\frac{1}{${a} + h} - \\frac{1}{${a}}}{h}`;
    return { t, a: q(-1, a * a), s: `${t} = ${T.lim(0, "h")} \\frac{\\frac{${a} - (${a} + h)}{${a}(${a} + h)}}{h} = ${T.lim(0, "h")} \\frac{-h}{${a}(${a} + h)\\,h} = ${T.lim(0, "h")} \\frac{-1}{${a}(${a} + h)} = ${q(-1, a * a).tex()}` }; },
  V4c() { const a = R.pick([1, 2, -1, 3]); const t = `${T.lim(0, "h")} \\frac{(${a} + h)^3 ${a ** 3 < 0 ? "+" : "-"} ${Math.abs(a ** 3)}}{h}`;
    return { t, a: q(3 * a * a), s: `(${a} + h)^3 = ${a ** 3} + ${3 * a * a}h ${3 * a < 0 ? "-" : "+"} ${Math.abs(3 * a)}h^2 + h^3,\\ \\text{so}\\ ${t} = ${T.lim(0, "h")} \\left(${3 * a * a} ${3 * a < 0 ? "-" : "+"} ${Math.abs(3 * a)}h + h^2\\right) = ${3 * a * a}` }; },
  V5() { const r = R.int(2, 7);
    if (R.chance(0.5)) { const t = `${T.lim(r * r)} \\frac{\\sqrt{x} - ${r}}{x - ${r * r}}`;
      return { t, a: q(1, 2 * r), s: `${t} = ${T.lim(r * r)} \\frac{\\sqrt{x} - ${r}}{(\\sqrt{x} - ${r})(\\sqrt{x} + ${r})} = ${T.lim(r * r)} \\frac{1}{\\sqrt{x} + ${r}} = \\frac{1}{${r} + ${r}} = \\frac{1}{${2 * r}}` }; }
    const t = `${T.lim(r * r)} \\frac{x - ${r * r}}{\\sqrt{x} - ${r}}`;
    return { t, a: q(2 * r), s: `${t} = ${T.lim(r * r)} \\frac{(\\sqrt{x} - ${r})(\\sqrt{x} + ${r})}{\\sqrt{x} - ${r}} = ${T.lim(r * r)} (\\sqrt{x} + ${r}) = ${2 * r}` }; },
  V7() { const a = R.nz(-6, 6), b = R.nz(-9, 9), c = R.pick([1, 1, 2, 3]);
    const t = `${T.lim(0)} \\frac{${T.poly([a, b, 0])}}{${c === 1 ? "x" : c + "x"}}`;
    return { t, a: q(b, c), s: `${t} = ${T.lim(0)} \\frac{x(${T.poly([a, b])})}{${c === 1 ? "x" : c + "x"}} = ${T.lim(0)} \\frac{${T.poly([a, b])}}{${c}} = ${q(b, c).tex()}` }; },
  V6() { const r = R.nz(-4, 4); const t = `${T.lim(r)} \\frac{${T.fac(r).slice(1, -1)}}{${T.poly([1, -2 * r, r * r])}}`;
    return { t, a: "DNE", s: `${t} = ${T.lim(r)} \\frac{${T.fac(r)}}{${T.fac(r)}^2} = ${T.lim(r)} \\frac{1}{${T.fac(r).slice(1, -1)}}.\\ \\text{Left} \\to -\\infty,\\ \\text{right} \\to \\infty,\\ \\text{so the limit DNE}` }; },
};

GEN.factor = () => {
  const keys = R.sample(["V1", "V2", "V3", "V3", "V4", "V4b", "V4c", "V5", "V5", "V7", "V6"], 3);
  const uniq = [...new Set(keys)].slice(0, 2);
  if (uniq.length < 2) uniq.push("V2");
  const items = uniq.map((k) => factorVariants[k]());
  return {
    prompt: para(`Calculate each limit algebraically. (Direct substitution gives ${$m("\\frac{0}{0}")} — simplify first.) If it doesn't exist, write <b>DNE</b>.`),
    parts: items.map((it) => P.num($m(it.t), it.a)),
    hint: "0/0 means a common factor is hiding. Factor (or expand, or use √x·√x = x), cancel, then substitute.",
    solution: items.map((it, i) => para(`<b>${"ab"[i]}.</b>`) + $M(it.s)).join("") + para(`<i>Notation tip:</i> keep writing ${$m("\\lim")} on every line until the step where you actually substitute.`),
  };
};

function divByPower(coefs, m) {
  const n = coefs.length - 1; let out = "";
  coefs.forEach((c, i) => {
    const k = n - i; if (c === 0) return;
    const neg = c < 0, a = Math.abs(c); let body;
    if (k > m) body = (a === 1 ? "" : a) + (k - m === 1 ? "x" : `x^{${k - m}}`);
    else if (k === m) body = String(a);
    else body = `\\frac{${a}}{${m - k === 1 ? "x" : `x^{${m - k}}`}}`;
    out += out === "" ? (neg ? "-" : "") + body : (neg ? " - " : " + ") + body;
  });
  return out;
}

GEN.infRational = () => {
  const cases = R.shuffle(["eq", "lt", "gt"]);
  const items = cases.map((cs) => {
    let n, m;
    if (cs === "eq") { n = m = R.int(1, 4); }
    if (cs === "lt") { m = R.int(2, 4); n = R.int(0, m - 1); }
    if (cs === "gt") { m = R.int(1, 3); n = m + R.int(1, 2); }
    const a = R.nz(-7, 7), b = R.nz(-7, 7), dir = R.sign();
    const num = [a], den = [b];
    for (let i = 0; i < n; i++) num.push(R.chance(0.45) ? 0 : R.int(-9, 9));
    for (let i = 0; i < m; i++) den.push(R.chance(0.45) ? 0 : R.int(-9, 9));
    const to = dir > 0 ? "\\infty" : "-\\infty";
    let ans;
    if (n === m) ans = q(a, b);
    else if (n < m) ans = q(0);
    else ans = Math.sign(a * b) * (dir < 0 && (n - m) % 2 === 1 ? -1 : 1) * Infinity;
    const t = `${T.lim(to)} \\frac{${T.poly(num)}}{${T.poly(den)}}`;
    const powTxt = m === 1 ? "x" : `x^{${m}}`;
    let concl;
    if (n === m) concl = `Every fraction term → 0, leaving ${$m(`\\frac{${a}}{${b}} = ${q(a, b).tex()}`)}.`;
    else if (n < m) concl = `The top → 0 while the bottom → ${b}, so the limit is ${$m("0")}.`;
    else concl = `The bottom → ${b}, but the top is dominated by ${$m(`${a}x^{${n - m}}`)}, which → ${$m(T.ans(Math.sign(a) * (dir < 0 && (n - m) % 2 === 1 ? -1 : 1) * Infinity))} as ${$m(`x \\to ${to}`)}; dividing by ${b} gives ${$m(T.ans(ans))}.`;
    return { t, ans, sol: `Divide every term by ${$m(powTxt)}, the highest power of ${$m("x")} in the denominator:` + $M(`${t} = ${T.lim(to)} \\frac{${divByPower(num, m)}}{${divByPower(den, m)}}`) + concl };
  });
  return {
    prompt: para(`Compute each limit algebraically. Use <code>inf</code> / <code>-inf</code> for unbounded results.`),
    parts: items.map((it) => P.num($m(it.t), it.ans)),
    hint: "Divide every term by the highest power of x in the DENOMINATOR, then use c/xᵖ → 0.",
    solution: items.map((it, i) => para(`<b>${"abc"[i]}.</b> ${it.sol}`)).join(""),
  };
};

GEN.pwLimit = () => {
  const s = R.pick([1, 2]);
  const t = s === 1 ? R.nz(-4, 4) : R.pick([-5, -3, -1, 1, 3, 5]);
  const c = q(-t, s), w = R.int(-5, 5);
  const num = [s, s * w + t, t * w];
  const leftL = c.add(w);
  const equal = R.chance(0.4);
  let m = R.nz(-3, 4); if (equal && s === 2 && m % 2 === 0) m += 1;
  if (m === 0) m = 1;
  let b = equal ? leftL.sub(c.mul(m)) : q(R.int(-6, 6));
  if (!equal && c.mul(m).add(b).eq(leftL)) b = b.add(2);
  const rightL = c.mul(m).add(b);
  const includeC = R.chance(0.5);
  const d = Math.ceil(c.val()) + R.int(2, 4), e = Math.floor(c.val()) - R.int(2, 3);
  const Lt = `\\dfrac{${T.poly(num)}}{${T.poly([s, t])}}`, Rt = T.poly([m, b]);
  const ftex = `f(x) = \\begin{cases} ${Lt} & x < ${c.tex()} \\\\ ${Rt} & x ${includeC ? "\\ge" : ">"} ${c.tex()} \\end{cases}`;
  const fc = includeC ? rightL : "DNE";
  const lim = limVal(leftL, rightL);
  return {
    prompt: para(`Let`) + $M(ftex) + para(`Find each limit or function value algebraically. Write <b>DNE</b> if it doesn't exist.`),
    parts: [
      P.num($m(`${T.lim(d)} f(x)`), q(m * d).add(b)),
      P.num($m(`${T.lim(e)} f(x)`), q(e + w)),
      P.num($m(`f\\left(${c.tex()}\\right)`), fc),
      P.num($m(`${T.lim(c.tex() + "^-")} f(x)`), leftL),
      P.num($m(`${T.lim(c.tex() + "^+")} f(x)`), rightL),
      P.num($m(`${T.lim(c.tex())} f(x)`), lim),
    ],
    hint: "Decide which piece each x-value lives on first. The top piece simplifies by factoring.",
    solution:
      para(`For ${$m(`x < ${c.tex()}`)}, factor the top: ${$m(`\\frac{${T.lin(s, t)}${T.lin(1, w)}}{${T.poly([s, t])}} = ${T.poly([1, w])}`)} (valid since ${$m(`x \\ne ${c.tex()}`)} there).`) +
      para(`<b>a.</b> ${d} > ${c.tex()} → bottom piece: ${$m(`${m}(${d}) ${b.n < 0 ? "-" : "+"} ${b.abs().tex()} = ${q(m * d).add(b).tex()}`)}.`) +
      para(`<b>b.</b> ${e} < ${c.tex()} → top piece, simplified: ${$m(`${e} ${w < 0 ? "-" : "+"} ${Math.abs(w)} = ${e + w}`)}.`) +
      para(`<b>c.</b> ${includeC ? `The bottom piece includes ${$m(`x = ${c.tex()}`)} (≥), so ${$m(`f(${c.tex()}) = ${m}\\left(${c.tex()}\\right) ${b.n < 0 ? "-" : "+"} ${b.abs().tex()} = ${rightL.tex()}`)}.` : `Neither piece includes ${$m(`x = ${c.tex()}`)}, so ${$m(`f(${c.tex()})`)} is undefined → DNE.`}`) +
      para(`<b>d.</b> Left: ${$m(`${T.lim(c.tex() + "^-")} (${T.poly([1, w])}) = ${leftL.tex()}`)}.`) +
      para(`<b>e.</b> Right: ${$m(`${T.lim(c.tex() + "^+")} (${Rt}) = ${rightL.tex()}`)}.`) +
      para(`<b>f.</b> ${lim === "DNE" ? `${leftL.tex() === rightL.tex() ? "" : `${$m(leftL.tex())} ≠ ${$m(rightL.tex())}`}, so the limit DNE.` : `Both sides equal ${$m(leftL.tex())}, so the limit is ${$m(leftL.tex())}.`}`),
  };
};

const CONT_CHOICES = [
  "Yes — f(a) exists, the limit exists, and they are equal",
  "No — the one-sided limits differ, so the limit does not exist",
  "No — the limit exists but does not equal f(a)",
  "No — f(a) is undefined",
];

GEN.continuity = () => {
  const v = R.pick(["A", "A", "B", "D"]);
  if (v === "A") {
    const c = R.int(-2, 3), co = [R.pick([1, -1, -1, 2, -2]), R.int(-4, 4), R.int(-6, 8)], low = R.chance(0.5);
    const left = evalPoly(co, c), m = R.nz(-4, 4), equal = R.chance(0.5);
    const k = equal ? left.sub(m * c) : left.sub(m * c).add(R.pick([-3, -2, 2, 3]));
    const right = q(m * c).add(k);
    const Lt = T.poly(co, "x", low), Rt = T.poly([m, k]);
    const cont = left.eq(right);
    const choices = CONT_CHOICES.map((s) => s.replace("f(a)", `f(${c})`));
    const subst = co.map((cf, i) => ({ cf, deg: 2 - i })).filter((o) => o.cf !== 0);
    const substTex = (low ? subst.reverse() : subst).map((o, i) => {
      const neg = o.cf < 0, a = Math.abs(o.cf), body = o.deg === 0 ? `${a}` : `${a === 1 ? "" : a}${T.par(c)}${o.deg === 2 ? "^2" : ""}`;
      return (i === 0 ? (neg ? "-" : "") : neg ? " - " : " + ") + body;
    }).join("");
    return {
      prompt: para(`Let`) + $M(`f(x) = \\begin{cases} ${Lt} & x \\le ${c} \\\\ ${Rt} & x > ${c} \\end{cases}`) + para(`Determine whether ${$m("f(x)")} is continuous at ${$m(`x = ${c}`)}.`),
      parts: [
        P.num($m(`f(${c})`), left),
        P.num($m(`${T.lim(c + "^-")} f(x)`), left),
        P.num($m(`${T.lim(c + "^+")} f(x)`), right),
        P.num($m(`${T.lim(c)} f(x)`), limVal(left, right)),
        P.mcFixed(`Is ${$m("f")} continuous at ${$m(`x = ${c}`)}?`, choices, cont ? 0 : 1),
      ],
      hint: `Watch the signs: with x = ${c}, a term like -x² is -(${c})² = ${-(c * c)}. Substitute into each term separately.`,
      solution:
        para(`<b>1. ${$m(`f(${c})`)}:</b> ${c} satisfies ${$m(`x \\le ${c}`)}, so use the top piece: ${$m(`${substTex} = ${left.tex()}`)}.`) +
        para(`<b>2. Limit:</b> left uses the top piece → ${$m(left.tex())}; right uses ${$m(Rt)} → ${$m(`${m}${T.par(c)} ${k.n < 0 ? "-" : "+"} ${k.abs().tex()} = ${right.tex()}`)}.`) +
        para(cont ? `<b>3.</b> Both one-sided limits are ${$m(left.tex())}, so the limit exists and equals ${$m(`f(${c})`)}. <b>Continuous.</b>` : `<b>3.</b> ${$m(left.tex())} ≠ ${$m(right.tex())}, so ${$m(`${T.lim(c)} f(x)`)} DNE. <b>Not continuous</b> — a jump discontinuity.`),
    };
  }
  if (v === "B") {
    const r = R.nz(-4, 4); let s; do { s = R.int(-5, 5); } while (s === r);
    const L = r - s, equal = R.chance(0.45), k = equal ? L : L + R.pick([-3, -2, -1, 1, 2, 3]);
    const choices = CONT_CHOICES.map((x) => x.replace("f(a)", `f(${r})`));
    return {
      prompt: para(`Is ${$m("f(x)")} continuous at ${$m(`x = ${r}`)}?`) + $M(`f(x) = \\begin{cases} \\dfrac{${T.poly([1, -(r + s), r * s])}}{${T.fac(r).slice(1, -1)}} & x \\ne ${r} \\\\ ${k} & x = ${r} \\end{cases}`),
      parts: [
        P.num($m(`f(${r})`), q(k)),
        P.num($m(`${T.lim(r)} f(x)`), q(L)),
        P.mcFixed(`Is ${$m("f")} continuous at ${$m(`x = ${r}`)}?`, choices, equal ? 0 : 2),
      ],
      hint: "The bottom piece tells you f(a) directly. For the limit, factor the top piece and cancel.",
      solution:
        para(`<b>1.</b> ${$m(`f(${r}) = ${k}`)} (given directly by the second piece).`) +
        para(`<b>2.</b> ${$m(`${T.lim(r)} \\frac{${T.fac(r)}${T.fac(s)}}{${T.fac(r)}} = ${T.lim(r)} ${s === 0 ? "x" : T.fac(s)} = ${L}`)}.`) +
        para(equal ? `<b>3.</b> ${L} = ${k}. All three conditions hold → <b>continuous</b>.` : `<b>3.</b> The limit is ${L} but ${$m(`f(${r}) = ${k}`)}. They're not equal → <b>not continuous</b> (a removable discontinuity).`),
    };
  }
  // D: find the constant
  const c = R.pick([1, 2, 3, -1, -2]), a = R.int(-4, 4), b = R.int(-6, 6);
  const leftV = c * c + a * c, k = q(leftV - b, c);
  return {
    prompt: para(`Find the value of ${$m("k")} that makes ${$m("f")} continuous at ${$m(`x = ${c}`)}.`) + $M(`f(x) = \\begin{cases} ${T.poly([1, a, 0])} & x < ${c} \\\\ kx ${b < 0 ? "-" : "+"} ${Math.abs(b)} & x \\ge ${c} \\end{cases}`),
    parts: [
      P.num($m(`${T.lim(c + "^-")} f(x)`), q(leftV)),
      P.num($m("k ="), k),
    ],
    hint: "Continuity needs left limit = right limit = f(c). Set the two pieces equal at x = c and solve for k.",
    solution:
      para(`Left: ${$m(`${T.par(c)}^2 ${a < 0 ? "-" : "+"} ${Math.abs(a)}${T.par(c)} = ${leftV}`)}. Right (and ${$m(`f(${c})`)}): ${$m(`k${T.par(c)} ${b < 0 ? "-" : "+"} ${Math.abs(b)}`)}.`) +
      $M(`${c}k ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${leftV} \\;\\Rightarrow\\; k = \\frac{${leftV - b}}{${c}} = ${k.tex()}`),
  };
};

const DISC = ["Continuous", "Removable discontinuity", "Jump discontinuity", "Infinite discontinuity"];
GEN.discType = () => {
  if (R.chance(0.45)) {
    const G = Graph.randomPiecewise(R.shuffle(["jump", "hole", "asym", "cont"]));
    const idx = { continuous: 0, removable: 1, jump: 2, infinite: 3 };
    return {
      prompt: para(`Classify the behavior of ${$m("f")} at each labeled ${$m("x")}-value.`),
      figure: G.svg,
      parts: G.inner.map((n) => P.mcFixed(`At ${$m(`x = ${n.x}`)}`, DISC, idx[n.type])),
      hint: "Removable = a hole (the limit exists). Jump = the two sides land at different heights. Infinite = a vertical asymptote.",
      solution: G.inner.map((n) => para(`<b>${$m(`x = ${n.x}`)}:</b> ${{
        continuous: `No break, and the dot is on the curve → continuous.`,
        removable: `Both sides approach ${n.left}, but ${n.value === "DNE" ? "there is no point there" : `the filled dot is at ${n.value}`} → removable (the limit exists, it just doesn't match f).`,
        jump: `Left approaches ${n.left}, right approaches ${n.right} → jump.`,
        infinite: `The graph shoots off along a vertical asymptote → infinite.`,
      }[n.type]}`)).join(""),
    };
  }
  const pool = [
    () => { const r = R.nz(-5, 5); return { t: `f(x) = \\frac{x^2 - ${r * r}}{${T.fac(r).slice(1, -1)}} \\text{ at } x = ${r}`, a: 1, s: `0/0 at ${r}, but it cancels to ${$m(T.fac(-r).slice(1, -1))}, so the limit exists (${2 * r}) while ${$m(`f(${r})`)} is undefined → removable.` }; },
    () => { const c = R.nz(-5, 5); let s; do { s = R.int(-5, 5); } while (s === -c); return { t: `f(x) = \\frac{${T.poly([1, s])}}{${T.fac(c).slice(1, -1)}} \\text{ at } x = ${c}`, a: 3, s: `The bottom is 0 at ${c} but the top is ${c + s} ≠ 0 → vertical asymptote → infinite.` }; },
    () => { const c = R.int(-3, 3), p = R.int(-4, 4), j = R.pick([-3, -2, 2, 3]); return { t: `f(x) = \\begin{cases} ${T.poly([1, p])} & x < ${c} \\\\ ${T.poly([1, p + j])} & x \\ge ${c} \\end{cases} \\text{ at } x = ${c}`, a: 2, s: `Left → ${c + p}, right → ${c + p + j}. Different finite values → jump.` }; },
    () => { const a = R.int(-4, 4), co = [R.nz(-3, 3), R.int(-5, 5), R.int(-5, 5)]; return { t: `f(x) = ${T.poly(co)} \\text{ at } x = ${a}`, a: 0, s: `Polynomials are continuous everywhere.` }; },
    () => { const c = R.nz(-3, 3); let d; do { d = R.nz(-4, 4); } while (d === c); return { t: `f(x) = \\frac{${T.fac(c).slice(1, -1)}}{${T.poly([1, -(c + d), c * d])}} \\text{ at } x = ${d}`, a: 3, s: `Factor: ${$m(`\\frac{${T.fac(c)}}{${T.fac(c)}${T.fac(d)}}`)}. The ${$m(T.fac(d))} factor does NOT cancel, so ${$m(`x = ${d}`)} is a vertical asymptote → infinite.` }; },
    () => { const c = R.nz(-3, 3); let d; do { d = R.nz(-4, 4); } while (d === c); return { t: `f(x) = \\frac{${T.fac(c).slice(1, -1)}}{${T.poly([1, -(c + d), c * d])}} \\text{ at } x = ${c}`, a: 1, s: `Factor: ${$m(`\\frac{${T.fac(c)}}{${T.fac(c)}${T.fac(d)}}`)}. The ${$m(T.fac(c))} cancels, leaving ${$m(`\\frac{1}{${T.fac(d).slice(1, -1)}} \\to ${q(1, c - d).tex()}`)} → removable.` }; },
  ];
  const items = R.sample(pool, 3).map((f) => f());
  return {
    prompt: para(`Classify each function at the given ${$m("x")}-value.`),
    parts: items.map((it) => P.mcFixed($m(it.t), DISC, it.a)),
    hint: "Factor first. A factor that cancels means a hole (removable); one that stays in the bottom means an asymptote (infinite).",
    solution: items.map((it, i) => para(`<b>${"abc"[i]}.</b> ${it.s}`)).join(""),
  };
};
