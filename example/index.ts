import Debug from '@substrate-system/debug'
import { waitFor } from '@substrate-system/dom'
import '../src/index.css'
import '../src/index.js'
const debug = Debug('checkbox')

if (import.meta.env.DEV || import.meta.env.MODE === 'staging') {
    localStorage.setItem('DEBUG', 'checkbox')
} else {
    localStorage.removeItem('DEBUG')
    localStorage.removeItem('debug')
}

// on first checkbox only
const box = await waitFor('check-box')
box?.addEventListener('change', ev => {
    debug('change event', ev)
    debug('is checked???', (ev.target as HTMLInputElement).checked)
})
