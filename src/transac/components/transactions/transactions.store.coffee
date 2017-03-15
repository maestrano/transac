###
#   @desc Store for Transactions state management
###
angular.module('transac.transactions').service('TransacTxsStore', ($q)->

  _self = @

  state =
    transactions: []
    pagination:
      limit: 10
      page: 1
      total: 0
      defaultParams: $skip: 0, $top: 10
    # TODO: refactor this cachedParams concept, it's a quickfix
    cachedParams: null
    loading: false

  callbacks = {}
  callbacks.dispatched = $q.defer()

  ###
  #   @desc Subscribe to notifications on state change via the dispatch method
  #   @returns {Promise} A promise to the latest state
  ###
  @subscribe = ->
    callbacks.dispatched.promise

  ###
  #   @desc Dispatch actions mutating the txs & paginations state managed by this Store.
  #   @param {string} [action] The action being made which selects the state change behaviour
  #   @param {any} [payload] Data to set / use to determine new state for the given action
  #   @returns {Object} The latest state object
  ###
  @dispatch = (action, payload=null)->
    switch action
      when 'addTxs'
        state.transactions = state.transactions.concat(payload)
      when 'removeTx'
        _.remove(state.transactions, (tx)-> tx.transaction_log.id == payload)
      when 'removeAllTxs'
        state.transactions.length = 0
      when 'loadingTxs'
        state.loading = payload
      when 'setPgnTotal'
        state.pagination.total = payload
      when 'minusPgnTotal'
        state.pagination.total -= payload
      when 'nextPgnPage'
        state.pagination.page += 1
      when 'resetPgnPage'
        state.pagination.page = 1
      when 'cacheParams'
        state.cachedParams = payload
      when 'clearCachedParams'
        state.cachedParams = null
    notify()
    _self.getState()

  ###
  #   @desc Get the latest state object
  #   @returns {Object} The latest state object
  ###
  @getState = ->
    state

  # Private

  notify = ->
    callbacks.dispatched.notify(_self.getState())
    return

  return @
)
