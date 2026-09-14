// ================= app: navigation, practice, mixed review, exam simulation, formula sheet =================
const TOPICS = [
  { sec: "1.1", name: "Limits: numerical & graphical", items: [["graphRead", "Limits from a graph"], ["numTable", "Estimating from a table"], ["inverse", "Infinite limits"], ["endBehavior", "End behavior at ±∞"], ["bigPiecewise", "Piecewise: the big example"], ["concepts11", "Concept check"]] },
  { sec: "1.2", name: "Algebraic limits & continuity", items: [["properties", "Properties of limits"], ["directSub", "Direct substitution"], ["factor", "0/0 — factor, cancel, conjugate"], ["infRational", "Rational limits at ±∞"], ["pwLimit", "Piecewise limits"], ["continuity", "Continuity at a point"], ["discType", "Types of discontinuity"], ["concepts12", "Concept check"]] },
  { sec: "1.3", name: "Average rate of change", items: [["arcFunc", "Average rate, with units"], ["arcData", "Rates from tables & graphs"], ["arcShrink", "Shrinking intervals"], ["dq", "Difference quotient"], ["concepts13", "Concept check"]] },
  { sec: "1.4", name: "The derivative", items: [["deriv", "f′(x) by the limit definition"], ["tangent", "Tangent lines"], ["interp", "Interpreting f′(a)"], ["diffGraph", "Continuous vs. differentiable"], ["rateGraph", "Rates from a graph (T/F)"], ["concepts14", "Concept check"]] },
];
const TOPIC_BY_ID = {};
TOPICS.forEach((s) => s.items.forEach(([id, name]) => { TOPIC_BY_ID[id] = { id, name, sec: s.sec }; }));
const EXAM_DATE = new Date(2026, 8, 16);
const KEY = "mat213-midterm-lab-v1";
const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

const store = {
  load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } },
  save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};
const state = Object.assign({ mode: "practice", topic: "graphRead", progress: {}, mockScores: {} }, store.load());
if (!GEN[state.topic]) state.topic = "graphRead";
const persist = () => store.save({ mode: state.mode, topic: state.topic, progress: state.progress, mockScores: state.mockScores });
let examTimer = null, uidCounter = 0;

function el(tag, attrs = {}, html) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  if (html != null) e.innerHTML = html;
  return e;
}
function typeset(node) {
  const MJ = window.MathJax;
  if (MJ && MJ.typesetPromise) { if (MJ.typesetClear) MJ.typesetClear([node]); return MJ.typesetPromise([node]).catch(() => {}); }
  return Promise.resolve();
}
function makeProblem(id) {
  for (let i = 0; i < 6; i++) { try { return GEN[id](); } catch (e) { console.warn(id, e); } }
  throw new Error("Could not generate " + id);
}
function insertAt(input, text) {
  const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0, s) + text + input.value.slice(e);
  const pos = s + text.length; input.setSelectionRange(pos, pos);
}

// ---------- countdown & rail ----------
function renderCountdown() {
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((EXAM_DATE - today) / 86400000);
  const [num, lbl] = days > 1 ? [days, "days to go"] : days === 1 ? [1, "day — it's tomorrow"] : days === 0 ? ["0", "exam day — you've got this"] : ["✓", "exam finished"];
  document.getElementById("countdown").innerHTML = `<span class="num">${num}</span><span class="lbl"><b>Midterm · Wed, Sep 16</b>${lbl}</span>`;
}
function renderRail() {
  const rail = document.getElementById("rail"); rail.innerHTML = "";
  TOPICS.forEach((s) => {
    rail.append(el("h2", {}, `<span>§${s.sec}</span><span>${s.name}</span>`));
    const ul = el("ul");
    s.items.forEach(([id, name]) => {
      const solved = state.progress[id]?.solved || 0;
      const pips = [0, 1, 2].map((i) => `<i class="${i < solved ? "on" : ""}"></i>`).join("");
      const b = el("button", {
        type: "button", "aria-current": state.mode === "practice" && state.topic === id ? "true" : "false",
        onclick: () => { state.mode = "practice"; state.topic = id; persist(); render(); window.scrollTo({ top: 0, behavior: smooth() }); },
      }, `<span>${name}</span><span class="pips" aria-label="${solved} solved">${pips}</span>`);
      const li = el("li"); li.append(b); ul.append(li);
    });
    rail.append(ul);
  });
  rail.append(el("p", { class: "legend" }, "A dot fills each time you solve a problem fully without opening the solution."));
}

// ---------- problem card ----------
function partView(part, i, n) {
  const id = "p" + ++uidCounter;
  const li = el("li", { class: "part" });
  li.append(el("div", { class: "letter" }, n > 1 ? String.fromCharCode(97 + i) + "." : ""));
  const body = el("div", { class: "body" }); li.append(body);
  body.append(el("div", { class: "label", id: id + "-l" }, part.label));
  const feedback = el("div", { class: "feedback", "aria-live": "polite" });
  let api;
  if (part.type === "mc") {
    const tf = part.choices.length === 2 && part.choices[0] === "True";
    const wrap = el("div", { class: tf ? "choice-row" : "choices", role: "radiogroup", "aria-labelledby": id + "-l" });
    const inputs = part.choices.map((c, j) => {
      const lab = el("label", { class: "choice" });
      const inp = el("input", { type: "radio", name: id, id: `${id}-${j}`, value: String(j) });
      inp.addEventListener("change", () => { li.classList.remove("ok", "bad"); inputs.forEach((o) => o.lab.classList.remove("wrong")); });
      lab.append(inp, el("span", {}, c)); wrap.append(lab);
      return { inp, lab };
    });
    body.append(wrap, feedback);
    api = {
      value: () => inputs.findIndex((o) => o.inp.checked),
      grade() { const k = this.value(); return k < 0 ? { empty: true } : { ok: k === part.ans }; },
      mark(res, reveal) { const k = this.value(); inputs.forEach((o, j) => { o.lab.classList.toggle("right", !!reveal && j === part.ans); o.lab.classList.toggle("wrong", !!res && res.ok === false && j === k); }); },
      lock() { inputs.forEach((o) => { o.inp.disabled = true; }); },
      answerText: () => part.choices[part.ans],
    };
  } else {
    const row = el("div", { class: "answer-row" });
    const input = el("input", {
      type: "text", id, autocomplete: "off", autocapitalize: "off", spellcheck: "false", inputmode: "text", "aria-labelledby": id + "-l",
      placeholder: part.type === "line" ? "y = …" : part.type === "expr" ? `in terms of ${(part.vars || ["x"]).join(" and ")}` : "number, inf, -inf, or DNE",
    });
    const mark = el("span", { class: "mark", hidden: "" });
    row.append(input, mark);
    const keys = el("div", { class: "keys", "aria-label": "insert symbols" });
    const keyset = part.type === "num" ? ["DNE", "inf", "-inf", "/", "sqrt(", "^"]
      : part.type === "expr" ? ["^", "/", "(", ")", "sqrt(", ...(part.vars || ["x"])]
        : ["y = ", "x", "^", "/", "(", ")"];
    keyset.forEach((k) => keys.append(el("button", { type: "button", tabindex: "-1", onclick: () => { insertAt(input, k); input.dispatchEvent(new Event("input")); input.focus(); } },
      k === "inf" ? "∞" : k === "-inf" ? "−∞" : k === "sqrt(" ? "√(" : k.trim())));
    const preview = el("div", { class: "preview" });
    body.append(row, keys, preview, feedback);
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => updatePreview(input.value, part.type, preview), 220);
      li.classList.remove("ok", "bad"); mark.hidden = true; feedback.innerHTML = "";
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); input.closest(".sheet")?.querySelector("[data-check]")?.click(); } });
    api = {
      value: () => input.value,
      grade: () => Check[part.type](input.value, part),
      mark(res) {
        if (!res || res.empty || !("ok" in res)) { mark.hidden = true; return; }
        mark.hidden = false; mark.className = "mark " + (res.ok ? "ok" : "bad"); mark.textContent = res.ok ? "✓ correct" : "✗ not yet";
      },
      lock() { input.disabled = true; keys.remove(); },
      answerText: () => $m(part.type === "num" ? T.ans(part.ans) : part.display),
    };
  }
  Object.assign(api, { li, feedback, part });
  return { li, api };
}
function updatePreview(raw, type, box) {
  if (!raw.trim()) { box.innerHTML = ""; return; }
  const tex = Check.preview(raw, type);
  box.innerHTML = tex == null ? `<span class="pv-lbl">reads as</span>…keep typing` : `<span class="pv-lbl">reads as</span>\\(${tex}\\)`;
  if (tex != null) typeset(box);
}
function applyResult(api, res, reveal) {
  api.li.classList.remove("ok", "bad");
  let fb = "";
  if (res.empty) fb = reveal ? "" : `<span class="reveal">No answer yet.</span>`;
  else if (res.err && !("ok" in res)) fb = `<span class="preview err">${res.err}</span>`;
  else {
    api.li.classList.add(res.ok ? "ok" : "bad");
    if (res.err) fb += `<span class="preview err">${res.err}</span>`;
    if (res.note) fb += `<div>${res.note}</div>`;
  }
  if (reveal && !res.ok) fb += `<div class="reveal">Answer: ${api.answerText()}</div>`;
  api.feedback.innerHTML = fb;
  api.mark(res, reveal);
}
function problemCard(pr, { title, tag, num }) {
  const card = el("article", { class: "sheet" });
  card.append(el("div", { class: "sheet-head" }, `<h3>${num ? `<span class="qnum">${num}.</span>` : ""}${title}</h3><span class="tag">${tag}</span>`));
  card.append(el("div", { class: "prompt" }, pr.prompt));
  if (pr.figure) card.append(el("div", { class: "figure" }, pr.figure));
  const list = el("ol", { class: "parts" });
  const ctrls = pr.parts.map((part, i) => { const { li, api } = partView(part, i, pr.parts.length); list.append(li); return api; });
  card.append(list);
  return { card, ctrls };
}

// ---------- practice & mixed ----------
function tipsCard() {
  const d = el("details", { class: "sheet" });
  if (!Object.keys(state.progress).length) d.setAttribute("open", "");
  d.innerHTML = `<summary class="sheet-head" style="cursor:pointer;margin-bottom:0;border:0;padding:0"><h3>How to type answers</h3><span class="tag">open / close</span></summary>
    <div class="intro" style="margin-top:14px">
      <div class="cell"><h4>Numbers & limits</h4><p><code>1/3</code> or <code>0.33</code> · <code>inf</code>, <code>-inf</code> · <code>DNE</code> (or “undefined”)</p></div>
      <div class="cell"><h4>Expressions</h4><p><code>2x + h - 3</code> · <code>-4/x^2</code> · <code>1/(2sqrt(x))</code> — the preview shows how it was read.</p></div>
      <div class="cell"><h4>Tangent lines</h4><p><code>y = -8x - 9</code> or point-slope <code>y - 15 = -8(x + 3)</code>. Both count.</p></div>
    </div>
    <p class="warn"><b>From your HW 2, #3:</b> ${$m("6 - x - x^2")} at ${$m("x = 1")} is ${$m("6 - 1 - 1 = 4")}, not ${$m("-4")}. The sign got lost when the expression was rewritten as ${$m("x^2 + x - 6")}. Substitute into the original piece, term by term. The continuity drills use negative leading terms on purpose.</p>`;
  return d;
}
function renderPractice(mixed) {
  const main = document.getElementById("main"); main.innerHTML = "";
  if (!mixed) main.append(tipsCard());
  const id = mixed ? R.pick(Object.keys(TOPIC_BY_ID)) : state.topic;
  const t = TOPIC_BY_ID[id], pr = makeProblem(id);
  const { card, ctrls } = problemCard(pr, { title: t.name, tag: `§${t.sec}${mixed ? " · mixed review" : ""}` });
  const btnCheck = el("button", { class: "btn primary", type: "button", "data-check": "" }, "Check answers");
  const btnHint = el("button", { class: "btn ghost", type: "button" }, "Hint");
  const btnSol = el("button", { class: "btn", type: "button" }, "Show solution");
  const btnNext = el("button", { class: "btn", type: "button" }, mixed ? "Next random problem →" : "New problem →");
  const score = el("span", { class: "score-line", "aria-live": "polite" });
  const actions = el("div", { class: "actions" }); actions.append(btnCheck, btnHint, btnSol, btnNext, score);
  const hintBox = el("div", { class: "hint", hidden: "" }, `<b>Hint</b>${pr.hint}`);
  const solBox = el("div", { class: "solution", hidden: "" }, `<div class="sol-lbl">Worked solution</div>${pr.solution}`);
  card.append(actions, hintBox, solBox);
  let tried = false, counted = false;
  btnCheck.onclick = () => {
    const results = ctrls.map((c) => { const r = c.grade(); applyResult(c, r, !solBox.hidden); return r; });
    const right = results.filter((r) => r.ok).length, total = results.length;
    const p = state.progress[id] || (state.progress[id] = { tries: 0, solved: 0 });
    if (!tried) { p.tries++; tried = true; }
    if (right === total && !counted && solBox.hidden) { p.solved++; counted = true; }
    score.textContent = right === total ? `All ${total} correct${solBox.hidden ? "" : " (solution was open)"}` : `${right} of ${total} correct`;
    persist(); renderRail(); typeset(card);
  };
  btnHint.onclick = () => { hintBox.hidden = !hintBox.hidden; };
  btnSol.onclick = () => { solBox.hidden = false; ctrls.forEach((c) => applyResult(c, c.grade(), true)); typeset(card); solBox.scrollIntoView({ behavior: smooth(), block: "start" }); };
  btnNext.onclick = () => { renderPractice(mixed); window.scrollTo({ top: 0, behavior: smooth() }); };
  main.append(card);
  typeset(main);
}

// ---------- formula sheet ----------
function renderFormulas() {
  const main = document.getElementById("main"); main.innerHTML = "";
  const c = el("section", { class: "sheet formula" });
  c.innerHTML = `<div class="sheet-head"><h3>Formula & fact sheet</h3><span class="tag">the blanks from your notes, filled in</span></div>` +
    FORMULA_SHEET.map((s) => `<section><h3><span class="tag">§${s.sec}</span>${s.title}</h3><dl>${s.items.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></section>`).join("");
  main.append(c);
  typeset(main);
}

function render() {
  clearInterval(examTimer);
  document.querySelectorAll(".modes button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === state.mode ? "true" : "false"));
  renderRail();
  if (state.mode === "practice") renderPractice(false);
  else if (state.mode === "mixed") renderPractice(true);
  else if (state.mode === "exam") renderMocks();
  else renderFormulas();
}
document.querySelectorAll(".modes button").forEach((b) => { b.onclick = () => { state.mode = b.dataset.mode; persist(); render(); }; });
renderCountdown();
if (!bootFromURL()) render();
