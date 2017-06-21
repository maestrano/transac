###
#   @desc Service responsible for dispatching messages to retrieve data and/or alter the Transactions state in methods that represent actions made from the view layer.
###
angular.module('transac.transactions').service('TransacTxsDispatcher', ($q, $log, $timeout, TransacTxsStore, TransacTxsService, TransacAlertsService)->

  _self = @

  ###
  #   @desc Load transactions & set pagination total
  #   @param {Object} [options=]
  #   @param {string} [options.url=] A custom url for the request (a pagination url)
  #   @param {string} [options.type=] Type of transactions e.g 'pending', 'historical'
  #   @param {Object} [options.params=] Pagination & filter params for the request
  #   @param {boolean} [options.excludeParams=] Prevent option.params being passed onto TransacTxsService, typically for using api url links instead of state pagination params.
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
        true
      ()->
        msg = 'Failed to load transactions'
        TransacAlertsService.send('error', msg, 'Error')
        $q.reject(message: text: msg, type: 'error')
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
  #   @param {Object} [options]
  #   @param {Object} [option.type=] Type of transaction
  #   @param {Object} [options.params=] pagination & filter parameters for the request
  #   @returns {Promise<Object>} whether the load was successful or not
  ###
  @reloadTxs = (options={})->
    # Prevent parent application reloading while a previous reload is still running.
    unless _self.reloadLocked
      _self.reloadLocked = true
      TransacTxsStore.dispatch('loadingTxs', true)
      TransacTxsStore.dispatch('removeAllTxs')
      TransacTxsStore.dispatch('resetPgnSkip')
      _self.loadTxs(options).then(->
        _self.reloadLocked = false
      )
    else
      $timeout(->
        $log.warn("Reload Transactions locked: retrying in 5sec")
        _self.reloadTxs(options)
      ,500)

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
        deferred.resolve(data: res, message: text: 'Commit transaction success', type: 'success')
      ()->
        # Restore pagination total if commit fails
        TransacTxsStore.dispatch('plusPgnTotal', 1)
        $timeout((-> deferred.notify(true)), 0)
        deferred.reject(message: text: 'Commit transaction failed', type: 'error')
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
      deferred.reject(message: text: 'Merge cancelled', type: 'info')
    else
      tx = _.find(TransacTxsStore.getState().transactions, (t) ->
        t.transaction_log.id == args.txId
      )
      unless tx?
        deferred.reject(message: text: 'No transaction found, merge failed', type: 'error') unless tx?
      else
        TransacTxsStore.dispatch('loadingTxs')

        TransacTxsService.merge(
          tx.links.merge
          tx.transaction_log.resource_type
          args.mergeParams
        ).then(
          (res)->
            deferred.resolve(message: text: "#{tx.transaction_log.reference} merged successfully", type: 'success')
          ()->
            deferred.reject(message: text: "#{tx.transaction_log.reference} failed to merge", type: 'error')
        )
    deferred.promise

  ###
  #   @desc Reset Transactions store state
  ###
  @resetTxsState = ->
    TransacTxsStore.dispatch('removeAllTxs')
    TransacTxsStore.dispatch('resetPgnSkip')
    return

  return @
)
