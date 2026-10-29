# Live Control Attributes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `aria-*`, `tabindex`, `autofocus`, and `id` keep reaching the
inner input after a `<check-box>` has rendered. A framework gets a
property it can set on every render that also removes them.

**Architecture:** Two additions to `CheckBox` in `src/index.ts`. First,
a `MutationObserver` on the host, while the element owns its markup,
moves any of those attributes set after render, using the same move
`render()` does now. Second, a `controlAttributes` property takes the
full set of control attributes for the inner input and applies them,
including the removal of names it no longer lists. Removal needs the
property: once an attribute has been moved off the host, a framework
removing it there changes nothing, so no attribute callback fires.

**Tech Stack:** TypeScript, Custom Elements, tapzero and tapout
(browser tests), esbuild.

**Spec:** none written. The problem, found while using the element from
Preact in `knitting-party`: `render()` moves these attributes once, on
connect. `observedAttributes` lists only `MIRRORED` and `label`, so a
later `aria-describedby` or `aria-invalid` stays on the host, where it
fails axe `aria-prohibited-attr`. When an error clears, Preact removes
`aria-invalid` from the host, where it no longer is, so the input keeps
it.

## Global Constraints

- The names this element moves: `id`, `tabindex`, `autofocus`, and
  every `aria-*`. These are the `MOVED` list plus the `aria-` prefix.
- Hydration keeps its contract: when the app rendered the input, host
  attributes are not moved. The existing test "hydration does not move
  host attributes or restore removed ones" must still pass.
- `controlAttributes` values are written the way Preact writes
  attributes. `null` and `undefined` remove the attribute. For `aria-*`,
  `true` and `false` become `"true"` and `"false"`. For any other name,
  `true` is `""` and `false` removes it. Anything else is `String(value)`.
- `controlAttributes` accepts only `aria-*`, `tabindex`, and
  `autofocus`. It ignores other names; `id` still goes through
  `inputId`.
- Do not change the rendered markup or `src/index.css`.
- Tests check attributes and properties, never HTML strings or CSS.

## Review Focus

- Preact sets a removed property prop to `''`, not `null`. A
  `controlAttributes` of `''` or `null` must clear everything it set.
  Tested in Task 2.
- Moving an attribute removes it from the host, and that removal is
  itself a mutation. The observer callback must find nothing to move
  and stop. Covered by the Task 1 tests finishing at all.
- Reconnecting an element that owns its markup goes through the
  hydrate branch of `render()`. It must start observing again. Tested
  in Task 1.
- A `label` change rebuilds the `<label>` around the same input, and
  attributes set by `controlAttributes` must survive it. Tested in
  Task 2.
- Attributes set on the host and in `controlAttributes` together: the
  property wins, because it is applied last. Tested in Task 2.

---

### Task 1: Move control attributes set after render

**Files:**
- Modify: `src/index.ts` (`render()` lines 205-237, `connectedCallback`,
  `disconnectedCallback`)
- Modify: `README.md`
- Test: `test/index.ts` (append before `all done`)

**Interfaces:**
- Produces: `private _moveFromHost ():void`, the move loop now inside
  `render()`, which later tasks reuse. `id` goes through `inputId`.

- [ ] **Step 1: Write the failing tests**

```ts
/** Let pending MutationObserver callbacks run */
function mutations ():Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
}

test('a control attribute set after render moves too', async t => {
    document.body.innerHTML = '<check-box label="Late"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    el.setAttribute('aria-invalid', 'true')
    el.setAttribute('tabindex', '-1')
    await mutations()
    t.equal(el.control!.getAttribute('aria-invalid'), 'true',
        'input gets aria-invalid')
    t.equal(el.control!.getAttribute('tabindex'), '-1',
        'input gets tabindex')
    t.ok(!el.hasAttribute('aria-invalid'), 'host has no aria-invalid')
    t.ok(!el.hasAttribute('tabindex'), 'host has no tabindex')
})

test('an id set after render moves to the input', async t => {
    document.body.innerHTML = '<check-box label="Late id"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    el.id = 'late'
    await mutations()
    t.equal(el.control!.id, 'late', 'input has the id')
    t.equal(el.id, '', 'host has no id')
})

test('a reconnected check-box still moves attributes', async t => {
    document.body.innerHTML = '<check-box label="Again"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    el.remove()
    document.body.append(el)
    el.setAttribute('aria-describedby', 'hint')
    await mutations()
    t.equal(el.control!.getAttribute('aria-describedby'), 'hint',
        'input gets aria-describedby')
    t.ok(!el.hasAttribute('aria-describedby'), 'host does not keep it')
})

test('hydration does not move attributes set after render', async t => {
    const el = document.createElement('check-box') as CheckBox
    const input = document.createElement('input')
    input.type = 'checkbox'
    el.append(input)
    document.body.replaceChildren(el)
    await waitFor('check-box')
    el.setAttribute('aria-invalid', 'true')
    await mutations()
    t.ok(!input.hasAttribute('aria-invalid'), 'app input is untouched')
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: the first three new tests fail; the hydration one and every
existing test pass.

- [ ] **Step 3: Implement**

Pull the move loop out of `render()` into `_moveFromHost()`, which
routes `id` through `inputId`. Add a `MutationObserver` field (with
`attributes: true` and no filter, because `aria-*` names are open)
whose callback calls `_moveFromHost()`. `connectedCallback` starts it
after `render()` when `_ownsMarkup` is true, and
`disconnectedCallback` disconnects it. In `README.md`, say that these
attributes move to the input whenever they are set on the host, but
that removing one from the host afterwards does nothing; point to
`controlAttributes` from Task 2.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test && npm run lint`
Expected: every test passes, lint is clean.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts test/index.ts README.md
git commit -m "feat: move control attributes set after render"
```

### Task 2: `controlAttributes` property

**Files:**
- Modify: `src/index.ts` (new type, property, and
  `_applyControlAttributes`; call it at the end of both `render()`
  branches)
- Modify: `README.md`
- Test: `test/index.ts` (append before `all done`)

**Interfaces:**
- Produces: `export type ControlAttributes = Record<string,
  string|number|boolean|null|undefined>`; `get controlAttributes
  ():ControlAttributes` (a copy) and `set controlAttributes
  (value:ControlAttributes|null)`; `private _applyControlAttributes
  ():void`.

- [ ] **Step 1: Write the failing tests**

```ts
test('controlAttributes puts attributes on the input only', async t => {
    document.body.innerHTML = '<check-box label="Prop"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    el.controlAttributes = { 'aria-describedby': 'hint', tabindex: 0 }
    t.equal(el.control!.getAttribute('aria-describedby'), 'hint',
        'input gets aria-describedby')
    t.equal(el.control!.getAttribute('tabindex'), '0', 'input gets tabindex')
    t.ok(!el.hasAttribute('aria-describedby'), 'host does not')
})

test('controlAttributes removes a name it no longer lists', async t => {
    document.body.innerHTML = '<check-box label="Drop"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    el.controlAttributes = { 'aria-invalid': 'true', 'aria-label': 'x' }
    el.controlAttributes = { 'aria-label': 'x' }
    t.ok(!el.control!.hasAttribute('aria-invalid'), 'aria-invalid is gone')
    t.equal(el.control!.getAttribute('aria-label'), 'x', 'others stay')
    el.controlAttributes = null
    t.ok(!el.control!.hasAttribute('aria-label'), 'null clears all')
    el.controlAttributes = { 'aria-label': 'x' }
    Reflect.set(el, 'controlAttributes', '')
    t.ok(!el.control!.hasAttribute('aria-label'), 'empty string clears all')
})

test('controlAttributes set before render reaches the input', async t => {
    const el = document.createElement('check-box') as CheckBox
    el.setAttribute('label', 'Early')
    el.controlAttributes = { 'aria-required': true }
    document.body.replaceChildren(el)
    await waitFor('check-box')
    t.equal(el.control!.getAttribute('aria-required'), 'true',
        'input has aria-required')
})

test('controlAttributes ignores names it does not move', async t => {
    document.body.innerHTML = '<check-box label="Ignore"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    el.controlAttributes = { name: 'x', id: 'y' }
    t.notEqual(el.control!.getAttribute('name'), 'x', 'name is ignored')
    t.notEqual(el.control!.id, 'y', 'id is ignored')
})

test('controlAttributes writes booleans as Preact does', async t => {
    document.body.innerHTML = '<check-box label="Bools"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    el.controlAttributes = { 'aria-invalid': false, autofocus: true }
    t.equal(el.control!.getAttribute('aria-invalid'), 'false',
        'aria false is the string "false"')
    t.equal(el.control!.getAttribute('autofocus'), '', 'true is present')
    el.controlAttributes = { autofocus: false }
    t.ok(!el.control!.hasAttribute('autofocus'), 'false removes it')
})

test('controlAttributes survive a label change and win over the host',
    async t => {
        document.body.innerHTML =
            '<check-box label="One" aria-label="host"></check-box>'
        const el = await waitFor('check-box') as CheckBox
        el.controlAttributes = { 'aria-label': 'prop' }
        el.setAttribute('label', 'Two')
        t.equal(el.control!.getAttribute('aria-label'), 'prop',
            'property value is kept')
    })

test('controlAttributes applies to a hydrated input', async t => {
    const el = document.createElement('check-box') as CheckBox
    const input = document.createElement('input')
    input.type = 'checkbox'
    el.append(input)
    el.controlAttributes = { 'aria-invalid': 'true' }
    document.body.replaceChildren(el)
    await waitFor('check-box')
    t.equal(input.getAttribute('aria-invalid'), 'true', 'app input has it')
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: the new tests fail on the missing property; every existing
test passes.

- [ ] **Step 3: Implement**

Keep the last value set (`{}` for `null` or anything that is not an
object) and the names applied last time. `_applyControlAttributes()`
does nothing without `_input`. Otherwise it removes each previously
applied name that is now missing or nullish, then writes each accepted
name with the value rules in Global Constraints. Call it from the
setter and at the end of both `render()` branches, after the move, so
the property wins. In `README.md`, document `controlAttributes`
as the way a framework sets and clears the inner input's `aria-*`,
`tabindex`, and `autofocus`, with a Preact example:
`` html`<check-box controlAttributes=${{ 'aria-invalid': bad }}>` ``.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test && npm run lint`
Expected: every test passes, lint is clean.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts test/index.ts README.md
git commit -m "feat: controlAttributes for the inner input"
```

## After release

In `knitting-party`, `src/client/components/checkbox.ts` passes
`controlAttributes` to the host and stops using
`components/form-control/`. When `radio-input` and `substrate-input`
ship the same property, that folder can be deleted.
