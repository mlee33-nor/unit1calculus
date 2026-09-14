// ================= core: random, rationals, TeX helpers, parser, answer checking =================
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  nz: (a, b) => { let v; do { v = R.int(a, b); } while (v === 0); return v; },
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  sign: () => (Math.random() < 0.5 ? -1 : 1),
  chance: (p) => Math.random() < p,
  sample: (arr, n) => R.shuffle(arr).slice(0, n),
};

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }

// Exact rational numbers
class Q {
  constructor(n, d = 1) {
    if (d === 0) throw new Error("division by zero");
    if (!Number.isInteger(n) || !Number.isInteger(d)) { // allow decimals like 0.05 by scaling
      let s = 1; while ((!Number.isInteger(n * s) || !Number.isInteger(d * s)) && s < 1e9) s *= 10;
      n = Math.round(n * s); d = Math.round(d * s);
    }
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); this.n = n / g; this.d = d / g;
  }
  static of(x) { return x instanceof Q ? x : new Q(x, 1); }
  add(o) { o = Q.of(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Q.of(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Q.of(o); return new Q(this.n * o.n, this.d * o.d); }
  div(o) { o = Q.of(o); return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  abs() { return new Q(Math.abs(this.n), this.d); }
  pow(k) { let r = new Q(1); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
  isZero() { return this.n === 0; }
  isInt() { return this.d === 1; }
  eq(o) { o = Q.of(o); return this.n === o.n && this.d === o.d; }
  val() { return this.n / this.d; }
  tex() { return this.d === 1 ? String(this.n) : (this.n < 0 ? "-" : "") + `\\frac{${Math.abs(this.n)}}{${this.d}}`; }
  txt() { return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`; }
}
const q = (n, d = 1) => new Q(n, d);

// ---------- TeX builders ----------
const T = {
  // coefficients high -> low degree
  poly(coefs, v = "x", lowFirst = false) {
    const n = coefs.length - 1;
    let terms = coefs.map((c, i) => ({ c: Q.of(c), deg: n - i })).filter((t) => !t.c.isZero());
    if (lowFirst) terms = terms.reverse();
    if (!terms.length) return "0";
    return terms.map((t, i) => {
      const neg = t.c.n < 0, a = neg ? t.c.neg() : t.c;
      const vp = t.deg === 0 ? "" : t.deg === 1 ? v : `${v}^{${t.deg}}`;
      let coef = a.tex();
      if (t.deg > 0 && a.eq(1)) coef = "";
      const body = coef + vp;
      if (i === 0) return (neg ? "-" : "") + body;
      return (neg ? " - " : " + ") + body;
    }).join("");
  },
  // (x - r) style factor; r may be Q
  fac(r, v = "x") { r = Q.of(r); if (r.isZero()) return v; return r.n > 0 ? `(${v} - ${r.tex()})` : `(${v} + ${r.neg().tex()})`; },
  // (p x + q)
  lin(p, qq, v = "x") { return `(${T.poly([p, qq], v)})`; },
  // " + n" or " - n"
  sgn(n) { n = Q.of(n); return n.n < 0 ? ` - ${n.neg().tex()}` : ` + ${n.tex()}`; },
  // wrap negatives in parentheses for substitution displays
  par(n) { n = Q.of(n); return `(${n.tex()})`; },
  line(m, b) { return `y = ${T.poly([m, b])}`; },
  pointSlope(m, x0, y0) {
    const ys = Q.of(y0).isZero() ? "y" : `y ${Q.of(y0).n < 0 ? "+" : "-"} ${Q.of(y0).abs().tex()}`;
    const mt = Q.of(m).eq(1) ? "" : Q.of(m).eq(-1) ? "-" : Q.of(m).tex();
    const xs = Q.of(x0).isZero() ? "x" : `(x ${Q.of(x0).n < 0 ? "+" : "-"} ${Q.of(x0).abs().tex()})`;
    return `${ys} = ${mt}${xs}`;
  },
  ans(a) { // TeX for an answer value
    if (a === "DNE") return "\\text{DNE}";
    if (a === Infinity) return "\\infty";
    if (a === -Infinity) return "-\\infty";
    if (a instanceof Q) return a.tex();
    return String(+a.toFixed(6));
  },
  lim(to, v = "x") { return `\\lim_{${v} \\to ${to}}`; },
};
const $m = (s) => `\\(${s}\\)`;      // inline math
const $M = (s) => `\\[${s}\\]`;      // display math

function fmtDec(x, d = 6) { const s = x.toFixed(d); return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s; }
function evalPoly(coefs, x) { x = Q.of(x); return coefs.reduce((acc, c) => acc.mul(x).add(Q.of(c)), new Q(0)); }

// ---------- Parser for typed answers ----------
const Parser = (() => {
  const WORDS = ["sqrt", "infinity", "inf", "oo", "ln", "pi", "dne", "x", "h", "t", "e", "y"];
  function tokenize(s) {
    s = s.replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[·×]/g, "*").replace(/÷/g, "/")
      .replace(/√/g, "sqrt").replace(/∞/g, "inf").replace(/\*\*/g, "^").replace(/[\[{]/g, "(").replace(/[\]}]/g, ")");
    const out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const num = s.slice(i, j);
        if ((num.match(/\./g) || []).length > 1 || num === ".") throw `"${num}" isn't a number`;
        out.push({ k: "n", v: parseFloat(num), dec: num.includes(".") }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        let w = s.slice(i, j).toLowerCase();
        while (w.length) {
          const m = WORDS.find((k) => w.startsWith(k));
          if (!m) throw `"${s.slice(i, j)}" isn't something I can read — use x, h, t, e, sqrt( ), ln( )`;
          out.push({ k: "id", v: m === "infinity" || m === "oo" ? "inf" : m });
          w = w.slice(m.length);
        }
        i = j; continue;
      }
      if ("+-*/^()".includes(c)) { out.push({ k: "op", v: c }); i++; continue; }
      throw `Unexpected character "${c}"`;
    }
    return out;
  }
  function parse(str) {
    const t = tokenize(str); let p = 0;
    if (!t.length) throw "Type an answer first";
    const peek = () => t[p];
    const eat = (v) => { if (t[p] && t[p].k === "op" && t[p].v === v) { p++; return true; } return false; };
    const startsAtom = (tk) => tk && (tk.k === "n" || tk.k === "id" || tk.v === "(");
    function expr() { let n = term(); while (peek() && peek().k === "op" && (peek().v === "+" || peek().v === "-")) { const o = t[p++].v; n = { t: o, a: n, b: term() }; } return n; }
    function term() {
      let n = unary();
      for (;;) {
        const tk = peek();
        if (tk && tk.k === "op" && (tk.v === "*" || tk.v === "/")) { p++; n = { t: tk.v, a: n, b: unary() }; }
        else if (startsAtom(tk)) { n = { t: "*", a: n, b: power() }; }
        else break;
      }
      return n;
    }
    function unary() { if (eat("-")) return { t: "neg", a: unary() }; if (eat("+")) return unary(); return power(); }
    function power() { const b = atom(); if (eat("^")) return { t: "^", a: b, b: unary() }; return b; }
    function atom() {
      const tk = t[p];
      if (!tk) throw "The expression ends too early";
      if (tk.k === "n") { p++; return { t: "n", v: tk.v, dec: tk.dec }; }
      if (tk.v === "(") { p++; const e = expr(); if (!eat(")")) throw "Missing a closing parenthesis"; return { t: "()", a: e }; }
      if (tk.k === "id") {
        p++;
        if (tk.v === "sqrt" || tk.v === "ln") { if (!peek()) throw `${tk.v} needs something after it`; return { t: "fn", f: tk.v, a: power() }; }
        return { t: "id", v: tk.v };
      }
      throw `Unexpected "${tk.v}"`;
    }
    const n = expr();
    if (p < t.length) throw `Unexpected "${t[p].v}"`;
    return n;
  }
  function ev(n, env) {
    switch (n.t) {
      case "n": return n.v;
      case "()": return ev(n.a, env);
      case "id":
        if (n.v === "e") return Math.E;
        if (n.v === "pi") return Math.PI;
        if (n.v === "inf") return Infinity;
        if (n.v === "dne") return NaN;
        if (!(n.v in env)) throw { unknownVar: n.v };
        return env[n.v];
      case "+": return ev(n.a, env) + ev(n.b, env);
      case "-": return ev(n.a, env) - ev(n.b, env);
      case "*": return ev(n.a, env) * ev(n.b, env);
      case "/": return ev(n.a, env) / ev(n.b, env);
      case "^": return Math.pow(ev(n.a, env), ev(n.b, env));
      case "neg": return -ev(n.a, env);
      case "fn": { const v = ev(n.a, env); return n.f === "sqrt" ? Math.sqrt(v) : Math.log(v); }
    }
  }
  const strip = (n) => (n.t === "()" ? n.a : n);
  function tex(n) {
    switch (n.t) {
      case "n": return String(n.v);
      case "()": return `\\left(${tex(n.a)}\\right)`;
      case "id": return { inf: "\\infty", pi: "\\pi", dne: "\\text{DNE}" }[n.v] || n.v;
      case "+": return `${tex(n.a)} + ${tex(n.b)}`;
      case "-": return `${tex(n.a)} - ${tex(n.b)}`;
      case "*": { const B = tex(n.b); const dot = /^[0-9.\-]/.test(B); return tex(n.a) + (dot ? " \\cdot " : " ") + B; }
      case "/": return `\\frac{${tex(strip(n.a))}}{${tex(strip(n.b))}}`;
      case "^": return `{${tex(n.a)}}^{${tex(strip(n.b))}}`;
      case "neg": return `-${tex(n.a)}`;
      case "fn": return n.f === "sqrt" ? `\\sqrt{${tex(strip(n.a))}}` : `\\ln\\left(${tex(strip(n.a))}\\right)`;
    }
  }
  function hasDecimal(n) { if (!n) return false; if (n.t === "n") return n.dec; return hasDecimal(n.a) || hasDecimal(n.b); }
  function usesVar(n, v) { if (!n) return false; if (n.t === "id") return n.v === v; return usesVar(n.a, v) || usesVar(n.b, v); }
  function varInDenominator(n, v) { if (!n) return false; if (n.t === "/" && usesVar(n.b, v)) return true; return varInDenominator(n.a, v) || varInDenominator(n.b, v); }
  return { parse, ev, tex, hasDecimal, usesVar, varInDenominator };
})();

// ---------- Answer checking ----------
function special(raw) {
  const s = raw.replace(/\s+/g, "").toLowerCase().replace(/[−–]/g, "-");
  if (/^(dne|doesnotexist|undefined|und|none|doesn'texist)$/.test(s)) return "DNE";
  if (/^\+?(inf|infinity|∞|oo)$/.test(s)) return Infinity;
  if (/^-(inf|infinity|∞|oo)$/.test(s)) return -Infinity;
  return null;
}
const closeTo = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b));
const rhs = (raw) => { const k = raw.lastIndexOf("="); return k >= 0 ? raw.slice(k + 1) : raw; };

// result: {ok:bool} | {err:string} | {empty:true}; may carry note
const Check = {
  num(raw, part) {
    if (!raw.trim()) return { empty: true };
    const A = part.ans instanceof Q ? part.ans.val() : part.ans;
    const sp = special(raw);
    if (sp !== null) {
      if (sp === A) return { ok: true };
      if (sp === "DNE" && part.dneOk && (A === Infinity || A === -Infinity))
        return { ok: true, note: `Accepted. More precisely the outputs grow without bound, so we write ${$m(T.ans(A))} (the limit still does not exist as a finite number).` };
      return { ok: false };
    }
    let ast; try { ast = Parser.parse(rhs(raw)); } catch (e) { return { err: String(e) }; }
    let v; try { v = Parser.ev(ast, {}); } catch (e) { return { err: e.unknownVar ? `This answer is a number — "${e.unknownVar}" doesn't belong here.` : String(e) }; }
    if (A === "DNE" || !isFinite(A)) return { ok: false };
    if (!isFinite(v)) return { ok: false };
    const tol = Parser.hasDecimal(ast) ? (part.approx ?? 0.0051) : (part.approx ?? 0);
    const ok = tol ? Math.abs(v - A) <= tol + 1e-9 : closeTo(v, A);
    return { ok, note: ok && tol && !closeTo(v, A) ? `Accepted as a rounded value. Exact: ${$m(T.ans(part.ans))}.` : undefined };
  },
  expr(raw, part) {
    if (!raw.trim()) return { empty: true };
    let ast; try { ast = Parser.parse(rhs(raw)); } catch (e) { return { err: String(e) }; }
    const vars = part.vars || ["x"];
    if (part.forbid) for (const f of part.forbid) if (Parser.usesVar(ast, f.v)) return { ok: false, err: f.msg };
    let good = 0;
    for (let tries = 0; tries < 60 && good < 6; tries++) {
      const env = {};
      vars.forEach((v) => { env[v] = (part.positive ? 1 : R.sign()) * (0.35 + Math.random() * 3.1); });
      if (part.avoid && part.avoid(env)) continue;
      const want = part.fn(env);
      if (!isFinite(want)) continue;
      let got;
      try { got = Parser.ev(ast, env); } catch (e) { return { err: e.unknownVar ? `Use only ${vars.join(" and ")} as variables here ("${e.unknownVar}" isn't one).` : String(e) }; }
      if (!closeTo(got, want)) return { ok: false };
      good++;
    }
    if (part.simplifyH && Parser.varInDenominator(ast, "h")) return { ok: false, err: "That's equivalent, but not simplified: the h in the denominator should cancel out." };
    return { ok: good >= 3 };
  },
  line(raw, part) { // accepts slope-intercept or point-slope, any equivalent linear equation
    if (!raw.trim()) return { empty: true };
    const sides = raw.split("=");
    if (sides.length > 2) return { err: "Use a single = sign" };
    let L, Rt;
    try { if (sides.length === 1) { L = Parser.parse("y"); Rt = Parser.parse(sides[0]); } else { L = Parser.parse(sides[0]); Rt = Parser.parse(sides[1]); } }
    catch (e) { return { err: String(e) }; }
    if (sides.length === 1 && !Parser.usesVar(Rt, "x")) { /* constant line y = c is fine */ }
    const m = Q.of(part.m).val(), b = Q.of(part.b).val();
    const g = (x, y) => Parser.ev(L, { x, y }) - Parser.ev(Rt, { x, y });
    try {
      for (const x of [-2.7, -1, 0.4, 1.9, 3.3]) {
        const y = m * x + b;
        if (Math.abs(g(x, y)) > 1e-6 * Math.max(1, Math.abs(y))) return { ok: false };
        if (Math.abs(g(x, y + 1)) < 1e-6) return { ok: false };
      }
    } catch (e) { return { err: e.unknownVar ? `Write the line using x and y only.` : String(e) }; }
    return { ok: true };
  },
  preview(raw, type) {
    try {
      if (special(raw) !== null) return T.ans(special(raw));
      if (type === "line") { const s = raw.split("="); return s.length === 2 ? `${Parser.tex(Parser.parse(s[0]))} = ${Parser.tex(Parser.parse(s[1]))}` : `y = ${Parser.tex(Parser.parse(s[0]))}`; }
      const k = raw.lastIndexOf("=");
      return (k >= 0 ? raw.slice(0, k).replace(/'/g, "'") + " = " : "") + Parser.tex(Parser.parse(rhs(raw)));
    } catch (e) { return null; }
  },
};

// ---------- part constructors (keeps generators terse) ----------
const P = {
  num: (label, ans, extra = {}) => ({ type: "num", label, ans, ...extra }),
  expr: (label, fn, display, extra = {}) => ({ type: "expr", label, fn, display, ...extra }),
  line: (label, m, b, extra = {}) => ({ type: "line", label, m, b, display: T.line(Q.of(m), Q.of(b)), ...extra }),
  mc: (label, choices, correctIndex, extra = {}) => {
    const order = R.shuffle(choices.map((c, i) => i));
    return { type: "mc", label, choices: order.map((i) => choices[i]), ans: order.indexOf(correctIndex), ...extra };
  },
  mcFixed: (label, choices, correctIndex, extra = {}) => ({ type: "mc", label, choices, ans: correctIndex, ...extra }),
  tf: (label, truth, extra = {}) => ({ type: "mc", label, choices: ["True", "False"], ans: truth ? 0 : 1, ...extra }),
};
const limVal = (L, Rr) => (L === Infinity || L === -Infinity || Rr === Infinity || Rr === -Infinity)
  ? (L === Rr ? L : "DNE")
  : (Q.of(L).eq(Q.of(Rr)) ? L : "DNE");
