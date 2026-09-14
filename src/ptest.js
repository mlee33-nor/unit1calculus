// Checks for the Pearson-format generators: own answers pass the strict grader, common mistakes fail.
const fs = require("fs"), vm = require("vm"), path = require("path");
const ctx = { console, window: {}, document: {} };
vm.createContext(ctx);
const files = ["core.js", "graph.js", "gen1.js", "gen2.js", "gen3.js", "gen4.js", "concepts.js", "mock.js", "pearson-gen.js", "pearson-gen2.js", "tables.js"];
const src = files.map((f) => fs.readFileSync(path.join(__dirname, f), "utf8")).join("\n;\n") +
  "\nfunction makeProblem(id){for(let i=0;i<6;i++){try{return GEN[id]()}catch(e){}}throw new Error(id)}" +
  "\n;this.PGEN=PGEN;this.PCheck=PCheck;this.Check=Check;this.Q=Q;this.withSeed=withSeed;this.PTESTS=PTESTS;this.PTEST_BLUEPRINT=PTEST_BLUEPRINT;this.PTOPIC_BY_ID=PTOPIC_BY_ID;this.pAnswerText=pAnswerText;this.normUnits=normUnits;";
vm.runInContext(src, ctx);
const { PGEN, PCheck, Check, Q, withSeed, PTESTS, PTEST_BLUEPRINT, PTOPIC_BY_ID, pAnswerText, normUnits } = ctx;

function tex2in(s) {
  let prev;
  s = s.replace(/\\left|\\right|\\,|\\;/g, "").replace(/\\cdot/g, "*");
  do {
    prev = s;
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))").replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)").replace(/\^\{([^{}]*)\}/g, "^($1)");
    if (s === prev && !s.includes("\\frac")) s = s.replace(/\{([^{}]*)\}/g, "($1)");
  } while (s !== prev);
  return s.replace(/\\infty/g, "inf");
}
const typed = (a) => (a instanceof Q ? a.txt() : a === Infinity ? "inf" : a === -Infinity ? "-inf" : String(a));

const bad = [];
let n = 0;
for (const key of Object.keys(PGEN)) {
  if (!PTOPIC_BY_ID[key]) bad.push(`${key}: not listed in PTOPICS`);
  for (let i = 0; i < 300; i++) {
    let pr;
    try { pr = PGEN[key](); } catch (e) { bad.push(`${key}: THREW ${String(e && e.stack || e).split("\n").slice(0, 2).join(" | ")}`); break; }
    n++;
    const blob = (pr.prompt + pr.solution + pr.parts.map((p) => (p.label || "") + (p.prefix || "") + (p.choices || []).join("") + pAnswerText(p)).join("")).replace(/(is|which is|are)( still)? undefined/g, "");
    if (/undefined|NaN|\[object|Infinity/.test(blob)) bad.push(`${key}: bad text …${blob.match(/.{0,50}(undefined|NaN|\[object|Infinity).{0,30}/)[0]}`);
    if (!pr.parts.length || !pr.solution) bad.push(`${key}: missing parts/solution`);
    for (const p of pr.parts) {
      let r;
      if (p.type === "cf") {
        const none = p.ans === "DNE" || p.ans === "NONE";
        r = PCheck.cf(none ? { choice: "B", text: "" } : { choice: "A", text: p.list ? p.ans.map(typed).join(", ") : typed(p.ans) }, p);
        if (!r.ok) bad.push(`${key}: own cf answer rejected ${JSON.stringify(r)} ans=${typed(p.ans)}`);
        const wrong = PCheck.cf(none ? { choice: "A", text: "3" } : { choice: "B", text: "" }, p);
        if (wrong.ok) bad.push(`${key}: wrong cf choice accepted`);
        if (!none && !p.list && p.ans instanceof Q && p.ans.d > 1 && !p.approx) {
          const unreduced = PCheck.cf({ choice: "A", text: `${p.ans.n * 2}/${p.ans.d * 2}` }, p);
          if (unreduced.ok) bad.push(`${key}: unreduced fraction accepted`);
        }
      } else if (p.type === "num") {
        r = PCheck.num(typed(p.ans), p);
        if (!r.ok) bad.push(`${key}: own num answer "${typed(p.ans)}" rejected ${JSON.stringify(r)} label=${p.label}`);
      } else if (p.type === "units") {
        r = PCheck.units(p.display, p);
        if (!r.ok) bad.push(`${key}: own units "${p.display}" rejected`);
        const [o, inp] = p.display.split("/");
        if (PCheck.units(`${inp}/${o}`, p).ok) bad.push(`${key}: flipped units accepted`);
      } else if (p.type === "multi") {
        r = PCheck.multi(p.ans, p);
        if (!r.ok && p.ans.length) bad.push(`${key}: own multi rejected`);
        if (!p.ans.length) bad.push(`${key}: multi with no correct choices`);
        if (p.ans.length === p.choices.length) bad.push(`${key}: multi with every choice correct`);
      } else if (p.type === "mc") {
        if (!(p.ans >= 0 && p.ans < p.choices.length)) bad.push(`${key}: mc ans out of range`);
      } else if (p.type === "expr") {
        r = Check.expr(tex2in(p.display), p);
        if (!r.ok) bad.push(`${key}: expr "${p.display}" rejected ${JSON.stringify(r)}`);
      } else if (p.type === "line") {
        r = Check.line(tex2in(p.display), p);
        if (!r.ok) bad.push(`${key}: line "${p.display}" rejected ${JSON.stringify(r)}`);
        const rhsOnly = tex2in(p.display).replace(/^y\s*=\s*/, "");
        if (!Check.line(rhsOnly, p).ok) bad.push(`${key}: right-side-only line "${rhsOnly}" rejected`);
      }
    }
  }
}
// strict-grading spot checks
const spots = [
  [PCheck.num("0.33", { ans: new Q(1, 3) }).ok, false, "rounded decimal for exact fraction"],
  [PCheck.num("2/6", { ans: new Q(1, 3) }).ok, false, "unreduced fraction"],
  [PCheck.num("1/3", { ans: new Q(1, 3) }).ok, true, "reduced fraction"],
  [PCheck.num("0.5", { ans: new Q(1, 2) }).ok, true, "exact decimal"],
  [PCheck.units("degrees per hour", { canon: "degree/hour" }).ok, true, "units with 'per'"],
  [PCheck.units("hours", { canon: "degree/hour" }).ok, false, "single unit"],
  [PCheck.units("mph", { canon: "mile/hour" }).ok, true, "mph"],
  [PCheck.cf({ choice: "A", text: "inf" }, { ans: Infinity }).ok, true, "infinite limit in box A"],
  [PCheck.cf({ choice: "B", text: "" }, { ans: Infinity }).ok, false, "B for an infinite limit"],
  [PCheck.list("4, -3", { ans: [new Q(-3), new Q(4)] }).ok, true, "list any order"],
  [PCheck.list("4", { ans: [new Q(-3), new Q(4)] }).ok, false, "list missing value"],
  [normUnits("Degrees / Hour") === "degree/hour", true, "units case/spacing"],
];
spots.forEach(([got, want, name]) => { if (got !== want) bad.push(`spot check failed: ${name}`); });
// seeded practice tests are reproducible
const sig = (t) => withSeed(t.seed, () => JSON.stringify(PTEST_BLUEPRINT.map((id) => { const pr = PGEN[id](); return [id, pr.prompt, (pr.figure || "").replace(/clip\d+/g, "c"), pr.parts.map((p) => (p.label || "") + (p.prefix || "") + typed(p.ans))]; })));
PTESTS.forEach((t) => { if (sig(t) !== sig(t)) bad.push(`${t.key}: practice test not reproducible`); });
console.log(`pearson problems generated: ${n}`);
const u = [...new Set(bad)];
console.log(u.length ? u.slice(0, 30).join("\n") : "ALL PEARSON CHECKS PASSED");
