# Check Box
[![tests](https://img.shields.io/github/actions/workflow/status/substrate-system/check-box/nodejs.yml?style=flat-square)](https://github.com/substrate-system/check-box/actions/workflows/nodejs.yml)
[![types](https://img.shields.io/npm/types/@substrate-system/check-box?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![install size](https://flat.badgen.net/packagephobia/install/@bicycle-codes/keys?cache-control=no-cache)](https://packagephobia.com/result?p=@bicycle-codes/keys)
[![GZip size](https://flat.badgen.net/bundlephobia/minzip/@substrate-system/check-box)](https://bundlephobia.com/package/@substrate-system/check-box)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


A web component checkbox.

[See a live demo](https://substrate-system.github.io/check-box/)

<!-- toc -->

- [Install](#install)
- [API](#api)
  * [Example](#example)
  * [Label](#label)
  * [Render the markup yourself](#render-the-markup-yourself)
  * [Attributes](#attributes)
  * [JavaScript API](#javascript-api)
  * [Events](#events)
- [Modules](#modules)
  * [ESM](#esm)
- [CSS](#css)
  * [Import CSS](#import-css)
  * [CSS `@import`](#css-import)
  * [Customize CSS via some variables](#customize-css-via-some-variables)
- [Use](#use)
  * [JS](#js)
  * [HTML](#html)
  * [pre-built](#pre-built)

<!-- tocstop -->

## Install

```sh
npm i -S @substrate-system/check-box
```

## API

### Example

```js
import { CheckBox } from '@substrate-system/check-box'
import '@substrate-system/check-box/css'
// tag name is at .TAG

document.body.innerHTML += `
  <${CheckBox.TAG} label="Example Label Text"></${CheckBox.TAG}>
`

const box = document.querySelector(CheckBox.TAG)

box?.addEventListener('change', ev => {
  console.log('Checked:', event.target.checked)
})
```

### Label

Set the label text with the `label` attribute. It is rendered as text,
not HTML.

```html
<check-box label="My label text"></check-box>
```

If there is no `label` attribute, the inner text content is used
instead. Prefer the attribute: the text content is replaced when the
element renders, which breaks a framework that owns those child nodes.

Without a label, a bare `<input>` is rendered. Give it an accessible
name with `aria-label` or `aria-labelledby`.

### Render the markup yourself

If the host already contains an `<input type="checkbox">` when it
connects, the element keeps that node and only adds behavior. Nothing
is replaced. Use this with a framework like Preact, so the framework
owns every node.

```html
<check-box name="metric">
  <label class="checkbox-label">
    <input type="checkbox">
    <span>Show metric</span>
  </label>
</check-box>
```

The `label` attribute is ignored in this case, and the inner input's
own attributes are left alone.

### Attributes

Takes standard input attributes.

- **`checked`** - Boolean attribute. When present, the checkbox is checked.
  ```html
  <check-box checked>Checked by default</check-box>
  ```

- **`disabled`** - Boolean attribute. When present, the checkbox is disabled and cannot be interacted with.
  ```html
  <check-box disabled>Cannot be clicked</check-box>
  ```

- **`name`** - String attribute. Sets the name of the checkbox, useful for form submissions.
  ```html
  <check-box name="newsletter">Subscribe to newsletter</check-box>
  ```

- **`label`** - String attribute. The label text. See [Label](#label).

These are copied to the inner `<input>` and stay on the host. Removing
one from the host removes it from the input too:

`checked`, `disabled`, `name`, `value`, `required`, and `form`.

These describe the focusable control, so they are moved to the inner
`<input>` and removed from the host when the element renders:

`id`, `tabindex`, `autofocus`, and every `aria-*` attribute.

Use `aria-describedby` to link a hint or an error message to the
checkbox.

```html
<check-box label="Show metric" aria-describedby="metric-hint">
</check-box>
<p id="metric-hint">Adds the metric to the chart.</p>
```

These move to the inner `<input>` whenever they are set on the host,
including after the element renders. Removing one from the host
afterwards does nothing, because it is no longer on the host. Change or
remove it on the inner input instead, with the `control` property, or
set the full set with the `controlAttributes` property. When you
[render the markup yourself](#render-the-markup-yourself), nothing is
moved: put these attributes on your `<input>` directly.


### JavaScript API

Getters and setters for programmatic access:

```js
const checkbox = document.querySelector('check-box')

// Get/set checked state
console.log(checkbox.checked)  // false
checkbox.checked = true

// Get/set disabled state
console.log(checkbox.disabled)  // false
checkbox.disabled = true

// Get/set name
console.log(checkbox.name)  // ""
checkbox.name = "myCheckbox"

// Get/set value
console.log(checkbox.value)  // "on"
checkbox.value = "yes"

// The inner input
checkbox.control?.setAttribute('aria-invalid', 'true')

// Get/set the id of the inner input
console.log(checkbox.inputId)  // ""
checkbox.inputId = "my-checkbox"

// Set aria-*, tabindex, and autofocus on the inner input
checkbox.controlAttributes = {
    'aria-invalid': true,
    tabindex: 0
}
```

`controlAttributes` is the full set for the inner input. A name left out
of the object is removed from the input, and `null` or `''` removes
everything it set. Values follow the usual attribute rules: `null` or
`undefined` removes the attribute, `true` sets it as an empty attribute
(or `"true"` for `aria-*`), `false` removes it (or sets `"false"` for
`aria-*`), and any other value is written as a string. Names other than
`aria-*`, `tabindex`, and `autofocus` are ignored. Use `inputId` for the
`id`. Keys are attribute names, so write `tabindex`, not `tabIndex`. A
camel-case key is ignored. A value in `controlAttributes` wins over a host
attribute with the same name, and leaving that name out later removes it
from the input, even if the host had supplied it before. `autofocus` only
takes effect if it is set before the element renders.

In a framework, pass the object as a prop. This Preact example marks the
checkbox invalid when `bad` is true:

```js
html`<check-box controlAttributes=${{ 'aria-invalid': bad }}>`
```

Import `@substrate-system/check-box` before the framework renders, or
before any code sets the property. Before the element is defined, Preact
writes the prop as a plain attribute instead of setting the property.


### Events

Standard HTML checkbox events are bubbled from the inner
`<input type="checkbox">` element.

* `change`
* `input`
* `click`

```js
const checkbox = document.querySelector('check-box')
checkbox.addEventListener('change', (event) => {
  console.log('Checked:', event.target.checked)
})
```



---

## Modules

This exposes ESM and common JS via
[package.json `exports` field](https://nodejs.org/api/packages.html#exports).


### ESM

```js
import { CheckBox } from '@substrate-system/check-box'
```


## CSS

### Import CSS

```js
import '@substrate-system/check-box/css'
```

### CSS `@import`

```css
@import url("@substrate-system/check-box/css");
```

Or minified:
```js
import '@substrate-system/check-box/min/css'
```


### Customize CSS via some variables

These variables are shared with the other `@substrate-system` form
controls, so an app can set them once. Each one has a fallback.

```css
:root {
  --substrate-accent: black;  /* the check mark */
  --substrate-surface: #fff;  /* the box background */
  --substrate-border: currentColor;  /* the box border */
  --substrate-focus: currentColor;  /* focus ring color */
  --substrate-focus-width: 2px;  /* focus ring width */
  --substrate-radius: 0;  /* box corners */
}
```

`--primary-accent` still works as a fallback for `--substrate-accent`.

The label text inherits its font size.


## Use

This calls the global function `customElements.define`. Just import, then use
the tag in your HTML.

### JS
```js
import '@substrate-system/check-box'
```

### HTML
```html
<div>
    <check-box></check-box>
</div>
```

### pre-built
This package exposes minified JS and CSS files too. Copy them to a location
that is accessible to your web server, then link to them in HTML.

#### copy
```sh
cp ./node_modules/@substrate-system/check-box/dist/index.min.js ./public/check-box.min.js
cp ./node_modules/@substrate-system/check-box/dist/style.min.css ./public/check-box.css
```

#### HTML
```html
<head>
    <link rel="stylesheet" href="./check-box.css">
</head>
<body>
    <!-- ... -->
    <script type="module" src="./check-box.min.js"></script>
</body>
```
