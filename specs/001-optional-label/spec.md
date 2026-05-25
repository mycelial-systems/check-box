# Feature Specification: Optional Label Rendering

**Feature Branch**: `001-optional-label`
**Created**: 2026-05-24
**Status**: Draft
**Input**: User description: "When not given any inner text for the label element, it should render without a label."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Render bare checkbox when no label text is provided (Priority: P1)

A developer uses the `<check-box>` component without supplying any inner
text. The component renders only the interactive checkbox control, with
no surrounding label wrapper and no empty text node, so the resulting
markup is clean and the visual layout has no phantom space reserved for
absent label text.

**Why this priority**: This is the entire feature. Without it, the
component always emits a `<label>` element wrapping the input plus an
empty `<span>`, producing semantically incorrect markup (a label with no
accessible name) and unwanted spacing in the rendered UI. This is the
single user-facing outcome the request asks for.

**Independent Test**: Place a `<check-box></check-box>` element (with no
inner text) on a page and inspect the resulting DOM. The component must
render only the checkbox input itself, with no `<label>` wrapper around
it. The checkbox must still be interactive (toggle on click, reflect
`checked`/`disabled`/`name` attributes) and still expose its state
through the public `checked` getter/setter.

**Acceptance Scenarios**:

1. **Given** a `<check-box></check-box>` element with no inner text,
   **When** the component is connected to the DOM,
   **Then** the rendered output contains an `<input type="checkbox">`
   and does NOT contain a `<label>` element wrapping it.
2. **Given** a `<check-box>Accept terms</check-box>` element with inner
   text, **When** the component is connected to the DOM, **Then** the
   rendered output contains a `<label>` element wrapping the input and
   a text node (or `<span>`) carrying the text "Accept terms".
3. **Given** a `<check-box>   </check-box>` element containing only
   whitespace, **When** the component is connected to the DOM, **Then**
   the component treats it as empty and renders without a label
   wrapper, matching scenario 1.
4. **Given** a `<check-box></check-box>` element with no inner text,
   **When** the user clicks the checkbox, **Then** the `checked`
   property and the `checked` attribute on the host element update
   correctly, identical to the behaviour when a label is present.

---

### Edge Cases

- A `<check-box>` containing only whitespace (spaces, tabs, newlines)
  is treated as having no label text and renders without the label
  wrapper.
- A `<check-box>` with the `disabled` attribute but no label text still
  renders disabled state correctly on the bare input, and the host
  element still receives the `disabled` CSS class.
- A `<check-box>` with the `checked` attribute but no label text still
  renders the input in checked state, and toggling continues to keep
  the host attribute in sync.
- A `<check-box>` with a `name` attribute but no label text still emits
  the input with the correct `name`, so it participates in form
  submission as expected.
- Existing styles that target the `.checkbox-label` class continue to
  apply when label text is present and simply have no effect when the
  wrapper is absent; the visual appearance of the unlabelled checkbox
  is the bare input's appearance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The component MUST detect whether inner text content was
  supplied by the consumer at render time, treating any string that is
  empty after trimming whitespace as "no inner text".
- **FR-002**: When no inner text is supplied, the component MUST render
  only an `<input type="checkbox">` as its child, with no surrounding
  `<label>` element and no empty `<span>` placeholder.
- **FR-003**: When inner text is supplied, the component MUST continue
  to render the existing structure: a `<label class="checkbox-label">`
  wrapping the `<input>` followed by a text-bearing element carrying
  the supplied text.
- **FR-004**: The component MUST preserve all existing public behaviour
  regardless of whether a label is rendered: the `checked`, `disabled`,
  and `name` getters/setters; the corresponding observed attributes;
  the `disabled` CSS class on the host; and the synchronisation of the
  host's `checked` attribute when the user toggles the input.
- **FR-005**: The component MUST keep the unlabelled checkbox
  interactive — clicking the input toggles its state and dispatches the
  same `change` event that the labelled variant does.

### Key Entities

Not applicable — this feature changes rendering logic only and
introduces no new data entities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A `<check-box>` element with no inner text produces DOM
  output that contains zero `<label>` elements, verified by an
  automated test that queries the component's children.
- **SC-002**: A `<check-box>` element with inner text continues to
  produce DOM output that contains exactly one `<label>` element
  wrapping exactly one `<input type="checkbox">`, verified by an
  automated test, with no regression in the existing test suite.
- **SC-003**: All existing public behaviour (checked/disabled/name
  attribute reflection, change-event synchronisation, disabled class on
  the host) passes its existing tests for both the labelled and the
  unlabelled variant, verified by extending the existing test cases to
  cover both shapes.
- **SC-004**: The rendered unlabelled checkbox occupies no visual space
  beyond the checkbox control itself (no horizontal gap where label
  text would have been), verified by visual inspection in the example
  page.

## Assumptions

- "Label" in the user's request refers to the HTML `<label>` element
  that the component currently emits as a wrapper around the input,
  along with the inner `<span>` it currently uses to carry the text.
  When no text is supplied, both the wrapper and the span are omitted;
  only the bare `<input type="checkbox">` is rendered.
- Whitespace-only content (e.g. `<check-box> </check-box>`) is treated
  as "no inner text", consistent with the current `textContent?.trim()`
  logic in the render method.
- Consumers who want an unlabelled checkbox associated with an external
  `<label for="...">` are responsible for setting an `id` on the host
  or otherwise associating it themselves; this feature does not add a
  new association mechanism.
- No existing CSS selector relies on `.checkbox-label` being present
  when there is no label text. Selectors that target
  `.checkbox-label` continue to match when a label is present and
  simply do not apply when it is absent.
- The change is backwards-compatible for all existing usage that
  supplies label text; only the previously-degenerate "no text" case
  changes its rendered shape.
