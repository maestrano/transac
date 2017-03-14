###
#   @desc The root component of the transactions module. Responsible for displaying transactions and delegating requests to reconcile to the tx service.
#   @require transac-tx component
#   @require transac-tx-reconcile component
#   @require infinite-scroll directive (external)
#   @binding {Function=} [onTransactionsChange] Callback fired on change to stored txs model
#   @binding {Function=} [onReconciling] Callback fired on reconcile tx with matches (dups)
#   @binding {Function=} [onInit] Callback fired on component initialize, emitting an api for exposing cmp methods to the parent component
###
angular.module('transac.transactions').component('transacTxs', {
  bindings: {
    txsType: '<?'
    onInit: '&?'
    onTransactionsChange: '&?'
    onReconciling: '&?'
  }
  templateUrl: 'components/transactions/transactions'
  controller: ($q, EventEmitter, TransacTxsService)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.transactions = []
      ctrl.txsType ||= 'pending'
      ctrl.reconciling = false
      ctrl.pagination =
        limit: 10
        page: 1
        total: 0
      ctrl.pagination.defaultParams = $skip: 0, $top: ctrl.pagination.limit
      # TODO: refactor this cachedParams concept, it's a quickfix
      ctrl.cacheParams = null
      loadTxs()
      # Provide parent component with an api
      if ctrl.onInit?
        ctrl.api =
          reloadTxs: ctrl.reload
        ctrl.onInit(EventEmitter(api: ctrl.api))

    ctrl.loadMore = ->
      # Do not attempt to pagination further if there are no results.
      return loadTxs(ctrl.cacheParams) if ctrl.isPaginationDisabled()
      ctrl.pagination.page += 1
      offset = (ctrl.pagination.page - 1) * ctrl.pagination.limit
      params = $skip: offset, $top: ctrl.pagination.limit
      angular.merge(params, ctrl.cachedParams) if ctrl.cachedParams
      loadTxs(params)

    ctrl.reload = (type=ctrl.txsType, params=null, cacheParams=false)->
      ctrl.txsType = type
      # Set or clear cachedParams
      ctrl.cachedParams = if cacheParams then params else null
      # clear transactions from store
      ctrl.transactions.length = 0
      # reset pagination
      ctrl.pagination.page = 1
      loadTxs(params, type)

    ctrl.isPaginationDisabled = ->
      ctrl.loading || !ctrl.pagination.total

    ctrl.onTransactionCommit = ({transaction})->
      TransacTxsService.commit(
        transaction.links.commit
        transaction.transaction_log.resource_type
        transaction.mappings
      ).then(
        (response)->
          # TODO: display success alert
          # TODO: move to store
          ctrl.transactions = _.reject(ctrl.transactions, (tx)-> tx.transaction_log.id == transaction.transaction_log.id)
          onTransactionsChange(ctrl.pagination.total -= 1)
          $q.when(success: true)
        (err)->
          # TODO: display error alert
          $q.when(success: false)
      )

    ctrl.onReconcileTransactions = ({transaction, matches, apps})->
      ctrl.reconcileData =
        transaction: transaction
        matches: matches
        apps: apps
      ctrl.reconciling = true
      ctrl.onReconciling(EventEmitter(isReconciling: true)) if ctrl.onReconciling

    ctrl.onTransactionReconciled = (args)->
      ctrl.reconcileData = null
      ctrl.reconciling = false
      ctrl.onReconciling(EventEmitter(isReconciling: false)) if ctrl.onReconciling
      return unless args?
      # Restore full transaction object
      transaction = _.find(ctrl.transactions, (tx) -> tx.transaction_log.id == args.txId)
      return unless transaction? # TODO: display error alert
      TransacTxsService.merge(
        transaction.links.merge
        transaction.transaction_log.resource_type
        args.mergeParams
      ).then(
        (response)->
          # TODO: display success alert
          # TODO: move to store
          ctrl.transactions = _.reject(ctrl.transactions, (tx)->
            tx.transaction_log.id == transaction.transaction_log.id
          )
          onTransactionsChange(ctrl.pagination.total -= 1)
          $q.when(success: true)
        (err)->
          # TODO: display error alert
          $q.when(success: false)
      )

    # Private

    loadTxs = (params=null, type=ctrl.txsType)->
      ctrl.loading = true
      params ||= ctrl.cachedParams || ctrl.pagination.defaultParams
      # TODO: move to store
      TransacTxsService.get(type, params: params).then(
        (response)->
          ctrl.transactions = ctrl.transactions.concat(response.transactions)
          ctrl.pagination.total = response.pagination.total
          ctrl.cacheParams = null
          onTransactionsChange()
        (error)->
          ctrl.pagination.total = 0
        # TODO: display error alert
      )
      .finally(-> ctrl.loading = false)

    onTransactionsChange = (txsCount=ctrl.pagination.total)->
      return if _.isUndefined(ctrl.onTransactionsChange)
      ctrl.onTransactionsChange(
        EventEmitter({"#{ctrl.txsType}TxsCount": txsCount})
      )


    return
})
