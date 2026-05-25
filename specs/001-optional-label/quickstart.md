# Quickstart: Optional Label Rendering

**Feature**: 001-optional-label
**Date**: 2026-05-24

This is a fast-path for verifying the optional-label feature once it
is implemented. It exercises both rendered shapes (labelled and bare)
and the cross-mode invariants from `contracts/component-contract.md`.
Treat this as the manual sanity check you would run alongside the
automated test suite before merging the feature.

## Prerequisites

- Node 18+ and a working `npm install` in the repository root.
- A browser that supports native Custom Elements v1 (any evergreen
  browser).

## 1. Install and start the example page

```bash
npm install
npm start
```

`npm start` launches Vite against the `example/` directory. Visit the
URL it prints (typically `http://localhost:5173`).

## 2. Verify Shape A (labelled, unchanged)

In the running example page, confirm that a `<check-box>` with inner
text renders as before:

1. Open DevTools and locate any `<check-box>` whose tag wraps text,
   e.g. `<check-box>Accept terms</check-box>`.
2. Inspect its children. You MUST see exactly:
   ```html
   <label class="checkbox-label">
     <input type="checkbox" />
     <span>Accept terms</span>
   </label>
   ```
3. Click anywhere on the label (the text or the input). The input's
   `checked` state MUST toggle, the host's `checked` attribute MUST
   appear/disappear in sync, and a `change` event MUST bubble out of
   the host (verifiable by attaching an inline listener in DevTools:
   `$0.addEventListener('change', e => console.log(e))`).

## 3. Verify Shape B (bare, new)

Add or temporarily author one of the following in `example/index.html`
(or directly in DevTools via "Edit as HTML"):

```html
<check-box></check-box>
<check-box>   </check-box>
<check-box checked></check-box>
<check-box disabled></check-box>
<check-box name="agree"></check-box>
```

For each, after the element is connected, confirm in DevTools:

1. The host's direct children consist of exactly one node: an
   `<input type="checkbox">`. There MUST be no `<label>` and no
   `<span>` inside the host.
2. `host.querySelector('label')` returns `null`.
3. `host.querySelector('input[type="checkbox"]')` returns the input.
4. `host.checked`, `host.disabled`, and `host.name` reflect the
   authored attributes correctly (same as Shape A).
5. Clicking the input toggles `host.checked`, flips the host's
   `checked` attribute presence, and dispatches a `change` event that
   bubbles out of the host (`host.addEventListener('change', ...)`).
6. For the `disabled` case: the host carries the `disabled` class
   AND the `disabled` attribute, the input is disabled, and clicks do
   not toggle state.
7. For the `name` case: `host.querySelector('input').name === 'agree'`.

## 4. Visual sanity check (SC-004)

In the same example page, place a labelled and a bare check-box
next to each other in a row container:

```html
<div style="display:flex; gap:1rem;">
  <check-box></check-box>
  <check-box>With a label</check-box>
</div>
```

The bare check-box MUST occupy only the visual footprint of the
input itself, with no extra horizontal gap reserved where label text
would have lived. The labelled check-box MUST keep its existing flex
layout (`display: flex; gap: 1em; align-items: center;` on the
`.checkbox-label`).

## 5. Run the automated test suite

```bash
npm test
```

All existing tests MUST still pass. The newly added cases (bare
input + checked / disabled / name / change-event / no-label
assertions, plus whitespace-only) MUST also pass. If any existing
test fails, the implementation has regressed an invariant from the
contract document; fix the implementation rather than relaxing the
test.

## 6. Lint and build

```bash
npm run lint
npm run stylelint
npm run build
```

All three MUST exit zero. Per the constitution, ESLint settings MUST
NOT be modified to make the change pass.

## Troubleshooting

- **The bare check-box still shows a `<label>` element.** The
  conditional in `render()` is choosing the labelled branch. Confirm
  that `this.textContent?.trim()` returns `''` for the failing case;
  if not, the test fixture is supplying whitespace text that the
  trim is not catching (very rare; check for non-breaking spaces).
- **The host's `checked` attribute does not flip after a click on
  the bare input.** The `change` listener wiring in
  `connectedCallback` did not bind because `_input` was not found
  after render. Confirm the bare branch is calling
  `this.replaceChildren(input)` and that `this.querySelector('input')`
  returns it on the next line.
- **`disabled` class is missing on the host in the bare case.** The
  bare branch must still call `this.classList.add('disabled')` when
  the host has the `disabled` attribute. Hoist that side-effect out
  of the labelled branch into the shared part of `render()`.
