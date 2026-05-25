# Implementation Plan: Optional Label Rendering

**Branch**: `001-optional-label` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-optional-label/spec.md`

## Summary

When a `<check-box>` is authored with no inner text (or whitespace only),
the component must render just an `<input type="checkbox">` with no
surrounding `<label class="checkbox-label">` wrapper and no empty
`<span>`. When inner text is supplied, the existing labelled structure is
preserved unchanged. All public behaviour (`checked` / `disabled` /
`name` getters/setters, attribute reflection, `change` event bubbling,
`disabled` class on the host) MUST continue to work in both modes.

Technical approach: a single conditional branch inside the existing
`render()` method in `src/index.ts` that builds either the labelled DOM
(current behaviour) or the bare input DOM (new behaviour), based on
whether `this.textContent?.trim()` is non-empty. Tests are added in
`test/index.ts` for the bare-input case and to assert no regression of
the labelled case. No CSS changes, no new dependencies, no public API
additions.

## Technical Context

**Language/Version**: TypeScript 5.9 (transpiled via esbuild to ES2020)
**Primary Dependencies**: `@substrate-system/web-component` (runtime,
already in `package.json`); `@substrate-system/tapzero` and
`@substrate-system/dom` (dev, test only)
**Storage**: N/A (DOM-only, no persistence)
**Testing**: `tapzero` driven by `tapout` in a real browser
(`npm test`); test entry at `test/index.ts`
**Target Platform**: All evergreen browsers that support native Custom
Elements v1 (Chrome, Firefox, Safari, Edge); shipped as ESM + CJS plus
matching minified builds and a separate CSS artifact
**Project Type**: Single web component library (publishable npm
package, leaf dependency for application bundles)
**Performance Goals**: One-shot DOM construction inside
`connectedCallback`; no perceptible regression vs. current render
(target: single-element render path, no extra allocations for the
labelled branch)
**Constraints**: Must remain backwards-compatible for every consumer
that supplies label text; must not enlarge the published bundle
materially; must not introduce new public API surface; must not require
any consumer-side change to keep working
**Scale/Scope**: Single web component, ~135 LOC in `src/index.ts`; one
test file; one CSS file (no CSS changes in this feature)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Mapped to the five principles of `.specify/memory/constitution.md`:

- **I. Web Standards First** — PASS. The change keeps the component as a
  native Custom Element, keeps `checked` / `disabled` / `name`
  attributes mirroring the underlying `<input type="checkbox">`, and
  keeps `change` / `input` / `click` events bubbling out of the
  component because the bare input is still a direct child of the host.
  No framework-specific API is introduced.
- **II. Accessibility (NON-NEGOTIABLE)** — PASS, with explicit consumer
  contract. When inner text is supplied, the existing `<label>` wrapper
  provides the accessible name as before. When no inner text is
  supplied, the component intentionally renders a bare input with no
  accessible name; per the spec's Assumption section, consumers who
  want an external `<label for="...">` association are responsible for
  it. Keyboard operability, focus visibility, and the `disabled` block
  on activation are unchanged because the rendered `<input>` is still
  the same native element. Color contrast is unaffected (no CSS
  variables changed).
- **III. Test-First Discipline** — PASS. New `tapzero` tests for the
  bare-input case are added to `test/index.ts` before the
  implementation change. Existing tests, which already exercise the
  labelled case via the public API and observable DOM, are extended
  (not replaced) to keep covering it. Tests assert through DOM
  structure and properties — they do not assert on rendered HTML
  strings or documentation copy, in line with project-level guidance
  against brittle tests.
- **IV. Minimal Dependency Footprint** — PASS. No new runtime or dev
  dependencies. ESM + CJS + CSS artifact configuration in
  `package.json#exports` is unchanged.
- **V. CSS Customization via Variables** — PASS. No CSS variables are
  added, removed, or renamed. The `.checkbox-label` selector continues
  to match in the labelled case and simply does not apply when the
  label is absent. Font-size and nesting conventions are untouched.

**Result**: All five gates pass. No deviations to record in Complexity
Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-optional-label/
├── plan.md                # This file (/speckit.plan command output)
├── research.md            # Phase 0 output
├── data-model.md          # Phase 1 output (rendering-mode states)
├── quickstart.md          # Phase 1 output (consumer usage)
├── contracts/
│   └── component-contract.md  # Public-API contract for <check-box>
├── checklists/            # Pre-existing checklists folder
└── spec.md                # Feature spec (input)
```

### Source Code (repository root)

```text
src/
├── index.ts               # CheckBox custom element (single file; render() updated)
└── index.css              # Component styles (no changes in this feature)

test/
└── index.ts               # tapzero tests (extended with bare-input cases)

dist/                      # Build output (regenerated by `npm run build`)
example/                   # Demo page used by `npm start` / build-example

.specify/
├── memory/constitution.md
├── scripts/bash/{setup-plan.sh, update-agent-context.sh, ...}
└── templates/{plan-template.md, ...}
```

**Structure Decision**: This is a single-package web component library
with no sub-projects. All implementation code stays in `src/`, all
tests stay in `test/`, all artifacts are emitted to `dist/`. No new
directories are introduced by this feature. The renderer change is
local to `src/index.ts`; the test additions are local to
`test/index.ts`.

## Complexity Tracking

> No constitution violations. Table intentionally left blank.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_  | _(n/a)_    | _(n/a)_                             |
