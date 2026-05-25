# Phase 0 Research: Optional Label Rendering

**Feature**: 001-optional-label
**Date**: 2026-05-24

The feature spec contained no `NEEDS CLARIFICATION` markers. This
document captures the small set of design decisions that fall out of
the spec, the alternatives considered for each, and the rationale for
the chosen approach, so reviewers can evaluate the implementation
against the same trade-off frame.

## Decision 1 — How to detect "no inner text"

**Decision**: Treat the consumer's authored text as empty when
`this.textContent?.trim()` returns an empty string. This is the exact
expression already used inside `render()` in `src/index.ts`, so the
detection rule does not change; only the branch that consumes its
result does.

**Rationale**:

- The current code already normalises whitespace this way before
  assigning to the `<span>`, so re-using the same condition guarantees
  there is no behavioural drift between "what counts as empty" and
  "what gets rendered". A consumer who currently sees a label
  containing only whitespace will switch to the bare-input shape, which
  is the documented intent of the spec (Edge Case: whitespace-only
  treated as empty).
- `textContent` (rather than `innerHTML` or `innerText`) keeps the
  detection cheap and predictable across browsers and avoids any layout
  side-effects from `innerText` (which forces style resolution).
- Trimming with `trim()` (rather than a custom regex) matches the way
  Web platform docs describe "whitespace-only" content and is the
  cheapest correct implementation for the volumes this component will
  ever see (one host element at render time).

**Alternatives considered**:

- _Use `this.childNodes.length === 0` instead._ Rejected: a host with a
  single whitespace text node has `childNodes.length === 1`, which
  would force consumers to author `<check-box></check-box>` with no
  whitespace at all (including no newline) to hit the bare branch.
  That contradicts the spec's whitespace-only edge case.
- _Use `innerText.trim()`._ Rejected: forces layout, depends on CSS
  rendering, and is unnecessary because we only need the raw text.
- _Add a new `no-label` boolean attribute and opt in explicitly._
  Rejected: the spec explicitly asks for "render without a label" to
  be inferred from the absence of inner text, not from a separate
  attribute. An additional attribute would expand the public surface
  for no behavioural benefit and contradict the Distribution &
  Compatibility section of the constitution (additive attributes are
  MINOR changes the consumer would have to learn about).

## Decision 2 — DOM shape when no label is rendered

**Decision**: Render the bare `<input type="checkbox">` as a direct
child of the host element via `this.replaceChildren(input)`. Do not
wrap it in a `<label>`, do not wrap it in a `<span>`, do not add a
shadow root.

**Rationale**:

- This is the minimum DOM that satisfies the spec's "only the
  interactive checkbox control" requirement and is the shape most
  likely to interoperate with consumers' existing form code: a single
  `<input>` direct child means `el.querySelector('input')` continues to
  work, the existing `_input` reference still binds correctly in
  `connectedCallback`, and the existing `change`-listener wiring is
  unchanged.
- Keeping the input as a direct child of the host preserves event
  bubbling out of the host without any retargeting logic, which the
  constitution's "Web Standards First" principle requires.
- Avoiding a Shadow DOM keeps consumer-authored CSS that targets
  `check-box input[type="checkbox"]` working unchanged, which is the
  selector path used by `src/index.css` itself.

**Alternatives considered**:

- _Render an empty `<label>` wrapper with just the input inside._
  Rejected: a `<label>` with no text or `for` association has no
  accessible name and is semantically a "label with no label", which
  is worse than no label at all and is exactly the markup the spec is
  trying to remove.
- _Keep the `<label>` wrapper but skip the `<span>`._ Rejected: a
  `<label>` whose only child is an `<input>` still creates the empty
  flex layout and the empty accessibility label; both are the visible
  symptoms the spec asks us to remove.
- _Move to Shadow DOM for both branches._ Rejected: out of scope for
  this feature, would be a contract change (consumers' light-DOM
  selectors and `:has()` rules would break), and the constitution
  treats removing the existing selector path as a MAJOR change.

## Decision 3 — Where the branch lives

**Decision**: Place the conditional inside the existing `render()`
method in `src/index.ts`. Build the `<input>` element first
(unconditionally, since it is required in both branches), then either
(a) append it directly to the host via `replaceChildren(input)`, or
(b) wrap it in the existing `<label>` + `<span>` structure and append
that wrapper via `replaceChildren(label)`.

**Rationale**:

- `render()` is the only place the component currently builds its
  light-DOM, and it is called exactly once from `connectedCallback`.
  Branching here keeps the change local and keeps the post-render
  `_input = this.querySelector('input')` lookup working unchanged in
  both branches.
- Building the `<input>` first lets us share the `name`, `checked`,
  `disabled` setup between branches and avoid duplication. The two
  branches differ only in whether the `<label>` wrapper and `<span>`
  are constructed.

**Alternatives considered**:

- _Split `render()` into `renderLabelled()` and `renderBare()` helper
  methods._ Rejected for now: with only one branch point and ~5 lines
  of shared input setup, splitting adds indirection without reducing
  cognitive load. If a third rendering shape ever appears, revisit.
- _Render the bare input from `connectedCallback` directly, bypassing
  `render()` for the empty case._ Rejected: would duplicate the
  `name` / `checked` / `disabled` / `disabled`-class wiring and create
  two code paths for `_input` setup, increasing the chance of drift.

## Decision 4 — CSS behaviour when no label is rendered

**Decision**: Make no CSS changes. Rely on the existing
`check-box input[type="checkbox"]` selector path in `src/index.css` to
style the bare input identically to the input inside the labelled
variant. The `.checkbox-label` block continues to apply when the
wrapper is present and naturally does not apply when it is absent.

**Rationale**:

- The Edge Cases section of the spec explicitly says existing styles
  that target `.checkbox-label` should continue to apply when label
  text is present and simply have no effect when the wrapper is
  absent. The existing CSS already meets this requirement without
  modification.
- The constitution's "CSS Customization via Variables" principle
  treats renaming or removing public CSS variables as a contract
  change; the same caution applies to introducing new selectors that
  consumers might come to rely on. Adding none is the safest move.
- The user's standing instructions in `CLAUDE.md` ("NEVER change CSS
  that is not related to the task you are working on") align with
  doing the minimum here.

**Alternatives considered**:

- _Add a `:host(:empty)` rule or a `check-box:not(:has(label))` rule
  to tighten spacing._ Rejected: the spec's SC-004 ("rendered
  unlabelled checkbox occupies no visual space beyond the checkbox
  control itself") is satisfied by removing the flex wrapper alone.
  Adding selectors would expand the styling contract without need.
- _Introduce a new `--checkbox-bare-*` variable family._ Rejected: no
  consumer has requested this; adding it pre-emptively contradicts
  the constitution's "additive variables are MINOR changes" caution.

## Decision 5 — Test strategy for the bare-input case

**Decision**: Add `tapzero` cases to `test/index.ts` covering:

1. Bare-input case (`<check-box></check-box>`): assert that
   `el.querySelector('label')` returns `null` and
   `el.querySelector('input[type="checkbox"]')` returns a real element.
2. Whitespace-only case (`<check-box>   </check-box>`): same assertion
   as case 1.
3. Bare-input + `checked` attribute: assert `el.checked === true`,
   `el.hasAttribute('checked') === true`, and click toggles both off.
4. Bare-input + `disabled` attribute: assert `el.disabled === true`,
   `el.classList.contains('disabled') === true`, and host has the
   `disabled` attribute.
5. Bare-input + `name` attribute: assert `input.name` equals the
   supplied name.
6. Bare-input + `change` event: assert that clicking the bare input
   dispatches a `change` event observable on the host.

Each test exercises observable DOM state and the component's public
API. None of them asserts on rendered HTML strings or on documentation
copy, per the constitution's Test-First Discipline rule and the
project-level guidance against brittle tests.

**Rationale**:

- The spec lists exactly these acceptance scenarios and edge cases,
  and the existing test file is already structured around one
  `tapzero` test per scenario. Mirroring the existing style keeps the
  test file readable and keeps the test runner output meaningful.
- Asserting "label is absent" with `querySelector('label')` returning
  `null` is the most direct expression of FR-002 and SC-001 and does
  not depend on internal markup choices.
- The labelled-case tests already in the file are preserved (and one
  is extended to also assert the `<label>` wrapper is present, to give
  SC-002 a positive assertion rather than relying on the bare-input
  test alone).

**Alternatives considered**:

- _Snapshot-test the rendered HTML._ Rejected: violates the
  constitution's "Tests MUST NOT assert on rendered HTML strings"
  clause and the project-level "do not test for specific text
  content in HTML" rule.
- _Add visual-regression tests for SC-004._ Rejected: out of scope
  for this feature and unsupported by the configured runner
  (`tapout` over `esbuild`-bundled tests). SC-004 will be verified by
  visual inspection in the example page as the spec already states.

## Open Questions

None. The spec is fully constrained for implementation.
