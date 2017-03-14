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

  callbacks = {}
  callbacks.dispatched = $q.defer()

  @subscribe = ->
    callbacks.dispatched.promise

  @dispatch = (action)->
    switch action.type
      when 'ADD_TXS'
        state.transactions = state.transactions.concat(action.payload)
        console.log('adding txs', action.payload.length)
      when 'SET_PGN_TOTAL'
        state.pagination.total = action.payload
        console.log('setting pgn total', action.payload)
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
