// ================= Pearson-format UI: question cards, practice with two tries, one-at-a-time practice tests =================
function makePProblem(id) {
  for (let i = 0; i < 6; i++) { try { return PGEN[id](); } catch (e) { console.warn(id, e); } }
  throw new Error("Could not generate " + id);
}
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function guideToggle() {
  const label = () => (state.guides === false ? "Show reading guides" : "Hide reading guides");
  const b = el("button", { type: "button", class: "btn ghost small guide-toggle" }, label());
  b.onclick = () => {
    state.guides = state.guides === false;
    document.body.classList.toggle("no-guides", state.guides === false);
    persist();
    document.querySelectorAll(".guide-toggle").forEach((x) => { x.textContent = label(); });
  };
  return b;
}

function pqPartView(part, i, n) {
  const sec = el("section", { class: "pq-part" });
  if (n > 1) sec.append(el("div", { class: "pq-part-head" }, `Part ${i + 1} of ${n}`));
  const bar = el("div", { class: "pq-bar", hidden: "", "aria-live": "polite" });
  const preview = el("div", { class: "preview" });
  const base = "pq" + ++uidCounter;
  const instr = part.instr ? el("div", { class: "pq-instr" }, part.instr) : "";
  const box = (ph = "") => {
    const inp = el("input", { type: "text", class: "pq-box", id: `${base}-box`, autocomplete: "off", autocapitalize: "off", spellcheck: "false", placeholder: ph, "aria-label": "answer box" });
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); inp.closest(".sheet")?.querySelector("[data-check]")?.click(); } });
    inp.addEventListener("input", () => { sec.classList.remove("ok", "bad"); });
    return inp;
  };
  const withPreview = (inp, type) => { let t; inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => updatePreview(inp.value, type, preview), 220); }); };
  const keys = (inp, set) => {
    const k = el("div", { class: "keys" });
    set.forEach((s) => k.append(el("button", { type: "button", tabindex: "-1", onclick: () => { insertAt(inp, s); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.focus(); } },
      s === "inf" ? "∞" : s === "-inf" ? "−∞" : s === "sqrt(" ? "√(" : s)));
    return k;
  };
  let api;
  if (part.type === "cf") {
    sec.append(el("div", { class: "pq-q" }, "Select the correct choice below and, if necessary, fill in the answer box to complete your choice."));
    const name = `${base}-choice`;
    const rA = el("input", { type: "radio", name, value: "A" }), rB = el("input", { type: "radio", name, value: "B" });
    const inp = box();
    const optA = el("div", { class: "pq-opt" });
    const labA = el("label", {}); labA.append(rA, el("span", { class: "pq-letter" }, "A."), el("span", {}, part.list ? $m("x =") : `${part.prefix} ${$m("=")}`));
    optA.append(labA, inp);
    const optB = el("label", { class: "pq-opt" }); optB.append(rB, el("span", { class: "pq-letter" }, "B."), el("span", {}, part.dneText));
    inp.addEventListener("input", () => { if (inp.value.trim()) rA.checked = true; });
    withPreview(inp, "num");
    sec.append(optA, instr, keys(inp, part.list ? ["/", ","] : ["inf", "-inf", "/", "sqrt("]), preview, optB);
    api = {
      state: () => ({ choice: rA.checked ? "A" : rB.checked ? "B" : null, text: inp.value }),
      grade() { return PCheck.cf(this.state(), part); },
      empty() { const s = this.state(); return !s.choice && !s.text.trim(); },
      yours() { const s = this.state(); return !s.choice ? "(no choice)" : s.choice === "B" ? "B" : `A. ${escapeHtml(s.text || "(blank)")}`; },
      lock() { [rA, rB, inp].forEach((e) => { e.disabled = true; }); },
      clear() { rA.checked = false; rB.checked = false; inp.value = ""; preview.innerHTML = ""; },
    };
  } else if (part.type === "mc") {
    sec.append(el("div", { class: "pq-q" }, part.label));
    const name = `${base}-mc`;
    const radios = part.choices.map((c, j) => {
      const r = el("input", { type: "radio", name, value: String(j) });
      const lab = el("label", { class: "pq-opt" }); lab.append(r, el("span", {}, c)); sec.append(lab);
      return r;
    });
    const k = () => radios.findIndex((r) => r.checked);
    api = {
      grade: () => PCheck.mc(k(), part), empty: () => k() < 0,
      yours: () => (k() < 0 ? "(no choice)" : part.choices[k()]),
      lock() { radios.forEach((r) => { r.disabled = true; }); }, clear() { radios.forEach((r) => { r.checked = false; }); },
    };
  } else if (part.type === "multi") {
    sec.append(el("div", { class: "pq-q" }, part.label));
    const grid = el("div", { class: "pq-multi" });
    const boxes = part.choices.map((c, j) => {
      const cb = el("input", { type: "checkbox", value: String(j) });
      const lab = el("label", { class: "pq-opt" }); lab.append(cb, el("span", { class: "pq-letter" }, `${"ABCDEFGH"[j]}.`), el("span", {}, c)); grid.append(lab);
      return cb;
    });
    sec.append(grid);
    const sel = () => boxes.map((b, j) => (b.checked ? j : -1)).filter((j) => j >= 0);
    api = {
      grade: () => PCheck.multi(sel(), part), empty: () => !sel().length,
      yours: () => sel().map((j) => part.choices[j]).join(", ") || "(none)",
      lock() { boxes.forEach((b) => { b.disabled = true; }); }, clear() { boxes.forEach((b) => { b.checked = false; }); },
    };
  } else {
    const inp = box(part.type === "units" ? "units" : "");
    const row = el("div", { class: "pq-row" });
    const label = part.label || "";
    if (label.includes("______")) { const [a, b] = label.split("______"); row.append(el("span", {}, a), inp, el("span", {}, b)); }
    else { row.append(el("span", {}, label)); if (part.type === "line") row.append(el("span", {}, $m("y ="))); row.append(inp); }
    sec.append(row, instr);
    if (part.type !== "units") {
      sec.append(keys(inp, part.type === "num" ? ["/", "sqrt(", "^"] : ["^", "/", "(", ")", "sqrt(", ...(part.vars || ["x"])]), preview);
      withPreview(inp, part.type);
    }
    api = {
      grade: () => PCheck[part.type](inp.value, part), empty: () => !inp.value.trim(),
      yours: () => escapeHtml(inp.value || "(blank)"),
      lock() { inp.disabled = true; }, clear() { inp.value = ""; preview.innerHTML = ""; },
    };
  }
  sec.append(bar);
  Object.assign(api, { sec, bar, part });
  return api;
}

// mode: "try" (a retry is allowed), "final" (show the correct answer)
function pqShow(api, res, mode) {
  api.sec.classList.remove("ok", "bad");
  api.bar.hidden = false;
  if (res.empty && mode === "try") { api.bar.className = "pq-bar"; api.bar.innerHTML = "Answer this part, then check again."; return; }
  const ok = !!res.ok;
  api.sec.classList.add(ok ? "ok" : "bad");
  api.bar.className = `pq-bar ${ok ? "ok" : "bad"}`;
  let h = ok ? "<b>Good job!</b>" : mode === "try" ? "<b>That's not right.</b> You have one more try." : "<b>That's incorrect.</b>";
  if (res.err) h += `<div class="pq-err">${res.err}</div>`;
  if (res.note) h += `<div>${res.note}</div>`;
  if (!ok && mode === "final") h += `<div class="pq-cmp"><div><span>Correct answer:</span> ${pAnswerText(api.part)}</div><div><span>Your answer:</span> ${api.yours()}</div></div>`;
  api.bar.innerHTML = h;
}

function pqCard(pr, meta) {
  const card = el("article", { class: "sheet pq-card" });
  const nParts = pr.parts.length;
  const head = el("div", { class: "pq-head" },
    `<div><div class="pq-code">${meta.num ? `Question ${meta.num}` : meta.title}</div><div class="pq-meta">${nParts} part${nParts > 1 ? "s" : ""}<span class="pq-sep">|</span><span class="pq-score">0 of 1 point</span></div></div><span class="tag">§${meta.sec}${meta.num ? ` · ${meta.title}` : ""}</span>`);
  const promptBox = el("div", { class: "pq-prompt" }, pr.prompt);
  if (pr.figure) { promptBox.append(el("div", { class: "figure" }, pr.figure)); if (pr.figure.includes("gp-guide")) promptBox.append(guideToggle()); }
  card.append(head, promptBox);
  const ctrls = pr.parts.map((p, i) => { const api = pqPartView(p, i, nParts); card.append(api.sec); return api; });
  const setScore = (fr) => { head.querySelector(".pq-score").textContent = `${+fr.toFixed(2)} of 1 point`; };
  return { card, ctrls, setScore };
}

// ---------- practice ----------
function pearsonIntro() {
  const d = el("details", { class: "sheet" });
  if (!state.pearsonIntroSeen) d.setAttribute("open", "");
  d.innerHTML = `<summary class="sheet-head" style="cursor:pointer;margin-bottom:0;border:0;padding:0"><h3>Answering in the Pearson format</h3><span class="tag">open / close</span></summary>
    <div class="intro" style="margin-top:14px">
      <div class="cell"><h4>Limit questions</h4><p>Pick <b>A</b> and type the value, or pick <b>B</b> when the limit doesn't exist. An infinite limit goes in box A: type <code>inf</code> or <code>-inf</code>.</p></div>
      <div class="cell"><h4>Strict boxes</h4><p>"Integer or simplified fraction" means <code>1/3</code>. Here, <code>0.33</code> and <code>2/6</code> get marked wrong. Units get their own box, output per input: <code>degrees/hour</code>.</p></div>
      <div class="cell"><h4>Tangent lines</h4><p>The box already says <b>y =</b>. Type only the right side, like <code>20x + 48</code>.</p></div>
    </div>`;
  d.addEventListener("toggle", () => { if (!d.open && !state.pearsonIntroSeen) { state.pearsonIntroSeen = true; persist(); } });
  return d;
}

function renderPearsonPractice() {
  clearInterval(examTimer);
  const main = document.getElementById("main"); main.innerHTML = "";
  main.append(pearsonIntro());
  const id = PGEN[state.ptopic] ? state.ptopic : "limGraph";
  const t = PTOPIC_BY_ID[id], pr = freshProblem(makePProblem, id);
  const { card, ctrls, setScore } = pqCard(pr, { title: t.name, sec: t.sec });
  const hintBox = el("div", { class: "hint", hidden: "" }, `<b>Hint</b>${pr.hint}`);
  const solBox = el("div", { class: "solution", hidden: "" }, `<div class="sol-lbl">Help me solve this</div>${pr.solution}`);
  let attempts = 0, finished = false, helped = false, firstRes = null;
  const check = btn("Check answer", "primary", () => {
    if (finished) return;
    const res = ctrls.map((c) => c.grade());
    if (res.every((r) => r.empty)) { ctrls.forEach((c, i) => pqShow(c, res[i], "try")); return; }
    attempts++;
    if (attempts === 1) firstRes = res;
    const allOk = res.every((r) => r.ok), final = allOk || attempts >= 2;
    ctrls.forEach((c, i) => pqShow(c, res[i], final ? "final" : "try"));
    if (final) {
      finished = true;
      setScore(res.filter((r) => r.ok).length / res.length);
      ctrls.forEach((c) => c.lock());
      recordResult({ catalog: "pgen", id, mode: "pearson", pr, results: firstRes, finalResults: res, helped, attempts, answers: ctrls.map((c) => c.yours()) });
      renderPearsonRail();
      check.hidden = true; clear.hidden = true;
      if (!allOk) solBox.hidden = false;
    }
    typeset(card);
  });
  check.setAttribute("data-check", "");
  const help = btn("Help me solve this", "", () => { if (!finished && !helped) { const p = state.pprogress[id] || (state.pprogress[id] = { tries: 0, solved: 0, streak: 0 }); p.streak = 0; persist(); renderPearsonRail(); } helped = true; solBox.hidden = false; solBox.scrollIntoView({ behavior: smooth(), block: "start" }); });
  const similar = btn("Similar question", "", () => { renderPearsonPractice(); window.scrollTo({ top: 0, behavior: smooth() }); });
  const hint = btn("Hint", "ghost", () => { hintBox.hidden = !hintBox.hidden; });
  const clear = btn("Clear all", "ghost", () => { ctrls.forEach((c) => { c.clear(); c.bar.hidden = true; c.sec.classList.remove("ok", "bad"); }); });
  const actions = el("div", { class: "actions" });
  actions.append(check, help, similar, hint, clear, el("span", { class: "score-line" }, "2 tries per question"));
  card.append(actions, hintBox, solBox);
  main.append(card);
  typeset(main);
}

function renderPearsonRail() {
  const rail = document.getElementById("rail"); rail.innerHTML = "";
  PTOPICS.forEach((s) => {
    rail.append(el("h2", {}, `<span>§${s.sec}</span><span>${s.name}</span>`));
    const ul = el("ul");
    s.items.forEach(([id, name]) => {
      const solved = Math.min(3, state.pprogress[id]?.streak || 0);
      const pips = [0, 1, 2].map((i) => `<i class="${i < solved ? "on" : ""}"></i>`).join("");
      const b = el("button", {
        type: "button", "aria-current": state.mode === "pearson" && state.ptopic === id ? "true" : "false",
        onclick: () => { state.mode = "pearson"; state.ptopic = id; persist(); render(); window.scrollTo({ top: 0, behavior: smooth() }); },
      }, `<span>${name}</span><span class="pips" aria-label="${solved} in a row">${pips}</span>`);
      const li = el("li"); li.append(b); ul.append(li);
    });
    rail.append(ul);
  });
  rail.append(el("h2", {}, `<span>Tests</span><span>${PTEST_BLUEPRINT.length} questions</span>`));
  const ul = el("ul");
  PTESTS.forEach((t) => {
    const best = state.mockScores[t.key];
    const b = el("button", { type: "button", "aria-current": state.mode === "ptest" ? "true" : "false", onclick: () => { state.mode = "ptest"; persist(); render(); } },
      `<span>${t.name}</span><span class="rail-score">${best != null ? `${best}%` : ""}</span>`);
    const li = el("li"); li.append(b); ul.append(li);
  });
  rail.append(ul);
  rail.append(el("p", { class: "legend" }, "Dots = right in a row on the first try, without help. 3 = mastered. One miss resets to zero."));
}

// ---------- practice tests ----------
function renderPTestHome() {
  clearInterval(examTimer);
  const main = document.getElementById("main"); main.innerHTML = "";
  const intro = el("section", { class: "sheet" });
  intro.innerHTML = `<div class="sheet-head"><h3>Pearson-style practice tests</h3><span class="tag">§1.1 – §1.4 · ${PTEST_BLUEPRINT.length} questions</span></div>
    <div class="prompt"><p>Every answer format from the homework: A/B limit choices, Yes/No, select all that apply, <b>y =</b> boxes, and separate unit boxes. Questions appear one at a time, you can jump between them, and nothing is graded until you submit.</p>
    <p>Scoring matches the homework: each question is worth 1 point, split across its parts, with the same strict rules — exact simplified fractions and correct units.</p></div>
    <div class="setup">${minutesSelect("pt-min")}</div>`;
  main.append(intro);
  const mins = () => +document.getElementById("pt-min").value;
  const grid = el("div", { class: "mock-grid" });
  PTESTS.forEach((t, i) => {
    const best = state.mockScores[t.key];
    const card = el("section", { class: "sheet mock-card" });
    card.innerHTML = `<div class="mock-letter" aria-hidden="true">${i + 1}</div><div><h3>${t.name}</h3><p class="mock-meta">${PTEST_BLUEPRINT.length} questions · same questions every time</p><p class="mock-best">${best != null ? `Best score <b>${best}%</b>` : "Not taken yet"}</p></div>`;
    const acts = el("div", { class: "actions" }); acts.append(btn("Start test", "primary", () => runPTest(t, mins())));
    card.append(acts); grid.append(card);
  });
  const rnd = el("section", { class: "sheet mock-card" });
  rnd.innerHTML = `<div class="mock-letter" aria-hidden="true">?</div><div><h3>Random test</h3><p class="mock-meta">New questions every time</p><p class="mock-best">Same layout as Tests 1–3</p></div>`;
  const racts = el("div", { class: "actions" });
  racts.append(btn("Start test", "primary", () => runPTest({ key: null, seed: 1000 + Math.floor(Math.random() * 900000), name: "Random test" }, mins())));
  rnd.append(racts); grid.append(rnd);
  main.append(grid);
}

function runPTest(test, minutes) {
  clearInterval(examTimer);
  const main = document.getElementById("main"); main.innerHTML = "";
  const problems = withSeed(test.seed, () => PTEST_BLUEPRINT.map((id) => ({ id, pr: makePProblem(id) })));
  const bar = el("div", { class: "exam-bar" });
  bar.innerHTML = `<span class="clock" id="clock">${minutes ? `${minutes}:00` : "∞"}</span><span class="meta">${test.name}<br><span class="pt-pos">Question 1 of ${problems.length}</span></span>`;
  bar.append(btn("Submit test", "", () => trySubmit()));
  const confirmRow = el("div", { class: "pt-confirm sheet", hidden: "" });
  const nav = el("nav", { class: "pt-nav", "aria-label": "Questions" });
  main.append(bar, confirmRow, nav);
  let cur = 0, done = false;
  const views = problems.map((p, i) => {
    const t = PTOPIC_BY_ID[p.id];
    const v = pqCard(p.pr, { title: t.name, sec: t.sec, num: i + 1 });
    v.card.hidden = i !== 0;
    main.append(v.card);
    const nb = el("button", { type: "button", class: "pt-q", "aria-label": `Question ${i + 1}`, onclick: () => go(i) }, String(i + 1));
    nav.append(nb);
    const mark = () => { if (!done) nb.classList.toggle("answered", !v.ctrls.every((c) => c.empty())); };
    v.card.addEventListener("input", mark); v.card.addEventListener("change", mark);
    return { ...p, ...v, nb };
  });
  const prev = btn("← Previous", "ghost", () => go(cur - 1)), next = btn("Next →", "primary", () => go(cur + 1));
  const pager = el("div", { class: "actions pt-pager" }); pager.append(prev, next);
  main.append(pager);
  function go(i) {
    if (i < 0 || i >= views.length) return;
    views[cur].card.hidden = true; views[cur].nb.removeAttribute("aria-current");
    cur = i; views[cur].card.hidden = false; views[cur].nb.setAttribute("aria-current", "true");
    const pos = bar.querySelector(".pt-pos"); if (pos) pos.textContent = `Question ${cur + 1} of ${views.length}`;
    prev.disabled = cur === 0; next.disabled = cur === views.length - 1;
    window.scrollTo({ top: 0 });
  }
  go(0);
  typeset(main);
  const end = Date.now() + minutes * 60000;
  if (minutes) {
    examTimer = setInterval(() => {
      const left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      const clock = document.getElementById("clock"); if (clock) clock.textContent = `${m}:${String(s).padStart(2, "0")}`;
      if (left <= 0) grade(true);
    }, 1000);
  }
  function trySubmit() {
    if (done) return;
    const blank = views.filter((v) => v.ctrls.every((c) => c.empty())).length;
    if (blank && confirmRow.hidden) {
      confirmRow.hidden = false; confirmRow.innerHTML = "";
      confirmRow.append(el("span", {}, `${blank} question${blank > 1 ? "s are" : " is"} still unanswered.`), btn("Submit anyway", "primary", () => grade(false)), btn("Keep working", "ghost", () => { confirmRow.hidden = true; }));
      return;
    }
    grade(false);
  }
  function grade(timeUp) {
    if (done) return; done = true; clearInterval(examTimer);
    confirmRow.remove(); bar.remove();
    let total = 0; const bySec = {};
    views.forEach((v) => {
      const res = v.ctrls.map((c) => c.grade());
      v.ctrls.forEach((c, i) => { pqShow(c, res[i], "final"); c.lock(); });
      const fr = res.filter((r) => r.ok).length / res.length;
      v.setScore(fr); total += fr;
      recordResult({ catalog: "pgen", id: v.id, mode: "ptest", pr: v.pr, results: res, helped: false, attempts: 1, answers: v.ctrls.map((c) => c.yours()), test: test.name });
      const sec = PTOPIC_BY_ID[v.id].sec; bySec[sec] = bySec[sec] || [0, 0]; bySec[sec][0] += fr; bySec[sec][1]++;
      v.nb.classList.remove("answered"); v.nb.classList.add(fr === 1 ? "full" : fr > 0 ? "partial" : "zero");
      v.card.append(el("details", { class: "solution" }, `<summary class="sol-lbl" style="cursor:pointer">Help me solve this</summary>${v.pr.solution}`));
    });
    const pct = Math.round((100 * total) / views.length);
    recordTest({ name: test.name, kind: "ptest", pct, bySec });
    if (test.key) { state.mockScores[test.key] = Math.max(state.mockScores[test.key] ?? 0, pct); persist(); renderPearsonRail(); }
    const weakest = Object.entries(bySec).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])[0];
    const res = el("section", { class: "sheet" });
    res.innerHTML = `<div class="sheet-head"><h3>${timeUp ? "Time's up — " : ""}${test.name} results</h3><span class="tag">graded</span></div>
      <div class="result"><span class="big">${pct}%</span><span>${+total.toFixed(2)} of ${views.length} points</span>
      <table>${Object.entries(bySec).map(([s, [a, b]]) => `<tr><td>§${s}</td><td>${+a.toFixed(2)}/${b}</td><td>${Math.round((100 * a) / b)}%</td></tr>`).join("")}</table></div>
      <p class="prompt" style="margin-top:10px">Click a question number to review it: <span class="pt-key full">full credit</span> <span class="pt-key partial">partial</span> <span class="pt-key zero">no credit</span>. Your weakest area was <b>§${weakest[0]}</b>. Practice those question types from the list on the left, then retake.</p>`;
    const acts = el("div", { class: "actions" });
    acts.append(btn("Back to tests", "primary", renderPTestHome), btn("Retake this test", "", () => runPTest(test, minutes)));
    res.append(acts);
    main.insertBefore(res, nav);
    typeset(main);
    go(cur);
  }
}
