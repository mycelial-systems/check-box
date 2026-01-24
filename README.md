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

### Label

The inner text content is used for the label's value.

```html
<check-box>My label text</check-box>
```

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
```


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

```css
check-box {
  --primary-accent: black;
  --primary-highlight: #00bbcb;
}
```


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
