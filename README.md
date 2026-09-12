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
4. **The workbook** is deliberately not linked. It carries firm addresses and
   internal MHBC funding notes. If you want it public, publish a copy with the
   open-items and funding-position tabs removed.

## Replacing the placeholder photos

`badminton.png`, `symphony.png`, `knicks.png`, and `dad.png` are solid fills at
the right dimensions, so the layout and CLS are already correct. Each one is
wrapped in a figure carrying `is-pending`, which is what draws the "Photo
pending" label.

For each photo:

1. Drop the real file into `assets/` at the same name and roughly the same
   pixel dimensions (badminton 1080x720, symphony 680x1020, knicks 1000x666,
   dad 1000x666).
2. If the dimensions differ, update that image's `width` and `height`
   attributes in `index.html` to the real intrinsic size.
3. Remove `is-pending` from the wrapping `<figure>`.

Crop guidance from the PRD: badminton 3:2 keeping the full lunge, symphony 2:3
portrait keeping the stage lighting, knicks 3:2, dad cropped to 3:2 around the
two of you.

Two open questions on the photos that only you can answer: whether everyone in
the Knicks group shot is fine being on a public page, and whether the Barstool
office photo belongs anywhere (if it was an MHBC trek, it could sit in the MHBC
work entry).

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
