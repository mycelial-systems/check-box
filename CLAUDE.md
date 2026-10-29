# check-box Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-10-29

## Active Technologies

- TypeScript 5.9 (transpiled via esbuild to ES2020) + `@substrate-system/web-component` (runtime, (001-optional-label)

## Project Structure

```text
src/index.ts    # the CheckBox custom element (the whole public API)
src/index.css   # styles, published as ./css and ./css/min
test/index.ts   # browser tests (tapzero, run through tapout)
example/        # demo app
specs/          # spec-kit feature plans
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9 (transpiled via esbuild to ES2020): Follow standard conventions

## Recent Changes

- 001-optional-label: Added TypeScript 5.9 (transpiled via esbuild to ES2020) + `@substrate-system/web-component` (runtime,

<!-- MANUAL ADDITIONS START -->
## Component Contracts

`src/index.ts` exports `CheckBox` (registered as `<check-box>`) and the
`ControlAttributes` type. The host wraps one inner
`<input type="checkbox">`, reachable as `control`.

Host attributes fall into two groups:

- **Mirrored** (`checked`, `disabled`, `name`, `value`, `required`,
  `form`): stay on the host and are copied to the input, so removing one
  from the host removes it from the input.
- **Moved** (`id`, `tabindex`, `autofocus`, every `aria-*`): taken off
  the host and put on the input (`id` goes through `inputId`). Left on
  the host they make a second tab stop or fail axe
  `aria-prohibited-attr`.

`controlAttributes` sets and clears `aria-*`, `tabindex`, and
`autofocus` on the input from a framework. Each assignment is the full
set: a name left out is removed. `null` or `''` (what Preact assigns
when the prop goes away) clears everything it set. Other names,
including `id`, are ignored. Values are written the way Preact writes
attributes: `null`/`undefined` remove; for `aria-*` booleans become
`"true"`/`"false"`; for other names `true` is `""` and `false` removes.

## Invariants

- Owned markup (the element rendered the input): moved attributes are
  moved on render and again whenever set on the host later, via a
  `MutationObserver` that runs only while connected. A reconnect moves
  anything set while disconnected. `controlAttributes` is re-applied
  after a move, so it wins over host attributes.
- Hydrated markup (the app rendered the input): host attributes are
  never moved or restored; the app sets them on the input. Mirrored
  attributes are still copied, and `controlAttributes` is applied.
- Moving an attribute only works one way. Removing a moved attribute
  from the host does nothing to the input, which is why
  `controlAttributes` exists.
<!-- MANUAL ADDITIONS END -->
