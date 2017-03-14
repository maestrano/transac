angular.module('transac.transactions').service('TransacTxsActions', ($q, TransacTxsStore, TransacTxsService)->

  _self = @

  @initTransactions = (type, params)->
    TransacTxsStore.dispatch('loadingTxs', true)
    params ||= TransacTxsStore.getState().pagination.defaultParams
    TransacTxsService.get(type, params: params).then(
      (response)->
        TransacTxsStore.dispatch('addTxs', response.transactions)
        TransacTxsStore.dispatch('setPgnTotal', response.pagination.total)
        # ctrl.cacheParams = null
        # TransacTxsStore.dispatch(type: 'CLEAR_CACHED_PARAMS')
        $q.when(success: true)
      (error)->
        TransacTxsStore.dispatch('setPgnTotal', 0)
        $q.reject(success: false, message: 'an error message')
    ).finally(->
      TransacTxsStore.dispatch('loadingTxs', false)
    )

  return @
)
