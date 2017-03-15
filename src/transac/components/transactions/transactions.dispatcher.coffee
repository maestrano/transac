###
#   @desc Service responsible for dispatching messages to retrieve data and/or alter the Transactions state in methods that represent actions made from the view layer.
###
angular.module('transac.transactions').service('TransacTxsDispatcher', ($q, $timeout, TransacTxsStore, TransacTxsService)->

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
        $q.when(success: true)
      (err)->
        TransacTxsStore.dispatch('setPgnTotal', 0)
        # TODO: display alert
        $q.reject(message: 'Load transactions failed')
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

  ###
  #   @desc Commit a transaction & update pagination total
  #   @params See service method comments
  #   @returns {Promise<Object>} whether the commit was successful or not
  ###
  @commitTx = (url, resource, mappings)->
    deferred = $q.defer()
    TransacTxsStore.dispatch('minusPgnTotal', 1)
    $timeout((-> deferred.notify(true)), 0)
    TransacTxsService.commit(url, resource, mappings).then(
      (res)->
        TransacTxsStore.dispatch('removeTx', res.transaction.id)
        deferred.resolve(success: true)
      (err)->
        # Restore pagination total if commit fails
        TransacTxsStore.dispatch('plusPgnTotal', 1)
        $timeout((-> deferred.notify(true)), 0)
        deferred.reject(message: 'Commit transaction failed')
    )
    deferred.promise

  ###
  #   @desc Merge a transaction's duplicates & update pagination total
  #   @param {Object} [args] Arguments for the merge action
  #   @param {Object} [args.txId] Transaction id
  #   @param {Object} [args.mergeParams] Body params for the merge PUT request
  #   @returns {Promise<Object>} whether the commit was successful or not
  ###
  @mergeTxs = (args)->
    deferred = $q.defer()
    # No merge has been published, cancel merge
    return deferred.reject(message: 'Cancelled merge') unless args?

    tx = _.find(TransacTxsStore.getState().transactions, (t) ->
      t.transaction_log.id == args.txId
    )
    return deferred.reject(message: 'No transaction found - merge failed') unless tx?

    TransacTxsStore.dispatch('loadingTxs')

    TransacTxsService.merge(
      tx.links.merge
      tx.transaction_log.resource_type
      args.mergeParams
    ).then(
      (res)->
        TransacTxsStore.dispatch('resetPgnPage')
        deferred.resolve(success: true)
      (err)->
        deferred.reject(message: 'Merge transaction failed')
    )
    deferred.promise

  return @
)
