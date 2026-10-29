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

test('hydrates existing markup without replacing the input', async t => {
    const el = document.createElement('check-box') as CheckBox
    const label = document.createElement('label')
    label.className = 'checkbox-label'
    const input = document.createElement('input')
    input.type = 'checkbox'
    const span = document.createElement('span')
    span.textContent = 'Show metric'
    label.append(input, span)
    el.append(label)

    let clicks = 0
    input.addEventListener('click', () => clicks++)

    document.body.replaceChildren(el)
    await waitFor('check-box')

    t.equal(el.querySelector('input'), input, 'same input node is kept')
    t.equal(el.querySelector('label'), label, 'same label node is kept')
    t.equal(el.querySelectorAll('input').length, 1, 'no extra input')

    click(input)
    t.equal(clicks, 1, 'listener attached before connecting still fires')
    t.equal(el.checked, true, 'host.checked reads the hydrated input')
    t.ok(el.hasAttribute('checked'), 'host reflects the click')
})

test('hydration forwards host attributes but keeps the input\'s own',
    async t => {
        const el = document.createElement('check-box') as CheckBox
        el.setAttribute('name', 'metric')
        const input = document.createElement('input')
        input.type = 'checkbox'
        input.setAttribute('aria-describedby', 'own-hint')
        el.append(input)

        document.body.replaceChildren(el)
        await waitFor('check-box')

        t.equal(input.name, 'metric', 'host name is forwarded')
        t.equal(input.getAttribute('aria-describedby'), 'own-hint',
            'attributes absent from the host are left alone')
    })

test('label attribute renders a label', async t => {
    document.body.innerHTML = '<check-box label="Accept terms"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    t.equal(input.labels?.length, 1, 'the input is labelled')
    t.equal(el.querySelector('span')?.textContent, el.getAttribute('label'),
        'label text comes from the attribute')
})

test('label attribute is rendered as text', async t => {
    const el = document.createElement('check-box') as CheckBox
    el.setAttribute('label', '<img src="x" onerror="window.__xss = 1">')
    document.body.replaceChildren(el)
    await waitFor('check-box')

    t.equal(el.querySelectorAll('img').length, 0, 'no img element is created')
})

test('changing the label attribute keeps the same input', async t => {
    document.body.innerHTML = '<check-box label="One"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    el.setAttribute('label', 'Two')
    t.equal(el.querySelector('span')?.textContent, el.getAttribute('label'),
        'label text updates')
    t.equal(el.querySelector('input'), input, 'input node is kept')

    el.removeAttribute('label')
    t.equal(el.querySelector('label'), null, 'label is removed')
    t.equal(el.querySelector('input'), input, 'input node is still kept')
})

test('focus and aria-* attributes move to the inner input', async t => {
    document.body.innerHTML = '<check-box label="Show metric" ' +
        'aria-describedby="hint" tabindex="0" id="metric" autofocus>' +
        '</check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    t.equal(input.getAttribute('aria-describedby'), 'hint',
        'input gets aria-describedby')
    t.equal(input.tabIndex, 0, 'input gets tabindex')
    t.equal(input.id, 'metric', 'input gets the id')
    t.ok(input.hasAttribute('autofocus'), 'input gets autofocus')

    t.ok(!el.hasAttribute('aria-describedby'),
        'host no longer has aria-describedby')
    t.ok(!el.hasAttribute('tabindex'), 'host no longer has tabindex')
    t.ok(!el.hasAttribute('id'), 'host no longer has the id')
    t.ok(!el.hasAttribute('autofocus'), 'host no longer has autofocus')
})

test('hydration does not move host attributes or restore removed ones',
    async t => {
        const el = document.createElement('check-box') as CheckBox
        const input = document.createElement('input')
        input.type = 'checkbox'
        input.setAttribute('aria-invalid', 'true')
        el.append(input)

        document.body.replaceChildren(el)
        await waitFor('check-box')

        input.removeAttribute('aria-invalid')
        el.setAttribute('name', 'metric')
        t.ok(!input.hasAttribute('aria-invalid'),
            'aria-invalid is not added back')
    })

test('control and inputId expose the inner input', async t => {
    document.body.innerHTML = '<check-box id="first"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    t.equal(el.control, input, 'control is the inner input')
    t.equal(el.inputId, 'first', 'inputId reads the inner id')

    el.inputId = 'second'
    t.equal(input.id, 'second', 'setting inputId changes the inner id')
    t.equal(el.id, '', 'host still has no id')
})

test('inputId set before render ends up on the inner input', async t => {
    const el = document.createElement('check-box') as CheckBox
    el.inputId = 'early'
    document.body.replaceChildren(el)
    await waitFor('check-box')

    t.equal(el.control?.id, 'early', 'inner input has the id')
    t.equal(el.id, '', 'host has no id')
})

test('required and form are mirrored, including removal', async t => {
    document.body.innerHTML = '<check-box required form="f"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    t.equal(input.required, true, 'required is forwarded')
    t.equal(input.getAttribute('form'), 'f', 'form is forwarded')
    t.ok(el.hasAttribute('required'), 'host keeps required')
    t.ok(el.hasAttribute('form'), 'host keeps form')

    el.removeAttribute('required')
    el.removeAttribute('form')
    t.equal(input.required, false, 'required is removed')
    t.ok(!input.hasAttribute('form'), 'form is removed')
})

test('removing value from the host removes it from the input', async t => {
    document.body.innerHTML = '<check-box value="yes"></check-box>'
    const el = await waitFor('check-box') as CheckBox
    const input = el.querySelector('input') as HTMLInputElement

    el.removeAttribute('value')
    t.ok(!input.hasAttribute('value'), 'inner value attribute is removed')
})

/** Let pending MutationObserver callbacks run */
function mutations ():Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
}

test('aria-* and tabindex set after render move to the input', async t => {
    document.body.innerHTML = '<check-box label="Agree"></check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.setAttribute('aria-invalid', 'true')
    el.setAttribute('tabindex', '-1')
    await mutations()

    t.equal(el.control!.getAttribute('aria-invalid'), 'true',
        'input gets aria-invalid')
    t.equal(el.control!.getAttribute('tabindex'), '-1',
        'input gets tabindex')
    t.ok(!el.hasAttribute('aria-invalid'),
        'host no longer has aria-invalid')
    t.ok(!el.hasAttribute('tabindex'), 'host no longer has tabindex')
})

test('id set after render becomes the inner input id', async t => {
    document.body.innerHTML = '<check-box label="Agree"></check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.id = 'late'
    await mutations()

    t.equal(el.control!.id, 'late', 'inner input has the id')
    t.equal(el.id, '', 'host has no id')
})

test('attributes move after the element is removed and appended', async t => {
    document.body.innerHTML = '<check-box label="Agree"></check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.remove()
    document.body.append(el)
    el.setAttribute('aria-describedby', 'hint')
    await mutations()

    t.equal(el.control!.getAttribute('aria-describedby'), 'hint',
        'input gets aria-describedby after reconnect')
    t.ok(!el.hasAttribute('aria-describedby'),
        'host no longer has aria-describedby')
})

test('attributes set while disconnected move on reconnect', async t => {
    document.body.innerHTML = '<check-box label="Agree"></check-box>'
    const el = await waitFor('check-box') as CheckBox

    el.remove()
    el.setAttribute('aria-label', 'later')
    document.body.append(el)
    await mutations()

    t.equal(el.control!.getAttribute('aria-label'), 'later',
        'input gets aria-label')
    t.ok(!el.hasAttribute('aria-label'), 'host no longer has aria-label')
})

test('hydrated input does not receive attributes set after render', async t => {
    const el = document.createElement('check-box') as CheckBox
    const input = document.createElement('input')
    input.type = 'checkbox'
    el.append(input)
    document.body.replaceChildren(el)
    await waitFor('check-box')

    el.setAttribute('aria-invalid', 'true')
    await mutations()

    t.ok(!input.hasAttribute('aria-invalid'),
        'app input does not get aria-invalid')
})

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
