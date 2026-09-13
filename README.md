# Jonathan Chau, personal site

Static HTML, CSS, and vanilla JS. No framework, no build step, no dependencies.
Built to `Recalc_Personal_Site_PRD_v2.md`.

```
index.html      one page, nine sections
styles.css      hand-written, token order per PRD 10.3
main.js         nav behaviour, the budget model, the hero load animation
assets/         portrait (real) + four placeholders
```

## Run locally

```bash
python3 -m http.server 8777
```

Then open http://localhost:8777.

## Deploy

Push this folder to GitHub, import it at vercel.com, accept the static defaults.
No build command, no output directory. A `*.vercel.app` URL is fine.

Publish it public. Nothing on the page is confidential, and a password adds
friction for the reviewer. If you want protection anyway, use Vercel's own
deployment protection rather than a JavaScript password check.

## Before you publish

Four things are marked `[VERIFY]` in `index.html`. Find them with:

```bash
grep -n "VERIFY" index.html
```

1. **og:url and og:image** point at `jonathanchau.vercel.app`. Change both to
   your real deployed origin or the link preview will break.
2. **Dylan Pinkins's spelling** and that Recalc's own materials say exactly
   "Finance Accelerator". Getting either wrong is the one unforced error here.
3. **The four photos** in `assets/` are flat placeholders, because the real
   files were not on this machine. See below.
3. **The workbook** is deliberately not linked. It carries firm addresses and
   internal MHBC funding notes. If you want it public, publish a copy with the
   open-items and funding-position tabs removed.

## Photos

All seven are real and in place. Three sources carried EXIF orientation 6
(raw pixels landscape, displayed portrait); those were physically rotated and
the orientation tag reset to 1, so they crop and render the same everywhere.

Photos keep the orientation they were shot in. Nothing is cropped to a common
aspect ratio; horizontal stays horizontal and vertical stays vertical.

Alignment is held two ways. A single photo is capped by the column width and by
--shot-h (560px), so a tall frame cannot run away down the page. A pair of
photos is laid out with flex-grow set to each image's aspect ratio, which gives
the row one shared height and makes it fill the column exactly regardless of
what mix of orientations it holds.

Open item: the Barstool Sports and NFL photos are captioned by what is visible,
not by the occasion, because that was never confirmed. See the [VERIFY] comment
above that figure in index.html.

## The budget model

The math in `main.js` reproduces all four acceptance scenarios from PRD 7.5
exactly. It self-tests on every page load; open the console and you will see:

```
Budget model: all 4 acceptance scenarios pass.
```

If you change a constant, that table is how you find out what you broke.

| Scenario | Total | Per student | November |
|---|---|---|---|
| All defaults | $6,720.33 | $280.01 | −$1,720.33 |
| Receipt pulled into October | $6,720.33 | $280.01 | $279.67 |
| Q70 return | $6,324.33 | $263.51 | −$1,324.33 |
| Both | $6,324.33 | $263.51 | $675.67 |

The Q70 toggle moves the total by $396, not $360: the $360 of ground transport
saved also takes $36 off the 10% contingency.

## Copy

The page was rewritten out of the PRD's memo voice in September 2026. The
original hero ("I would rather rebuild a number than accept one") read as a
positioning statement rather than a person, so the site now opens with a plain
introduction, and the resume-speak in the work entries was pulled down into
ordinary sentences. Every number and name from the fact base survived the
rewrite; only the register changed.

## Two deviations from the PRD

1. **No WebP.** PRD 9 asks for WebP with a JPEG fallback via `<picture>`. This
   machine has no `cwebp` and `sips` cannot write WebP, so the portrait ships
   as JPEG with a 1x/2x `srcset` instead. Total page weight is about 200KB
   against a 900KB budget, so nothing is lost in practice. If you want WebP
   later, `brew install webp` and convert.

2. **Six work entries, not five.** Blood Cancer United was added per your call,
   and placed fifth so that the Jimmy Crystal closing line ("two years later I
   am still doing a version of the same thing, with better questions") still
   ends the section. The list was never strictly reverse chronological.
