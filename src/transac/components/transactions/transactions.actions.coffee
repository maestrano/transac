###
#   @desc Service responsible for dispatching messages to retrieve data and/or alter the Transactions state in methods that represent actions made from the view layer.
###
angular.module('transac.transactions').service('TransacTxsActions', ($q, TransacTxsStore, TransacTxsService)->

  _self = @

  ###
  #   @desc Load transactions & set pagination total
  #   @param {string} [type] Type of transaction
  #   @param {Object} [params=] pagination & filter parameters for the request
  #   @returns {Promise<Object>} whether the load was successful or not
  ###
  @loadTxs = (type, params=null)->
    TransacTxsStore.dispatch('loadingTxs', true) unless TransacTxsStore.getState().loading
    params ||= TransacTxsStore.getState().pagination.defaultParams
    TransacTxsService.get(type, params: params).then(
      (response)->
        TransacTxsStore.dispatch('addTxs', response.transactions)
        TransacTxsStore.dispatch('setPgnTotal', response.pagination.total)
        TransacTxsStore.dispatch('clearCachedParams')
        $q.when(success: true)
      (error)->
        TransacTxsStore.dispatch('setPgnTotal', 0)
        # TODO: display alert
        $q.reject(success: false, message: 'an error message')
    ).finally(->
      TransacTxsStore.dispatch('loadingTxs', false)
    )

  ###
  #   @desc Paginates Transactions
  #   @param {string} [type] Type of transaction
  #   @returns {Promise<Object>} whether the load more txs was successful or not
  ###
  @paginateTxs = (type)->
    TransacTxsStore.dispatch('loadingTxs', true)
    state = TransacTxsStore.dispatch('nextPgnPage')
    offset = (state.pagination.page - 1) * state.pagination.limit
    params = $skip: offset, $top: state.pagination.limit
    angular.merge(params, state.cachedParams) if state.cachedParams
    _self.loadTxs(type, params)

  ###
  #   @desc Load transactions & set pagination total
  #   @param {string} [type] Type of transaction
  #   @param {Object} [params=] pagination & filter parameters for the request
  #   @param {boolean} [cacheParams=] whether to cache the params in store. This is used to re-apply previous parameters on the next requests.
  #   @returns {Promise<Object>} whether the load was successful or not
  ###
  @reloadTxs = (type, params=null, cacheParams=false)->
    TransacTxsStore.dispatch('loadingTxs', true)
    TransacTxsStore.dispatch('cacheParams', (cacheParams && params || null))
    TransacTxsStore.dispatch('removeAllTxs')
    TransacTxsStore.dispatch('resetPgnPage')
    _self.loadTxs(type, params)

  return @
)
