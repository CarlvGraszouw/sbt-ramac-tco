# RAMAC TCO — G-Matrix proposal for SBT

Interactive **Total Cost of Ownership (TCO)** models for RAMAC™ **AT1L** and **AT2**. The UI is split into **two full-width pages** so fleet cost tables and schedules are readable (no cramped side-by-side columns).

| Page | Role |
|------|------|
| `index.html` | Hub: branding, links to both calculators, executive snapshot |
| `at1l.html` | **AT1L** calculator — full-width tables |
| `at2.html` | **AT2** calculator — full-width tables |
| `assets/tco.css` | Shared styles |
| `assets/tco-calculator.js` | Shared calculation logic |
| `ramac_tco_model.html` | Copy of `index.html` (optional bookmark name) |

## Client URLs (GitHub Pages)

**Home (hub):** [https://carlvgraszouw.github.io/sbt-ramac-tco/](https://carlvgraszouw.github.io/sbt-ramac-tco/)

- **AT1L TCO:** [https://carlvgraszouw.github.io/sbt-ramac-tco/at1l.html](https://carlvgraszouw.github.io/sbt-ramac-tco/at1l.html)
- **AT2 TCO:** [https://carlvgraszouw.github.io/sbt-ramac-tco/at2.html](https://carlvgraszouw.github.io/sbt-ramac-tco/at2.html)

Share the hub or either calculator link; print to PDF from the browser works on each page.

## Local use

Open `index.html` or `at1l.html` / `at2.html` in a browser. All asset paths are relative (`assets/…`).

## Deploy updates

```bash
git add -A && git commit -m "Your message" && git push
```

GitHub Pages rebuilds in about one minute.
