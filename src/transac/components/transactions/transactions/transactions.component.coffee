###
#   @desc The root component of the transactions module. Responsible for displaying transactions and delegating requests to reconcile to the tx service.
#   @require transac-tx component
#   @require transac-tx-reconcile component
#   @require infinite-scroll directive (external)
#   @binding {string=} [txsType] The type of transactions to load, e.g 'pending', 'historical'
#   @binding {Object=} [filters] An object containing filters params to apply to load txs requests (Connec! api filter spec)
#   @binding {Function=} [onInit] Callback fired $onInit, emitting upward an api.
#   @binding {Function=} [onTransactionsChange] Callback fired on change to stored txs model
#   @binding {Function=} [onReconciling] Callback fired on reconcile tx with matches (dups)
#   @binding {Function=} [onLoadingChange] Callback fired when txs loading state is changed
###
angular.module('transac.transactions').component('transacTxs', {
  bindings: {
    txsType: '<?'
    filters: '<?'
    onInit: '&?'
    onTransactionsChange: '&?'
    onReconciling: '&?'
    onLoadingChange: '&?'
  }
  templateUrl: 'components/transactions/transactions'
  controller: ($q, EventEmitter, TransacTxsDispatcher, TransacTxsStore, TransacAlertsService)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.reconciling = false
      ctrl.onInit(EventEmitter(api: filterTxs: onFilterTxs)) if ctrl.onInit?
      initTxsState()
      TransacTxsDispatcher.loadTxs(type: ctrl.txsType).then(
        ->
          onTxsChange()
      )

    ctrl.loadMore = ->
      return if ctrl.isPaginationDisabled()
      TransacTxsDispatcher.paginateTxs(ctrl.pagination.next)

    ctrl.isPaginationDisabled = ->
      ctrl.loading || ctrl.reconciling || ctrl.noTxsFound() || ctrl.allTxsFound()

    ctrl.allTxsFound = ->
      !ctrl.loading && ctrl.transactions.length && (ctrl.transactions.length == ctrl.pagination.total)

    ctrl.noTxsFound = ->
      !ctrl.loading && !ctrl.transactions.length && !ctrl.pagination.total

    ctrl.onTransactionCommit = ({transaction, action, auto})->
      TransacTxsDispatcher.commitTx(
        transaction.links.commit
        transaction.transaction_log.resource_type
        transaction.mappings
      ).then(null,
        (err)->
          TransacAlertsService.send(err.message.type, "Failed to #{action} sharing of #{transaction.transaction_log.reference}")
          $q.reject(err)
        ()->
          phrase = if auto then "#{action}d ongoing sharing for" else "#{action}d sharing for"
          TransacAlertsService.send('success', "#{phrase} #{transaction.transaction_log.reference}")
          onTxsChange()
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
          TransacAlertsService.send(res.message.type, res.message.text)
          # Reload transactions, applying most current filters.
          TransacTxsDispatcher.reloadTxs(ctrl.txsType, ctrl.filters)
          res
        (err)->
          TransacAlertsService.send(err.message.type, err.message.text)
          $q.reject(err)
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
      ctrl.loading = TransacTxsStore.getState().loading
      TransacTxsStore.subscribe().then(null, null, (state)->
        # Redefine state
        ctrl.txsType = state.txsType
        ctrl.transactions = state.transactions
        ctrl.pagination = state.pagination
        ctrl.loading = state.loading
        # Emit state changes to parent cmps
        ctrl.onLoadingChange(EventEmitter(loading: ctrl.loading))
      )

    onFilterTxs = (type, params)->
      TransacTxsDispatcher.reloadTxs(type, params).then(
        ->
          onTxsChange()
      )

    # For controlled emitting of the pagination total (as opposed to triggering on state change)
    onTxsChange = ->
      ctrl.onTransactionsChange(
        EventEmitter("#{ctrl.txsType}": ctrl.pagination.total)
      ) unless _.isUndefined(ctrl.onTransactionsChange)

    return
})
