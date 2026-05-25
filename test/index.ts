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

    const labels = el.querySelectorAll('label.checkbox-label')
    t.equal(labels.length, 1,
        'exactly one label.checkbox-label wraps the input')
    const inputs = labels[0]?.querySelectorAll('input[type="checkbox"]')
    t.equal(inputs?.length, 1,
        'the label wraps exactly one input[type="checkbox"]')
})

test('renders bare input when no label text is provided', async t => {
    document.body.innerHTML = '<check-box></check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.querySelector('label'), null,
        'no label element is rendered')
    const input = el.querySelector('input[type="checkbox"]')
    t.ok(input, 'an input[type="checkbox"] is present')
})

test('whitespace-only content is treated as no label', async t => {
    document.body.innerHTML = '<check-box>   </check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.querySelector('label'), null,
        'no label element is rendered for whitespace-only content')
    const input = el.querySelector('input[type="checkbox"]')
    t.ok(input, 'an input[type="checkbox"] is present')
})

test('bare input still reflects checked attribute', async t => {
    document.body.innerHTML = '<check-box checked></check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.checked, true, 'host.checked is true')
    t.equal(el.hasAttribute('checked'), true,
        'host retains checked attribute')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.checked, true, 'inner input is checked')
})

test('bare input still reflects disabled attribute and disabled class',
    async t => {
        document.body.innerHTML = '<check-box disabled></check-box>'
        const el = await waitFor('check-box') as CheckBox

        t.equal(el.disabled, true, 'host.disabled is true')
        t.equal(el.classList.contains('disabled'), true,
            'host has disabled class')
        t.equal(el.hasAttribute('disabled'), true,
            'host retains disabled attribute')
        const input = el.querySelector('input') as HTMLInputElement
        t.equal(input.disabled, true, 'inner input is disabled')
    })

test('bare input still carries name attribute', async t => {
    document.body.innerHTML = '<check-box name="agree"></check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.name, 'agree', 'host.name is "agree"')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.name, 'agree', 'inner input name is "agree"')
})

test('bare input dispatches change event on click and syncs host ' +
    'checked attribute', async t => {
    document.body.innerHTML = '<check-box></check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    let changeEventCount = 0
    el.addEventListener('change', () => {
        changeEventCount++
    })

    click(input)
    t.equal(changeEventCount, 1, 'change event fired on first click')
    t.equal(el.checked, true, 'host.checked is true after first click')
    t.equal(el.hasAttribute('checked'), true,
        'host has checked attribute after first click')

    click(input)
    t.equal(changeEventCount, 2, 'change event fired on second click')
    t.equal(el.hasAttribute('checked'), false,
        'host checked attribute removed after second click')
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

test('checked attribute is preserved on host after render', async t => {
    document.body.innerHTML = '<check-box checked>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.ok(
        el.hasAttribute('checked'),
        'checked attribute should remain on the host element'
    )
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.checked, true, 'inner input should be checked')
})

test('host checked attribute reflects user-driven state changes', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    t.ok(!el.hasAttribute('checked'), 'starts without checked attribute')

    input.click()
    t.ok(
        el.hasAttribute('checked'),
        'host reflects checked state after user click'
    )

    input.click()
    t.ok(
        !el.hasAttribute('checked'),
        'host reflects unchecked state after second click'
    )
})

test('label text is rendered as text, not parsed as HTML', async t => {
    const el = document.createElement('check-box') as CheckBox
    el.textContent = '<script>window.__xssRan = true</script>danger'
    document.body.replaceChildren(el)
    await waitFor('check-box')

    const span = el.querySelector('span') as HTMLSpanElement
    t.equal(
        span.textContent,
        '<script>window.__xssRan = true</script>danger',
        'angle brackets render as text'
    )
    t.equal(
        el.querySelectorAll('script').length,
        0,
        'no script element is created'
    )
    // @ts-expect-error test-only window prop
    t.ok(!window.__xssRan, 'injected script does not execute')
})

test('name attribute with special characters is set safely', async t => {
    const el = document.createElement('check-box') as CheckBox
    el.setAttribute('name', 'tricky" onfocus="x')
    el.textContent = 'Test'
    document.body.replaceChildren(el)
    await waitFor('check-box')

    const input = el.querySelector('input') as HTMLInputElement
    t.equal(
        input.name,
        'tricky" onfocus="x',
        'input.name preserves quotes verbatim'
    )
    t.equal(
        input.getAttribute('onfocus'),
        null,
        'no onfocus attribute is created'
    )
})

test('value attribute is propagated to inner input', async t => {
    document.body.innerHTML = '<check-box value="yes">Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    t.equal(el.value, 'yes', 'host.value is "yes"')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.value, 'yes', 'inner input value is "yes"')
})

test('bare input (no label) propagates value attribute', async t => {
    document.body.innerHTML = '<check-box value="agree"></check-box>'
    const el = await waitFor('check-box') as CheckBox

    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.value, 'agree', 'inner input value is "agree"')
})

test('setting value property updates attribute and input', async t => {
    document.body.innerHTML = '<check-box>Test</check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.value = 'changed'
    t.equal(el.value, 'changed', 'property should update')
    t.equal(el.getAttribute('value'), 'changed', 'attribute should update')
    const input = el.querySelector('input') as HTMLInputElement
    t.equal(input.value, 'changed', 'input value should update')
})

test('attributeChangedCallback updates input when value attr changes',
    async t => {
        document.body.innerHTML = '<check-box>Test</check-box>'
        const el = await waitFor('check-box') as CheckBox
        const input = el.querySelector('input') as HTMLInputElement

        el.setAttribute('value', 'updated')
        t.equal(input.value, 'updated',
            'input value should update when attribute changes')
    })

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
