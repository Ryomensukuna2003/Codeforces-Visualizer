# CF Stats — design spec

A self-contained description of the current UI, written so it can be audited
without the conversation that produced it. Everything below is what is in the
tree today, not an aspiration.

---

## 1. The product

**CF Stats** (`cfstats.vercel.app`) is a statistics dashboard for
[Codeforces](https://codeforces.com), the competitive-programming judge. You
type a handle; it reads that account's public history from the Codeforces API
and tells you how you are doing.

**Audience.** Competitive programmers, typically rated 800–2400, who practise
several times a week and want to know what to fix. They are technical, they
read dense tables happily, and they already live in a terminal.

**The job each screen does.** `/` answers *"am I improving, and what do I do
next?"*. The sub-routes answer narrower versions: which submissions failed,
which rating band I'm stuck at, where a specific contest went wrong, how I
compare to a rival.

**Data.** Everything is read from the public Codeforces REST API in the
browser and held in Zustand. No accounts, no auth.

Three things touch Postgres, and nothing else does:

| Table | What it holds | Why |
| --- | --- | --- |
| `Snapshot` | One row per handle per day: rating, solved, AC rate, the six Stand scores, solves per tag | Codeforces has no endpoint for what your AC rate or tag spread looked like three months ago — `user.rating` is a rating history and nothing else. Everything stored is public on that handle's own profile. |
| `DailyMetric` | Aggregate counters, one per name per day | Answers "how often does the product fail", not "what did this person do". No session id, no handle, no ordering, so no individual's path is reconstructable. Route traffic is Vercel Analytics' job and is not duplicated. |
| `Feedback` | Anonymous notes | No handle, no IP, no user agent. Guarded by a honeypot field and length bounds; there is no application-level throttle — put one at the platform edge if you want it. |

`User` and `Subscriber` are legacy tables, no longer written. `User` appended a
row on every lookup — twice, because the save call was duplicated — and nothing
ever read it back. `Subscriber` outlived the contest-reminder mailer that was
removed along with Redis; it still holds real addresses, so it was not dropped.

---

## 2. Design direction: "Dossier"

The brief was a redesign of an existing brutalist UI. The stated goal: keep the
identity (monospace, sharp corners, black/white, red accent) but fix a
usability problem — **~95% of visitors never left `/`**, so five sub-routes got
almost no traffic.

The chosen direction is **"Dossier"**: the profile reads like a printed
intelligence report. A permanent numbered sidebar replaces a full-screen
hamburger overlay, and a plain-English **verdict** answers "am I improving?"
above the fold.

Four rules carry the whole system:

1. **Palette is black / white / red only.** Rank, difficulty and mastery are
   encoded as **luminance steps, never hue**. Red is reserved exclusively for
   failure and urgency — it never decorates.
2. **Radius is 0 everywhere.** No exceptions.
3. **Type comes from seven named steps.** Never ad-hoc pixel sizes.
4. **One left rail: 20px (`px-5`).** Every section on every route insets its
   content by the same amount, because the tables do and the tables are the
   densest, most repeated object in the product. Columns are aligned rather than
   fenced, so the left edge is doing the work a vertical rule would.

   The vertical half of the same rule: **a control row is a strip of cells, and
   every cell fills it.** Filter inputs, select triggers and tag toggles run
   edge to edge between the row's own rules, separated by hairlines. A small
   bordered box floating inside a taller row reads as an object sitting on the
   page rather than part of it — especially beside a tab strip that does fill
   the height. Bordered controls in a *padded section* (the feedback form, page
   header actions) are a different case and stay inset.

---

## 3. Typography

All monospace, three voices. Loaded via `next/font/google` in `src/app/fonts.ts`.

| Role | Face | Used for |
| --- | --- | --- |
| `font-sans` / `font-mono` | **JetBrains Mono** 400/500/600/700 | Everything: rows, labels, data columns, prose |
| `font-display` | **Martian Mono** 400/700 | Handle, page titles, eyebrows, stat values, verdict figures |
| `font-mark` | **Major Mono Display** 400 | The `CF Stats` wordmark, nothing else |

`sans` and `mono` both resolve to the same face — the aliases exist so markup
does not need churning.

**Why Martian Mono for display:** blocky, heavy, faintly awkward proportions.
Mass over refinement, which is the brutalist read. It has a real 700 weight,
which matters because the emphasis mechanic depends on it.

**Why Major Mono Display only on the wordmark:** it draws lowercase as
constructed small-cap forms — `a` becomes a delta, `y` a triangle. That is
wrong for a handle or a sentence (`Yzm007` renders as `▼ZM007`) and right for a
logo, where the letters are a shape rather than a word to read.

### The scale — seven steps

Defined in `tailwind.config.ts` as `fontSize` tokens.

| Token | Size / line-height / tracking | Used for |
| --- | --- | --- |
| `display` | 56px / 0.95 / −0.03em | Masthead handle only |
| `title` | 32px / 1.05 / −0.02em | Page titles |
| `stat` | 24px / 1 / −0.01em | Stat-strip values |
| `lead` | 20px / 1.55 | The verdict sentence |
| `body` | 14px / 1.4 | Row primary text |
| `meta` | 12px / 1.35 | Row secondary, data cells |
| `label` | 11px / 1 / 0.06em | Every label |

All numeric columns use `tabular-nums`.

**Labels use one treatment.** Uppercase + tracking survives in exactly two
places where it aids scanning: the page eyebrow (`02 — Submission log`) and
table column headers. Everywhere else is sentence case.

---

## 4. Colour

Tokens in `src/app/globals.css`, exposed through `tailwind.config.ts`. Values
below are dark mode; each has a light counterpart.

### Text — three tiers, all clearing WCAG AA

| Token | Dark | Contrast on `#000` | Use |
| --- | --- | --- | --- |
| `foreground` | `#fafafa` | 20.1:1 | Primary |
| `muted-foreground` | `#a3a3a3` | 8.3:1 | Secondary |
| `faint` | `#8a8a8a` | 6.0:1 | Labels, captions, axis ticks |

Nothing fainter than `faint` is ever text. Rule colours are never used for text.

### Surfaces and rules

| Token | Dark | Use |
| --- | --- | --- |
| `background` | `#0a0a0a` | Page |
| `card` | `#000000` | Panels |
| `inset` | `#080808` | Table header rows |
| `rule` | `#525252` | **Section** dividers |
| `hair` | `#1a1a1a` | **Row** dividers |
| `track` | `#131313` | Empty bar / meter track |
| `rowhover` | `#0f0f0f` | Row hover |
| `field` | `#333333` | Input and control borders |
| `chip` | `#2b2b2b` | Tag chip borders |

**Rules are hierarchical, not uniform.** `rule` separates sections; `hair`
separates rows. **Columns are aligned, not fenced** — a vertical cell divider
appears in exactly one place, the verdict gutter on `/submissions`, and that
cell draws its own `border-r`. There is no `divided` prop: it drew a *left* seam
and both call sites cancelled it to draw a right one instead.

### Failure flags

`flag` `#0a0000` (failed row background) · `flag-wash` `#0d0000` (callout) ·
`flag-rule` `#4a1414` (border) · `flag-fg` `#c26a6a` (tag text in flagged
cards) · accent `red-500` `#ef4444`.

**Focus is not failure.** There is exactly one focus treatment — a 2px
`foreground` outline on `:focus-visible`, defined once in `globals.css`. No
component draws a ring of its own, so nothing doubles up, and knowing where you
are never looks like an error.

### Rank / difficulty ramp — luminance, never hue

`tier-1` `#5c5c5c` → `tier-2` `#8f8f8f` → `tier-3` `#d4d4d4` → `tier-4`
`#fafafa`. **Higher rank carries more contrast against the ground** — brighter
on black, darker on white. Chart band fills are the same ramp expressed as
foreground opacity (`RANK_BANDS` in `src/lib/dossier.ts`), so the direction
inverts with the theme and the ordering survives. Each band is labelled inside
itself rather than in a legend row, because the bands are horizontal stripes and
a row of names reads as an x-axis. The original hue-based Codeforces rank
colours (`#AB00AA`, `#FF8C00`, `#FF0000`) are deliberately **not** used.

---

## 5. Layout

**Shell** (`src/components/dossier/Shell.tsx`): a fixed **196px** sidebar plus
a main column, on every route. The sidebar's right edge is an
absolutely-positioned 1px rule rather than `border-r`, so row dividers inside
don't visually interrupt it.

**Sidebar** (`Sidebar.tsx`): wordmark → "Viewing {handle} {rating}" (opens the
handle dialog) → seven numbered nav items → "Compare / add a rival". Active
item takes a 2px red left border. The `01–07` numerals stay because this is a
fixed order people learn positionally.

Below `md` the sidebar collapses to a ~56px bar plus a horizontally scrolling
nav strip (≈95px of chrome before content).

### Routes

| # | Route | Contents |
| --- | --- | --- |
| 01 | `/` | Masthead (eyebrow, 56px handle, rank badge, rating, 30-day delta) → **the verdict** → 5-cell stat strip → rank-banded rating curve + Stand parameter meters → coach |
| 02 | `/submissions` | Summary strip → verdict tape (last 60 outcomes) → filters (verdict, rating range, tag, language) → submission tempo chart → 7-column table, 100/page |
| 03 | `/problems` | Rung-coverage ladder (solved ÷ total per 100-point rating band, red at ≥1600 "the wall") → filters incl. weakest-tag chips → problem table with `[*]`/`[ ]` marks and `FOR YOU` badges |
| 04 | `/rating_change` | Stat strip → rank-banded curve with an aligned per-contest delta row → contest table with inline delta bars |
| 05 | `/analysis` | Contest picker (opens on most recent) → stat strip → gantt of where the round went → per-problem breakdown → "tags that cost you time" |
| 06 | `/blogs` | Sort tabs → title / author / date / votes table |
| 07 | `/feedback` | Anonymous form: category, optional 1–5 score, free text |
| — | `/compare` | Two handles → the head-to-head verdict → 5-cell record strip → rating-gap chart → shared-contest table (RECENT / BIGGEST WINS / BIGGEST LOSSES) → tag ledger with diverging bars → what they've solved in your reach, 50/page |

### Shared chrome

`src/components/dossier/primitives.tsx` is the leverage point — `PageHeader`,
`StatStrip`, `FigCaption`, `THead`/`TH`/`TD`, `TagChip`, `TagList`, `BoxTabs`,
`RatingRange`, `Pagination`, `Notice`, `EmptyOrLoading`, `Label`. Changing the
system here lands on every route at once — `PageHeader` alone carries the left
rail on five routes.

---

## 6. The signature element

**The verdict block** on `/`. Red 2px left rule, generous space, one plain
sentence generated from real data, e.g.:

> You are improving — but only below **1600**. Your AC rate is **72%** on ≤1600
> problems and **43%** above it. 7 of your last 12 failed submissions were
> **interactive**.

The sentence is set in the text face; **the figures switch to the display cut
at the same size**, so the numbers speak in a different voice from the prose
around them. That is the one deliberately loud thing on the page — everything
else is disciplined so it can be.

Built by `buildVerdict()` in `src/lib/utils.ts`, which returns tagged parts
(`{ text, bold, accent }`) rather than a string.

---

## 7. Deliberate decisions (please don't "fix" these)

- **Monospace everywhere.** An earlier pass tried a sans/mono split (IBM Plex);
  it was rejected. The readability problem was never mono — it was nine font
  sizes crammed between 9 and 13.5px at 2:1 contrast.
- **No vertical rules in tables.** Alignment does that work.
- **No `Fig. N` numbering.** Panels sit side by side and are not a sequence, so
  numbering decorated rather than informed. The sidebar's `01–07` stays because
  that genuinely is a fixed order.
- **`01–07` numerals in the sidebar** are positional wayfinding, not decoration.
- **Tag chips cap at 2 + a count.** Uncapped lists wrapped rows to two lines.
- **`/` deliberately ends** after the rating curve and Stand meters. Difficulty,
  tempo and recent submissions live on the routes that own them. The one
  exception is the contest schedule: the Stand panel's "Next contest" row
  expands in place to the full list, because that data is already fetched and a
  countdown you cannot expand is a dead end.
- **API responses are cached** (Cache API, 5min profile / 10min feed / 1h
  contests / 24h problemset). The masthead timestamp is the manual refresh, and
  it reports true cache age rather than "just now".

---

## 8. Known gaps and open questions

Worth an auditor's attention:

1. **Light mode is real but secondary.** Every token has a light value and it
   renders correctly, but the direction was designed dark-first. The ramp
   question is settled: it inverts, and §4 now states the rule as contrast
   against the ground rather than brightness. There is still no redundant
   encoding if luminance alone fails a reader — see §10 item 3.
2. **Mobile is a reflow, not a design.** No mobile layout was ever specified.
   Tables scroll horizontally; the sidebar becomes a strip. Functional, not
   designed.
3. **No landing page — and it is now the biggest open problem.** First visit is
   a blocking modal asking for a handle. A crawler has no handle, so every search
   engine sees a skeleton behind a dialog: the site has metadata, a sitemap and a
   share card, but no indexable content on any route. Technical SEO is done; this
   is what would have to change for any of it to rank.
4. **Share card** exists now — `src/app/opengraph-image.tsx`, generated at the
   edge in the product's own language rather than as a screenshot. The font is
   fetched and falls back to the built-in sans if that fails, because a card in
   the wrong face beats a request that throws.
5. **`html { scrollbar-width: none }`** hides scrollbars app-wide. On a 100-row
   table you get no scroll-position feedback. Inherited, deliberate-looking,
   possibly wrong.
6. **`/analysis` shows `Solved / tried`, not `/ total`.** Codeforces now
   rejects every parameter on `contest.standings`, so the contest's problem
   count costs an ~8 MB download. Dropped rather than paid for.
7. **Unused shadcn primitives are gone.** The count was sixteen, not eight.
   They and the nine npm dependencies that only served them have been removed,
   along with `Upcoming_Contest.tsx`, `contest-sheet.tsx` and the duplicate
   `src/types/` tree. `src/app/types.ts` is now the only type barrel.
8. **Redis is gone.** The configured host had stopped resolving, so the feedback
   throttle it backed had been returning "not limited" on every call for a long
   time — the endpoint was already unthrottled. Removing it dropped the pretence,
   not the protection. The contest-reminder mailer and its GitHub cron went at
   the same time.
9. **The original design handoff is now stale.** It specifies JetBrains Mono as
   a single family and a different type scale. The build has moved past it.

---

## 9. Where things live

```
src/
  app/
    globals.css              design tokens (light + dark)
    fonts.ts                 the three faces
    page.tsx                 01 overview
    submissions/ problems/ rating_change/ analysis/ compare/ blogs/ feedback/
    api/feedback/route.ts    anonymous feedback endpoint
  components/
    dossier/
      Shell.tsx              sidebar + main, wraps every route
      Sidebar.tsx            196px nav
      primitives.tsx         shared chrome — the leverage point
      RankBandChart.tsx      rank-banded rating curve + delta row (recharts)
      StandParameters.tsx    segmented skill meters
    codeforces-visualizer.tsx  the overview
  lib/
    dossier.ts               ramp, rank bands, formatters, NAV
    utils.ts                 derived values (verdict, weak tags, rung coverage…)
    api-cache.ts             read-through cache for Codeforces endpoints
    compare.ts               head-to-head derivations for /compare
    feedback.ts              feedback contract + validation
    *.test.mjs               node-runnable checks (cn, verdict, analytics,
                             feedback, compare) — CI runs all of them
  app/types.ts               the one type barrel
tailwind.config.ts           type scale, families, colour tokens
```

---

## 10. Suggested audit focus

Most useful angles, roughly in order:

1. **Does the hierarchy hold?** Land on each route cold — is it obvious what to
   read first? The seven-step scale and three-tier contrast ramp are the claim;
   check whether they actually deliver.
2. **Accessibility beyond contrast.** Contrast was measured and fixed, but
   keyboard traversal, focus order, screen-reader labelling on the charts, the
   gantt and the verdict tape have not been audited.
3. **Is the luminance-only encoding legible?** Rank and difficulty carry meaning
   through brightness alone. Check it holds for low-vision users and in light
   mode — and note there is no redundant encoding if it doesn't.
4. **Information density.** Tables are deliberately tight. Is that right for
   this audience, or is it just inherited brutalism?
5. **Copy.** Labels and empty states were rewritten for plain language. Worth a
   read for tone consistency and honesty (especially error messages).
6. **Charts.** Rank bands, the delta row alignment, the gantt's "thinking"
   model. The gantt infers attention sequentially from submission times — that
   is a modelling choice worth challenging.
7. **The verdict's claims.** It asserts things about the user from derived
   stats. Check the derivations in `src/lib/utils.ts` are defensible and the
   sentence can't mislead on edge cases (very few submissions, unrated, etc).
