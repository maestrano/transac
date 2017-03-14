angular.module('transac.transactions').service('TransacTxsActions', ($q, TransacTxsStore, TransacTxsService)->

  _self = @

  @loadTxs = (type, params=null)->
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
        # TODO: display alert
        $q.reject(success: false, message: 'an error message')
    ).finally(->
      TransacTxsStore.dispatch('loadingTxs', false)
    )

  @paginateTxs = (type)->
    TransacTxsStore.dispatch('loadingTxs', true)
    state = TransacTxsStore.dispatch('nextPgnPage')
    offset = (state.pagination.page - 1) * state.pagination.limit
    params = $skip: offset, $top: state.pagination.limit
    angular.merge(params, state.cachedParams) if state.cachedParams
    _self.loadTxs(type, params)

  @reloadTxs = (type, params=null, cacheParams=false)->
    TransacTxsStore.dispatch('loadingTxs', true)
    TransacTxsStore.dispatch('cacheParams', (cacheParams && params || null))
    TransacTxsStore.dispatch('removeAllTxs')
    TransacTxsStore.dispatch('resetPgnPage')
    _self.loadTxs(type, params)

  return @
)
