# Unit 1 Calculus — MAT 213 Midterm Lab

A self-contained practice site for MAT 213 Brief Calculus, Sections 1.1–1.4:

- **1.1** Limits: numerical and graphical (graph reading, tables, infinite limits, end behavior)
- **1.2** Limits: algebraic, and continuity (limit properties, 0/0 forms, limits at ±∞, piecewise functions, discontinuity types)
- **1.3** Average rate of change and the difference quotient
- **1.4** The limit definition of the derivative (f′(x), tangent lines, interpreting f′(a), differentiability)

## Features

- **Practice by topic:** 25 problem generators, so every problem gets fresh numbers. Answers are graded automatically, and each problem has a hint and a full worked solution.
- **Mixed review:** random problems pulled from every section.
- **Mock exams:** four fixed practice midterms (A–D) plus a random one. Each has point values, a timer, grading by section, a printable exam, and an answer key.
- **Formula sheet:** the key definitions and results from the lecture notes.

## Grading

Answers are checked by value, not by how they're typed:

- Numbers: `1/3` or `0.33`, plus `inf`, `-inf`, and `DNE`
- Expressions: `2x + h - 3`, `1/(2sqrt(x))`
- Tangent lines: slope-intercept or point-slope form

## Use it

Open `index.html` in a browser. It needs internet only to load fonts and MathJax.

Printable PDFs of the mock exams and their answer keys are in [`mock-exams/`](mock-exams/).

## Source

The site is built from small modules in [`src/`](src/):

| File | Purpose |
| --- | --- |
| `core.js` | Exact fractions, TeX helpers, answer parser and checker |
| `graph.js` | SVG graph engine: piecewise curves, open and closed dots, asymptotes |
| `gen1.js` – `gen4.js` | Problem generators for sections 1.1–1.4 |
| `concepts.js` | Concept-check bank and formula sheet |
| `mock.js` | Seeded mock exams, printable papers, answer keys |
| `app.js` | Navigation, practice, and grading UI |

Rebuild `index.html` with:

```bash
python src/build.py
```

`src/test.js` generates thousands of problems and checks that every displayed answer matches what the grader accepts. Run it with:

```bash
node src/test.js
```
