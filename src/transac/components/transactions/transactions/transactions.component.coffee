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
  controller: ($q, EventEmitter, TransacTxsService, TransacTxsActions, TransacTxsStore)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.txsType ||= 'pending'
      ctrl.reconciling = false
      initState()
      TransacTxsActions.loadTxs(ctrl.txsType).then(()->
        onTransactionsChange()
      )
      # Provide parent component with an api
      ctrl.onInit(EventEmitter(api: reloadTxs: ctrl.reload)) if ctrl.onInit?

    ctrl.loadMore = ->
      return TransacTxsActions.loadTxs(ctrl.txsType, ctrl.cachedParams) if ctrl.isPaginationDisabled()
      TransacTxsActions.paginateTxs(ctrl.txsType)

    ctrl.reload = (type=ctrl.txsType, params, cacheParams=false)->
      ctrl.txsType = type
      TransacTxsActions.reloadTxs(type, params, cacheParams)

    ctrl.isPaginationDisabled = ->
      ctrl.loading || !ctrl.pagination.total || ctrl.reconciling

    ctrl.onTransactionCommit = ({transaction})->
      TransacTxsActions.commitTx(
        transaction.links.commit
        transaction.transaction_log.resource_type
        transaction.mappings
      ).then(
        (res)->
          # TODO: display success alert
          onTransactionsChange()
          $q.when(success: res.success)
        (err)->
          # TODO: display error alert
          $q.when(success: false, message: err.message)
      )

    ctrl.onReconcileTransactions = ({transaction, matches, apps})->
      # data bound to tx-reconcile component
      ctrl.reconcileData =
        transaction: transaction
        matches: matches
        apps: apps
      ctrl.reconciling = true
      ctrl.onReconciling(EventEmitter(isReconciling: true)) if ctrl.onReconciling

    ctrl.onTransactionReconciled = (args)->
      TransacTxsActions.mergeTxs(args).then(
        (res)->
          TransacTxsActions.reloadTxs(ctrl.type)
          $q.when(success: res.success)
        (err)->
          # TODO: display error alert
          $q.when(success: false, message: err.message)
      ).finally(->
        ctrl.reconcileData = null
        ctrl.reconciling = false
        ctrl.onReconciling(EventEmitter(isReconciling: false)) if ctrl.onReconciling
      )

    # Private

    initState = ->
      ctrl.transactions = TransacTxsStore.getState().transactions
      ctrl.pagination = TransacTxsStore.getState().pagination
      ctrl.cachedParams = TransacTxsStore.getState().cachedParams
      ctrl.loading = TransacTxsStore.getState().loading
      TransacTxsStore.subscribe().then(null, null, (state)->
        ctrl.transactions = state.transactions
        ctrl.pagination = state.pagination
        ctrl.cachedParams = state.cachedParams
        ctrl.loading = state.loading
      )

    onTransactionsChange = (txsCount=ctrl.pagination.total)->
      return if _.isUndefined(ctrl.onTransactionsChange)
      ctrl.onTransactionsChange(
        EventEmitter({"#{ctrl.txsType}TxsCount": txsCount})
      )

    return
})
