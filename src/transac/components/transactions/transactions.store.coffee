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

  @subscribe = ->
    callbacks.dispatched.promise

  @dispatch = (action, payload=null)->
    switch action
      when 'addTxs'
        state.transactions = state.transactions.concat(payload)
        console.log('adding txs', payload.length)
      when 'removeAllTxs'
        state.transactions.length = 0
        console.log('removing all txs', state.transactions.length)
      when 'loadingTxs'
        state.loading = payload
        console.log('is loading txs', payload)
      when 'setPgnTotal'
        state.pagination.total = payload
        console.log('setting pgn total', payload)
      when 'nextPgnPage'
        state.pagination.page += 1
        console.log('setting png next page', state.pagination.page)
      when 'resetPgnPage'
        state.pagination.page = 1
        console.log('reseting pgn page', state.pagination.page)
      when 'cacheParams'
        state.cachedParams = payload
        console.log('caching params', payload)
    notify()
    _self.getState()

  @getState = ->
    state

  # Private

  notify = ->
    callbacks.dispatched.notify(_self.getState())
    return

  return @
)
