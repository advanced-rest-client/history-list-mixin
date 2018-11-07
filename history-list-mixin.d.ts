/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   history-list-mixin.html
 */

/// <reference path="../polymer/types/lib/utils/mixin.d.ts" />
/// <reference path="../polymer/types/lib/utils/render-status.d.ts" />

declare namespace ApiElements {
}

declare namespace ArcComponents {


  /**
   * A mixin to be applied to a list that renders history requests.
   * It contains methods to query for history list and to search history.
   */
  function HistoryListMixin<T extends new (...args: any[]) => {}>(base: T): T & HistoryListMixinConstructor;

  interface HistoryListMixinConstructor {
    new(...args: any[]): HistoryListMixin;
  }

  interface HistoryListMixin {

    /**
     * The list of request to render.
     */
    requests: Array<object|null>|null;

    /**
     * True when the element is querying the database for the data.
     */
    readonly querying: boolean|null|undefined;

    /**
     * Single page query limit.
     */
    pageLimit: number|null|undefined;
    _queryStartKey: string|null|undefined;
    _querySkip: number|null|undefined;

    /**
     * Computed value.
     * Database query options for pagination.
     * Use `pageLimit` to set pagination limit.
     */
    readonly queryOptions: object|null|undefined;

    /**
     * Computed value. True if query ended and there's no results.
     */
    readonly dataUnavailable: boolean|null|undefined;

    /**
     * When set this component is in search mode.
     * This means that the list won't be loaded automatically and
     * some operations not related to search are disabled.
     */
    isSearch: boolean|null|undefined;

    /**
     * Computed value. True when the query has been performed and no items
     * has been returned. It is different from `listHidden` where less
     * conditions has to be checked. It is set to true when it doesn't
     * have items, is not loading and is search.
     */
    readonly searchListEmpty: boolean|null|undefined;

    /**
     * When set it won't query for data automatically when attached to the DOM.
     */
    noAuto: boolean|null|undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;

    /**
     * Computes pagination options.
     * This resets pagination status.
     *
     * @param limit Items per page limit.
     * @param startKey Query start key
     * @param skip Number of records to skip.
     * @returns Pagination options for PouchDB.
     */
    _computeQueryOptions(limit: Number|null, startKey: String|null, skip: Number|null): object|null;

    /**
     * Computes value for the `dataUnavailable` proeprty
     *
     * @param hasRequests [description]
     * @param loading [description]
     * @param isSearch [description]
     */
    _computeDataUnavailable(hasRequests: Boolean|null, loading: Booelan|null, isSearch: Boolean|null): Boolean|null;

    /**
     * Computes value for the `searchListEmpty` property
     *
     * @param hasRequests [description]
     * @param loading [description]
     * @param isSearch [description]
     */
    _computeSearchListEmpty(hasRequests: Boolean|null, loading: Booelan|null, isSearch: Boolean|null): Boolean|null;

    /**
     * Refreshes the data from the datastore.
     * It resets the query options, clears requests and makes a query to the datastore.
     */
    refresh(): void;

    /**
     * Resets the state of the variables.
     */
    reset(): void;

    /**
     * Handler for `data-imported` cutom event.
     * Refreshes data state.
     */
    _dataImportHandler(): void;

    /**
     * Handler for the `datastore-destroyed` custom event.
     * If one of destroyed databases is history store then it refreshes the sate.
     */
    _onDatabaseDestroy(e: CustomEvent|null): void;

    /**
     * Loads next page of results. It runs the task in a debouncer set to
     * next render frame so it's safe to call it more than once at the time.
     */
    loadNext(): void;

    /**
     * Appends array items to the `requests` property.
     * It should be used instead of direct manipulation of the `items` array.
     *
     * @param requests List of requests to appenmd
     */
    _appendItems(requests: Array<object|null>|null): void;

    /**
     * Loads next page of results from the datastore.
     * Pagination used here has been described in PouchDB pagination strategies
     * document.
     */
    _loadPage(): Promise<any>|null;

    /**
     * Dispatches `request-list` custom event and returns the event.
     */
    _dispatchListEvent(): CustomEvent|null;
    _handleError(cause: any): void;

    /**
     * Processes query results to generate view data model.
     *
     * @param res List of history requests retreived from the datastore.
     * @returns Processed data requests.
     */
    _processHistoryResults(res: any[]|null): any[]|null;

    /**
     * Ensures that the history objects have the `updated` property
     * required by further computations while processing results.
     *
     * @param requests List of history requests
     * @returns The same array but all requests will have `updated`
     * property.
     */
    _ensureTimestamps(requests: Array<object|null>|null): Array<object|null>|null;

    /**
     * Sorts the query results by `updated` property.
     */
    _sortHistoryResults(a: object|null, b: object|null): Number|null;

    /**
     * Creates a timestamp fot today, midnight
     */
    _getTodayTimestamp(): Number|null;

    /**
     * Computes yesterday's midninght based on today's mignight timestamp
     *
     * @param todayTimestamp Timestamp of current daty at midnight
     * @returns Timestamp 24 hours earlier.
     */
    _getYesterdayTimestamp(todayTimestamp: Number|null): Number|null;

    /**
     * Creates headers for each day and group requests in each day group.
     * This is relevant for history type
     *
     * @param today Timestamp of today
     * @param yesterday Timestamp of yesterday
     */
    _groupHistory(requests: Array<object|null>|null, today: Number|null, yesterday: Number|null): Array<object|null>|null;

    /**
     * Computes time information for a history item. This is later used to
     * present history list item.
     *
     * @param date Timestamp of when the item was created / updated
     * @returns Various time formats:
     * - formatted - Formatted date string
     * - time - Parsed timestamp
     * - timeLabel - secondary list item
     */
    _computeHistoryTime(date: Number|null): object|null;

    /**
     * Resets history object by removing items that has been added
     * when processing response.
     *
     * @param request ARC request object
     */
    _resetHistoryObject(request: object|null): object|null;

    /**
     * Dispatches `request-query` custom event to `request-model`
     * to perform a query.
     *
     * @param query The query to performs. Pass empty stirng
     * (or nothing) to reset query state.
     * @returns Resolved promise when the query ends.
     */
    query(query: String|null): Promise<any>|null;

    /**
     * Dispatches `request-query` custom event.
     * This event is handled by `request-mode` element to query the
     * datastore for user search term.
     *
     * @param q Query passed to event detail.
     */
    _dispatchQueryEvent(q: String|null): CustomEvent|null;
  }
}
