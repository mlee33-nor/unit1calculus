// ================= mock midterms: fixed seeds, point values, printable papers, answer keys =================
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function withSeed(seed, fn) {
  const orig = Math.random; Math.random = mulberry32(seed);
  try { return fn(); } finally { Math.random = orig; }
}

const MOCK_BLUEPRINT = [
  ["graphRead"], ["numTable", "inverse"], ["properties", "directSub"], ["factor"], ["infRational"], ["bigPiecewise", "endBehavior"],
  ["pwLimit"], ["continuity"], ["discType"], ["arcFunc"], ["arcData", "arcShrink"], ["dq"], ["deriv"], ["tangent"], ["interp"], ["diffGraph", "rateGraph"],
];
const MOCKS = [
  { key: "A", seed: 213001, variant: 0, name: "Mock Midterm A" },
  { key: "B", seed: 213002, variant: 1, name: "Mock Midterm B" },
  { key: "C", seed: 213003, variant: 2, name: "Mock Midterm C" },
  { key: "D", seed: 213004, variant: 3, name: "Mock Midterm D" },
];
const WORK = { factor: "tall", dq: "tall", deriv: "tall", tangent: "tall", continuity: "tall", pwLimit: "mid", infRational: "tall", properties: "mid", directSub: "mid", arcFunc: "mid", arcShrink: "mid", interp: "mid", bigPiecewise: "mid", numTable: "short", inverse: "mid", endBehavior: "mid", arcData: "mid" };

function partPoints(parts, part) {
  if (part.type === "expr" || part.type === "line") return 3;
  if (part.type === "mc") return 1;
  return parts.filter((p) => p.type === "num").length >= 4 ? 1 : 2;
}
function buildMock(mock) {
  return withSeed(mock.seed, () => MOCK_BLUEPRINT.map((opts, i) => {
    const id = opts[((mock.variant >> (i % 2)) & 1) % opts.length];
    const pr = makeProblem(id);
    const pts = pr.parts.map((part) => partPoints(pr.parts, part));
    return { id, pr, pts, total: pts.reduce((a, b) => a + b, 0) };
  }));
}
const btn = (label, cls, onClick) => el("button", { class: `btn ${cls}`, type: "button", onclick: onClick }, label);
const minutesSelect = (id) => `<label for="${id}">Time limit <select id="${id}"><option value="50">50 min</option><option value="75" selected>75 min</option><option value="90">90 min</option><option value="0">No limit</option></select></label>`;

function renderMocks() {
  clearInterval(examTimer);
  const main = document.getElementById("main"); main.innerHTML = "";
  const intro = el("section", { class: "sheet" });
  intro.innerHTML = `<div class="sheet-head"><h3>Mock midterms</h3><span class="tag">§1.1 – §1.4 · ${MOCK_BLUEPRINT.length} problems each</span></div>
    <div class="prompt"><p>Four full-length practice midterms built like the real one: every section, point values, and show-your-work problems. Each exam stays the same every time you open it, so you can print it, work it on paper, grade it with the answer key, and retake it later.</p>
    <p><b>Plan before Wednesday:</b> take A under the timer tonight, review the misses, and drill those topics. Take B on Monday and C on Tuesday. Save D for a final warm-up.</p></div>
    <div class="setup">${minutesSelect("mock-min")}</div>`;
  main.append(intro);
  const mins = () => +document.getElementById("mock-min").value;
  const grid = el("div", { class: "mock-grid" });
  MOCKS.forEach((m) => {
    const probs = buildMock(m), pts = probs.reduce((n, p) => n + p.total, 0), best = state.mockScores[m.key];
    const card = el("section", { class: "sheet mock-card" });
    card.innerHTML = `<div class="mock-letter" aria-hidden="true">${m.key}</div><div><h3>${m.name}</h3><p class="mock-meta">${probs.length} problems · ${pts} points</p><p class="mock-best">${best != null ? `Best score <b>${best}%</b>` : "Not taken yet"}</p></div>`;
    const acts = el("div", { class: "actions" });
    acts.append(btn("Take it", "primary", () => runMock(m, mins())), btn("Printable exam", "", () => renderPaper(m, false)), btn("Answer key", "ghost", () => renderPaper(m, true)));
    card.append(acts); grid.append(card);
  });
  const rnd = el("section", { class: "sheet mock-card" });
  rnd.innerHTML = `<div class="mock-letter" aria-hidden="true">?</div><div><h3>Random mock</h3><p class="mock-meta">A brand-new exam every time</p><p class="mock-best">Same layout and point values as A–D</p></div>`;
  const newRandom = () => { const seed = 1000 + Math.floor(Math.random() * 900000); return { key: null, seed, variant: seed % 4, name: `Random Mock #${seed}` }; };
  const racts = el("div", { class: "actions" });
  racts.append(btn("Take one", "primary", () => runMock(newRandom(), mins())), btn("Print one", "", () => renderPaper(newRandom(), false)));
  rnd.append(racts); grid.append(rnd);
  main.append(grid);
}

function runMock(mock, minutes) {
  clearInterval(examTimer);
  const main = document.getElementById("main"); main.innerHTML = "";
  const problems = buildMock(mock), totalPts = problems.reduce((n, p) => n + p.total, 0);
  const bar = el("div", { class: "exam-bar" });
  bar.innerHTML = `<span class="clock" id="clock">${minutes ? `${minutes}:00` : "∞"}</span><span class="meta">${mock.name} · ${problems.length} problems · ${totalPts} points<br>${minutes ? "time remaining · no feedback until you submit" : "untimed · no feedback until you submit"}</span>`;
  const submit = btn("Submit exam", "", () => grade(false));
  bar.append(submit); main.append(bar);
  const views = problems.map((p, i) => {
    const t = TOPIC_BY_ID[p.id];
    const v = problemCard(p.pr, { title: t.name, tag: `§${t.sec} · ${p.total} pts`, num: i + 1 });
    main.append(v.card);
    return { ...p, ...v };
  });
  typeset(main);
  window.scrollTo({ top: 0 });
  const end = Date.now() + minutes * 60000;
  if (minutes) {
    examTimer = setInterval(() => {
      const left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      const clock = document.getElementById("clock"); if (clock) clock.textContent = `${m}:${String(s).padStart(2, "0")}`;
      if (left <= 0) grade(true);
    }, 1000);
  }
  let done = false;
  function grade(timeUp) {
    if (done) return; done = true; clearInterval(examTimer);
    const bySec = {}; let earned = 0;
    views.forEach((v) => {
      const sec = TOPIC_BY_ID[v.id].sec; bySec[sec] = bySec[sec] || [0, 0];
      v.ctrls.forEach((c, j) => { const r = c.grade(); applyResult(c, r, true); c.lock(); if (r.ok) { earned += v.pts[j]; bySec[sec][0] += v.pts[j]; } bySec[sec][1] += v.pts[j]; });
      v.card.append(el("details", { class: "solution" }, `<summary class="sol-lbl" style="cursor:pointer">Worked solution</summary>${v.pr.solution}`));
    });
    const pct = Math.round((100 * earned) / totalPts);
    if (mock.key) { state.mockScores[mock.key] = Math.max(state.mockScores[mock.key] ?? 0, pct); persist(); }
    const weakest = Object.entries(bySec).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])[0];
    const res = el("section", { class: "sheet" });
    res.innerHTML = `<div class="sheet-head"><h3>${timeUp ? "Time's up — " : ""}${mock.name} results</h3><span class="tag">graded</span></div>
      <div class="result"><span class="big">${pct}%</span><span>${earned} of ${totalPts} points</span>
      <table>${Object.entries(bySec).map(([s, [a, b]]) => `<tr><td>§${s}</td><td>${a}/${b} pts</td><td>${Math.round((100 * a) / b)}%</td></tr>`).join("")}</table></div>
      <p class="prompt" style="margin-top:10px">Your weakest section was <b>§${weakest[0]}</b>. Missed answers below show the correct value, and every problem has a worked solution. Drill §${weakest[0]} from the topic list, then retake this exam or move to the next one.</p>`;
    const acts = el("div", { class: "actions" });
    acts.append(btn("Back to mock exams", "primary", renderMocks));
    if (mock.key) acts.append(btn("Printable answer key", "", () => renderPaper(mock, true)));
    res.append(acts);
    bar.remove(); main.prepend(res); typeset(main);
    window.scrollTo({ top: 0, behavior: smooth() });
  }
}

const paperText = (html) => html.replace(/<code>-inf<\/code>/g, "−∞").replace(/<code>inf<\/code>/g, "∞").replace(/ Use ∞ \/ −∞ for \\\(\\pm\\infty\\\)\./g, "");
function renderPaper(mock, withKey, bare = false) {
  clearInterval(examTimer);
  const main = document.getElementById("main"); main.innerHTML = "";
  const problems = buildMock(mock), totalPts = problems.reduce((n, p) => n + p.total, 0);
  if (!bare) {
    const tools = el("div", { class: "paper-tools" });
    tools.append(btn("← Mock exams", "ghost", renderMocks), btn(withKey ? "Show the exam" : "Show the answer key", "", () => renderPaper(mock, !withKey)), btn("Print / save as PDF", "primary", () => window.print()));
    tools.append(el("span", { class: "score-line" }, `Printing blocked here? PDFs of A–D are in <b>mat 2026 › 03 Exam Prep › Mock Exams</b>.`));
    main.append(tools);
  }
  const L = "ABCD";
  let html = `<header class="paper-top"><div><div>MAT 213 Brief Calculus</div><div class="paper-title">${mock.name}${withKey ? " — Answer Key" : ""}</div><div>Practice midterm (AI-Free) · Sections 1.1–1.4</div></div>` +
    (withKey ? `<div class="paper-total">Total: ${totalPts} points</div>` : `<div class="paper-name"><div>Name: <span class="line"></span></div><div>Date: <span class="line"></span></div><div>Score: <span class="line short"></span> / ${totalPts}</div></div>`) + `</header>`;
  if (!withKey) html += `<p class="paper-dir"><b>Directions:</b> Answer each question below. Be sure to show work to receive full credit. Work this exam on your own, without notes or AI, the way you will on the proctored midterm. Be sure the notation in your solutions matches the notation from the lesson videos. Write <b>DNE</b> if a value or limit does not exist. Suggested time: 75 minutes.</p>`;
  problems.forEach((p, i) => {
    html += `<section class="paper-q"><div class="pq-head"><span class="pq-num">${i + 1}.</span><div class="pq-body">${paperText(p.pr.prompt)}${p.pr.figure ? `<div class="figure">${p.pr.figure}</div>` : ""}<ol class="pq-parts">`;
    p.pr.parts.forEach((part, j) => {
      const letter = p.pr.parts.length > 1 ? `${String.fromCharCode(97 + j)}.)` : "";
      const tf = part.type === "mc" && part.choices.length === 2 && part.choices[0] === "True";
      let inner;
      if (withKey) {
        const ans = part.type === "mc" ? (tf ? part.choices[part.ans] : `(${L[part.ans]}) ${part.choices[part.ans]}`) : $m(part.type === "num" ? T.ans(part.ans) : part.display);
        inner = `<span class="pl">${part.label}</span><div class="key-ans">${ans}</div>`;
      } else if (tf) inner = `<span class="tf">T&nbsp;&nbsp;&nbsp;F</span><span class="pl">${part.label}</span>`;
      else if (part.type === "mc") inner = `<span class="pl">${part.label}</span><div class="pq-choices">${part.choices.map((c, k) => `<div>(${L[k]}) ${c}</div>`).join("")}</div>`;
      else inner = `<span class="pl">${part.label}</span><span class="blank"></span>`;
      html += `<li><span class="pq-letter">${letter}</span><div>${inner}</div><span class="pq-pts">(${p.pts[j]})</span></li>`;
    });
    html += `</ol></div><span class="pq-total">${p.total} pts</span></div>`;
    html += withKey ? `<div class="solution"><div class="sol-lbl">Worked solution</div>${p.pr.solution}</div>` : `<div class="work ${WORK[p.id] || "short"}" aria-hidden="true"></div>`;
    html += `</section>`;
  });
  main.append(el("article", { class: `paper${withKey ? " key" : ""}` }, html));
  typeset(main).then(() => document.documentElement.setAttribute("data-typeset", "done"));
  if (!bare) window.scrollTo({ top: 0 });
}

function bootFromURL() {
  const qs = new URLSearchParams(location.search), k = (qs.get("paper") || "").toUpperCase();
  const mock = MOCKS.find((m) => m.key === k);
  if (!mock) return false;
  document.body.classList.add("bare");
  renderPaper(mock, qs.get("key") === "1", true);
  return true;
}
