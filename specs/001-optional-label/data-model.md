# Phase 1 Data Model: Optional Label Rendering

**Feature**: 001-optional-label
**Date**: 2026-05-24

This feature introduces no new persistent data entities. The spec
itself notes "Not applicable — this feature changes rendering logic
only and introduces no new data entities." For completeness, this
document captures the one piece of derived state the renderer
consults (the rendering mode) and the state transitions on the host
element that the existing public API already drives.

## Derived state: rendering mode

The component's `render()` method computes a single derived value at
render time and uses it to pick between two DOM shapes. This is not
stored on the instance, has no setter, and is not observable from
outside — it lives only as a local variable inside `render()`.

| Name           | Type           | Source                                | Values                                             |
|----------------|----------------|---------------------------------------|----------------------------------------------------|
| `labelText`    | `string`       | `this.textContent?.trim() \|\| ''`    | Any string; empty after trim ⇒ `''`                |
| `renderMode`   | derived enum   | `labelText === '' ? 'bare' : 'labelled'` | `'bare'`, `'labelled'`                          |

### Validation rules

- `labelText` is treated as plain text only. The component MUST NOT
  parse it as HTML or interpolate it into an attribute. The existing
  code already enforces this by assigning to `span.textContent` (never
  `innerHTML`); the new branch preserves the rule by simply not
  creating a `<span>`.
- `renderMode` is computed every time `render()` runs. It is not
  cached across renders. If a consumer later mutates the host's text
  content and triggers another render, the mode is recomputed.

### Transition rules

- `renderMode` does not change after `connectedCallback` returns
  unless the consumer explicitly calls `render()` again (the
  component does not observe text-node mutations). The spec does not
  require live re-rendering on text changes; it requires that the
  initial connected render pick the correct shape.

## Host element state already covered by the public API

These exist today and are unchanged by this feature. They are listed
here only to make the cross-mode invariants explicit, because every
one of them MUST hold in both `bare` and `labelled` modes (FR-004,
SC-003).

| Host state                       | Backed by                              | Invariant across modes                                 |
|----------------------------------|----------------------------------------|--------------------------------------------------------|
| `checked` (property)             | `this._input.checked`                  | Property reads from the input; setter mirrors to the input and host attribute. |
| `checked` (host attribute)       | observed attribute                     | Set when property is set to `true`; removed when set to `false`; reflected from user-driven toggles via `_syncChecked`. |
| `disabled` (property)            | `this._input.disabled`                 | Setter mirrors to the input, sets `disabled` host attribute, and adds/removes the `disabled` class on the host. |
| `disabled` (host attribute)      | observed attribute                     | Drives input's `disabled` and the host's `disabled` class via `attributeChangedCallback`. |
| `disabled` class on the host     | derived                                | Present iff the `disabled` attribute is present. |
| `name` (property)                | `this._input.name`                     | Setter mirrors to the input and the host's `name` attribute. |
| `name` (host attribute)          | observed attribute                     | Drives input's `name` via `attributeChangedCallback`. |
| Bubbled events                   | DOM standard                           | `change`, `input`, `click` originating on the input bubble out of the host because the input is a (direct or `<label>`-nested) descendant. |

### Cross-mode invariant (the new requirement)

For every public state in the table above, the observable result of
reading or mutating it via the component's public API MUST be
identical in both `bare` and `labelled` modes. The only observable
difference between modes is the presence or absence of the
`<label class="checkbox-label">` wrapper element and its child
`<span>` in the host's light-DOM subtree.

## What is intentionally not in this data model

- No new persistent storage.
- No new observed attributes.
- No new component lifecycle hooks.
- No internal state machine — `renderMode` is a pure function of the
  host's text content at render time.
