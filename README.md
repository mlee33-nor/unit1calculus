# Unit 1 Calculus — MAT 213 Midterm Lab

A self-contained practice site for MAT 213 Brief Calculus, Sections 1.1–1.4:

- **1.1** Limits: numerical and graphical (graph reading, tables, infinite limits, end behavior)
- **1.2** Limits: algebraic, and continuity (limit properties, 0/0 forms, limits at ±∞, piecewise functions, discontinuity types)
- **1.3** Average rate of change and the difference quotient
- **1.4** The limit definition of the derivative (f′(x), tangent lines, interpreting f′(a), differentiability)

## Features

- **Pearson-style practice:** the course exam runs on Pearson, so questions use its answer formats:
  - A/B limit choices ("does not exist and is neither ∞ nor −∞")
  - Yes/No and select-all-that-apply
  - `y =` boxes for tangent lines, plus separate unit boxes
  - strict "integer or simplified fraction" grading
  - two tries per question, a similar-question button, and a worked solution
- **Pearson tests:** three fixed 20-question practice tests plus a random one. Questions appear one at a time with a navigator, and each is scored "x of 1 point."
- **My gaps:** logs every answer and classifies each mistake (sign error, flipped units, unreduced fraction, chose DNE for an infinite limit, and more). It shows accuracy per skill, what to study next, test history, and a copyable report to paste into Claude for targeted practice.
- **Algebra warm-up:** six topics on the algebra behind calculus mistakes: signs and substitution, expanding (x + h)², factoring, fractions, exponents and radicals, and line equations. Answers must be expanded, factored, or in slope-intercept form, as each question asks.
- **Concept checks:** about 60 questions across §1.1–1.4, plus a mixed check in the Pearson format.
- **Study plan:** a checklist through exam day. Test and practice steps check themselves off; other steps are checked by hand.
- **Test settings:** set the question count (10–25), time limit, and whether a calculator is allowed, to match the real exam.
- **Mastery streaks:** a topic's dots fill only for first-try correct answers in a row; one miss resets them.
- **Practice by topic:** 25 more problem generators with fresh numbers every time, automatic grading, hints, and worked solutions.
- **Readable graphs:** large, spread-out piecewise graphs with optional reading guides. Solutions highlight the approach from the left and from the right.
- **Paper mock exams:** four fixed printable midterms (A–D) with point values and answer keys, plus a random one.
- **Formula sheet:** the key definitions and results from the lecture notes.

## Grading

Answers are checked by value, not by how they're typed:

- Numbers: `1/3` or `0.33`, plus `inf`, `-inf`, and `DNE`
- Expressions: `2x + h - 3`, `1/(2sqrt(x))`
- Tangent lines: slope-intercept or point-slope form

## Use it

Open **https://mlee33-nor.github.io/unit1calculus/** on any device, or open `index.html` locally. It needs internet only to load fonts and MathJax. Progress is saved in the browser you use.

Printable PDFs of the mock exams and their answer keys are in [`mock-exams/`](mock-exams/).

## Source

The site is built from small modules in [`src/`](src/):

| File | Purpose |
| --- | --- |
| `core.js` | Exact fractions, TeX helpers, answer parser and checker |
| `graph.js` | SVG graph engine: piecewise curves, open and closed dots, asymptotes |
| `gen1.js` – `gen4.js` | Problem generators for sections 1.1–1.4 |
| `concepts.js` | Concept-check bank and formula sheet |
| `mock.js` | Seeded paper mock exams, printable papers, answer keys |
| `tables.js` | Limits-from-a-table and shrinking-interval generators, plus a guard against repeated questions |
| `pearson-gen.js`, `pearson-gen2.js` | Pearson-format questions, strict answer checks, practice-test blueprint |
| `pearson-ui.js` | Pearson-style question cards, two-try practice, one-at-a-time practice tests |
| `algebra.js` | Algebra warm-up questions, expanded concept bank, topic registration |
| `analytics.js` | Answer log, mistake classification, streaks, "My gaps" dashboard, report builder |
| `app.js` | Navigation, topic practice, and app state |

Rebuild `index.html` with:

```bash
python src/build.py
```

`src/test.js` and `src/ptest.js` generate thousands of problems and checks that every displayed answer matches what the grader accepts. Run it with:

```bash
node src/test.js
```
