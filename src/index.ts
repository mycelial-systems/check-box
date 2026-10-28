import { define } from '@substrate-system/web-component/util'

// for document.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'check-box':CheckBox
    }
}

/**
 * Host attributes that are mirrored onto the inner input. They stay on the
 * host, so a framework that later removes one from the host also removes it
 * from the input.
 */
const MIRRORED = ['checked', 'disabled', 'name', 'value', 'required', 'form']

/**
 * Host attributes that describe the focusable control, so they are moved to
 * the inner input when this element renders it. `aria-*` attributes are
 * moved too. Left on the host, these would make a second tab stop, or fail
 * axe's `aria-prohibited-attr`, because the host has no role.
 */
const MOVED = ['id', 'tabindex', 'autofocus']

export class CheckBox extends HTMLElement {
    static TAG:string = 'check-box'

    static observedAttributes = [...MIRRORED, 'label']
    private _input:HTMLInputElement|null = null
    // true if this element created the inner markup, false if it hydrated
    // markup that was already there
    private _ownsMarkup = false

    get checked ():boolean {
        return this._input?.checked ?? false
    }

    set checked (value:boolean) {
        if (this._input) {
            this._input.checked = value
        }
        if (value) {
            this.setAttribute('checked', '')
        } else {
            this.removeAttribute('checked')
        }
    }

    get disabled ():boolean {
        return this._input?.disabled ?? false
    }

    set disabled (value:boolean) {
        if (this._input) {
            this._input.disabled = value
        }
        if (value) {
            this.setAttribute('disabled', '')
            this.classList.add('disabled')
        } else {
            this.removeAttribute('disabled')
            this.classList.remove('disabled')
        }
    }

    get name ():string {
        return this._input?.name ?? ''
    }

    set name (value:string) {
        if (this._input) {
            this._input.name = value
        }
        this.setAttribute('name', value)
    }

    get value ():string {
        return this._input?.value ?? ''
    }

    set value (value:string) {
        if (this._input) {
            this._input.value = value
        }
        this.setAttribute('value', value)
    }

    /**
     * The inner input. Use it to change a moved attribute, like `aria-*` or
     * `tabindex`, after connect.
     */
    get control ():HTMLInputElement|null {
        return this._input
    }

    /**
     * The `id` of the inner input. Before the element renders, this is the
     * host `id`, which is moved to the input on render.
     */
    get inputId ():string {
        return this._input ? this._input.id : this.id
    }

    set inputId (value:string) {
        if (this._input) {
            this._input.id = value
        } else {
            this.id = value
        }
    }

    async connectedCallback () {
        this.render()
        this._input?.addEventListener('change', this._syncChecked)
    }

    disconnectedCallback () {
        this._input?.removeEventListener('change', this._syncChecked)
    }

    // Keep host `checked` attribute in sync with user-driven input toggles
    // so external observers (CSS selectors, querySelectorAll) see the
    // current state.
    private _syncChecked = ():void => {
        if (!this._input) return
        if (this._input.checked) {
            if (!this.hasAttribute('checked')) {
                this.setAttribute('checked', '')
            }
        } else if (this.hasAttribute('checked')) {
            this.removeAttribute('checked')
        }
    }

    attributeChangedCallback (
        name:string,
        _oldValue:string,
        newValue:string|null
    ) {
        if (!this._input) return

        if (name === 'label') {
            if (this._ownsMarkup) this._renderLabel(newValue?.trim() ?? '')
            return
        }

        this._forward(name, newValue)
    }

    /**
     * Copy one host attribute onto the inner input.
     */
    private _forward (name:string, value:string|null) {
        const input = this._input
        if (!input) return

        if (name === 'checked') {
            input.checked = value !== null
            return
        }

        if (name === 'disabled') {
            if (value !== null) {
                this.classList.add('disabled')
            } else {
                this.classList.remove('disabled')
            }
        }

        if (value === null) {
            input.removeAttribute(name)
        } else {
            input.setAttribute(name, value)
        }
    }

    /**
     * The `label` attribute, or the text content if there is no `label`
     * attribute.
     */
    private _labelText ():string {
        return this.hasAttribute('label') ?
            (this.getAttribute('label') ?? '').trim() :
            (this.textContent?.trim() || '')
    }

    private _renderLabel (labelText:string) {
        const input = this._input!

        if (labelText === '') {
            this.replaceChildren(input)
            return
        }

        const label = document.createElement('label')
        label.className = 'checkbox-label'

        const span = document.createElement('span')
        span.textContent = labelText

        label.append(input, span)
        this.replaceChildren(label)
    }

    render () {
        // Hydrate if the markup is already here, so a framework that
        // rendered it keeps ownership of every node.
        const existing = this.querySelector<HTMLInputElement>(
            'input[type="checkbox"]'
        )

        // When hydrating, leave the input's own attributes alone. The
        // framework that rendered it should set `aria-*`, `id`, and the rest
        // on the input directly.
        if (existing) {
            this._input = existing
            this._forwardMirrored()
            return
        }

        const labelText = this._labelText()
        const input = document.createElement('input')
        input.type = 'checkbox'
        this._input = input
        this._ownsMarkup = true

        // Before the input is in the DOM, so `autofocus` takes effect
        this._forwardMirrored()
        for (const { name, value } of Array.from(this.attributes)) {
            if (MOVED.includes(name) || name.startsWith('aria-')) {
                input.setAttribute(name, value)
                this.removeAttribute(name)
            }
        }

        this._renderLabel(labelText)
    }

    private _forwardMirrored () {
        for (const name of MIRRORED) {
            if (this.hasAttribute(name)) {
                this._forward(name, this.getAttribute(name))
            }
        }
    }
}

define('check-box', CheckBox)
