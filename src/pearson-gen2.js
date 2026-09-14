// ================= Pearson-format questions (part 2): rates of change, derivatives, topic list, tests =================
const FRACS = [q(1, 2), q(1, 3), q(1, 4), q(3, 2), q(-1, 2), q(2, 3), q(3, 4), q(-3, 2)];
const clock = (h) => (h === 12 ? "noon" : `${h % 12 || 12} ${h < 12 ? "a.m." : "p.m."}`);

function quadSteps(a, b, c, low = false) {
  a = Q.of(a); b = Q.of(b); c = Q.of(c);
  return $M(`f'(x) = ${LH} \\frac{\\left[${sumTex([[a, "(x + h)^2"], [b, "(x + h)"], [c, ""]])}\\right] - \\left(${T.poly([a, b, c], "x", low)}\\right)}{h}`) +
    $M(`= ${LH} \\frac{${sumTex([[a.mul(2), "xh"], [a, "h^2"], [b, "h"]])}}{h} = ${LH} \\left(${sumTex([[a.mul(2), "x"], [a, "h"], [b, ""]])}\\right) = ${T.poly([a.mul(2), b])}`);
}

// ---------- §1.3 ----------
const SITUATIONS = [
  () => { const h1 = R.int(7, 15), d = R.pick([2, 3, 4, 5]), A = R.int(48, 80), ch = R.int(2, 15), up = R.chance(0.6), B = up ? A + ch : A - ch;
    return { text: `The temperature ${up ? "rose" : "fell"} from ${A} degrees at ${clock(h1)} to ${B} degrees at ${clock(h1 + d)}.`, lead: `The temperature ${up ? "rose" : "fell"}`, rate: q(ch, d), top: `${B} - ${A}`, bottom: d, canon: "degree/hour", display: "degrees/hour", ex: "feet/second", out: "degrees", inp: "hour" }; },
  () => { const h1 = R.int(8, 14), d = R.pick([2, 3, 4]), m1 = R.int(12000, 48000), dist = R.int(70, 260);
    return { text: `A car's odometer read ${m1} miles at ${clock(h1)} and ${m1 + dist} miles at ${clock(h1 + d)}.`, lead: "The car traveled at an average rate of", rate: q(dist, d), top: `${m1 + dist} - ${m1}`, bottom: d, canon: "mile/hour", display: "miles/hour", ex: "degrees/hour", out: "miles", inp: "hour" }; },
  () => { const w1 = R.int(6, 9), k = R.pick([2, 3, 4, 6]), gain = R.int(3, 10);
    return { text: `A baby weighed ${w1} pounds at birth and ${w1 + gain} pounds at ${k} months old.`, lead: "The baby's weight increased at an average rate of", rate: q(gain, k), top: `${w1 + gain} - ${w1}`, bottom: k, canon: "pound/month", display: "pounds/month", ex: "inches/year", out: "pounds", inp: "month" }; },
  () => { const [d1, d2, n] = R.pick([["Monday", "Thursday", 3], ["Monday", "Friday", 4], ["Tuesday", "Friday", 3], ["Monday", "Wednesday", 2]]), p1 = R.int(20, 90), ch = R.int(1, 12), up = R.chance(0.5), p2 = up ? p1 + ch : p1 - ch;
    return { text: `A stock's price ${up ? "rose" : "fell"} from $${p1} per share on ${d1} to $${p2} per share on ${d2}.`, lead: `The price ${up ? "rose" : "fell"}`, rate: q(ch, n), top: `${p2} - ${p1}`, bottom: n, canon: "dollar/day", display: "dollars/day", ex: "miles/hour", out: "dollars", inp: "day" }; },
  () => { const w1 = R.int(1, 4), w2 = w1 + R.int(2, 5), h1 = R.int(3, 20), gain = R.int(4, 30);
    return { text: `A plant was ${h1} centimeters tall after ${w1} weeks and ${h1 + gain} centimeters tall after ${w2} weeks.`, lead: "The plant grew at an average rate of", rate: q(gain, w2 - w1), top: `${h1 + gain} - ${h1}`, bottom: `${w2} - ${w1}`, canon: "centimeter/week", display: "centimeters/week", ex: "pounds/month", out: "centimeters", inp: "week" }; },
  () => { const d = R.pick([2, 3, 4, 5]), a = R.int(48, 72), drop = R.int(2, 11);
    return { text: `The water in a pool dropped from ${a} inches deep at noon to ${a - drop} inches deep at ${clock(12 + d)}.`, lead: "The water level fell", rate: q(drop, d), top: `${a - drop} - ${a}`, bottom: d, canon: "inch/hour", display: "inches/hour", ex: "degrees/day", out: "inches", inp: "hour" }; },
];
PGEN.arcSituation = () => {
  const s = R.pick(SITUATIONS)();
  return {
    prompt: para(`State the average rate of change for the situation. Be sure to include units.`) + para(s.text),
    parts: [PP.num(`${s.lead} ______`, s.rate), PP.units(`Units`, s.canon, s.display, s.ex)],
    hint: `Average rate = (change in ${s.out}) ÷ (change in time). The units follow the same order: ${s.out} per ${s.inp}.`,
    solution: $M(`\\text{average rate of change} = \\frac{${s.top}}{${s.bottom}} = ${s.rate.tex()}`) +
      para(`So the answer is <b>${s.rate.tex().includes("frac") ? $m(s.rate.tex()) : s.rate.tex()} ${s.display}</b>. The sentence already says the direction (rose/fell/grew), so you type the size of the rate.`) +
      para(`Watch out: dividing time by ${s.out} gives ${$m(Q.of(s.rate).n === 0 ? "0" : new Q(s.rate.d, s.rate.n).abs().tex())} and flipped units (${s.inp}s per ${s.out.replace(/s$/, "")}). That's the most common way this question gets marked wrong.`),
  };
};

PGEN.arcFunction = () => {
  const v = R.pick(["quad", "quad", "quadFrac", "recip", "sqrt", "cubic"]);
  let ftex, a, b, f;
  if (v === "quad" || v === "quadFrac") {
    const co = [v === "quad" ? q(R.nz(-3, 4)) : R.pick(FRACS), q(R.int(-6, 6)), q(R.int(-9, 9))];
    ftex = T.poly(co); a = R.int(-2, 3); b = a + R.int(1, 4); f = (x) => evalPoly(co, x);
  } else if (v === "recip") {
    const k = R.pick([2, 3, 4, 6, 8, -4, -6]); ftex = `\\frac{${k}}{x}`; a = R.int(1, 3); b = a + R.int(1, 4); f = (x) => q(k, x);
  } else if (v === "sqrt") {
    const r1 = R.int(0, 3), r2 = r1 + R.int(1, 3); ftex = `\\sqrt{x}`; a = r1 * r1; b = r2 * r2; f = (x) => q(Math.round(Math.sqrt(x)));
  } else {
    const c = R.int(-5, 5); ftex = T.poly([1, 0, 0, c]); a = R.int(-2, 1); b = a + R.int(1, 3); f = (x) => q(x ** 3 + c);
  }
  const fa = f(a), fb = f(b), val = fb.sub(fa).div(b - a);
  return {
    prompt: para(`Find the average rate of change for the function over the given interval.`) + $M(`y = ${ftex} \\quad \\text{between } x = ${a} \\text{ and } x = ${b}`),
    parts: [PP.num(`The average rate of change is`, val)],
    hint: "Compute f(b) and f(a) first, then (f(b) − f(a)) / (b − a). Reduce the fraction.",
    solution: $M(`f(${b}) = ${fb.tex()}, \\qquad f(${a}) = ${fa.tex()}`) + $M(`\\frac{f(${b}) - f(${a})}{${b} - ${T.par(a)}} = \\frac{${fb.tex()} - ${T.par(fa)}}{${b - a}} = \\frac{${fb.sub(fa).tex()}}{${b - a}} = ${val.tex()}`),
  };
};

PGEN.instRate = () => {
  if (R.chance(0.35)) {
    const v0 = R.pick([32, 48, 64, 80]), h0 = R.int(0, 60), p = R.int(1, 3), vel = -32 * p + v0;
    return {
      prompt: para(`A ball is thrown upward. Its height in feet after ${$m("t")} seconds is ${$m(`s(t) = -16t^2 + ${v0}t${h0 ? ` + ${h0}` : ""}`)}. Find the instantaneous velocity at ${$m(`t = ${p}`)}.`),
      parts: [PP.num(`The instantaneous velocity at t = ${p} is`, q(vel)), PP.units("Units", "foot/second", "feet/second", "miles/hour")],
      hint: "Instantaneous velocity is the limit of the average velocity: lim h→0 [s(t+h) − s(t)]/h.",
      solution: $M(`s'(t) = ${LH} \\frac{s(t + h) - s(t)}{h} = ${LH} \\frac{-32th - 16h^2 + ${v0}h}{h} = -32t + ${v0}`) +
        $M(`s'(${p}) = -32(${p}) + ${v0} = ${vel}\\ \\text{feet per second}`) + para(vel < 0 ? "Negative: the ball is on its way down." : vel === 0 ? "Zero: the ball is at its highest point." : "Positive: the ball is still rising."),
    };
  }
  const a = R.pick([...FRACS, q(1), q(2), q(-1), q(3)]), b = q(R.int(-6, 6)), c = q(R.int(-8, 8)), p = R.int(-3, 4);
  const val = a.mul(2 * p).add(b);
  return {
    prompt: para(`Find the instantaneous rate of change for the function at the given value.`) + $M(`F(x) = ${T.poly([a, b, c])} \\quad \\text{at } x = ${p}`),
    parts: [PP.num(`The instantaneous rate of change at x = ${p} is`, val)],
    hint: "Use lim h→0 [F(a+h) − F(a)]/h, or find F′(x) with the limit definition and substitute.",
    solution: quadSteps(a, b, c).replace(/f'\(x\)/g, "F'(x)") + $M(`F'(${p}) = ${T.poly([a.mul(2), b]).replace(/x/g, `(${p})`)} = ${val.tex()}`),
  };
};

PGEN.dqP = () => pearsonize(GEN.dq());
PGEN.arcDataP = () => pearsonize(GEN.arcData(), { round: true });

// ---------- §1.4 ----------
PGEN.derivDef = () => {
  const c = R.pick([q(1, 2), q(1, 3), q(1, 4), q(3, 2), q(-1, 2), q(2, 3), q(3, 4), q(2), q(-1)]), b = R.chance(0.35) ? R.nz(-4, 4) : 0;
  const xs = R.pick([[0, 1, 3], [-2, 0, 2], [1, 2, 4], [-1, 1, 3]]);
  const fpTex = T.poly([c.mul(2), b]);
  return {
    prompt: para(`Use the function ${$m(`f(x) = ${T.poly([c, b, 0])}`)} to answer the parts.`) +
      para(`(a) Find ${$m("f'(x)")} by determining ${$m(`${LH} \\frac{f(x+h) - f(x)}{h}`)}.`) + para(`(b) Find ${xs.map((x) => $m(`f'(${x})`)).join(", ")}.`),
    parts: [
      PP.expr($m("f'(x) ="), (e) => 2 * c.val() * e.x + b, fpTex),
      ...xs.map((x) => PP.num($m(`f'(${x}) =`), c.mul(2 * x).add(b))),
    ],
    hint: "Replace x with (x + h), expand, subtract f(x), cancel the h, then let h → 0. A fraction coefficient just rides along.",
    solution: quadSteps(c, b, 0) + $M(xs.map((x) => `f'(${x}) = ${c.mul(2 * x).add(b).tex()}`).join(",\\quad ")) +
      para(`On the homework version, parts that ask you to graph and draw tangent lines at these x-values use the same numbers: each ${$m("f'(a)")} is the slope of the tangent line at ${$m("x = a")}.`),
  };
};

PGEN.tangentP = () => {
  const v = R.pick(["cq", "cq", "std", "recip", "cubic", "sqrt"]);
  let ftex, p, y0, m, steps;
  if (v === "cq" || v === "std") {
    const k = v === "cq" ? R.pick([q(-3), q(-2), q(-1), q(1), q(2), q(3), q(1, 2), q(-1, 2)]) : q(R.nz(-3, 3));
    const lin = v === "cq" ? q(0) : q(R.int(-6, 6)), c0 = q(R.nz(-8, 8)), low = v === "cq" || R.chance(0.5);
    ftex = T.poly([k, lin, c0], "x", low); p = R.nz(-5, 5);
    y0 = evalPoly([k, lin, c0], p); m = k.mul(2 * p).add(lin); steps = quadSteps(k, lin, c0, low);
  } else if (v === "recip") {
    const k = R.pick([2, 4, 6, 8, -4, -6, 12]); p = R.pick([1, 2, -1, -2].filter((z) => Math.abs(k) % Math.abs(z) === 0));
    ftex = `\\frac{${k}}{x}`; y0 = q(k, p); m = q(-k, p * p); steps = derivSteps("recip", { k });
  } else if (v === "cubic") {
    const b = R.int(-4, 4); p = R.nz(-2, 2); ftex = T.poly([1, 0, b, 0]); y0 = q(p ** 3 + b * p); m = q(3 * p * p + b); steps = derivSteps("cubic", { b });
  } else {
    const r = R.int(1, 4); p = r * r; ftex = "\\sqrt{x}"; y0 = q(r); m = q(1, 2 * r); steps = derivSteps("sqrt", {});
  }
  const bb = y0.sub(m.mul(p));
  return {
    prompt: para(`Find an equation of the line tangent to the graph of ${$m(`f(x) = ${ftex}`)} at ${$m(`(${p}, ${y0.tex()})`)}.`),
    parts: [PP.line(`The equation of the tangent line to the graph of ${$m(`f(x) = ${ftex}`)} at ${$m(`(${p}, ${y0.tex()})`)} is`, m, bb)],
    hint: "Slope = f′(a) from the limit definition. Then y − y₁ = m(x − x₁), and solve for y.",
    solution: steps + $M(`m = f'(${p}) = ${m.tex()}`) + $M(`${T.pointSlope(m, p, y0)} \\;\\Rightarrow\\; ${T.line(m, bb)}`) +
      para(`Type only the right side in the box: ${$m(T.poly([m, bb]))}.`),
  };
};

PGEN.pwDiff = () => {
  const a = R.pick([1, 2, 3, 4, -1, -2]), p = R.pick([1, 1, -1, 2]), k = R.int(-6, 8);
  const L = p * a * a + k, slopeL = 2 * p * a, kind = R.pick(["corner", "corner", "smooth", "jump"]);
  let m; if (kind === "smooth") m = slopeL; else { do { m = R.nz(-6, 8); } while (m === slopeL); }
  let b = L - m * a; if (kind === "jump") b += R.pick([-3, -2, 2, 3]);
  const right = m * a + b, cont = right === L, diff = cont && m === slopeL;
  const Lt = T.poly([p, 0, k]), Rt = T.poly([m, b]);
  return {
    prompt: para(`Let ${$m("f")} be the following piecewise-defined function.`) + $M(`f(x) = \\begin{cases} ${Lt} & \\text{for } x \\le ${a} \\\\ ${Rt} & \\text{for } x > ${a} \\end{cases}`) +
      para(`(a) Is ${$m("f")} continuous at ${$m(`x = ${a}`)}?<br>(b) Is ${$m("f")} differentiable at ${$m(`x = ${a}`)}?`),
    parts: [PP.yn(`(a) Is ${$m("f(x)")} continuous at ${$m(`x = ${a}`)}?`, cont), PP.yn(`(b) Is ${$m("f(x)")} differentiable at ${$m(`x = ${a}`)}?`, diff)],
    hint: "Continuity: plug x = a into BOTH pieces — same height? Differentiability: also compare the slopes of the two pieces at x = a.",
    solution:
      para(`<b>(a)</b> Top piece at ${$m(`x = ${a}`)}: ${$m(`${p === 1 ? "" : p === -1 ? "-" : p}(${a})^2 ${k < 0 ? "-" : "+"} ${Math.abs(k)} = ${L}`)}. Bottom piece: ${$m(`${m}(${a}) ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${right}`)}. ${cont ? `Both give ${L}, so ${$m("f")} is <b>continuous</b>.` : `${L} ≠ ${right}: a jump, so <b>not continuous</b>.`}`) +
      para(`<b>(b)</b> ${cont ? `Slope of the top piece: its derivative is ${$m(`${2 * p}x`)}, which is ${$m(slopeL)} at ${$m(`x = ${a}`)}. Slope of the line: ${$m(m)}. ${m === slopeL ? "They match, so the pieces join smoothly → <b>differentiable</b>." : `${slopeL} ≠ ${m}, so the graph has a corner → <b>not differentiable</b>.`}` : "A function that isn't continuous at a point can't be differentiable there → <b>No</b>."}`),
  };
};

PGEN.notDiffGraph = () => {
  const askCont = R.chance(0.3), xs = [1.5, 3.5, 5.5, 7.5, 9.5, 11.5];
  const view = { xmin: -0.8, xmax: 13.4, ymin: -1.8, ymax: 6.2, W: 580, H: 300, noGrid: true, noLabels: true, dotContinuous: true, padL: 16, padB: 30 };
  for (let attempt = 0; attempt < 400; attempt++) {
    const types = R.shuffle(["smooth", "smooth", "corner", "hole", "holePt", "jump", "asym"]).slice(0, 6);
    const nodes = [{ x: -1.4, yR: R.pick([0.5, 1, 1.5]), sR: 0.3 }];
    types.forEach((t, i) => {
      const y = R.pick([1.5, 2, 2.5, 3, 3.5]), s = R.pick([-0.6, -0.3, 0, 0.3, 0.6]), nd = { x: xs[i], t };
      if (t === "smooth") Object.assign(nd, { yL: y, yR: y, val: y, sL: s, sR: s });
      if (t === "corner") { const sl = R.pick([-1.6, 1.6]); Object.assign(nd, { yL: y, yR: y, val: y, sL: sl, sR: -sl }); }
      if (t === "hole") Object.assign(nd, { yL: y, yR: y, val: null, sL: s, sR: s });
      if (t === "holePt") Object.assign(nd, { yL: y, yR: y, val: y + R.pick([1.3, -1.3]), sL: s, sR: s });
      if (t === "jump") Object.assign(nd, { yL: y, yR: y + R.pick([-1.5, 1.5]), val: y, sL: s, sR: s });
      if (t === "asym") Object.assign(nd, { yL: R.pick([Infinity, -Infinity]), yR: R.pick([Infinity, -Infinity]), val: null, sL: 0, sR: 0 });
      nodes.push(nd);
    });
    nodes.push({ x: 14.2, yL: R.pick([1.5, 2.5]), sL: 0.3 });
    let ok = true;
    for (let i = 0; i < nodes.length - 1 && ok; i++) {
      const A = nodes[i], B = nodes[i + 1];
      if (!isFinite(A.yR) || !isFinite(B.yL)) continue;
      const f = Graph.segFn(A, B);
      for (let k = 1; k < 40; k++) { const y = f(A.x + ((B.x - A.x) * k) / 40); if (y < 0.3 || y > 5.4) { ok = false; break; } }
    }
    nodes.forEach((nd) => { [nd.yL, nd.yR, nd.val].forEach((y) => { if (y != null && isFinite(y) && (y < 0.4 || y > 5.2)) ok = false; }); });
    if (!ok) continue;
    const inner = nodes.slice(1, -1), infos = inner.map(Graph.info);
    const svg = Graph.drawPiecewise(nodes, {
      ...view,
      extras(g) {
        inner.forEach((nd, i) => {
          const tops = [nd.yL, nd.yR, nd.val].filter((y) => y != null && isFinite(y));
          if (tops.length) g.raw(`<line class="gp-asym" x1="${g.X(nd.x)}" y1="${g.Y(0)}" x2="${g.X(nd.x)}" y2="${g.Y(Math.max(...tops))}"/>`);
          g.raw(`<text class="gp-name" text-anchor="middle" x="${g.X(nd.x)}" y="${g.Y(0) + 20}">x<tspan dy="4" font-size="11">${i}</tspan></text>`);
        });
      },
    }, "graph with labeled points x0 through x5");
    const order = R.shuffle([0, 1, 2, 3, 4, 5]);
    const bad = (i) => (askCont ? !infos[i].continuous : !infos[i].differentiable);
    const choices = order.map((i) => $m(`x_{${i}}`));
    const ans = order.map((i, j) => (bad(i) ? j : -1)).filter((j) => j >= 0);
    const why = (n, i) => {
      const lab = $m(`x_{${i}}`);
      if (n.differentiable) return `${lab}: smooth and unbroken → continuous and differentiable.`;
      if (n.corner) return `${lab}: a sharp corner → continuous, but <b>not differentiable</b>.`;
      if (n.type === "infinite") return `${lab}: vertical asymptote → not continuous, not differentiable.`;
      if (n.type === "jump") return `${lab}: the graph jumps → not continuous, not differentiable.`;
      return `${lab}: a hole (open circle${n.value !== "DNE" ? ", with the point moved elsewhere" : ""}) → not continuous, not differentiable.`;
    };
    return {
      prompt: para(`List the points in the graph at which the function is <b>not ${askCont ? "continuous" : "differentiable"}</b>.`),
      figure: svg,
      parts: [PP.multi(`Select all that apply.`, choices, ans)],
      hint: askCont ? "Not continuous: holes, jumps, vertical asymptotes. Corners ARE continuous." : "Not differentiable: corners, holes, jumps, vertical asymptotes (and vertical tangents). Smooth points are fine.",
      solution: infos.map((n, i) => para(why(n, i))).join("") + para(askCont ? "Corners are the trap: no break in the graph, so they're continuous even though they aren't differentiable." : "Every discontinuity is also a non-differentiable point, plus the corners."),
    };
  }
  throw new Error("notDiffGraph generation failed");
};

PGEN.interpP = () => pearsonize(GEN.interp());
PGEN.derivP = () => pearsonize(GEN.deriv());

// ---------- topic list & practice tests ----------
const PTOPICS = [
  { sec: "1.1–1.2", name: "Limits & continuity", items: [["limGraph", "Limits from a graph"], ["limTable", "Complete the table"], ["limAlg", "Find the limit, if it exists"], ["limInfinite", "Infinite limits"], ["limInf", "Limits at infinity"], ["limPiecewise", "Piecewise limits"], ["contYN", "Is f continuous at a?"], ["discList", "Where is f discontinuous?"]] },
  { sec: "1.3", name: "Rates of change", items: [["arcSituation", "Rate from a situation (units)"], ["arcFunction", "Average rate of a function"], ["arcDataP", "Rates from tables & graphs"], ["instRate", "Instantaneous rate at a value"], ["dqP", "Difference quotient"]] },
  { sec: "1.4", name: "The derivative", items: [["derivDef", "f′(x) by the limit, then values"], ["tangentP", "Tangent line at a point"], ["pwDiff", "Continuous? Differentiable? (piecewise)"], ["notDiffGraph", "Not differentiable — select all"], ["interpP", "Interpret f′(a) with units"], ["derivP", "Derivative from the definition"]] },
];
const PTOPIC_BY_ID = {};
PTOPICS.forEach((s) => s.items.forEach(([id, name]) => { PTOPIC_BY_ID[id] = { id, name, sec: s.sec }; }));
const PTESTS = [
  { key: "P1", seed: 516001, name: "Practice Test 1" },
  { key: "P2", seed: 516002, name: "Practice Test 2" },
  { key: "P3", seed: 516003, name: "Practice Test 3" },
];
const PTEST_BLUEPRINT = ["limGraph", "limTable", "limAlg", "limAlg", "limInfinite", "limInf", "limPiecewise", "contYN", "discList", "arcSituation", "arcFunction", "instRate", "dqP", "derivDef", "tangentP", "tangentP", "pwDiff", "notDiffGraph", "interpP", "arcDataP"];
