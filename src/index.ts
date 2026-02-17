import { define } from '@substrate-system/web-component/util'

// for document.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'check-box':CheckBox
    }
}

export class CheckBox extends HTMLElement {
    static TAG:string = 'check-box'

    static observedAttributes = ['checked', 'disabled', 'name']
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

    async connectedCallback () {
        this.render()
        this._input = this.querySelector('input')
    }

    attributeChangedCallback (name:string, oldValue:string, newValue:string) {
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

        this.innerHTML = `<label class="checkbox-label">
            <input
                type="checkbox"
                ${name ? `name="${name}"` : ''}
                ${isChecked ? 'checked' : ''}
                ${isDisabled ? 'disabled' : ''}
            />
            <span>${labelText}</span>
        </label>`

        // Move checked to the inner input; remove it from the host element
        this.removeAttribute('checked')
    }
}

define('check-box', CheckBox)
