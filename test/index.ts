import { test } from '@substrate-system/tapzero'
import { waitFor, click } from '@substrate-system/dom'
import type { CheckBox } from '../src/index.js'
import '../src/index.js'

test('renders with label text', async t => {
    document.body.innerHTML = '<check-box>Accept terms</check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.ok(el, 'should find the element')
    const span = el.querySelector('span')
    t.equal(span?.textContent, 'Accept terms', 'should render label text')
})

test('default state is unchecked and enabled', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.checked, false, 'should be unchecked by default')
    t.equal(el.disabled, false, 'should be enabled by default')
    t.equal(el.name, '', 'should have empty name by default')
})

test('checked attribute sets initial state', async t => {
    document.body.innerHTML = '<check-box checked>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.checked, true, 'should be checked when attribute is present')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.checked, true, 'input should be checked')
})

test('disabled attribute sets initial state', async t => {
    document.body.innerHTML = '<check-box disabled>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.disabled, true, 'should be disabled when attribute is present')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.disabled, true, 'input should be disabled')
    t.ok(el.classList.contains('disabled'), 'should have disabled class')
})

test('name attribute is set on input', async t => {
    document.body.innerHTML = '<check-box name="my-checkbox">Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.name, 'my-checkbox', 'should have name property')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.name, 'my-checkbox', 'input should have name attribute')
})

test('setting checked property updates attribute and input', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.checked = true
    t.equal(el.checked, true, 'property should be true')
    t.ok(el.hasAttribute('checked'), 'should have checked attribute')

    el.checked = false
    t.equal(el.checked, false, 'property should be false')
    t.ok(!el.hasAttribute('checked'), 'should not have checked attribute')
})

test('setting disabled property updates attribute and input', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.disabled = true
    t.equal(el.disabled, true, 'property should be true')
    t.ok(el.hasAttribute('disabled'), 'should have disabled attribute')
    t.ok(el.classList.contains('disabled'), 'should have disabled class')

    el.disabled = false
    t.equal(el.disabled, false, 'property should be false')
    t.ok(!el.hasAttribute('disabled'), 'should not have disabled attribute')
    t.ok(!el.classList.contains('disabled'), 'should not have disabled class')
})

test('setting name property updates attribute and input', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.name = 'new-name'
    t.equal(el.name, 'new-name', 'property should update')
    t.equal(el.getAttribute('name'), 'new-name', 'attribute should update')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.name, 'new-name', 'input name should update')
})

test('dispatches change event when clicked', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    el.addEventListener('change', (ev:Event) => {
        t.ok(ev, 'should dispatch change event')
        t.equal((ev.target as HTMLInputElement).checked, true,
            'target should contain checked: true')
        t.equal(el.querySelector('input')?.checked, true,
            'element should be checked')
    })

    click(input)
})

test('change event reflects unchecking', async t => {
    document.body.innerHTML = '<check-box checked>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    let changeEventFired = false
    el.addEventListener('change', (e: Event) => {
        changeEventFired = true
        t.equal((e.target as HTMLInputElement).checked, false,
            'target should be unchecked')
    })

    input.click()

    t.ok(changeEventFired, 'should dispatch change event')
    t.equal(el.checked, false, 'element should be unchecked')
})

test('attributeChangedCallback', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    el.setAttribute('checked', '')
    t.equal(input.checked, true, 'input should be checked after setting attribute')

    el.removeAttribute('checked')
    t.equal(input.checked, false, 'input should be unchecked after removing attribute')
})

test('attributeChangedCallback', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    el.setAttribute('disabled', '')
    t.equal(input.disabled, true,
        'input should be disabled after setting attribute')
    t.ok(el.classList.contains('disabled'), 'should have disabled class')

    el.removeAttribute('disabled')
    t.equal(input.disabled, false, 'input should be enabled after removing attribute')
    t.ok(!el.classList.contains('disabled'), 'should not have disabled class')
})

test('attributeChangedCallback updates input when name attribute changes', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    el.setAttribute('name', 'updated-name')
    t.equal(input.name, 'updated-name', 'input name should update when attribute changes')
})

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
