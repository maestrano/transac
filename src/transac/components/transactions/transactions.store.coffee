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

  @dispatch = (action, payload)->
    switch action
      when 'addTxs'
        state.transactions = state.transactions.concat(payload)
        console.log('adding txs', payload.length)
      when 'setPgnTotal'
        state.pagination.total = payload
        console.log('setting pgn total', payload)
      when 'loadingTxs'
        state.loading = payload
        console.log('is loading txs', payload)
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
