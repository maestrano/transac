###
#   @desc Service responsible for dispatching messages to retrieve data and/or alter the Transactions state in methods that represent actions made from the view layer.
###
angular.module('transac.transactions').service('TransacTxsDispatcher', ($q, $timeout, TransacTxsStore, TransacTxsService)->

  _self = @

  ###
  #   @desc Load transactions & set pagination total
  #   @param {Object} [options=]
  #   @param {string} [options.url=] A custom url for the request (a pagination url)
  #   @param {string} [options.type=] Type of transactions e.g 'pending', 'history'
  #   @param {Object} [options.params=] Pagination & filter params for the request
  #   @param {boolean} [options.excludeParams=] Prevent option.params being passed onto TransacTxsService
  #   @returns {Promise<Object>} whether the load was successful or not
  ###
  @loadTxs = (options={})->
    TransacTxsStore.dispatch('loadingTxs', true) unless TransacTxsStore.getState().loading
    TransacTxsStore.dispatch('setTxsType', options.type) if options.type
    unless options.excludeParams
      currentPgnState = TransacTxsStore.getState().pagination
      pgnParams = $skip: currentPgnState.skip, $top: currentPgnState.top
      options.params = angular.merge({}, pgnParams, options.params)
    TransacTxsService.get(options).then(
      (response)->
        TransacTxsStore.dispatch('addTxs', response.transactions)
        TransacTxsStore.dispatch('setPgn', response.pagination)
        $q.when(success: true)
      (err)->
        # TODO: display alert
        $q.reject(message: 'Load transactions failed')
    ).finally(->
      TransacTxsStore.dispatch('loadingTxs', false)
    )

  ###
  #   @desc Paginates Transactions
  #   @param {string} [url] for retrieving paginated transactions
  #   @returns {Promise<Object>} whether the load more txs was successful or not
  ###
  @paginateTxs = (url)->
    TransacTxsStore.dispatch('loadingTxs', true)
    _self.loadTxs(url: url, excludeParams: true)

  ###
  #   @desc Load transactions & set pagination total
  #   @param {string} [type] Type of transaction
  #   @param {Object} [params=] pagination & filter parameters for the request
  #   @returns {Promise<Object>} whether the load was successful or not
  ###
  @reloadTxs = (type, params=null)->
    TransacTxsStore.dispatch('loadingTxs', true)
    TransacTxsStore.dispatch('removeAllTxs')
    TransacTxsStore.dispatch('resetPgnSkip')
    _self.loadTxs(type: type, params: params)

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
    unless args?
      deferred.reject(message: 'Cancelled merge')
    else
      tx = _.find(TransacTxsStore.getState().transactions, (t) ->
        t.transaction_log.id == args.txId
      )
      unless tx?
        deferred.reject(message: 'No transaction found - merge failed') unless tx?
      else
        TransacTxsStore.dispatch('loadingTxs')

        TransacTxsService.merge(
          tx.links.merge
          tx.transaction_log.resource_type
          args.mergeParams
        ).then(
          (res)->
            deferred.resolve(success: true)
          (err)->
            deferred.reject(message: 'Merge transaction failed')
        )
    deferred.promise

  return @
)
