import {PolymerElement} from '../../../@polymer/polymer/polymer-element.js';
import {HistoryListMixin} from '../history-list-mixin.js';
import {html} from '../../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @appliesMixin HistoryListMixin
 */
class TestElement extends HistoryListMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
    }
    </style>
`;
  }

  static get is() {
    return 'test-element';
  }
}
window.customElements.define(TestElement.is, TestElement);
