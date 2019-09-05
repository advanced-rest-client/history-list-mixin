[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/history-list-mixin.svg)](https://www.npmjs.com/package/@advanced-rest-client/history-list-mixin)

[![Build Status](https://travis-ci.org/advanced-rest-client/history-list-mixin.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/history-list-mixin)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/history-list-mixin)

# history-list-mixin

A mixin to be applied to a list that renders history requests in Advanced REST Client.

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/history-list-mixin
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import { HistoryListMixin } from '@advanced-rest-client/history-list-mixin/history-list-mixin.js';

class SampleElement extends HistoryListMixin(LitElement) {
  render() {
    return html`
    ${(this.requests || []).map((request) => html`...`)}
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/history-list-mixin
cd history-list-mixin
npm install
```

### Running the tests

```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
