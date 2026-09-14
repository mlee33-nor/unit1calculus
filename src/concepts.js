// ================= Concept checks + formula sheet =================
const CONCEPTS = {
  "1.1": [
    { q: tx`If ${$m(tx`\lim_{x\to a^-} f(x) = 5`)}, ${$m(tx`\lim_{x\to a^+} f(x) = 5`)}, and ${$m("f(a) = 2")}, then ${$m(tx`\lim_{x\to a} f(x)`)} is…`, c: ["5", "2", "DNE", "3.5"], why: "Both one-sided limits are 5. The limit describes where the outputs are heading, not the value at a." },
    { q: tx`If ${$m(tx`\lim_{x\to 2^-} f(x) = 3`)} and ${$m(tx`\lim_{x\to 2^+} f(x) = -1`)}, then ${$m(tx`\lim_{x\to 2} f(x)`)} is…`, c: ["DNE", "3", "−1", "1"], why: "The left and right limits must match for the limit to exist." },
    { q: tx`${$m(tx`\lim_{x\to\infty} \left(-2x^3 + x\right)`)} is…`, c: [$m("-\\infty"), $m("\\infty"), "0", "−2"], why: "Odd degree, negative leading coefficient: as x → ∞ the graph falls." },
    { q: tx`${$m(tx`\lim_{x\to 0} \frac{1}{x^2}`)} is…`, c: [`${$m("\\infty")} (both sides go up)`, "0", `${$m("-\\infty")}`, "Left → −∞, right → +∞"], why: "x² is a small positive number on both sides of 0, so 1/x² → +∞ from both sides." },
    { q: tx`${$m(tx`\lim_{x\to 0^-} \frac{1}{x}`)} is…`, c: [$m("-\\infty"), $m("\\infty"), "0", "1"], why: "Just left of 0, x is a small negative number, so 1/x is a huge negative number." },
    { q: tx`${$m(tx`\lim_{x\to -\infty} e^{x}`)} is…`, c: ["0", $m("\\infty"), "1", $m("-\\infty")], why: "e^x shrinks toward its horizontal asymptote y = 0 as x → −∞." },
    { q: tx`A rational function has ${$m(tx`\lim_{x\to\infty} f(x) = 3/2`)}. On the graph this is…`, c: [`A horizontal asymptote ${$m("y = 3/2")}`, `A vertical asymptote ${$m("x = 3/2")}`, `A hole at ${$m("x = 3/2")}`, `The ${$m("y")}-intercept`], why: "Limits at ±∞ describe end behavior — horizontal asymptotes." },
    { q: "A function is a rule that assigns…", c: ["exactly one output to each input", "exactly one input to each output", "at least one output to each input", "a limit to each input"], why: "That's the definition — and it's why the circle x² + y² = 16 is not a function." },
  ],
  "1.2": [
    { q: "f is continuous at x = a when…", c: ["f(a) is defined, the limit as x → a exists, and the limit equals f(a)", "f(a) is defined and the left-hand limit exists", "the limit as x → a exists", "f'(a) exists and f(a) ≠ 0"], why: "All three conditions are required." },
    { q: tx`Direct substitution into ${$m(tx`\lim_{x\to 3} \frac{x^2 - 9}{x - 3}`)} gives ${$m("\\frac{0}{0}")}. This means…`, c: ["Nothing yet — simplify (factor and cancel), then substitute again", "The limit is 0", "The limit does not exist", "The limit is 1"], why: "0/0 is an indeterminate form. Here (x−3)(x+3)/(x−3) = x + 3 → 6." },
    { q: tx`To compute ${$m(tx`\lim_{x\to\infty}`)} of a rational function algebraically, divide every term by…`, c: ["the highest power of x in the denominator", "x", "the leading coefficient of the numerator", "the highest power of x in the numerator"], why: "Then every term of the form c/xᵖ goes to 0." },
    { q: "A graph has an open circle on the curve at x = 2 and a filled dot at (2, 5) above it. At x = 2 there is a…", c: ["removable discontinuity", "jump discontinuity", "infinite discontinuity", "corner, but it is continuous"], why: "The limit exists (the curve closes up to one height) but doesn't equal f(2)." },
    { q: tx`If ${$m(tx`\lim_{x\to1} f(x) = 4`)} and ${$m(tx`\lim_{x\to1} g(x) = -2`)}, then ${$m(tx`\lim_{x\to1} \frac{f(x)}{g(x)}`)} is…`, c: ["−2", "2", "−8", "DNE"], why: "Quotient property: 4 / (−2) = −2 (allowed since the bottom limit isn't 0)." },
    { q: tx`${$m(tx`f(x) = \frac{x + 1}{x - 4}`)} has what kind of discontinuity at ${$m("x = 4")}?`, c: ["Infinite", "Removable", "Jump", "None — it's continuous"], why: "The bottom is 0 but the top is 5, nothing cancels → vertical asymptote." },
  ],
  "1.3": [
    { q: "The average rate of change of f on [a, b] is the slope of…", c: ["the secant line through (a, f(a)) and (b, f(b))", "the tangent line at x = a", "the tangent line at x = b", "the line through the origin and (b, f(b))"], why: "Rise over run between two points on the graph." },
    { q: "If P(t) is profit in dollars after t months, the average rate of change of P has units…", c: ["dollars per month", "months per dollar", "dollars", "dollars · months"], why: "Output units per input unit." },
    { q: tx`The difference quotient ${$m(tx`\frac{f(x+h) - f(x)}{h}`)} represents…`, c: ["the average rate of change of f from x to x + h", "the instantaneous rate of change at x", "the value of f at x + h", "the change in f from x to x + h"], why: "It's (change in output)/(change in input) over an interval of width h." },
    { q: "Unemployment was 5.4% in 2004 and 9.9% in 2009. The average rate of change is…", c: ["0.9 percentage points per year", "4.5 percentage points per year", "1.11 years per percentage point", "0.9%"], why: "(9.9 − 5.4)/(2009 − 2004) = 4.5/5 = 0.9." },
    { q: tx`For ${$m(tx`f(x) = \frac{2}{x}`)}, the average rate of change on ${$m("[1, 4]")} is…`, c: ["−1/2", "1/2", "−3/2", "−2"], why: "(f(4) − f(1))/(4 − 1) = (0.5 − 2)/3 = −0.5." },
  ],
  "1.4": [
    { q: "The derivative of f is defined as f′(x) = …", c: [$m(tx`\lim_{h\to0} \frac{f(x+h) - f(x)}{h}`), $m(tx`\frac{f(b) - f(a)}{b - a}`), $m(tx`\lim_{h\to0} \frac{f(x+h) + f(x)}{h}`), $m(tx`\lim_{x\to0} \frac{f(x+h) - f(x)}{h}`)], why: "The limit of the difference quotient as h → 0." },
    { q: "Which is NOT a place where f can fail to be differentiable?", c: ["A point with a horizontal tangent line", "A corner (sharp point)", "A discontinuity (hole, jump, asymptote)", "A vertical tangent line"], why: "A horizontal tangent just means f′ = 0 — the derivative exists." },
    { q: "If f is differentiable at x = a, then…", c: ["f is continuous at a", "f has a corner at a", "f′(a) = 0", "f may have a jump at a"], why: "Differentiable ⇒ continuous. (The reverse is false: |x| is continuous at 0 but has a corner.)" },
    { q: "True or false: if f is continuous at a, then f is differentiable at a.", c: ["False", "True"], why: "Counterexample: f(x) = |x| at x = 0 has a corner." },
    { q: "Which is NOT notation for the derivative of y = f(x)?", c: [$m(tx`\frac{\Delta y}{\Delta x}`), $m("f'(x)"), $m(tx`\frac{dy}{dx}`), $m("y'")], why: "Δy/Δx is an average rate of change over an interval." },
    { q: "The tangent line to f at x = 2 when f(2) = 7 and f′(2) = −3 is…", c: [$m("y = -3x + 13"), $m("y = -3x + 7"), $m("y = 7x - 3"), $m("y = -3x - 1")], why: "y − 7 = −3(x − 2) → y = −3x + 6 + 7 = −3x + 13." },
    { q: "If h(t) is a plant's height in cm after t weeks, then h′(4) = 30 means…", c: ["at week 4 the plant is growing at 30 cm per week", "the plant is 30 cm tall at week 4", "over the first 4 weeks it grew 30 cm per week on average", "the plant grows 30 cm between week 4 and week 5"], why: "An instantaneous rate at one moment, in output units per input unit." },
    { q: "As h → 0, the secant lines through (a, f(a)) and (a + h, f(a + h)) approach…", c: ["the tangent line at x = a", "the x-axis", "a vertical line", "the average rate of change on [0, a]"], why: "That's the geometric picture behind the limit definition." },
  ],
};

function conceptGen(sec) {
  return () => {
    const items = R.sample(CONCEPTS[sec], 4);
    return {
      prompt: para(`Quick concept check for section ${sec}. No calculation traps — just make sure the ideas are solid.`),
      parts: items.map((it) => P.mc(it.q, it.c, 0)),
      hint: "Think about what each idea means, not just how to compute it.",
      solution: items.map((it, i) => para(`<b>${"abcd"[i]}.</b> ${it.c[0]} — ${it.why}`)).join(""),
    };
  };
}
GEN.concepts11 = conceptGen("1.1");
GEN.concepts12 = conceptGen("1.2");
GEN.concepts13 = conceptGen("1.3");
GEN.concepts14 = conceptGen("1.4");

const FORMULA_SHEET = [
  { sec: "1.1", title: "Limits: numerical & graphical", items: [
    ["Limit", tx`${$m(tx`\lim_{x\to a} f(x) = L`)} means the outputs get as close to ${$m("L")} as we like when inputs are close to ${$m("a")} (from both sides). The value ${$m("f(a)")} itself doesn't matter.`],
    ["Existence", tx`${$m(tx`\lim_{x\to a} f(x)`)} exists only if ${$m(tx`\lim_{x\to a^-} f(x) = \lim_{x\to a^+} f(x)`)}. Otherwise it DNE.`],
    ["Infinite limits", tx`${$m(tx`\lim_{x\to0^-} \frac1x = -\infty`)}, ${$m(tx`\lim_{x\to0^+} \frac1x = \infty`)}, so ${$m(tx`\lim_{x\to0} \frac1x`)} DNE. ${$m(tx`\lim_{x\to0} \frac1{x^2} = \infty`)}.`],
    ["End behavior", tx`Even degree: both ends match the leading-coefficient sign. Odd degree, positive: ${$m(tx`x\to\infty \Rightarrow \infty`)}, ${$m(tx`x\to-\infty \Rightarrow -\infty`)} (negative flips both).`],
    ["Reciprocals & exponentials", tx`${$m(tx`\frac{1}{x^p} \to 0`)} as ${$m(tx`x\to\pm\infty`)} (${$m("p>0")}). ${$m(tx`e^x \to \infty`)} as ${$m(tx`x\to\infty`)}, ${$m(tx`e^x\to 0`)} as ${$m(tx`x\to-\infty`)}. ${$m(tx`e^{-x}`)} is the mirror image.`],
  ] },
  { sec: "1.2", title: "Limits: algebraic & continuity", items: [
    ["Properties", tx`Limits pass through sums, differences, constant multiples, products, quotients (bottom ≠ 0), powers, and roots: e.g. ${$m(tx`\lim [f\,g] = LM`)}, ${$m(tx`\lim \frac{f}{g} = \frac{L}{M}`)}, ${$m(tx`\lim [f]^n = L^n`)}.`],
    ["Direct substitution", tx`If ${$m("a")} is in the domain (polynomials, rational functions with nonzero bottom, roots of nonnegatives), ${$m(tx`\lim_{x\to a} f(x) = f(a)`)}.`],
    ["0/0", "Factor & cancel, expand & simplify, or use the conjugate (√x − r)(√x + r) = x − r². Keep writing “lim” until you substitute."],
    ["Limits at ±∞", "Divide every term by the highest power of x in the denominator. Equal degrees → ratio of leading coefficients; bigger bottom → 0; bigger top → ±∞."],
    ["Continuity at x = a", tx`(1) ${$m("f(a)")} defined, (2) ${$m(tx`\lim_{x\to a} f(x)`)} exists, (3) they're equal.`],
    ["Discontinuities", "Removable: hole (limit exists ≠ f(a) or f(a) undefined). Jump: one-sided limits differ. Infinite: vertical asymptote."],
  ] },
  { sec: "1.3", title: "Average rate of change", items: [
    ["Average rate of change", tx`${$m(tx`\frac{f(b) - f(a)}{b - a}`)} = slope of the secant line. Units: output units <b>per</b> input unit.`],
    ["Difference quotient", tx`${$m(tx`\frac{f(x+h) - f(x)}{h}`)} = average rate of change from ${$m("x")} to ${$m("x+h")}. Simplify until ${$m("h")} cancels from the bottom.`],
    ["Example", tx`${$m("f(x) = ax^2 + bx + c")} gives ${$m(tx`\frac{f(x+h)-f(x)}{h} = 2ax + ah + b`)}. ${$m(tx`f(x) = \frac{k}{x}`)} gives ${$m(tx`\frac{-k}{x(x+h)}`)}.`],
  ] },
  { sec: "1.4", title: "The derivative", items: [
    ["Definition", $m(tx`f'(x) = \lim_{h\to 0} \frac{f(x+h) - f(x)}{h}`)],
    ["Notation", tx`${$m("f'(x)")}, ${$m("y'")}, ${$m(tx`\frac{dy}{dx}`)}, ${$m(tx`\frac{d}{dx}f(x)`)}. ${$m("f'(a)")} is a number.`],
    ["Meaning", tx`${$m("f'(a)")} = instantaneous rate of change at ${$m("x = a")} = slope of the tangent line there. Units: output per input.`],
    ["Tangent line", tx`Point ${$m("(a, f(a))")}, slope ${$m("m = f'(a)")}: ${$m("y - f(a) = f'(a)(x - a)")}.`],
    ["Not differentiable", "Corners/cusps, discontinuities (holes, jumps, asymptotes), vertical tangent lines."],
    ["Key fact", "Differentiable ⇒ continuous. Continuous does NOT imply differentiable (|x| at 0)."],
    ["Results to know", tx`${$m("(ax^2+bx+c)' = 2ax + b")}, ${$m(tx`\left(\frac{k}{x}\right)' = -\frac{k}{x^2}`)}, ${$m(tx`\left(\sqrt{x}\right)' = \frac{1}{2\sqrt{x}}`)}, ${$m("(x^3)' = 3x^2")}.`],
  ] },
];
