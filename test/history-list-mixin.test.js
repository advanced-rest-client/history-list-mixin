import { fixture, assert, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import './test-element.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '@advanced-rest-client/arc-models/url-indexer.js';

describe('HistoryListMixin', function() {
  async function basicFixture() {
    return await fixture(`<test-element noauto></test-element>`);
  }

  describe('queryOptions computations', () => {
    it('Sets default query limit', async () => {
      const element = await basicFixture();
      assert.equal(element.pageLimit, 150);
    });

    it('Sets startkey property', async () => {
      const element = await basicFixture();
      const result = element._computeQueryOptions(1, 'test');
      assert.equal(result.startkey, 'test');
    });

    it('Sets skip property', async () => {
      const element = await basicFixture();
      const result = element._computeQueryOptions(1, 'test', 1);
      assert.equal(result.skip, 1);
    });

    it('Sets descending property', async () => {
      const element = await basicFixture();
      const result = element._computeQueryOptions(1, 'test', 1);
      assert.isTrue(result.descending);
    });

    it('Sets include_docs property', async () => {
      const element = await basicFixture();
      const result = element._computeQueryOptions(1, 'test', 1);
      assert.isTrue(result.include_docs);
    });
  });

  describe('_computeQueryOptions()', () => {
    let element;
    before(async () => {
      element = await basicFixture();
    });

    it('Sets descending property', () => {
      const result = element._computeQueryOptions();
      assert.isTrue(result.descending);
    });

    it('Sets include_docs property', () => {
      const result = element._computeQueryOptions();
      assert.isTrue(result.include_docs);
    });

    it('Sets limit', () => {
      const result = element._computeQueryOptions(10);
      assert.equal(result.limit, 10);
    });

    it('Sets startkey property', () => {
      const result = element._computeQueryOptions(10, 'test');
      assert.equal(result.startkey, 'test');
    });

    it('Sets skip property', () => {
      const result = element._computeQueryOptions(10, 'test', 1);
      assert.equal(result.skip, 1);
    });
  });

  describe('#dataUnavailable', () => {
    let element;
    before(async () => {
      element = await basicFixture();
    });

    it('Returns true if all undefined', () => {
      assert.isTrue(element.dataUnavailable);
    });

    it('Returns true if all false', () => {
      element.requests = undefined;
      element._querying = false;
      element.isSearch = false;
      assert.isTrue(element.dataUnavailable);
    });

    it('Returns false if has requests is true', () => {
      element.requests = [{}];
      element._querying = false;
      element.isSearch = false;
      assert.isFalse(element.dataUnavailable);
    });

    it('Returns false if querying is true', () => {
      element.requests = undefined;
      element._querying = true;
      element.isSearch = false;
      assert.isFalse(element.dataUnavailable);
    });

    it('Returns false if isSearch is true', () => {
      element.requests = undefined;
      element._querying = false;
      element.isSearch = true;
      assert.isFalse(element.dataUnavailable);
    });
  });

  describe('#searchListEmpty', () => {
    let element;
    before(async () => {
      element = await basicFixture();
    });

    it('Returns false if all undefined', () => {
      assert.isFalse(element.searchListEmpty);
    });

    it('Returns false if all false', () => {
      element.requests = undefined;
      element._querying = false;
      element.isSearch = false;
      assert.isFalse(element.searchListEmpty);
    });

    it('Returns false if has requests is true', () => {
      element.requests = [{}];
      element._querying = false;
      element.isSearch = false;
      assert.isFalse(element.searchListEmpty);
    });

    it('Returns false if querying is true', () => {
      element.requests = undefined;
      element._querying = true;
      element.isSearch = false;
      assert.isFalse(element.searchListEmpty);
    });

    it('Returns true if isSearch is true', () => {
      element.requests = undefined;
      element._querying = false;
      element.isSearch = true;
      assert.isTrue(element.searchListEmpty);
    });
  });

  describe('_dataImportHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls refresh() when called', () => {
      let called = false;
      element.refresh = () => called = true;
      element._dataImportHandler();
      assert.isTrue(called);
    });

    it('Calls refresh() when data-imported is handled', () => {
      let called = false;
      element.refresh = () => called = true;
      document.body.dispatchEvent(new CustomEvent('data-imported', {
        bubbles: true
      }));
      assert.isTrue(called);
    });
  });

  describe('_onDatabaseDestroy()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls refresh() when called with "history" datastore', () => {
      let called = false;
      element.refresh = () => called = true;
      element._onDatabaseDestroy({
        detail: {
          datastore: ['history']
        }
      });
      assert.isTrue(called);
    });

    it('Calls refresh() when called with "history-requests" datastore (legacy api)', () => {
      let called = false;
      element.refresh = () => called = true;
      element._onDatabaseDestroy({
        detail: {
          datastore: ['history-requests']
        }
      });
      assert.isTrue(called);
    });

    it('Calls refresh() when called with "all" datastore', () => {
      let called = false;
      element.refresh = () => called = true;
      element._onDatabaseDestroy({
        detail: {
          datastore: ['history-requests']
        }
      });
      assert.isTrue(called);
    });

    it('Calls refresh() when datastore is a string', () => {
      let called = false;
      element.refresh = () => called = true;
      element._onDatabaseDestroy({
        detail: {
          datastore: 'history-requests'
        }
      });
      assert.isTrue(called);
    });

    it('Calls refresh() when datastore-destroyed is handled', () => {
      let called = false;
      element.refresh = () => called = true;
      document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore: ['history']
        }
      }));
      assert.isTrue(called);
    });

    it('Do nothing when datastore not set', () => {
      let called = false;
      element.refresh = () => called = true;
      element._onDatabaseDestroy({
        detail: {}
      });
      assert.isFalse(called);
    });

    it('Do nothing when datastore is not an array', () => {
      let called = false;
      element.refresh = () => called = true;
      element._onDatabaseDestroy({
        detail: {
          datastore: true
        }
      });
      assert.isFalse(called);
    });

    it('Do nothing when datastore is history store', () => {
      let called = false;
      element.refresh = () => called = true;
      element._onDatabaseDestroy({
        detail: {
          datastore: 'saved'
        }
      });
      assert.isFalse(called);
    });
  });

  describe('_processHistoryResults()', function() {
    let element;
    let data;
    beforeEach(async () => {
      element = await basicFixture();
      data = [{
        _id: '1',
        updated: 10
      }, {
        _id: '2',
        updated: 20
      }];
    });

    it('Do nothing if no response', function() {
      const result = element._processHistoryResults();
      assert.isUndefined(result);
    });

    it('Returns empty array when no response', function() {
      const result = element._processHistoryResults([]);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 0);
    });

    it('Returns a list of documents', function() {
      const result = element._processHistoryResults(data);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 2);
    });

    it('Documents are sorted by name', function() {
      const result = element._processHistoryResults(data);
      assert.equal(result[0]._id, '2');
      assert.equal(result[1]._id, '1');
    });

    it('Adds created property when missing', () => {
      const result = element._processHistoryResults(data);
      assert.typeOf(result[0].created, 'number');
    });

    it('Adds updated property when missing', () => {
      const result = element._processHistoryResults(data);
      assert.typeOf(result[0].updated, 'number');
    });

    it('Adds timeLabel property', () => {
      const result = element._processHistoryResults(data);
      assert.typeOf(result[0].timeLabel, 'string');
    });

    it('Adds header property', () => {
      const result = element._processHistoryResults(data);
      assert.typeOf(result[0].header, 'string');
    });

    it('Adds hasHeader property', () => {
      const result = element._processHistoryResults(data);
      assert.typeOf(result[0].hasHeader, 'boolean');
    });
  });

  describe('_ensureTimestamps()', () => {
    let element;
    let data;
    beforeEach(async () => {
      element = await basicFixture();
      data = [{
        _id: '1',
        created: 1
      }, {
        _id: '2',
        updated: 2
      }, {
        _id: '3'
      }];
    });

    it('Returns array', () => {
      const result = element._ensureTimestamps(data);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 3);
    });

    it('Adds "updated" property', () => {
      const result = element._ensureTimestamps(data);
      assert.typeOf(result[0].updated, 'number');
    });

    it('Adds "created" property', () => {
      const result = element._ensureTimestamps(data);
      assert.typeOf(result[1].created, 'number');
    });

    it('Adds both properties', () => {
      const result = element._ensureTimestamps(data);
      assert.typeOf(result[2].created, 'number');
      assert.typeOf(result[2].updated, 'number');
    });

    it('Returns the same values if present', function() {
      const created = 123456789;
      const updated = 987654321;
      const result = element._ensureTimestamps([{
        created,
        updated
      }]);
      assert.equal(result[0].created, created);
      assert.equal(result[0].updated, updated);
    });
  });

  describe('_sortHistoryResults()', () => {
    let element;
    let data;
    beforeEach(async () => {
      element = await basicFixture();
      data = [{
        _id: '1',
        updated: 3
      }, {
        _id: '2',
        updated: 1
      }, {
        _id: '3',
        updated: 2
      }];
    });

    it('Sorts the array', () => {
      data.sort(element._sortHistoryResults);
      assert.equal(data[0]._id, '1');
      assert.equal(data[1]._id, '3');
      assert.equal(data[2]._id, '2');
    });

    it('Returns 0 when times equal', () => {
      const a = {
        updated: 1
      };
      const b = {
        updated: 1
      };
      const result = element._sortHistoryResults(a, b);
      assert.equal(result, 0);
    });

    it('Returns -1 when A time is higher', () => {
      const a = {
        updated: 1
      };
      const b = {
        updated: 0
      };
      const result = element._sortHistoryResults(a, b);
      assert.equal(result, -1);
    });

    it('Returns 1 when B time is higher', () => {
      const a = {
        updated: 0
      };
      const b = {
        updated: 1
      };
      const result = element._sortHistoryResults(a, b);
      assert.equal(result, 1);
    });
  });

  describe('_getTodayTimestamp()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns a number', () => {
      const result = element._getTodayTimestamp();
      assert.typeOf(result, 'number');
    });

    it('Hours, minutes, seconds, and ms are removed ', () => {
      const result = element._getTodayTimestamp();
      const secs = String(result).substr(-5);
      assert.equal(secs, '00000');
    });

    it('Hours is set to 0', () => {
      const result = element._getTodayTimestamp();
      const date = new Date(result);
      assert.equal(date.getHours(), 0);
    });

    it('Minutes is set to 0', () => {
      const result = element._getTodayTimestamp();
      const date = new Date(result);
      assert.equal(date.getMinutes(), 0);
    });

    it('Seconds is set to 0', () => {
      const result = element._getTodayTimestamp();
      const date = new Date(result);
      assert.equal(date.getSeconds(), 0);
    });

    it('Milliseconds is set to 0', () => {
      const result = element._getTodayTimestamp();
      const date = new Date(result);
      assert.equal(date.getMilliseconds(), 0);
    });
  });

  describe('_getYesterdayTimestamp()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns a number', () => {
      const result = element._getYesterdayTimestamp(Date.now());
      assert.typeOf(result, 'number');
    });

    it('Is a day earlier', () => {
      const result = element._getYesterdayTimestamp(1541658370548);
      assert.equal(result, 1541571970548);
    });
  });

  describe('_appendItems()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Adds items to the list that doesn\'t exists', function() {
      const items = [{
        _id: 1
      }, {
        _id: 2
      }];
      assert.isUndefined(element.requests);
      element._appendItems(items);
      assert.typeOf(element.requests, 'array');
      assert.lengthOf(element.requests, 2);
    });

    it('Adds items to the list that already exists', function() {
      const requests = [{
        _id: 1
      }, {
        _id: 2
      }];
      element.requests = [{
        _id: 3
      }];
      element._appendItems(requests);
      assert.typeOf(element.requests, 'array');
      assert.lengthOf(element.requests, 3);
    });
  });

  describe('refresh()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calles reset() function', () => {
      let called = false;
      element.reset = () => called = true;
      element.loadNext = () => {};
      element.refresh();
      assert.isTrue(called);
    });

    it('Calles loadNext() function', () => {
      let called = false;
      element.reset = () => {};
      element.loadNext = () => called = true;
      element.refresh();
      assert.isTrue(called);
    });
  });

  describe('reset()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Resets _queryStartKey', () => {
      element._queryStartKey = 'test';
      element.reset();
      assert.isUndefined(element._queryStartKey);
    });

    it('Resets _querySkip', () => {
      element._querySkip = 1;
      element.reset();
      assert.isUndefined(element._querySkip);
    });

    it('Resets requests', () => {
      element.requests = [{}];
      element.reset();
      assert.isUndefined(element.requests);
    });

    it('Resets isSearch', () => {
      element.isSearch = true;
      element.reset();
      assert.isFalse(element.isSearch);
    });

    it('Resets querying', () => {
      element._querying = true;
      element.reset();
      assert.isFalse(element.querying);
    });
  });

  describe('loadNext()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Eventually calls _loadPage()', async () => {
      let called = false;
      element._loadPage = () => called = true;
      element.loadNext();
      await aTimeout();
      assert.isTrue(called);
    });

    it('Sets __makingQuery flag', (done) => {
      element._loadPage = () => done();
      element.loadNext();
      assert.isTrue(element.__makingQuery);
    });

    it('Clears __makingQuery flag after callback', (done) => {
      element._loadPage = () => {
        assert.isFalse(element.__makingQuery);
        done();
      };
      element.loadNext();
    });

    it('Do nothing when __makingQuery flag is set', async () => {
      let called = false;
      element._loadPage = () => called = true;
      element.__makingQuery = true;
      element.loadNext();
      await aTimeout();
      assert.isFalse(called);
    });

    it('Do nothing when isSearch flag is set', async () => {
      let called = false;
      element._loadPage = () => called = true;
      element.isSearch = true;
      element.loadNext();
      await aTimeout();
      assert.isFalse(called);
    });
  });

  describe('_handleError()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Throws an error', () => {
      assert.throws(function() {
        element._handleError(new Error('test'));
      });
    });
  });

  describe('_loadPage()', () => {
    before(async () => {
      await DataGenerator.insertHistoryRequestData();
    });

    after(async () => {
      await DataGenerator.destroyHistoryData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('does nothing when isSearch is set', async () => {
      element.isSearch = true;
      const p = element._loadPage();
      assert.isUndefined(element.querying);
      await p;
    });

    it('Returns a promise', () => {
      element.isSearch = true;
      const p = element._loadPage();
      assert.typeOf(p.then, 'function');
      return p;
    });

    it('resets querying when ready', async () => {
      await element._loadPage();
      assert.isFalse(element.querying);
    });


    it('sets requests from the response', async () => {
      await element._loadPage();
      assert.typeOf(element.requests, 'array');
      assert.lengthOf(element.requests, 25);
    });

    it('sets _queryStartKey', async () => {
      await element._loadPage();
      assert.typeOf(element._queryStartKey, 'string');
    });

    it('sets _querySkip', async () => {
      await element._loadPage();
      assert.equal(element._querySkip, 1);
    });

    it('Calls _processHistoryResults() for documents', async () => {
      const spy = sinon.spy(element, '_processHistoryResults');
      await element._loadPage();
      assert.isTrue(spy.called);
    });

    it('Calls notifyResize when defined', async () => {
      element.notifyResize = () => {};
      const spy = sinon.spy(element, 'notifyResize');
      await element._loadPage();
      await aTimeout();
      assert.isTrue(spy.called);
    });
  });

  describe('_computeHistoryTime()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns an object', () => {
      const result = element._computeHistoryTime(Date.now());
      assert.typeOf(result, 'object');
    });

    it('Has formatted date', () => {
      const result = element._computeHistoryTime(Date.now());
      assert.typeOf(result.formatted, 'string');
    });

    it('Has time at midnight', () => {
      const result = element._computeHistoryTime(Date.now());
      assert.typeOf(result.time, 'number', 'Is a number');
      const secs = String(result.time).substr(-5);
      assert.equal(secs, '00000', 'time is removed');
    });

    it('Has timeLabel date', () => {
      const result = element._computeHistoryTime(Date.now());
      assert.typeOf(result.timeLabel, 'string');
    });
  });

  describe('_resetHistoryObject()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns the same passed object', () => {
      const obj = {};
      const result = element._resetHistoryObject(obj);
      assert.isTrue(result === obj);
    });

    it('Sets type', () => {
      const result = element._resetHistoryObject({});
      assert.equal(result.type, 'history');
    });

    it('Removes "header"', () => {
      const result = element._resetHistoryObject({ header: 'test' });
      assert.isUndefined(result.header);
    });

    it('Removes "hasHeader"', () => {
      const result = element._resetHistoryObject({ hasHeader: 'test' });
      assert.isUndefined(result.hasHeader);
    });

    it('Removes "timeLabel"', () => {
      const result = element._resetHistoryObject({ timeLabel: 'test' });
      assert.isUndefined(result.timeLabel);
    });

    it('Removes "today"', () => {
      const result = element._resetHistoryObject({ today: 'test' });
      assert.isUndefined(result.today);
    });
  });

  describe('query()', () => {
    before(async () => {
      await DataGenerator.insertHistoryRequestData();
    });

    after(async () => {
      await DataGenerator.destroyHistoryData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Does nothing when query is not set', async () => {
      const p = element.query();
      assert.isUndefined(element.querying);
      await p;
    });

    it('returns a promise when query is not set', async () => {
      const p = element.query();
      assert.typeOf(p.then, 'function');
      await p;
    });

    it('Returns promise when query is not set and isSearch', async () => {
      element.isSearch = true;
      const p = element.query();
      assert.typeOf(p.then, 'function');
      await p;
    });

    it('calls refresh() when query is not set and isSearch', async () => {
      element.isSearch = true;
      let called = false;
      element.refresh = () => called = true;
      const p = element.query();
      assert.isTrue(called);
      await p;
    });

    it('sets querying property', async () => {
      const p = element.query('test');
      assert.isTrue(element.querying);
      await p;
    });

    it('resets querying when ready', async () => {
      await element.query('test');
      assert.isFalse(element.querying);
    });
  });

  describe('_historyTypeChanged()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 10
      });
    });

    it('Do nothing when type is not set', () => {
      element.type = undefined;
      const item = DataGenerator.generateHistoryObject();
      element._historyTypeChanged(item);
      assert.lengthOf(element.requests, 10);
    });

    it('Do nothing when type is not history', () => {
      element.type = 'saved';
      const item = DataGenerator.generateHistoryObject();
      element._historyTypeChanged(item);
      assert.lengthOf(element.requests, 10);
    });

    it('Do nothing when request type is not history', () => {
      const item = DataGenerator.generateSavedItem();
      element._historyTypeChanged(item);
      assert.lengthOf(element.requests, 10);
    });

    it('Creates requests array when request type is "history"', () => {
      element.requests = undefined;
      const item = DataGenerator.generateHistoryObject();
      item.type = 'history';
      element._historyTypeChanged(item);
      assert.lengthOf(element.requests, 1);
    });

    it('Creates requests array when request type is "history-requests"', () => {
      element.requests = undefined;
      const item = DataGenerator.generateHistoryObject();
      item.type = 'history-requests';
      element._historyTypeChanged(item);
      assert.lengthOf(element.requests, 1);
    });

    it('Calls _insertItem() when no requests', () => {
      element.requests = undefined;
      const item = DataGenerator.generateHistoryObject();
      const spy = sinon.spy(element, '_insertItem');
      element._historyTypeChanged(item);
      assert.isTrue(spy.called, 'Function is called');
      assert.deepEqual(spy.args[0][0], item, 'Argument is set');
    });

    it('Calls _insertItem() when request do not match current requests', () => {
      const item = DataGenerator.generateHistoryObject();
      const spy = sinon.spy(element, '_insertItem');
      element._historyTypeChanged(item);
      assert.isTrue(spy.called, 'Function is called');
      assert.deepEqual(spy.args[0][0], item, 'Argument is set');
    });

    it('Calls _removeItem() when item already exist', () => {
      const value = 'x-test: x-value';
      const item = Object.assign({}, element.requests[2]);
      item.headers = value;
      const spy = sinon.spy(element, '_removeItem');
      element._historyTypeChanged(item);
      assert.isTrue(spy.called, 'Function is called');
      assert.deepEqual(spy.args[0][0], 2, 'Argument is set');
    });
  });

  describe('_removeItem()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 5
      });
    });

    it('Removes request at position', () => {
      const id = element.requests[1];
      element._removeItem(1);
      assert.lengthOf(element.requests, 4);
      const item = element.requests.some((item) => item._id === id);
      assert.isFalse(item);
    });

    it('Passes header to the next item', () => {
      const current = element.requests[2];
      current.hasHeader = true;
      current.header = 'test-header';
      current.today = true;
      element._removeItem(2);
      const next = element.requests[2];
      assert.equal(next.header, 'test-header');
      assert.isTrue(next.hasHeader);
      assert.isTrue(next.today);
    });

    it('Ignores header set when next item has header', () => {
      const current = element.requests[2];
      current.hasHeader = true;
      current.header = 'test-header';
      current.today = true;
      const next = element.requests[3];
      next.hasHeader = true;
      next.header = 'other-header';
      next.today = false;
      element._removeItem(2);
      const updated = element.requests[2];
      assert.equal(updated.header, 'other-header');
      assert.isTrue(updated.hasHeader);
      assert.isFalse(updated.today);
    });
  });

  describe('_insertItem()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.requests = DataGenerator.generateHistoryRequestsData({
        requestsSize: 2
      });
    });

    it('Creates "requests" if not exists', () => {
      element.requests = undefined;
      const item = DataGenerator.generateHistoryObject();
      element._insertItem(item);
      assert.lengthOf(element.requests, 1);
      assert.deepEqual(element.requests[0], item);
    });

    it('Calls _appendHistoryTimeHeader() when no requests', () => {
      element.requests = undefined;
      const item = DataGenerator.generateHistoryObject();
      const spy = sinon.spy(element, '_appendHistoryTimeHeader');
      element._insertItem(item);
      assert.isTrue(spy.called, 'Method is called');
      assert.deepEqual(spy.args[0][0], item, 'Passes item as an argument');
      assert.typeOf(spy.args[0][1], 'object', 'Passes time info');
      assert.isTrue(spy.args[0][2], 'AddHeader argument is set');
    });

    it('Calls _computeHistoryTime() with item\'s updated time', () => {
      const item = DataGenerator.generateHistoryObject();
      const time = item.updated;
      const spy = sinon.spy(element, '_computeHistoryTime');
      element._insertItem(item);
      assert.isTrue(spy.called, 'Method is called');
      assert.equal(spy.args[0][0], time, 'Passes "updated" as an argument');
    });

    it('Calls _computeHistoryTime() with item\'s created time', () => {
      const item = DataGenerator.generateHistoryObject();
      delete item.updated;
      const time = item.created;
      const spy = sinon.spy(element, '_computeHistoryTime');
      element._insertItem(item);
      assert.isTrue(spy.called, 'Method is called');
      assert.equal(spy.args[0][0], time, 'Passes "updated" as an argument');
    });

    it('Calls _historyInsertPosition() with item\'s updated time', () => {
      const item = DataGenerator.generateHistoryObject();
      const time = item.updated;
      const spy = sinon.spy(element, '_historyInsertPosition');
      element._insertItem(item);
      assert.isTrue(spy.called, 'Method is called');
      assert.equal(spy.args[0][0], time, 'Passes "updated" as an argument');
    });

    it('Calls _historyInsertPosition() with item\'s created time', () => {
      const item = DataGenerator.generateHistoryObject();
      delete item.updated;
      const time = item.created;
      const spy = sinon.spy(element, '_historyInsertPosition');
      element._insertItem(item);
      assert.isTrue(spy.called, 'Method is called');
      assert.equal(spy.args[0][0], time, 'Passes "updated" as an argument');
    });

    it('Removes header from next item when the same day', () => {
      const item = DataGenerator.generateHistoryObject();
      item.created = item.updated = Date.now();
      const timeInfo = element._computeHistoryTime(item.updated);
      const next = element.requests[0];
      next.created = next.updated = item.created - 1;
      next.hasHeader = true;
      next.dayTime = timeInfo.time;
      next.today = true;
      next.header = 'test';
      const id = next._id;
      element._insertItem(item);
      // next is now at index 1
      const updated = element.requests[1];
      assert.equal(updated._id, id, 'Inserted intem at position 0');
      assert.isFalse(updated.hasHeader, 'Next item\'s hasHeader is false');
      assert.isUndefined(updated.today, 'Next item\'s today is undefined');
      assert.isFalse(updated.header, 'Next item\'s header is false');
    });

    it('Next item stays the same if does not have header', () => {
      const item = DataGenerator.generateHistoryObject();
      item.created = item.updated = Date.now();
      const next = element.requests[0];
      next.created = next.updated = item.created - 1;
      const id = next._id;
      element._insertItem(item);
      // next is now at index 1
      const updated = element.requests[1];
      assert.equal(updated._id, id, 'Inserted intem at position 0');
      assert.isUndefined(updated.hasHeader, 'hasHeader is undefined');
    });

    it('Adds header to the item if previous item has no header', () => {
      const item = DataGenerator.generateHistoryObject();
      item.created = item.updated = Date.now();
      element.requests[0].updated = item.created + 1;
      element.requests[1].updated = item.created - 1;
      element._insertItem(item);
      assert.isTrue(item.hasHeader, 'hasHeader is set');
      assert.equal(item.header, 'Today', 'header is set');
      assert.isTrue(item.today, 'today is set');
    });

    it('Header is not added if previous item has the same date', () => {
      const item = DataGenerator.generateHistoryObject();
      item.created = item.updated = Date.now();
      const timeInfo = element._computeHistoryTime(item.updated);
      element.requests[0].updated = item.created + 1;
      element.requests[0].dayTime = timeInfo.time;
      element.requests[1].updated = item.created - 1;
      element._insertItem(item);
      assert.isUndefined(item.hasHeader, 'hasHeader is not set');
    });
  });
});
