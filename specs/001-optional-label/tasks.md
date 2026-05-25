# Tasks: Optional Label Rendering

**Input**: Design documents from `/specs/001-optional-label/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md,
contracts/component-contract.md, quickstart.md

**Tests**: Test tasks are INCLUDED. The constitution's
"Test-First Discipline" principle (cited in plan.md Constitution
Check) requires the bare-input tests to be written and failing
before the implementation branch is added.

**Organization**: This feature has a single user story (US1), so
Phase 3 contains all story-specific tasks. Phases 1 and 2 are
intentionally minimal because the project's infrastructure
(build, lint, tapout test harness, esbuild bundling, exports
map) already exists and is not changed by this feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1)
- Exact file paths are included in every task

## Path Conventions

This is a single-package web component library. All paths are
relative to the repository root (`/Users/nick/code/check-box/`):

- Component source: `src/index.ts`
- Component styles: `src/index.css` (NOT modified)
- Tests: `test/index.ts`
- Example page: `example/index.html`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing project toolchain runs cleanly
before any change is made, so later failures can be attributed to
this feature's diffs rather than to pre-existing breakage.

- [ ] T001 Run `npm install` from the repository root to ensure
  `node_modules/` reflects current `package.json` (no new deps
  are added by this feature, but the install must succeed before
  tests can run)
- [ ] T002 Run `npm test && npm run lint && npm run stylelint` from
  the repository root and confirm all three exit zero on the
  pre-change baseline. Record the pre-change passing-test count so
  the post-change run can be compared against it.

**Checkpoint**: Baseline is green. Any failure after this point is
attributable to this feature's changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required for this feature.

No shared models, no shared services, no schema, no auth, no
routing infrastructure is introduced. The single rendering-mode
derived value (`labelText` / `renderMode` per `data-model.md`) is
local to `render()` and does not need a pre-built foundation.

**Checkpoint**: Phase 2 is intentionally empty. Proceed directly
to Phase 3.

---

## Phase 3: User Story 1 - Render bare checkbox when no label text is provided (Priority: P1) MVP

**Goal**: When a `<check-box>` is authored with no inner text (or
whitespace only), the component renders only an
`<input type="checkbox">` — no `<label class="checkbox-label">`
wrapper and no empty `<span>`. When inner text is supplied, the
existing labelled structure is preserved unchanged. All public
behaviour (`checked` / `disabled` / `name` getters/setters,
attribute reflection, `change` event bubbling, `disabled` class on
the host) continues to work in both modes.

**Independent Test**: Place `<check-box></check-box>` (no inner
text) and `<check-box>Accept terms</check-box>` (with inner text)
on a page. Verify via DOM queries that the first has no `<label>`
descendant and the second does, and that both respond identically
to the public API (`checked`, `disabled`, `name`, `change`).

### Tests for User Story 1 (write FIRST, watch them FAIL before implementation)

Per the constitution's Test-First Discipline rule and `research.md`
Decision 5, all assertions exercise observable DOM state and the
public API — none assert on rendered HTML strings or documentation
copy. Tests must FAIL before T010 begins.

- [ ] T003 [P] [US1] Add test `renders bare input when no label
  text is provided` to `test/index.ts`. Fixture:
  `<check-box></check-box>`. Assert
  `el.querySelector('label') === null` and
  `el.querySelector('input[type="checkbox"]')` returns an element.
  Maps to acceptance scenario 1 and SC-001.
- [ ] T004 [P] [US1] Add test `whitespace-only content is treated
  as no label` to `test/index.ts`. Fixture:
  `<check-box>   </check-box>` (containing spaces). Assert
  `el.querySelector('label') === null` and an
  `input[type="checkbox"]` is present. Maps to acceptance
  scenario 3 and the whitespace edge case.
- [ ] T005 [P] [US1] Add test `bare input still reflects checked
  attribute` to `test/index.ts`. Fixture:
  `<check-box checked></check-box>`. Assert `el.checked === true`,
  `el.hasAttribute('checked') === true`, and the inner
  `input.checked === true`. Maps to the bare + `checked` edge case.
- [ ] T006 [P] [US1] Add test `bare input still reflects disabled
  attribute and disabled class` to `test/index.ts`. Fixture:
  `<check-box disabled></check-box>`. Assert `el.disabled === true`,
  `el.classList.contains('disabled') === true`,
  `el.hasAttribute('disabled') === true`, and the inner
  `input.disabled === true`. Maps to the bare + `disabled` edge case.
- [ ] T007 [P] [US1] Add test `bare input still carries name
  attribute` to `test/index.ts`. Fixture:
  `<check-box name="agree"></check-box>`. Assert
  `el.name === 'agree'` and the inner `input.name === 'agree'`.
  Maps to the bare + `name` edge case.
- [ ] T008 [P] [US1] Add test `bare input dispatches change event
  on click and syncs host checked attribute` to `test/index.ts`.
  Fixture: `<check-box></check-box>`. Attach a `change` listener
  on the host; click the inner input via
  `@substrate-system/dom` `click()`; assert the listener fires,
  `el.checked === true` afterwards, and `el.hasAttribute('checked')`
  is `true`. Click again; assert the host's `checked` attribute is
  removed. Maps to acceptance scenario 4 and FR-005.
- [ ] T009 [US1] Extend the existing test
  `'renders with label text'` in `test/index.ts` to also assert
  positively that exactly one `<label class="checkbox-label">`
  wraps exactly one `<input type="checkbox">` (give SC-002 a
  positive assertion rather than relying solely on the absence-of-label
  test). Do NOT change other existing tests' behaviour.

**Verification step before implementation**: Run `npm test` and
confirm tests T003–T008 FAIL (they must fail because
`render()` still always emits the `<label>` wrapper). T009 should
PASS after the extension because the current code still emits the
labelled shape. If T003–T008 pass before implementation, the
tests are not actually exercising the new requirement — fix the
tests, do not proceed to T010.

### Implementation for User Story 1

- [ ] T010 [US1] Modify the `render()` method in `src/index.ts` to
  branch on rendering mode. Steps inside `render()`:
  1. Compute `labelText` as `this.textContent?.trim() || ''`
     (already present; do not duplicate).
  2. Build the `<input>` element first (set `type`, `name`,
     `checked`, `disabled` exactly as today).
  3. If `labelText === ''`, call
     `this.replaceChildren(input)` — the bare branch. Do NOT
     create a `<label>` or `<span>` in this branch.
  4. Else, create the `<label class="checkbox-label">` and the
     `<span>` (with `span.textContent = labelText`), append the
     input and span into the label, and call
     `this.replaceChildren(label)` — the labelled branch
     (current behaviour).
  5. Keep the `if (isDisabled) this.classList.add('disabled')`
     side-effect in the shared part of `render()` (above the
     branch), so it fires for both shapes.
  Per `research.md` Decision 3, do not split `render()` into
  helper methods.
- [ ] T011 [US1] Re-run `npm test` and confirm the full test
  suite passes — tests T003–T008 must now PASS, T009 must still
  pass, and the pre-existing tests from the baseline (T002)
  must all still pass with no regressions in count or content.

**Checkpoint**: User Story 1 is fully functional. Bare and
labelled shapes both work, both honour the public API, and the
quickstart contract holds.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verify the change against the documented contract,
the quickstart manual sanity check, and the project's lint /
build pipeline before the feature is considered done.

- [ ] T012 [US1] Execute every step of
  `/specs/001-optional-label/quickstart.md` against a running
  `npm start` (Shape A unchanged in step 2; Shape B for each of
  the five fixtures in step 3; visual SC-004 check in step 4).
  Record any deviations from the contract; deviations are bugs
  in T010, not bugs in the quickstart.
- [ ] T013 [P] Run `npm run lint` from the repository root and
  confirm it exits zero. Per the global guidance, do NOT modify
  ESLint settings to make the change pass; if a lint error
  appears in `src/index.ts` or `test/index.ts`, fix the code.
- [ ] T014 [P] Run `npm run stylelint` from the repository root
  and confirm it exits zero. `src/index.css` is NOT modified by
  this feature, so this should pass unchanged from the baseline.
- [ ] T015 Run `npm run build` from the repository root and
  confirm it exits zero. Spot-check the published shape: the
  bundle size in `dist/` should be within rounding distance of
  the pre-change baseline (the diff adds one `if/else` branch
  and removes one allocation in the empty case).
- [ ] T016 Re-verify the Constitution Check section of
  `plan.md` against the final implementation: Web Standards First
  (no framework API added), Accessibility (consumer contract for
  external labelling is documented in
  `contracts/component-contract.md`), Test-First Discipline (T003–T008
  failed before T010), Minimal Dependency Footprint (no new deps in
  `package.json`), CSS Customization via Variables (no CSS
  variables added/renamed). All five gates must still PASS.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run first to establish
  a green baseline.
- **Foundational (Phase 2)**: Empty for this feature — no work.
- **User Story 1 (Phase 3)**: Depends on Phase 1 completion.
  Within Phase 3, tests (T003–T009) MUST be completed before
  implementation (T010) — see verification step.
- **Polish (Phase 4)**: Depends on Phase 3 completion (the
  feature must work before lint/build/quickstart verifies it).

### User Story Dependencies

- **User Story 1 (P1)**: The only user story in this feature.
  No inter-story dependencies exist.

### Within User Story 1

- T003 through T008 are parallelisable (all add separate test
  cases to `test/index.ts`; merge-time conflicts are trivial
  text-append operations and can be sequenced as needed).
- T009 extends an existing test in `test/index.ts` — can be
  done in parallel with T003–T008 if working on disjoint regions
  of the file, otherwise serialise.
- T010 must NOT begin until T003–T008 are observed to FAIL.
- T011 must NOT begin until T010 is complete.

### Parallel Opportunities

- All test-authoring tasks (T003, T004, T005, T006, T007, T008,
  T009) can be developed in parallel since they each add an
  independent `test(...)` block. They all land in the same file
  (`test/index.ts`), so coordinate merges to avoid conflicts.
- T013 (`npm run lint`) and T014 (`npm run stylelint`) in Phase 4
  are independent and can run concurrently.
- T015 (`npm run build`) is independent of T013 and T014 but
  must run after T011.

---

## Parallel Example: User Story 1

```bash
# In Phase 3, the six new test cases are independent test() blocks
# in test/index.ts. They can be drafted in parallel:
Task: "Add test 'renders bare input when no label text is provided'
       to test/index.ts (T003)"
Task: "Add test 'whitespace-only content is treated as no label'
       to test/index.ts (T004)"
Task: "Add test 'bare input still reflects checked attribute'
       to test/index.ts (T005)"
Task: "Add test 'bare input still reflects disabled attribute and
       disabled class' to test/index.ts (T006)"
Task: "Add test 'bare input still carries name attribute'
       to test/index.ts (T007)"
Task: "Add test 'bare input dispatches change event on click and
       syncs host checked attribute' to test/index.ts (T008)"
```

After all tests are added and FAILING:

```bash
# Sequential — single-file render() branch:
Task: "Modify render() in src/index.ts to branch on labelText
       (T010)"
```

---

## Implementation Strategy

### MVP (this feature IS the MVP)

This feature has exactly one user story and is itself the MVP
increment. The recommended path:

1. Complete Phase 1 (Setup) — green baseline.
2. Skip Phase 2 (empty).
3. Complete Phase 3 (User Story 1) with TDD discipline:
   write T003–T008 and watch them fail → run T010 → watch them pass.
4. **STOP and VALIDATE**: Run `npm test` and confirm zero
   regressions.
5. Complete Phase 4 (Polish) — quickstart, lint, stylelint,
   build, Constitution re-check.

### Incremental Delivery

Not applicable — there is only one user story. The whole feature
ships in one cut.

### Parallel Team Strategy

Single-engineer task by design. If two engineers are available,
one can draft tests (T003–T008 in parallel) while the second
prepares the `render()` diff in a scratch branch; the second
engineer must wait for the first's tests to be observed as
FAILING on `main` before applying the implementation diff.

---

## Notes

- [P] tasks = different files or independent regions of the same
  file, no dependencies.
- [Story] label maps each Phase 3/Phase 4 task to User Story 1
  for traceability.
- TDD is mandatory here per the Constitution Check in `plan.md`:
  T003–T008 MUST FAIL before T010 begins.
- Per `CLAUDE.md`: NEVER change CSS that is not related to this
  task (none is needed here — see `research.md` Decision 4) and
  NEVER change ESLint settings.
- Per `CLAUDE.md`: do NOT write tests that assert on specific
  HTML text content for documentation — all six new tests
  assert on DOM structure / properties / events, not on copy.
- Commit after each task or each logical group (e.g. one commit
  for T003–T009, one for T010, one for T011).
- The feature touches exactly two source files: `src/index.ts`
  (modified by T010) and `test/index.ts` (extended by T003–T009).
  No other source file should change.
