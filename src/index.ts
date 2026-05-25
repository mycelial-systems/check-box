import { define } from '@substrate-system/web-component/util'

// for document.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'check-box':CheckBox
    }
}

export class CheckBox extends HTMLElement {
    static TAG:string = 'check-box'

    static observedAttributes = ['checked', 'disabled', 'name', 'value']
    private _input:HTMLInputElement|null = null

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

    async connectedCallback () {
        this.render()
        this._input = this.querySelector('input')
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
        newValue:string
    ) {
        if (!this._input) return

        switch (name) {
            case 'checked':
                this._input.checked = newValue !== null
                break
            case 'disabled':
                this._input.disabled = newValue !== null
                if (newValue !== null) {
                    this.classList.add('disabled')
                } else {
                    this.classList.remove('disabled')
                }
                break
            case 'name':
                this._input.name = newValue ?? ''
                break
            case 'value':
                if (newValue !== null) {
                    this._input.value = newValue
                }
                break
        }
    }

    render () {
        const labelText = this.textContent?.trim() || ''
        const isChecked = this.hasAttribute('checked')
        const isDisabled = this.hasAttribute('disabled')
        const name = this.getAttribute('name') || ''

        if (isDisabled) {
            this.classList.add('disabled')
        }

        const input = document.createElement('input')
        input.type = 'checkbox'
        if (name) input.name = name
        if (this.hasAttribute('value')) {
            input.value = this.getAttribute('value') ?? ''
        }
        input.checked = isChecked
        input.disabled = isDisabled

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
}

define('check-box', CheckBox)
