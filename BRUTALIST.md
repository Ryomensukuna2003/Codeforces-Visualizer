# The Dossier system

A portable brutalist design system, extracted from [CF Stats](https://cfstats.vercel.app).
Everything here is copy-pasteable into another project. `DESIGN.md` in this repo is
the *product* spec — routes, components, decisions specific to this app. **This**
file is the transferable part.

The governing idea: **the page is a printed intelligence report.** Dense, monospaced,
black and white, ruled into cells. Nothing decorative survives. The reader is
technical, reads tables happily, and already lives in a terminal. Every choice below
follows from that sentence — so if you are adapting this for a different audience,
change the sentence first and re-derive, rather than keeping the rules and losing
the reason.

---

## 1. The four rules

These are non-negotiable. Everything else is detail.

1. **Palette is black, white and red only.** Rank, difficulty, severity and
   magnitude are *luminance* steps, never hue. **Red is reserved for failure and
   urgency** — nothing else may use it, ever. A red "success" badge destroys the
   system, because red stops meaning anything.
2. **Border radius is 0. Everywhere. No exceptions.**
3. **Type comes from seven named steps.** Never an ad-hoc pixel size.
4. **One left rail, 20px.** Every section on every screen shares it. The eye should
   be able to draw a straight vertical line down the whole page.

A fifth, which is really a consequence of 4: **boxes touch.** See §6.

---

## 2. Tokens

HSL triplets, so they compose with opacity. Light first, dark under `.dark`.

### Structure

| Token | Light | Dark | Job |
|---|---|---|---|
| `--background` | `0 0% 98.5%` | `0 0% 3.9%` | The ground behind panels |
| `--card` | `0 0% 100%` | `0 0% 0%` | The panel itself |
| `--foreground` | `0 0% 3.9%` | `0 0% 98%` | Primary text |
| `--muted-foreground` | `0 0% 45.1%` | `0 0% 63.9%` | Secondary text |
| `--faint` | `0 0% 45%` | `0 0% 54%` | Labels, units. **Nothing fainter is text.** |

> `--background` is deliberately **not** pure white. `card` is the panel and
> `background` is the ground behind it — the same relationship dark mode has. When
> both were `100%`, every `bg-background` element inside a `bg-card` panel painted
> white on white and vanished.

### Lines and surfaces

| Token | Light | Dark | Job |
|---|---|---|---|
| `--rule` | `0 0% 78%` | `0 0% 32%` | Divides **sections** |
| `--hair` | `0 0% 90%` | `0 0% 10.2%` | Divides **rows** |
| `--inset` | `0 0% 97.5%` | `0 0% 3.1%` | Table headers, recessed areas |
| `--track` | `0 0% 92.5%` | `0 0% 7.5%` | Meter / progress backgrounds |
| `--rowhover` | `0 0% 96%` | `0 0% 5.9%` | Row hover |
| `--field` | `0 0% 80%` | `0 0% 20%` | Input borders |
| `--chip` | `0 0% 84%` | `0 0% 16.9%` | Tag chip borders |

**Two line weights, two jobs, nothing else draws a line.** `rule` between sections,
`hair` between rows. The moment a third line token appears, the grid stops reading
as a grid.

### The ramp — luminance, never hue

Four steps for any ordinal scale (rank, tier, difficulty, severity):

| Token | Light | Dark |
|---|---|---|
| `--tier-1` | `0 0% 64%` | `0 0% 36.1%` |
| `--tier-2` | `0 0% 45%` | `0 0% 56.1%` |
| `--tier-3` | `0 0% 25%` | `0 0% 83.1%` |
| `--tier-4` | `0 0% 3.9%` | `0 0% 98%` |

Note the ramp **inverts** between themes: higher tier means *darker* on light,
*lighter* on dark. It always means "more contrast against the ground."

For chart fills, express the same ramp as opacity of `--foreground` rather than as
separate colours — that way it composes over any surface.

### Failure flags — the only red

| Token | Light | Dark | Job |
|---|---|---|---|
| `--flag-bg` | `0 100% 98%` | `0 100% 2%` | Failure block background |
| `--flag-wash` | `0 100% 97%` | `0 100% 2.6%` | Failure row background |
| `--flag-rule` | `0 57% 85%` | `0 57% 18%` | Failure border |
| `--flag-fg` | `0 45% 45%` | `0 42% 59%` | Failure text |

Plus a saturated red (`red-500` or equivalent) for the 2px accent rule on the one
loud element per page, and for negative deltas.

---

## 3. Type scale — seven steps

Name them. Never write `text-[13px]`.

| Step | Size | Line height | Tracking | Job |
|---|---|---|---|---|
| `display` | 3.5rem / 56px | 0.95 | −0.03em | The one huge number or name |
| `title` | 2rem / 32px | 1.05 | −0.02em | Page title |
| `stat` | 1.5rem / 24px | 1 | −0.01em | Figures in a stat strip |
| `lead` | 1.25rem / 20px | 1.55 | — | The one prose sentence per page |
| `body` | 0.875rem / 14px | 1.4 | — | Table cells, most text |
| `meta` | 0.75rem / 12px | 1.35 | — | Secondary/inline detail |
| `label` | 0.6875rem / 11px | 1 | **+0.06em** | Uppercase labels, column heads |

Two things carry the whole scale: **negative tracking tightens as size grows**
(large mono is too airy otherwise), and **`label` is the only step with positive
tracking**, because it is always uppercase and uppercase needs air.

> The failure mode this replaced: twenty ad-hoc sizes between 9 and 13.5px. The
> readability problem was never the monospace — it was nine sizes crammed into a
> 4px range at 2:1 contrast. Fix the scale and the contrast ramp, and mono carries
> a whole dense application comfortably.

---

## 4. Typography

**All monospace. Two voices.**

```ts
text:    JetBrains Mono   // 400/500/600/700 — the workhorse: rows, labels, columns
display: Martian Mono     // 400/700 — wordmark, titles, stat values, figures
```

`display` is the blocky, heavy cut: mass over refinement, which is the brutalist
read. It **needs a real 700 weight**, because the emphasis mechanic depends on it.

The mechanic: inside a sentence set in the text face, the damning **figures switch
to the display cut at the same size**. The numbers speak in a different voice from
the prose without changing size or colour. This is the single most characteristic
move in the system — steal this one if you steal nothing else.

Two voices, not three. A separate "logo" face is a trap; see §9.

---

## 5. Layout

**The rail.** `padding-left: 20px` on every section, every screen. It is the spine.

**Sections stack, divided by `--rule`. Rows stack, divided by `--hair`.** No gaps,
no shadows, no cards floating on a background. The page is one continuous ruled
sheet.

**Tables are div grids, not `<table>`:**

```
Header row:  flex, py-2.5, text-label uppercase, color faint, bg inset
First cell:  flex-1 px-5        ← carries the rail
Other cells: shrink-0 px-2, fixed width, justify-center
Body row:    flex items-stretch border-b border-hair hover:bg-rowhover
```

Every column gets an explicit width class shared between head and body cell. The
first cell is always `flex-1` and always carries the 20px rail.

> Honest trade-off: divs lose native table semantics. If your content is genuinely
> tabular data a screen-reader user will navigate, use a real `<table>` with
> `display: contents` styling rather than copying this.

**Numbers use `font-variant-numeric: tabular-nums`.** Always. Columns of digits
that shift width as they change are the fastest way to make a dense layout feel
cheap.

---

## 6. Boxes touch

The rule that does the most work, and the one most often broken.

**A control never floats inside a larger container with padding around it.** If a
button, input or toggle sits in a cell, it *fills* that cell — full height, edge to
edge — and divides from its neighbour with a single rule.

```
✗  <div class="p-3"><button class="h-7 w-7 border">…</button></div>
   A 28px box inside a 60px box, touching nothing. Reads as debris.

✓  <div class="flex items-stretch border-l border-rule">
     <button class="h-full w-12 border-0">…</button>
   </div>
   One cell beside another cell. Reads as a strip.
```

The same applies to filter rows, tab strips, header bars and input groups. A row's
height comes from its tallest control, and every other control stretches to match.

**Corollary — an indicator belongs to the box you can see, not the element that
owns the state.** A focus underline drawn on an `<input>` sitting in a padded cell
stops short of the cell's edges and reads as a stray line. Put it on the cell:

```css
.field-cell:has(:is(input, textarea, select):focus-visible) {
  box-shadow: inset 0 -2px 0 0 hsl(var(--foreground));
}
```

---

## 7. The signature element

One loud element per page, and only one:

```
2px solid red left border · no radius · label above in red uppercase `label`
· one sentence at `lead` · figures inside it in the display cut, bold
```

This is where the page states its conclusion in plain English. It is the only place
red appears as a structural accent, and the only place prose is allowed to be
large. Everything else on the page is a number in a cell.

If your product has no conclusion to state, you do not need this element — but then
you probably do not need this design system either, because the whole point is
being opinionated about what the data means.

---

## 8. Interaction

**Focus.** One treatment for the whole app; components draw no ring of their own,
so it can never double.

```css
:focus-visible {
  outline: 2px solid hsl(var(--foreground));
  outline-offset: -2px;   /* INSET. See below. */
}
```

`outline-offset` must be **negative**. At `+1px` the ring lands *outside* the
element, so on anything with a border — which in a design made of 1px rules is
nearly everything — it draws a second rectangle a pixel beyond the first. In dark
mode that outer rectangle is white and looks like a rendering bug.

Fields need their own answer, because in this system they usually sit in cells that
strip their border and so compute to `border-width: 0`. A rectangle there invents a
box that does not otherwise exist. Give them an underline (see §6).

`--foreground`, not red: red is for failure, and knowing where you are is not a
failure.

**Hover.** `--rowhover` on rows. That is the entire hover vocabulary. No lifts, no
shadows, no scale transforms.

**Motion.** Effectively none, with one licensed exception: a `clip-path` wipe that
inverts a cell to `foreground`/`background` on hover. It is a fill, not a fade, and
it is the only animation in the system.

---

## 9. What breaks it

Every item here is a real defect found in this codebase, not a hypothetical.

**A third font for the logo.** A display face chosen because "a logo is a shape,
not a word" rendered `A` as a bare triangle and drew lowercase *lighter than* its
caps — so a title-case wordmark came out as heavy `CF S` beside thin `tats`, one
word looking like two typefaces. In a face where case is a weight switch, mix case
and you get a mismatch. Use your display face, set all caps, and delete the third
font.

**Class-merge utilities that don't know your scale.** `tailwind-merge` classifies
unknown `text-*` values as *colour*, so `cn("text-meta", "text-tier-2")` silently
dropped the size. If you use custom `fontSize` keys, you **must** declare them:

```ts
extendTailwindMerge({ extend: { classGroups: { "font-size": [{ text: [
  "display","title","stat","lead","body","meta","label",
] }] } } })
```

**Zeroing `--radius` but not the scale.** A shadcn primitive shipping `rounded-lg`
reads its own token, not yours. Override the *whole* `borderRadius` scale to `0` so
a stray class renders square instead of having to be hunted down.

**`position: absolute` with no positioning context.** An icon absolutely positioned
inside a button whose base classes lack `relative` anchors to the nearest positioned
ancestor — which was, in one case, the entire sidebar. It only showed in one theme,
because only one of the two cross-fading icons was the absolute one.

**Sizing an indicator to the control instead of the cell.** Measured: a 76px rating
input inside a 270px cell, with the focus rule drawn under 28% of the box it was
meant to mark.

**Hue creeping in for meaning.** The instant a green "good" or amber "warning"
appears, the luminance ramp stops being readable as an ordinal scale, and red stops
being an alarm. Severity is contrast, not colour.

---

## 10. Copy

The words are design material.

- **Sentences, not labels, for conclusions.** "You are improving — but only below
  1600" beats a gauge.
- **Never fabricate a number.** Show `—`, not `0`, when a value does not exist. A
  zero is a claim; an em dash is an absence.
- **Name the thing the user recognises.** Their vocabulary, not your schema's.
- **Uppercase only at the `label` step**, always with `+0.06em` tracking.
- **Numbers shown to a user must be defensible.** If you assert something about
  someone from their data, check the edge cases — no data, one row, a null — and
  leave a runnable check behind.

---

## 11. Minimal starter

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 98.5%; --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;        --muted-foreground: 0 0% 45.1%;
    --faint: 0 0% 45%;        --radius: 0rem;
    --rule: 0 0% 78%;         --hair: 0 0% 90%;
    --inset: 0 0% 97.5%;      --track: 0 0% 92.5%;
    --rowhover: 0 0% 96%;     --field: 0 0% 80%;
    --tier-1: 0 0% 64%; --tier-2: 0 0% 45%;
    --tier-3: 0 0% 25%; --tier-4: 0 0% 3.9%;
  }
  .dark {
    --background: 0 0% 3.9%;  --foreground: 0 0% 98%;
    --card: 0 0% 0%;          --muted-foreground: 0 0% 63.9%;
    --faint: 0 0% 54%;
    --rule: 0 0% 32%;         --hair: 0 0% 10.2%;
    --inset: 0 0% 3.1%;       --track: 0 0% 7.5%;
    --rowhover: 0 0% 5.9%;    --field: 0 0% 20%;
    --tier-1: 0 0% 36.1%; --tier-2: 0 0% 56.1%;
    --tier-3: 0 0% 83.1%; --tier-4: 0 0% 98%;
  }
  :focus-visible { outline: 2px solid hsl(var(--foreground)); outline-offset: -2px; }
  body { background: hsl(var(--background)); color: hsl(var(--foreground)); }
}
```

```ts
// tailwind.config.ts
theme: { extend: {
  fontFamily: {
    sans:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
    mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
    display: ['var(--font-display)', 'var(--font-mono)', 'monospace'],
  },
  fontSize: {
    display: ['3.5rem',   { lineHeight: '0.95', letterSpacing: '-0.03em' }],
    title:   ['2rem',     { lineHeight: '1.05', letterSpacing: '-0.02em' }],
    stat:    ['1.5rem',   { lineHeight: '1',    letterSpacing: '-0.01em' }],
    lead:    ['1.25rem',  { lineHeight: '1.55' }],
    body:    ['0.875rem', { lineHeight: '1.4'  }],
    meta:    ['0.75rem',  { lineHeight: '1.35' }],
    label:   ['0.6875rem',{ lineHeight: '1',    letterSpacing: '0.06em' }],
  },
  colors: {
    background: 'hsl(var(--background))', foreground: 'hsl(var(--foreground))',
    faint: 'hsl(var(--faint))', rule: 'hsl(var(--rule))', hair: 'hsl(var(--hair))',
    inset: 'hsl(var(--inset))', track: 'hsl(var(--track))',
    rowhover: 'hsl(var(--rowhover))', field: 'hsl(var(--field))',
    tier: { 1:'hsl(var(--tier-1))', 2:'hsl(var(--tier-2))',
            3:'hsl(var(--tier-3))', 4:'hsl(var(--tier-4))' },
  },
  // Rule 2, enforced against stray primitives.
  borderRadius: { none:'0', sm:'0', DEFAULT:'0', md:'0', lg:'0',
                  xl:'0', '2xl':'0', '3xl':'0', full:'0' },
}}
```

---

## 12. Adapting it

Keep: the four rules, the seven steps, two line weights, boxes-touch, luminance-not-hue,
tabular numerals, the inset focus outline.

Safe to change: the faces (any two monospaces with a real 700 will do), the exact
greys, the rail width, whether you keep the red accent at all.

Do not keep the rules while dropping the premise. This system is *hostile* to
consumer products — no warmth, no illustration, no reassurance. It works because
its readers are engineers looking at their own performance data and would rather be
told the truth in a table than encouraged in a card. For a different audience,
rewrite the governing sentence in the preamble and derive again from there.
