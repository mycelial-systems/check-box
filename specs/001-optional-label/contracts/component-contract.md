# Public Contract: `<check-box>` (Optional Label Rendering)

**Feature**: 001-optional-label
**Date**: 2026-05-24
**Element tag**: `check-box` (exposed at `CheckBox.TAG`)

The `<check-box>` element is the only public interface this package
ships. This document is the contract that the optional-label feature
either preserves (everything other than the rendered DOM shape) or
extends (the rendered DOM shape gains a second valid case). Anything
not listed below is internal and may change without a version bump,
subject to the constitution's Distribution & Compatibility rules.

## Rendered DOM shapes

The host element's light-DOM children after the first render are one
of exactly two shapes, selected by the host's authored text content
at render time:

### Shape A — Labelled (existing, unchanged)

Selected when `host.textContent.trim() !== ''`.

```html
<check-box>
  <label class="checkbox-label">
    <input type="checkbox" />
    <span>{label text}</span>
  </label>
</check-box>
```

- `label.className === 'checkbox-label'`.
- `span.textContent` equals the trimmed inner text supplied by the
  consumer. Always set via `textContent`, never `innerHTML`.
- The `<input>` is the first child of the `<label>` and the only
  `<input>` inside the host.

### Shape B — Bare (new in this feature)

Selected when `host.textContent.trim() === ''` (empty after trim,
including whitespace-only authored content).

```html
<check-box>
  <input type="checkbox" />
</check-box>
```

- The `<input>` is a direct child of the host.
- No `<label>` element appears anywhere in the host's subtree.
- No `<span>` element appears anywhere in the host's subtree.
- The host's subtree contains exactly one element node.

### Cross-shape invariants

- In both shapes, `host.querySelector('input[type="checkbox"]')`
  returns the same input that backs the public properties.
- In both shapes, `host.querySelectorAll('input[type="checkbox"]').length === 1`.

## HTML attributes (observed)

These three attributes drive the input's state. Behaviour is
unchanged by this feature.

| Attribute  | Type             | Meaning                                                                                |
|------------|------------------|----------------------------------------------------------------------------------------|
| `checked`  | boolean-present  | Initial checked state at connect time; reflected from user-driven toggles thereafter.  |
| `disabled` | boolean-present  | Initial disabled state at connect time; also drives the `disabled` class on the host.  |
| `name`     | string           | Form-control `name` for participation in form submission.                              |

Setting or removing any of these attributes after connect triggers
`attributeChangedCallback`, which updates the underlying input. This
behaviour MUST be identical in Shape A and Shape B.

## JavaScript properties

All three are present in both shapes and read/write through the
underlying input.

| Property   | Type      | Getter                          | Setter side-effects                                                                              |
|------------|-----------|---------------------------------|---------------------------------------------------------------------------------------------------|
| `checked`  | `boolean` | `this._input?.checked ?? false` | Updates `input.checked`; sets/removes host `checked` attribute.                                  |
| `disabled` | `boolean` | `this._input?.disabled ?? false`| Updates `input.disabled`; sets/removes host `disabled` attribute; adds/removes `disabled` class. |
| `name`     | `string`  | `this._input?.name ?? ''`       | Updates `input.name`; sets host `name` attribute.                                                |

## Bubbled events

| Event    | Where it originates                       | Bubbles out of host?                              |
|----------|-------------------------------------------|----------------------------------------------------|
| `change` | The inner `<input type="checkbox">`       | Yes, in both Shape A and Shape B.                  |
| `input`  | The inner `<input type="checkbox">`       | Yes, in both Shape A and Shape B.                  |
| `click`  | The inner `<input type="checkbox">` or, in Shape A, the `<label>` | Yes, in both shapes. |

In Shape B, the click flow is identical to clicking the input
directly because the `<label>` wrapper that would otherwise have
re-targeted clicks is absent — and there is no other clickable
ancestor inside the host that should retarget.

## CSS classes on the host

| Class      | Set when                                       |
|------------|------------------------------------------------|
| `disabled` | The host has the `disabled` attribute, or the `disabled` property has been set to `true`. |

The `disabled` class behaviour is identical in Shape A and Shape B.

## CSS variables (host-scoped, public)

| Variable           | Default | Purpose                                          |
|--------------------|---------|--------------------------------------------------|
| `--primary-accent` | `black` | Stroke color of the rendered check marks (the two `::before`/`::after` pseudo-elements on the input). |

No CSS variables are added, removed, or renamed by this feature.

## Backwards-compatibility statement

- Every consumer that supplies non-empty inner text continues to see
  Shape A unchanged. This includes the trimmed-text rule (any
  surrounding whitespace was already stripped by the existing render
  logic).
- Consumers who previously authored `<check-box></check-box>` or
  `<check-box> </check-box>` and observed a degenerate
  `<label class="checkbox-label">` with an empty `<span>` will now
  observe Shape B instead. Per the spec's Assumptions section, this
  is the intended outcome and is treated as a bug fix to the rendered
  DOM rather than a breaking change to the documented contract.
- No public attribute, property, event, CSS class, or CSS variable
  is renamed or removed. By the constitution's Distribution &
  Compatibility rules, this places the change in PATCH or MINOR
  semver territory (the bumping decision is the maintainer's call at
  release time, but it is not a MAJOR change).

## Accessibility note

When inner text is supplied (Shape A), the `<label>` wrapper provides
the accessible name for the checkbox, as it does today. When no
inner text is supplied (Shape B), the rendered input has no
accessible name unless the consumer associates one externally
(for example, by setting `aria-label` or `aria-labelledby` on the
host, or by pairing the host with an external `<label for="...">`).

Providing such an association in Shape B is the consumer's
responsibility. This feature does not add a new association
mechanism, consistent with the spec's Assumption: _"Consumers who
want an unlabelled checkbox associated with an external `<label for="...">`
are responsible for setting an `id` on the host or otherwise associating
it themselves; this feature does not add a new association mechanism."_
