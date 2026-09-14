// ================= analytics: answer log, streaks, mistake patterns, "My gaps" dashboard, report for Claude =================
const SKILLS = [
  { id: "graphLimits", sec: "1.1", name: "Limits from a graph", topics: ["limGraph", "graphRead"] },
  { id: "tableLimits", sec: "1.1", name: "Limits from a table", topics: ["limTable", "numTable"] },
  { id: "infiniteLimits", sec: "1.1", name: "Infinite limits (1/x, 1/x²)", topics: ["limInfinite", "inverse"] },
  { id: "endBehavior", sec: "1.1", name: "End behavior & piecewise at ±∞", topics: ["endBehavior", "bigPiecewise"] },
  { id: "limitProps", sec: "1.2", name: "Limit properties & substitution", topics: ["properties", "directSub"] },
  { id: "algLimits", sec: "1.2", name: "0/0 limits (factor, conjugate)", topics: ["limAlg", "factor"] },
  { id: "limInfinity", sec: "1.2", name: "Limits at infinity (rational)", topics: ["limInf", "infRational"] },
  { id: "pwLimits", sec: "1.2", name: "Piecewise limits", topics: ["limPiecewise", "pwLimit"] },
  { id: "continuity", sec: "1.2", name: "Continuity & discontinuities", topics: ["contYN", "discList", "continuity", "discType"] },
  { id: "arcUnits", sec: "1.3", name: "Average rate with units", topics: ["arcSituation", "arcFunction", "arcFunc"] },
  { id: "arcData", sec: "1.3", name: "Rates from tables, graphs, shrinking intervals", topics: ["arcDataP", "arcData", "arcShrink"] },
  { id: "dq", sec: "1.3", name: "Difference quotient & instantaneous rate", topics: ["instRate", "dqP", "dq"] },
  { id: "limitDef", sec: "1.4", name: "f′(x) from the limit definition", topics: ["derivDef", "derivP", "deriv"] },
  { id: "tangent", sec: "1.4", name: "Tangent lines", topics: ["tangentP", "tangent"] },
  { id: "interp", sec: "1.4", name: "Interpreting f′(a) & rate graphs", topics: ["interpP", "interp", "rateGraph"] },
  { id: "differentiability", sec: "1.4", name: "Continuity vs. differentiability", topics: ["pwDiff", "notDiffGraph", "diffGraph"] },
  { id: "concepts", sec: "all", name: "Concept checks", topics: ["concepts11", "concepts12", "concepts13", "concepts14"] },
];
const SKILL_OF = {};
SKILLS.forEach((s) => s.topics.forEach((t) => { SKILL_OF[t] = s; }));
const STATUS_ORDER = { gap: 0, shaky: 1, untested: 2, good: 3, mastered: 4 };
const STATUS_LABEL = { gap: "Gap", shaky: "Shaky", untested: "Not tried", good: "Solid", mastered: "Mastered" };

const plain = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\\\(|\\\)|\\\[|\\\]/g, "").replace(/&nbsp;|&amp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---------- mistake classification ----------
function numVal(raw) { try { const v = Parser.ev(Parser.parse(rhs(String(raw))), {}); return isFinite(v) ? v : null; } catch (e) { return null; } }
function valueMistake(part, raw) {
  const a = part.ans;
  if (a === Infinity || a === -Infinity) return numVal(raw) === null && /inf/i.test(String(raw)) ? "wrong sign on an infinite limit" : "missed an infinite limit";
  const want = a instanceof Q ? a.val() : typeof a === "number" ? a : null, got = numVal(raw);
  if (want == null || got == null) return "wrong value";
  if (Math.abs(want) > 1e-9 && closeTo(got, -want)) return "sign error";
  if (Math.abs(want) > 1e-9 && Math.abs(got) > 1e-9 && closeTo(got, 1 / want)) return "flipped the fraction (reciprocal)";
  return "wrong value";
}
function classify(part, res, answer, helped) {
  if (!res || res.ok) return null;
  if (res.empty) return helped ? "opened the solution instead" : "left blank";
  const err = res.err || "";
  if (/flipped/i.test(err)) return "units flipped";
  if (/two units/i.test(err)) return "units incomplete";
  if (/not simplified|reduce it/i.test(err)) return "fraction not simplified";
  if (/exact value|rounded decimal/i.test(err)) return "rounded instead of exact";
  if (/still contains h/i.test(err)) return "left h in the derivative";
  if (/h in the denominator/i.test(err)) return "didn't cancel the h";
  if (/Expand completely/i.test(err)) return "didn't expand completely";
  if (/factored form/i.test(err)) return "not in factored form";
  if (/slope-intercept/i.test(err)) return "not in slope-intercept form";
  const ansStr = String(answer ?? "");
  switch (part.type) {
    case "cf": {
      const none = part.ans === "DNE" || part.ans === "NONE", choice = /^A/.test(ansStr) ? "A" : /^B/.test(ansStr) ? "B" : null;
      if (none && choice === "A") return part.list ? "listed discontinuities that don't exist" : "said a limit/value exists when it doesn't";
      if (!none && choice === "B") return part.ans === Infinity || part.ans === -Infinity ? "chose DNE for an infinite limit" : part.list ? "missed the discontinuities" : "said DNE when it exists";
      if (part.list) return "wrong discontinuity values";
      return valueMistake(part, ansStr.replace(/^A\.\s*/, ""));
    }
    case "num": {
      if (part.ans === "DNE") return "gave a value when it's DNE/undefined";
      if (/dne|undefined|does/i.test(ansStr)) return part.ans === Infinity || part.ans === -Infinity ? "wrote DNE for an infinite limit" : "said DNE when a value exists";
      return valueMistake(part, ansStr);
    }
    case "units": return "wrong units";
    case "expr": return "wrong expression";
    case "line": {
      if (ansStr.includes("=") && !/^\s*y\s*=/.test(ansStr)) return "wrong tangent line";
      const f = (x) => { try { return Parser.ev(Parser.parse(rhs(ansStr)), { x }); } catch (e) { return NaN; } };
      const slope = f(1) - f(0), m = Q.of(part.m).val();
      if (!isFinite(slope)) return "wrong tangent line";
      if (closeTo(slope, m)) return "tangent line: right slope, wrong intercept";
      if (Math.abs(m) > 1e-9 && closeTo(slope, -m)) return "tangent line: slope sign error";
      return "tangent line: wrong slope";
    }
    case "multi": return "select-all: wrong set";
    case "mc":
      if (part.choices[0] === "Yes") return "Yes/No wrong";
      if (part.choices[0] === "True") return "True/False wrong";
      return "wrong choice";
    default: return "wrong answer";
  }
}

// ---------- recording ----------
function recordResult({ catalog, id, mode, pr, results, finalResults, helped, attempts, answers, test }) {
  const progress = catalog === "pgen" ? state.pprogress : state.progress;
  const p = progress[id] || (progress[id] = { tries: 0, solved: 0, streak: 0 });
  const res = results || finalResults || [];
  const firstOk = res.length > 0 && res.every((r) => r.ok) && !helped;
  p.tries++;
  if (firstOk) { p.solved++; p.streak = (p.streak || 0) + 1; p.best = Math.max(p.best || 0, p.streak); } else p.streak = 0;
  const parts = pr.parts.map((part, i) => {
    const r = res[i] || { empty: true }, o = { t: part.type, ok: !!r.ok };
    if (!r.ok) {
      o.kind = classify(part, r, answers?.[i], helped);
      o.q = plain(part.label || part.prefix || "").slice(0, 140);
      o.you = plain(answers?.[i] ?? "").slice(0, 80);
      o.ans = plain(pAnswerText(part)).slice(0, 120);
    }
    return o;
  });
  const skill = SKILL_OF[id];
  const entry = { id: newId(), t: Date.now(), mode, topic: id, skill: skill ? skill.id : id, sec: skill ? skill.sec : "", ok: parts.filter((x) => x.ok).length, n: parts.length, first: firstOk, helped: !!helped, tries: attempts || 1, parts, prompt: plain(pr.prompt).slice(0, 220) };
  if (test) entry.test = test;
  if (finalResults && finalResults !== results) entry.finalOk = finalResults.filter((r) => r.ok).length;
  state.log.push(entry);
  persist();
  Sync.touch();
}
function recordTest({ name, kind, pct, bySec }) {
  const secs = {};
  Object.entries(bySec || {}).forEach(([s, [a, b]]) => { secs[s] = Math.round((100 * a) / b); });
  state.tests.push({ id: newId(), t: Date.now(), name, kind, pct, secs });
  persist();
  Sync.touch();
}

// ---------- statistics ----------
function computeStats() {
  const bySkill = {};
  SKILLS.forEach((s) => { bySkill[s.id] = { skill: s, n: 0, first: 0, parts: 0, partsOk: 0, recent: [], last: 0 }; });
  const mistakes = {}, bySec = {};
  state.log.forEach((e) => {
    const b = bySkill[e.skill];
    if (b) { b.n++; if (e.first) b.first++; b.parts += e.n; b.partsOk += e.ok; b.recent.push(e.first ? 1 : e.ok > 0 ? 0.5 : 0); b.last = e.t; }
    if (e.sec && e.sec !== "all") { const s = bySec[e.sec] || (bySec[e.sec] = { n: 0, first: 0 }); s.n++; if (e.first) s.first++; }
    e.parts.forEach((p) => {
      if (p.ok || !p.kind || p.kind === "left blank" || p.kind === "opened the solution instead") return;
      const m = mistakes[p.kind] || (mistakes[p.kind] = { kind: p.kind, count: 0, skills: {}, examples: [] });
      m.count++; m.skills[e.skill] = (m.skills[e.skill] || 0) + 1;
      m.examples.push({ q: p.q, you: p.you, ans: p.ans, topic: e.topic, t: e.t, prompt: e.prompt });
      if (m.examples.length > 3) m.examples.shift();
    });
  });
  const mlist = Object.values(mistakes).sort((a, b) => b.count - a.count);
  Object.values(bySkill).forEach((b) => {
    b.acc = b.n ? b.first / b.n : null;
    b.partAcc = b.parts ? b.partsOk / b.parts : null;
    b.last5 = b.recent.slice(-5);
    b.recentAcc = b.last5.length ? b.last5.reduce((a, c) => a + c, 0) / b.last5.length : null;
    b.streak = Math.max(0, ...b.skill.topics.map((t) => Math.max(state.progress[t]?.streak || 0, state.pprogress[t]?.streak || 0)));
    b.status = b.n === 0 ? "untested" : b.streak >= 3 ? "mastered" : b.n >= 2 && b.recentAcc < 0.5 ? "gap" : b.acc < 0.75 || b.recentAcc < 0.75 ? "shaky" : "good";
    b.topMistake = mlist.find((m) => m.skills[b.skill.id]);
  });
  const log = state.log;
  return {
    bySkill, bySec, mistakes: mlist,
    total: log.length,
    firstRate: log.length ? log.filter((e) => e.first).length / log.length : null,
    partRate: log.length ? log.reduce((a, e) => a + e.ok, 0) / Math.max(1, log.reduce((a, e) => a + e.n, 0)) : null,
    recentRate: log.length ? log.slice(-20).filter((e) => e.first).length / Math.min(20, log.length) : null,
  };
}
const pct = (x) => (x == null ? "—" : `${Math.round(100 * x)}%`);
const when = (t) => new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const recommended = (S) => Object.values(S.bySkill).filter((b) => b.skill.id !== "concepts")
  .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (a.recentAcc ?? 1) - (b.recentAcc ?? 1)).slice(0, 3);

function buildReport(S) {
  const L = [];
  L.push(`# MAT 213 study analytics (generated ${new Date().toLocaleString()})`);
  L.push(`Exam: Wed Sep 16, 2026, Sections 1.1–1.4, taken on Pearson.`);
  L.push(`Totals: ${S.total} questions answered; first-try full credit ${pct(S.firstRate)}; parts correct ${pct(S.partRate)}; last 20 questions ${pct(S.recentRate)}.`);
  L.push("", "## By section");
  ["alg", "1.1", "1.2", "1.3", "1.4"].forEach((s) => { const v = S.bySec[s]; L.push(`- ${s === "alg" ? "Algebra warm-up" : "§" + s}: ${v ? `${pct(v.first / v.n)} first-try over ${v.n} questions` : "not practiced"}`); });
  L.push("", "## Skills (weakest first)", "| Skill | § | Status | First-try | Last 5 | Streak | Attempts | Most common mistake |", "|---|---|---|---|---|---|---|---|");
  Object.values(S.bySkill).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]).forEach((b) => {
    L.push(`| ${b.skill.name} | ${b.skill.sec} | ${STATUS_LABEL[b.status]} | ${pct(b.acc)} | ${b.last5.map((x) => (x === 1 ? "✓" : x > 0 ? "½" : "✗")).join("") || "—"} | ${b.streak} | ${b.n} | ${b.topMistake ? b.topMistake.kind : "—"} |`);
  });
  L.push("", "## Mistake patterns");
  if (!S.mistakes.length) L.push("- none recorded yet");
  S.mistakes.slice(0, 12).forEach((m) => {
    const where = Object.entries(m.skills).sort((a, b) => b[1] - a[1]).map(([k, c]) => `${SKILLS.find((s) => s.id === k)?.name || k} ×${c}`).join(", ");
    L.push(`- **${m.kind}** — ${m.count}× (${where})`);
    m.examples.slice(-2).forEach((x) => L.push(`  - ${x.prompt.slice(0, 120)} | part: ${x.q} | you: ${x.you || "(blank)"} | correct: ${x.ans}`));
  });
  L.push("", "## Recent misses (newest first)");
  state.log.filter((e) => !e.first).slice(-15).reverse().forEach((e) => {
    const miss = e.parts.filter((p) => !p.ok).map((p) => `${p.kind}: you "${p.you || "blank"}", correct "${p.ans}"`).join("; ");
    L.push(`- ${when(e.t)} · ${SKILL_OF[e.topic]?.name || e.topic} · ${e.mode}${e.test ? ` (${e.test})` : ""} · ${e.ok}/${e.n} parts · ${e.prompt.slice(0, 100)} → ${miss}`);
  });
  L.push("", "## Tests and mock exams");
  if (!state.tests.length) L.push("- none taken yet");
  state.tests.slice(-10).forEach((t) => L.push(`- ${when(t.t)} · ${t.name}: ${t.pct}% (${Object.entries(t.secs).map(([s, v]) => `§${s} ${v}%`).join(", ")})`));
  L.push("", "Please use this to build a targeted practice exam in the Pearson format that focuses on my gaps and mistake patterns.");
  return L.join("\n");
}

// ---------- cloud sync (only inside the published page; the local copy keeps data in the browser) ----------
const Sync = (() => {
  let db = null, ready = false, timer = null, status = "local";
  const CHUNK = 100;
  const listeners = new Set();
  const setStatus = (s) => { status = s; listeners.forEach((fn) => fn(s)); };
  async function init() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    try { db = await window.claude.use("db"); } catch (e) { db = null; }
    if (!db) return;
    try {
      const snap = await db.collection("attempts").get();
      const ids = new Set(state.log.map((e) => e.id));
      let added = 0;
      snap.docs.forEach((d) => { const body = d.data(); (body && Array.isArray(body.entries) ? body.entries : []).forEach((e) => { if (e && e.id && !ids.has(e.id)) { state.log.push(e); ids.add(e.id); added++; } }); });
      state.log.sort((a, b) => a.t - b.t);
      const t = await db.doc("analytics/tests").get();
      if (t.exists) { const tids = new Set(state.tests.map((x) => x.id)); (t.data().tests || []).forEach((x) => { if (x && x.id && !tids.has(x.id)) { state.tests.push(x); added++; } }); state.tests.sort((a, b) => a.t - b.t); }
      const pg = await db.doc("analytics/progress").get();
      if (pg.exists && !Object.keys(state.progress).length && !Object.keys(state.pprogress).length) {
        const body = pg.data(); state.progress = { ...(body.progress || {}) }; state.pprogress = { ...(body.pprogress || {}) }; state.mockScores = { ...(body.mockScores || {}), ...state.mockScores };
      }
      ready = true; setStatus("synced");
      persist();
      if (added && (state.mode === "stats" || state.mode === "pearson" || state.mode === "practice")) render();
      touch();
    } catch (e) { console.warn("sync init failed", e); db = null; setStatus("local"); }
  }
  function touch() { if (!db || !ready) return; clearTimeout(timer); timer = setTimeout(flush, 2000); }
  async function flush() {
    try {
      const log = state.log;
      for (let c = 0; c * CHUNK < log.length; c++) await db.doc(`attempts/chunk-${String(c).padStart(4, "0")}`).set({ entries: JSON.parse(JSON.stringify(log.slice(c * CHUNK, (c + 1) * CHUNK))), updated: Date.now() });
      await db.doc("analytics/tests").set({ tests: JSON.parse(JSON.stringify(state.tests.slice(-200))) });
      await db.doc("analytics/progress").set({ progress: JSON.parse(JSON.stringify(state.progress)), pprogress: JSON.parse(JSON.stringify(state.pprogress)), mockScores: { ...state.mockScores }, updated: Date.now() });
      const S = computeStats();
      await db.doc("analytics/summary").set({ updated: Date.now(), total: S.total, firstRate: S.firstRate, report: buildReport(S) });
      setStatus("synced");
    } catch (e) {
      console.warn("sync failed", e);
      setStatus(e && e.code === "quota_exceeded" ? "full" : "error");
      if (e && e.code === "unavailable") { clearTimeout(timer); timer = setTimeout(flush, 5000 + Math.random() * 5000); }
    }
  }
  async function reset() {
    if (!db || !ready) return;
    try {
      const snap = await db.collection("attempts").get();
      for (const d of snap.docs) await db.doc(`attempts/${d.id}`).delete();
      await flush();
    } catch (e) { console.warn("sync reset failed", e); }
  }
  return { init, touch, reset, status: () => status, onStatus: (fn) => { listeners.add(fn); return () => listeners.delete(fn); } };
})();
setTimeout(() => Sync.init(), 0);

// ---------- dashboard ----------
function practiceSkill(skill) {
  const pt = skill.topics.find((t) => PTOPIC_BY_ID[t]);
  if (pt) { state.mode = "pearson"; state.ptopic = pt; } else { state.mode = "practice"; state.topic = skill.topics.find((t) => TOPIC_BY_ID[t]) || state.topic; }
  persist(); render(); window.scrollTo({ top: 0, behavior: smooth() });
}
const syncText = (s) => ({
  synced: "Saved to this page's storage, so Claude can read your results directly.",
  error: "Couldn't reach the page's storage just now. Results are saved in this browser and will sync on the next answer.",
  full: "The page's storage is full. Results are still saved in this browser.",
  local: "Saved in this browser only. Use “Copy report” to share results with Claude.",
})[s];

function planCard(S) {
  const took = (name) => state.tests.some((t) => t.name === name);
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  const algToday = state.log.filter((e) => e.sec === "alg" && e.t >= midnight.getTime()).length;
  const examSkills = Object.values(S.bySkill).filter((b) => b.skill.sec !== "alg" && b.skill.id !== "concepts");
  const mastered = examSkills.filter((b) => b.status === "mastered").length;
  const weakest = recommended(S).filter((b) => b.skill.sec !== "alg").map((b) => b.skill.name).join(", ");
  const steps = [
    { id: "t1", day: "Sun", text: "Take Pearson Practice Test 1 with the timer on", auto: took("Practice Test 1") },
    { id: "report1", day: "Sun", text: "Open My gaps and paste your report to Claude", manual: true },
    { id: "alg", day: "Daily", text: `Algebra warm-up: 5 questions today (${Math.min(5, algToday)}/5)`, auto: algToday >= 5 },
    { id: "drill", day: "Mon", text: `Get 3 exam skills to 3 dots (${Math.min(3, mastered)}/3)${weakest ? `. Start with: ${weakest}` : ""}`, auto: mastered >= 3 },
    { id: "t2", day: "Mon", text: "Take Pearson Practice Test 2", auto: took("Practice Test 2") },
    { id: "hw3", day: "Tue", text: "Finish Written HW 3 by hand (due 11:59 p.m.)", manual: true },
    { id: "t3", day: "Tue", text: "Take Pearson Practice Test 3, then ask Claude for a final exam on your gaps", auto: took("Practice Test 3") },
    { id: "warm", day: "Wed", text: "Morning warm-up: a random Pearson test or paper mock D, then the formula sheet", manual: true },
  ];
  const isDone = (s) => !!(s.auto || (s.manual && state.plan[s.id]));
  const card = el("section", { class: "sheet" });
  card.innerHTML = `<div class="sheet-head"><h3>Plan until Wednesday</h3><span class="tag">${steps.filter(isDone).length}/${steps.length} done</span></div>`;
  const ul = el("ul", { class: "plan" });
  steps.forEach((s) => {
    const li = el("li", { class: isDone(s) ? "done" : "" });
    const box = el("input", { type: "checkbox", id: `plan-${s.id}` });
    box.checked = isDone(s);
    if (!s.manual) box.disabled = true;
    box.addEventListener("change", () => { state.plan[s.id] = box.checked; persist(); renderStats(); });
    li.append(box, el("label", { for: `plan-${s.id}` }, `<span class="plan-day">${s.day}</span>${escapeHtml(s.text)}${s.manual ? "" : ' <span class="plan-auto">checks itself</span>'}`));
    ul.append(li);
  });
  card.append(ul);
  return card;
}

function renderStats() {
  clearInterval(examTimer);
  const main = document.getElementById("main"); main.innerHTML = "";
  const S = computeStats(), skills = Object.values(S.bySkill);
  const mastered = skills.filter((b) => b.status === "mastered").length, weak = skills.filter((b) => b.status === "gap" || b.status === "shaky").length;

  const top = el("section", { class: "sheet" });
  top.innerHTML = `<div class="sheet-head"><h3>My gaps</h3><span class="tag">from every answer you check</span></div>
    <div class="stat-tiles">
      <div class="stat-tile"><div class="v">${S.total}</div><div class="k">questions answered</div></div>
      <div class="stat-tile"><div class="v">${pct(S.firstRate)}</div><div class="k">first-try full credit</div></div>
      <div class="stat-tile"><div class="v">${pct(S.recentRate)}</div><div class="k">last 20 questions</div></div>
      <div class="stat-tile"><div class="v">${mastered}/${skills.length}</div><div class="k">skills mastered (3 in a row)</div></div>
      <div class="stat-tile"><div class="v">${weak}</div><div class="k">gaps or shaky skills</div></div>
    </div>
    <p class="sync-line" id="sync-line">${syncText(Sync.status())}</p>`;
  main.append(top);
  const off = Sync.onStatus((s) => { const n = document.getElementById("sync-line"); if (n) n.textContent = syncText(s); else off(); });
  main.append(planCard(S));

  if (!S.total) {
    const empty = el("section", { class: "sheet" });
    empty.innerHTML = `<div class="prompt"><p>No answers recorded yet. Every question you check in Pearson-style practice, topic practice, Pearson tests, and mock exams shows up here: which skills are solid, where you keep losing points, and what kind of mistake it was.</p></div>`;
    empty.append(btn("Start Pearson-style practice", "primary", () => { state.mode = "pearson"; persist(); render(); }));
    main.append(empty);
  } else {
    const next = el("section", { class: "sheet" });
    next.innerHTML = `<div class="sheet-head"><h3>Study these next</h3><span class="tag">weakest first</span></div>`;
    const list = el("div", { class: "next-list" });
    recommended(S).forEach((b) => {
      const why = b.status === "untested" ? "Not practiced yet — it's on the exam."
        : `${STATUS_LABEL[b.status]}: last ${b.last5.length} ${pct(b.recentAcc)}, first-try ${pct(b.acc)} over ${b.n}${b.topMistake ? `. Most common mistake: ${b.topMistake.kind}` : ""}.`;
      const item = el("div", { class: "next-item" }, `<div><b>${b.skill.name}</b> <span class="chip ${b.status}">${STATUS_LABEL[b.status]}</span><div class="why">${b.skill.sec === "alg" ? "Algebra" : "§" + b.skill.sec} · ${why}</div></div>`);
      item.append(btn("Practice", "primary", () => practiceSkill(b.skill)));
      list.append(item);
    });
    next.append(list);
    main.append(next);
  }

  const table = el("section", { class: "sheet" });
  let rows = "";
  ["alg", "1.1", "1.2", "1.3", "1.4", "all"].forEach((sec) => {
    const secSkills = skills.filter((b) => b.skill.sec === sec);
    const sv = S.bySec[sec];
    rows += `<tr class="sec-row"><td colspan="7">${sec === "all" ? "All sections" : sec === "alg" ? "Algebra warm-up" : `§${sec}`}${sv ? ` — ${pct(sv.first / sv.n)} first-try over ${sv.n}` : ""}</td></tr>`;
    secSkills.forEach((b) => {
      const dots = b.last5.map((x) => `<i class="${x === 1 ? "y" : x > 0 ? "p" : "n"}"></i>`).join("");
      rows += `<tr><td>${b.skill.name}${b.topMistake ? `<div class="why" style="font-size:12px;color:var(--graphite)">often: ${b.topMistake.kind}</div>` : ""}</td><td><span class="chip ${b.status}">${STATUS_LABEL[b.status]}</span></td><td class="num">${pct(b.acc)}</td><td><span class="last5" aria-label="last five results">${dots || "—"}</span></td><td class="num">${b.streak}/3</td><td class="num">${b.n}</td><td data-skill="${b.skill.id}"></td></tr>`;
    });
  });
  table.innerHTML = `<div class="sheet-head"><h3>Every skill</h3><span class="tag">last 5: <span class="last5"><i class="y"></i></span> right · <span class="last5"><i class="p"></i></span> partial · <span class="last5"><i class="n"></i></span> wrong</span></div>
    <div class="tbl-scroll"><table class="skill-table"><thead><tr><th>Skill</th><th>Status</th><th>First try</th><th>Last 5</th><th>Streak</th><th>Tried</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  table.querySelectorAll("td[data-skill]").forEach((td) => { const s = SKILLS.find((x) => x.id === td.dataset.skill); td.append(btn("Practice", "ghost", () => practiceSkill(s))); });
  main.append(table);

  if (S.mistakes.length) {
    const mist = el("section", { class: "sheet" });
    mist.innerHTML = `<div class="sheet-head"><h3>Mistake patterns</h3><span class="tag">what kind of wrong</span></div>` +
      `<div class="miss-list">${S.mistakes.slice(0, 8).map((m) => {
        const where = Object.entries(m.skills).sort((a, b) => b[1] - a[1]).map(([k, c]) => `${SKILLS.find((s) => s.id === k)?.name || k} (${c})`).join(", ");
        const ex = m.examples[m.examples.length - 1];
        return `<div class="miss"><h4><span>${escapeHtml(m.kind)}</span><span class="count">${m.count}×</span></h4><div class="where">${escapeHtml(where)}</div>${ex ? `<div class="ex">Latest: ${escapeHtml(ex.q)} — you: ${escapeHtml(ex.you || "(blank)")} · correct: ${escapeHtml(ex.ans)}</div>` : ""}</div>`;
      }).join("")}</div>`;
    main.append(mist);
  }

  if (state.tests.length) {
    const tests = el("section", { class: "sheet" });
    tests.innerHTML = `<div class="sheet-head"><h3>Tests & mock exams</h3><span class="tag">${state.tests.length} taken</span></div>
      <div class="tbl-scroll"><table class="skill-table"><thead><tr><th>When</th><th>Test</th><th>Score</th><th>By section</th></tr></thead><tbody>${state.tests.slice().reverse().map((t) => `<tr><td class="num">${when(t.t)}</td><td>${escapeHtml(t.name)}</td><td class="num"><b>${t.pct}%</b></td><td class="num">${Object.entries(t.secs).map(([s, v]) => `§${s} ${v}%`).join(" · ")}</td></tr>`).join("")}</tbody></table></div>`;
    main.append(tests);
  }

  const rep = el("section", { class: "sheet" });
  rep.innerHTML = `<div class="sheet-head"><h3>Report for Claude</h3><span class="tag">paste into a chat</span></div>
    <div class="prompt"><p>Copy this and paste it to Claude with a request like “make me a Pearson-style practice exam on my gaps.” It lists your weakest skills, mistake patterns with real examples, and test scores.</p></div>`;
  const ta = el("textarea", { class: "report-box", id: "report-box", readonly: "", "aria-label": "analytics report" });
  ta.value = buildReport(S);
  const msg = el("span", { class: "score-line", "aria-live": "polite" });
  const copy = btn("Copy report", "primary", async () => {
    try { await navigator.clipboard.writeText(ta.value); msg.textContent = "Copied."; }
    catch (e) { ta.focus(); ta.select(); try { document.execCommand("copy"); msg.textContent = "Copied."; } catch (e2) { msg.textContent = "Selected — press Ctrl+C to copy."; } }
  });
  const confirmReset = el("span", { hidden: "" });
  const resetBtn = btn("Reset all tracking", "ghost", () => { confirmReset.hidden = false; resetBtn.hidden = true; });
  confirmReset.append(el("span", { class: "score-line", style: "margin:0 8px 0 0" }, "Erase every recorded answer, streak, and score?"),
    btn("Erase everything", "primary", async () => { state.log = []; state.tests = []; state.progress = {}; state.pprogress = {}; state.mockScores = {}; persist(); await Sync.reset(); render(); }),
    btn("Cancel", "ghost", () => { confirmReset.hidden = true; resetBtn.hidden = false; }));
  const acts = el("div", { class: "actions" });
  acts.append(copy, msg);
  const acts2 = el("div", { class: "actions" });
  acts2.append(resetBtn, confirmReset);
  rep.append(ta, acts, acts2);
  main.append(rep);
}
