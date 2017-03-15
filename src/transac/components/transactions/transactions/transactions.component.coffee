###
#   @desc The root component of the transactions module. Responsible for displaying transactions and delegating requests to reconcile to the tx service.
#   @require transac-tx component
#   @require transac-tx-reconcile component
#   @require infinite-scroll directive (external)
#   @binding {Function=} [onTransactionsChange] Callback fired on change to stored txs model
#   @binding {Function=} [onReconciling] Callback fired on reconcile tx with matches (dups)
###
angular.module('transac.transactions').component('transacTxs', {
  bindings: {
    txsType: '<?'
    onTransactionsChange: '&?'
    onReconciling: '&?'
  }
  templateUrl: 'components/transactions/transactions'
  controller: ($q, EventEmitter, TransacTxsDispatcher, TransacTxsStore)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.reconciling = false
      initTxsState()
      TransacTxsStore.dispatch('setTxsType', ctrl.txsType) if ctrl.txsType?
      TransacTxsDispatcher.loadTxs(ctrl.txsType).then(->
        emitTxsStateChange()
      )

    ctrl.loadMore = ->
      return TransacTxsDispatcher.loadTxs(ctrl.txsType, ctrl.cachedParams) if ctrl.isPaginationDisabled()
      TransacTxsDispatcher.paginateTxs(ctrl.txsType)

    ctrl.isPaginationDisabled = ->
      ctrl.loading || !ctrl.pagination.total || ctrl.reconciling

    ctrl.onTransactionCommit = ({transaction})->
      TransacTxsDispatcher.commitTx(
        transaction.links.commit
        transaction.transaction_log.resource_type
        transaction.mappings
      ).then(
        (res)->
          # TODO: display success alert
          $q.when(success: res.success)
        (err)->
          # TODO: display error alert
          $q.when(success: false, message: err.message)
        (res)->
          emitTxsStateChange()
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
      TransacTxsDispatcher.mergeTxs(args).then(
        (res)->
          TransacTxsDispatcher.reloadTxs(ctrl.type)
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

    initTxsState = ->
      ctrl.txsType = TransacTxsStore.getState().txsType
      ctrl.transactions = TransacTxsStore.getState().transactions
      ctrl.pagination = TransacTxsStore.getState().pagination
      ctrl.cachedParams = TransacTxsStore.getState().cachedParams
      ctrl.loading = TransacTxsStore.getState().loading
      TransacTxsStore.subscribe().then(null, null, (state)->
        ctrl.txsType = state.txsType
        ctrl.transactions = state.transactions
        ctrl.pagination = state.pagination
        ctrl.cachedParams = state.cachedParams
        ctrl.loading = state.loading
      )

    emitTxsStateChange = ->
      ctrl.onTransactionsChange(
        EventEmitter("#{ctrl.txsType}TxsCount": ctrl.pagination.total)
      ) unless _.isUndefined(ctrl.onTransactionsChange)

    return
})
