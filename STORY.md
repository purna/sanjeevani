# The Legend of Sanjeevani — Story (Comic Template)

Interactive comic built on the `__Template` Adam-pattern layered renderer
(SVG bg → [Three.js midground] → SVG fg → character/overlay).
Story data lives in `data/`; visuals in `assets/svg/` and `assets/characters/`.

## Run
Open `__Template/index.html` in a browser. Advance with **Next →** (or →/Space/←/arrow),
tap, or pick a chapter from the dropdown. Each beat auto-appears after its `delay`.

## Story structure (2:30, 30 beats @ 5s)
Five acts/chapters in `data/manifest.json`:

| Act | Chapter | Beats | Scene (BG) | Foreground | Beat range |
|---|---|---|---|---|---|
| 0 | Title · Dawn | 7 | title → morning → workfield | fg_interpreter | 0:00–0:35 |
| 1 | Ch.1 · At the Health Post | 6 | health_ext → health_int → knowledge | fg_interpreter | 0:35–1:05 |
| 2 | Ch.2 · Treatment & Family | 6 | knowledge → home_int → health_int → morning → workfield | fg_interpreter | 1:05–1:35 |
| 3 | Ch.3 · Recovery & Community | 6 | workfield → morning → end | fg_interpreter | 1:35–2:05 |
| 4 | Ch.4 · Call to Action | 5 | end | fg_interpreter / fg_endcard | 2:05–2:30 |

Each beat `line` in `data/sanjeevani_N.json` carries:
`id, speaker, text, fx, delay, align, width, valign, sfx, scene, foreground, time, cite, big`.
- `scene` = which `assets/svg/scene_<scene>.svg` background to show **for that beat** (per-line override).
- `speaker` = `narrator` (caption) or a character key (portrait overlay).

## Speakers (portraits in `assets/characters/`)
sanjeevani · grandfather · daughter · health_worker · child (plus template
guide/traveller/witness). Wired in `js/template-story.js` → `CHARACTER_KEYS`.

## Scene backgrounds (`assets/svg/scene_*.svg`)
These are scaled/cropped copies of the prototype backgrounds in `/backgrounds`:
title(morning parchment) → scene_title, morning/bg_01 → scene_morning, workfield/bg_02 → scene_workfield,
health_ext/bg_04 → scene_health_ext, health_int/bg_05 → scene_health_int, knowledge/bg_07 → scene_knowledge,
home_int/bg_06 → scene_home_int, end/bg_08 → scene_end.

## Foreground overlays (`assets/svg/fg_*.svg`)
- `fg_interpreter.svg` — fixed Nepali Sign-Language interpreter box, lower corner (every panel).
- `fg_endcard.svg` — placeholder logo slots for NHEICC / CARE / DoHS (replace with approved assets).

## Comic pages (jpgs) + text overlays
The comic is illustrated with full-bleed jpg pages in `assets/backgrounds/`
(`act1_page1.jpg` … `act5_page5.jpg`). Per-page text is **overlay data**
(not baked into the images), so it stays editable:

- `data/pages.json` — 30 entries, one per beat, in story order:
  `{ part, id, time, page, speaker, text, big }`.
- Each act JSON (`data/sanjeevani_N.json`) also carries `image` (the page jpg)
  on every line, so any reader can overlay `text` on `image` per beat.

Page → beat mapping (sequential by Part; background-only `*_bg.jpg` is preferred):

| Part | File | Beats | Pages (in order) |
|---|---|---|---|
| 1 | sanjeevani_1.json | 7 | page1, page2_bg, page3_bg, page4, page6, page7_bg, page8_bg_alt |
| 2 | sanjeevani_2.json | 6 | page1_bg, page2, page3_bg, page4, page5, page6 |
| 3 | sanjeevani_3.json | 6 | page1–page6 |
| 4 | sanjeevani_4.json | 6 | page1–page6 |
| 5 | sanjeevani_5.json | 5 | page1–page5 (page3 is portrait) |

On-screen text is encoded in the beats (`big` = large centered text): title card
(`THE LEGEND OF SANJEEVANI` / `संजीवनीको कथा`), Sanjeevani intro (`MEET DR. SANJEEVANI — Your Community Healer`), and the end-card block (`GET FREE, CONFIDENTIAL TESTING AND TREATMENT`, `POWERED BY NHEICC AND CARE NEPAL`, `TB IS CURABLE. COMPLETE TREATMENT SAVES LIVES. / टीबी नाश हुन सकिन्छ।`). The fixed Nepali Sign-Language box is flagged via the `fg_interpreter` foreground on every beat; end-card logo slots are `fg_endcard` (replace placeholders with approved assets).

To render in the template reader: each beat loads its `image` jpg (rendered on top of the prototype SVG scene) as the full-bleed page background, then overlays `text` (large centered when `big`) and the interpreter box; advance sequentially.

## Visual style
- Dr. Sanjeevani wears the Nepali national colors (red/white/blue) under a white coat,
  stethoscope + silver jewelry, golden halo → bridge of folklore + modern medicine.
- Palette: warm regenerative tones (gold + green) for health/restoration.
- No text baked into backgrounds (story text is rendered as overlays).

## Changes made to the template
- `js/template-story.js`: added Sanjeevani character keys to `CHARACTER_KEYS`;
  background scene is now chosen per-line (`data.scene || act.scene || act.id`)
  from `assets/svg/scene_<scene>.svg` (shared across acts); foreground honors
  per-line `data.foreground`. `node --check` clean.
- Original template story preserved in `data/_original_template/`.

## Notes / TODOs
- Medical content, TPT details, symptom thresholds, and the approved TB-medicine
  imagery remain `TO REVIEW` against CARE/NHEICC/DoHS guidance (per the storyboard).
- Character portraits & cut-out rigs (`backgrounds/characters/*.svg`) are prototype
  vector styles — reconcile with `/designs` reference art before final.
- Three.js midground is optional; with no `SCENE_FACTORIES` the renderer falls
  back to the SVG layers (no breakage).
