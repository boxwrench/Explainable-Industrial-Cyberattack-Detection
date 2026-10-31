# Research website

Static research companion for *Auditing Process Knowledge for Parsimonious and Explainable Industrial Cyberattack Detection*.

## Hosting

In repository **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. The `Deploy research website to GitHub Pages` workflow publishes this directory on changes to `website/` or its workflow. It can also be run manually from Actions.

Expected project URL: https://boxwrench.github.io/Explainable-Industrial-Cyberattack-Detection/

## Editing and data

- `index.html`: academic narrative, author information, sources and acknowledgements.
- `style.css`: responsive layout and typography.
- `app.js`: relationship filters, model/seed comparison and interval recall view.
- `assets/data.json`: frozen snapshot of the repository's audited relationships and experimental results. This is not live inference and does not automatically synchronize with changes to the CSV tables.

The data snapshot combines `tables/final_cross_stage_symbolic_audit.csv` (16 retained relationships), `tables/manuscript_symbolic_rejection_rationale.csv` (11 limited/rejected candidates), `tables/final_test_summary_stats.csv`, `diagnostics/04b_interval_level_recall_mean.csv`, and `diagnostics/03_attack_intervals.csv`. Snapshot collected 31 October 2026. When results change, regenerate the snapshot from those sources and check all displayed values.

Figure 1 comes from page 3 of the manuscript. Institutional logos match the supplied conference poster reference. No raw SWaT observations or model checkpoints are bundled.

To preview locally: `python3 -m http.server 8000 --directory website`, then open http://localhost:8000/.
