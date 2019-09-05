/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html } from 'lit-html';
import '@advanced-rest-client/arc-models/request-model.js';
import '@advanced-rest-client/arc-models/url-indexer.js';
/**
 * A mixin to be applied to a list that renders history requests.
 * It contains methods to query for history list and to search history.
 * @mixinFunction
 * @memberof ArcComponents
 * @param {Class} base
 * @return {Class}
 */
export const HistoryListMixin = (base) => class extends base {
  static get properties() {
    return {
      /**
       * The list of request to render.
       * @type {Array<Object>}
       */
      requests: { type: Array },
      /**
       * True when the element is querying the database for the data.
       */
      _querying: { type: Boolean },
      /**
       * Single page query limit.
       */
      pageLimit: { type: Number },
      _queryStartKey: String,
      _querySkip: Number,
      /**
       * When set this component is in search mode.
       * This means that the list won't be loaded automatically and
       * some operations not related to search are disabled.
       */
      isSearch: { type: Boolean },
      /**
       * When set it won't query for data automatically when attached to the DOM.
       */
      noAuto: { type: Boolean }
    };
  }

  get querying() {
    return this._querying;
  }

  get _querying() {
    return this.__querying;
  }

  set _querying(value) {
    const old = this.__querying;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.__querying = value;
    if (this.requestUpdate) {
      this.requestUpdate('_querying', old);
    }
    this.dispatchEvent(new CustomEvent('querying-changed', {
      detail: {
        value
      }
    }));
  }

  /**
   * True when there's no requests after refresing the state.
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { requests, querying, isSearch } = this;
    return !isSearch && !querying && !(requests && requests.length);
  }
  /**
   * Computed value. True when the query has been performed and no items
   * has been returned. It is different from `listHidden` where less
   * conditions has to be checked. It is set to true when it doesn't
   * have items, is not loading and is search.
   *
   * @return {Boolean}
   */
  get searchListEmpty() {
    const { requests, querying, isSearch } = this;
    return !!isSearch && !querying && !(requests && requests.length);
  }

  constructor() {
    super();
    this._dataImportHandler = this._dataImportHandler.bind(this);
    this._onDatabaseDestroy = this._onDatabaseDestroy.bind(this);

    this.pageLimit = 150;
  }

  connectedCallback() {
    if (!this.type) {
      this.type = 'history';
    }
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('data-imported', this._dataImportHandler);
    window.addEventListener('datastore-destroyed', this._onDatabaseDestroy);
    if (!this.noAuto && !this.querying && !this.requests) {
      this.loadNext();
    }
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('data-imported', this._dataImportHandler);
    window.removeEventListener('datastore-destroyed', this._onDatabaseDestroy);
  }
  /**
   * Computes pagination options.
   * This resets pagination status.
   * @param {Number} limit Items per page limit.
   * @param {String} startKey Query start key
   * @param {Number} skip Number of records to skip.
   * @return {Object} Pagination options for PouchDB.
   */
  _computeQueryOptions(limit, startKey, skip) {
    const result = {
      limit,
      descending: true,
      include_docs: true
    };
    if (startKey) {
      result.startkey = startKey;
    }
    if (skip) {
      result.skip = skip;
    }
    return result;
  }
  /**
   * Refreshes the data from the datastore.
   * It resets the query options, clears requests and makes a query to the datastore.
   */
  refresh() {
    this.reset();
    this.loadNext();
  }
  /**
   * Resets the state of the variables.
   */
  reset() {
    if (this._queryStartKey) {
      this._queryStartKey = undefined;
    }
    if (this._querySkip) {
      this._querySkip = undefined;
    }
    if (this.isSearch) {
      this.isSearch = false;
    }
    if (this.querying) {
      this._querying = false;
    }
    if (this.requests) {
      this.requests = undefined;
    }
  }
  /**
   * Handler for `data-imported` cutom event.
   * Refreshes data state.
   */
  _dataImportHandler() {
    this.refresh();
  }
  /**
   * Handler for the `datastore-destroyed` custom event.
   * If one of destroyed databases is history store then it refreshes the sate.
   * @param {CustomEvent} e
   */
  _onDatabaseDestroy(e) {
    let datastore = e.detail.datastore;
    if (!datastore || !datastore.length) {
      return;
    }
    if (typeof datastore === 'string') {
      datastore = [datastore];
    }
    if (datastore.indexOf('history-requests') === -1 &&
      datastore.indexOf('history') === -1 &&
      datastore[0] !== 'all') {
      return;
    }
    this.refresh();
  }
  /**
   * Loads next page of results. It runs the task in a debouncer set to
   * next render frame so it's safe to call it more than once at the time.
   */
  loadNext() {
    if (this.isSearch) {
      return;
    }
    if (this.__makingQuery) {
      return;
    }
    this.__makingQuery = true;
    setTimeout(() => {
      this.__makingQuery = false;
      this._loadPage();
    });
  }
  /**
   * Appends array items to the `requests` property.
   * It should be used instead of direct manipulation of the `items` array.
   * @param {Array<Object>} requests List of requests to appenmd
   */
  _appendItems(requests) {
    if (!requests || !requests.length) {
      return;
    }
    let items = this.requests || [];
    items = [...items, ...requests]
    this.requests = items;
  }

  get modelTemplate() {
    return html`
      <request-model></request-model>
      <url-indexer></url-indexer>
    `;
  }

  get requestModel() {
    if (!this.__model) {
      this.__model = this.shadowRoot.querySelector('request-model');
    }
    return this.__model;
  }
  /**
   * Loads next page of results from the datastore.
   * Pagination used here has been described in PouchDB pagination strategies
   * document.
   * @return {Promise}
   */
  async _loadPage() {
    if (this.isSearch || this.querying) {
      return;
    }
    const model = this.requestModel;
    this._querying = true;

    try {
      const queryOptions = this._computeQueryOptions(this.pageLimit, this._queryStartKey, this._querySkip);
      const response = await model.list('history', queryOptions);
      this._querying = false;
      this._handleModelResponse(response);
    } catch (e) {
      this._querying = false;
      this._handleError(e);
    }
  }

  _handleModelResponse(response) {
    if (!response || !response.rows.length) {
      return;
    }
    // Set up pagination.
    this._queryStartKey = response.rows[response.rows.length - 1].key;
    if (!this._querySkip) {
      this._querySkip = 1;
    }
    let res = response.rows.map((item) => item.doc);
    res = this._processHistoryResults(res);
    this._appendItems(res);
    setTimeout(() => {
      if (this.notifyResize) {
        this.notifyResize();
      }
    });
  }

  _handleError(cause) {
    this.dispatchEvent(new CustomEvent('send-analytics', {
      bubbles: true,
      composed: true,
      detail: {
        type: 'exception',
        description: '[history-list-consumer]: ' + cause.message,
        fatal: false
      }
    }));
    throw cause;
  }
  /**
   * Processes query results to generate view data model.
   * @param {Array} res List of history requests retreived from the datastore.
   * @return {Array} Processed data requests.
   */
  _processHistoryResults(res) {
    if (!res) {
      return;
    }
    if (!res.length) {
      return [];
    }
    res = this._ensureTimestamps(res);
    res.sort(this._sortHistoryResults);
    const today = this._getTodayTimestamp();
    const yesterday = this._getYesterdayTimestamp(today);
    res = this._groupHistory(res, today, yesterday);
    return res;
  }
  /**
   * Ensures that the history objects have the `updated` property
   * required by further computations while processing results.
   *
   * @param {Array<Object>} requests List of history requests
   * @return {Array<Object>} The same array but all requests will have `updated`
   * property.
   */
  _ensureTimestamps(requests) {
    return requests.map((item) => {
      if (!item.created || isNaN(item.created)) {
        item.created = Date.now();
      }
      if (!item.updated || isNaN(item.updated)) {
        item.updated = item.created;
      }
      return item;
    });
  }
  /**
   * Sorts the query results by `updated` property.
   * @param {Object} a
   * @param {Object} b
   * @return {Number}
   */
  _sortHistoryResults(a, b) {
    if (a.updated > b.updated) {
      return -1;
    }
    if (a.updated < b.updated) {
      return 1;
    }
    return 0;
  }
  /**
   * Creates a timestamp fot today, midnight
   * @return {Number}
   */
  _getTodayTimestamp() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }
  /**
   * Computes yesterday's midninght based on today's mignight timestamp
   * @param {Number} todayTimestamp Timestamp of current daty at midnight
   * @return {Number} Timestamp 24 hours earlier.
   */
  _getYesterdayTimestamp(todayTimestamp) {
    return todayTimestamp - 86400000; // 24 h in milliseconds
  }
  /**
   * Creates headers for each day and group requests in each day group.
   * This is relevant for history type
   *
   * @param {Array<Object>} requests
   * @param {Number} today Timestamp of today
   * @param {Number} yesterday Timestamp of yesterday
   * @return {Array<Object>}
   */
  _groupHistory(requests, today, yesterday) {
    const days = [];
    const result = [];
    requests.forEach((item) => {
      const info = this._computeHistoryTime(item.updated);
      item.timeLabel = info.timeLabel;
      item.dayTime = info.time;
      let date = info.formatted;
      if (days.indexOf(date) === -1) {
        days[days.length] = date;
        const time = info.time;
        if (time === today) {
          item.today = true;
          date = 'Today';
        } else if (time === yesterday) {
          date = 'Yesterday';
        }
        item.hasHeader = true;
        item.header = date;
      }
      result.push(item);
    });
    return result;
  }
  /**
   * Computes time information for a history item. This is later used to
   * present history list item.
   * @param {Number} date Timestamp of when the item was created / updated
   * @return {Object} Various time formats:
   * - formatted - Formatted date string
   * - time - Parsed timestamp
   * - timeLabel - secondary list item
   */
  _computeHistoryTime(date) {
    const d = new Date(date);
    const formatted = new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
    const timeLabel = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(d);
    d.setHours(0, 0, 0, 0);
    const time = d.getTime();
    return {
      formatted,
      time,
      timeLabel
    };
  }
  /**
   * Handles request model change when the type is history.
   * @param {Object} request Changed request object.
   */
  _historyTypeChanged(request) {
    const t = this.type;
    if (t !== 'history') {
      return;
    }
    if (['history', 'history-requests'].indexOf(request.type) === -1) {
      return;
    }
    const requests = this.requests;
    if (!requests) {
      this._insertItem(request);
      return;
    }
    const id = request._id;
    for (let i = 0, len = requests.length; i < len; i++) {
      if (requests[i]._id === id) {
        this._removeItem(i);
        break;
      }
    }
    this._insertItem(request);
  }
  /**
   * Removes history item at position.
   * @param {Number} index Item's index in requests array
   */
  _removeItem(index) {
    const old = this.requests[index];
    const nextIndex = index + 1;
    const next = this.requests[nextIndex];
    if (old.hasHeader && next && !next.hasHeader) {
      this.requests[nextIndex].header = old.header;
      this.requests[nextIndex].hasHeader = old.hasHeader;
      this.requests[nextIndex].today = old.today;
    }
    this.requests.splice(index, 1);
    this.requests = [...this.requests];
  }
  /**
   * Adds a new history item to the list at a position where its `updated` or
   * `created` time suggests.
   * @param {Object} item History model to add.
   */
  _insertItem(item) {
    const timeInfo = this._computeHistoryTime(item.updated || item.created);
    if (!this.requests) {
      this._appendHistoryTimeHeader(item, timeInfo, true);
      this.requests = [item];
      return;
    }
    const index = this._historyInsertPosition(item.updated || item.created);
    const items = this.requests;
    const next = items[index];
    if (next && next.hasHeader && next.dayTime === timeInfo.time) {
      items[index].header = false;
      items[index].hasHeader = false;
      items[index].today = undefined;
    }
    let addHeader = true;
    if (index > 0) {
      const pIndex = index - 1;
      const prev = items[pIndex];
      if (prev && prev.dayTime === timeInfo.time) {
        addHeader = false;
      }
    }
    this._appendHistoryTimeHeader(item, timeInfo, addHeader);
    items.splice(index, 0, item);
    this.requests = [...items];
  }
  /**
   * Determines a position of a history item to be inserted at.
   * The position is determined by `time` argument.
   * It always returns the position where the item to insert is newer than next item on the list.
   * @param {Number} time Request's `updated` or `created` property,.
   * @return {Number} Position at which insert the request.
   */
  _historyInsertPosition(time) {
    const list = this.requests;
    if (!list) {
      return 0;
    }
    let i = 0;
    const len = list.length;
    for (; i < len; i++) {
      const item = list[i];
      if (item.updated) {
        if (item.updated < time) {
          return i;
        }
      } else if (item.created) {
        if (item.created < time) {
          return i;
        }
      }
    }
    return i;
  }
  /**
   * Appends time properties to a history item.
   * @param {Object} item History model
   * @param {Object} timeInfo Generated time info object.
   * @param {Boolean} addHeader True to set header values.
   */
  _appendHistoryTimeHeader(item, timeInfo, addHeader) {
    item.timeLabel = timeInfo.timeLabel;
    item.dayTime = timeInfo.time;
    if (addHeader) {
      let date = timeInfo.formatted;
      const time = timeInfo.time;
      const today = this._getTodayTimestamp();
      if (time === today) {
        item.today = true;
        date = 'Today';
      } else if (time === this._getYesterdayTimestamp(today)) {
        date = 'Yesterday';
      }
      item.hasHeader = true;
      item.header = date;
    }
  }
  /**
   * Resets history object by removing items that has been added
   * when processing response.
   * @param {Object} request ARC request object
   * @return {Object}
   */
  _resetHistoryObject(request) {
    request.type = 'history';
    delete request.header;
    delete request.hasHeader;
    delete request.timeLabel;
    delete request.today;
    return request;
  }

  /**
   * Dispatches `request-query` custom event to `request-model`
   * to perform a query.
   *
   * @param {String} query The query to performs. Pass empty stirng
   * (or nothing) to reset query state.
   * @return {Promise} Resolved promise when the query ends.
   */
  async query(query) {
    if (!query) {
      if (this.isSearch) {
        this.refresh();
      }
      return Promise.resolve();
    }
    this.isSearch = true;
    this._querying = true;
    this.requests = undefined;

    const model = this.requestModel;
    try {
      let result = await model.query(query, 'history');
      result = this._processHistoryResults(result);
      this._appendItems(result);
      this._querying = false;
    } catch (e) {
      this._querying = false;
      this._handleError(e);
    }
  }
}
