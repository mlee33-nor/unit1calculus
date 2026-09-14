// Sanity harness: run every generator many times; check consistency of displayed vs graded answers.
const fs = require("fs"), vm = require("vm"), path = require("path");
const dir = __dirname;
const ctx = { console, Math, window: {} };
vm.createContext(ctx);
const src = ["core.js", "graph.js", "gen1.js", "gen2.js", "gen3.js", "gen4.js", "concepts.js"].map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join("\n;\n") +
  "\n;this.GEN=GEN;this.Check=Check;this.T=T;this.Q=Q;this.Parser=Parser;";
vm.runInContext(src, ctx);
const { GEN, Check, T, Q, Parser } = ctx;

// crude TeX -> typed-input converter for simple answer displays
function tex2in(s) {
  let prev;
  s = s.replace(/\\left|\\right|\\,|\\;/g, "").replace(/\\cdot/g, "*");
  do {
    prev = s;
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))").replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)").replace(/\^\{([^{}]*)\}/g, "^($1)");
    if (s === prev && !s.includes("\\frac")) s = s.replace(/\{([^{}]*)\}/g, "($1)"); // plain groups only once no \frac is waiting on its braces
  } while (s !== prev);
  return s.replace(/\\infty/g, "inf").replace(/\\text\(DNE\)/g, "DNE");
}

const bad = [];
let count = 0, parts = 0;
for (const key of Object.keys(GEN)) {
  for (let i = 0; i < 400; i++) {
    let pr;
    try { pr = GEN[key](); } catch (e) { bad.push(`${key}: THREW ${e && e.stack ? e.stack.split("\n").slice(0, 2).join(" | ") : e}`); break; }
    count++;
    const blob = pr.prompt + (pr.solution || "") + (pr.figure || "") + pr.parts.map((p) => p.label + (p.choices || []).join("")).join("");
    const blobChk = blob.replace(/(is|which is|are) undefined/g, "");
    if (/undefined|NaN|\[object|Infinity/.test(blobChk)) { bad.push(`${key}: text contains undefined/NaN: …${blobChk.match(/.{0,60}(undefined|NaN|\[object|Infinity).{0,40}/)[0]}`); }
    for (const p of pr.parts) {
      parts++;
      if (p.type === "num") {
        const A = p.ans;
        if (!(A instanceof Q || A === "DNE" || A === Infinity || A === -Infinity || (typeof A === "number" && isFinite(A)))) { bad.push(`${key}: bad num answer ${A} for ${p.label}`); continue; }
        const typed = A instanceof Q ? A.txt() : A === "DNE" ? "DNE" : A === Infinity ? "inf" : A === -Infinity ? "-inf" : String(A);
        const r = Check.num(typed, p);
        if (!r.ok) bad.push(`${key}: own answer "${typed}" rejected for ${p.label} ${JSON.stringify(r)}`);
      } else if (p.type === "expr") {
        const typed = tex2in(p.display);
        const r = Check.expr(typed, p);
        if (!r.ok) bad.push(`${key}: expr display "${p.display}" -> "${typed}" rejected ${JSON.stringify(r)}`);
      } else if (p.type === "line") {
        const typed = tex2in(p.display);
        const r = Check.line(typed, p);
        if (!r.ok) bad.push(`${key}: line display "${p.display}" -> "${typed}" rejected ${JSON.stringify(r)}`);
      } else if (p.type === "mc") {
        if (!(p.ans >= 0 && p.ans < p.choices.length)) bad.push(`${key}: mc ans out of range`);
        if (new Set(p.choices).size !== p.choices.length) bad.push(`${key}: duplicate mc choices ${p.choices.join(" / ").slice(0, 120)}`);
      }
    }
  }
}
// parser spot checks
const pc = [
  ["num", "1/3", { ans: new Q(1, 3) }, true], ["num", "0.33", { ans: new Q(1, 3) }, true], ["num", "0.3", { ans: new Q(1, 3) }, false],
  ["num", "-inf", { ans: -Infinity }, true], ["num", "undefined", { ans: "DNE" }, true], ["num", "DNE", { ans: Infinity, dneOk: true }, true],
  ["expr", "2x+h-3", { fn: (e) => 2 * e.x + e.h - 3, vars: ["x", "h"] }, true], ["expr", "-4/x^2", { fn: (e) => -4 / (e.x * e.x) }, true],
  ["expr", "1/(2sqrt(x))", { fn: (e) => 1 / (2 * Math.sqrt(e.x)), positive: true }, true], ["expr", "f'(x)=6x-2", { fn: (e) => 6 * e.x - 2 }, true],
  ["expr", "((x+h)^2-x^2)/h", { fn: (e) => 2 * e.x + e.h, vars: ["x", "h"], simplifyH: true }, false],
  ["line", "y-15=-8(x+3)", { m: -8, b: -9 }, true], ["line", "y=-8x-9", { m: -8, b: -9 }, true], ["line", "-8x-9", { m: -8, b: -9 }, true], ["line", "y=-8x+9", { m: -8, b: -9 }, false],
];
for (const [type, input, part, want] of pc) { const r = Check[type](input, part); if (!!r.ok !== want) bad.push(`parser: ${type} "${input}" expected ${want} got ${JSON.stringify(r)}`); }
console.log(`problems generated: ${count}, parts checked: ${parts}`);
const uniq = [...new Set(bad)];
console.log(uniq.length ? uniq.slice(0, 40).join("\n") : "ALL CHECKS PASSED");
