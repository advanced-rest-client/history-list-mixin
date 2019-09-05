import { LitElement, html } from 'lit-element';
import { HistoryListMixin } from '../history-list-mixin.js';
/**
 * @customElement
 * @demo demo/index.html
 * @appliesMixin HistoryListMixin
 */
class TestElement extends HistoryListMixin(LitElement) {
  render() {
    return html`${this.modelTemplate}`;
  }
}
window.customElements.define('test-element', TestElement);
