angular.module('transac.transactions').service('TransacTxsActions', ($q, TransacTxsStore, TransacTxsService)->

  _self = @

  @initTransactions = (params, type)->
    params ||= TransacTxsStore.getState().pagination.defaultParams
    TransacTxsService.get(type, params: params).then(
      (response)->
        # ctrl.transactions = ctrl.transactions.concat(response.transactions)
        TransacTxsStore.dispatch(type: 'ADD_TXS', payload: response.transactions)
        # ctrl.pagination.total = response.pagination.total
        TransacTxsStore.dispatch(type: 'SET_PGN_TOTAL', payload: response.pagination.total)
        # ctrl.cacheParams = null
        # TransacTxsStore.dispatch(type: 'CLEAR_CACHED_PARAMS')
        $q.when(success: true)
      (error)->
        ctrl.pagination.total = 0
        $q.reject(success: false, message: 'an error message')
    )

  return @
)
