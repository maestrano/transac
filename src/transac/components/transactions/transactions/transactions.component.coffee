###
#   @desc The root component of the transactions module. Responsible for displaying transactions and delegating requests to reconcile to the tx service.
#   @require transac-tx component
#   @require transac-tx-reconcile component
#   @require infinite-scroll directive (external)
#   @binding {Function} [onTransactionsChange] Callback fired on change to stored txs model
#   @binding {Function} [onReconciling] Callback fire on reconcile tx with matches (dups)
###
angular.module('transac.transactions').component('transacTxs', {
  bindings: {
    onTransactionsChange: '&'
    onReconciling: '&'
  }
  templateUrl: 'components/transactions/transactions'
  controller: (EventEmitter, TransacTxsService)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.reconciling = false
      ctrl.pagination =
        nbItems: 10
        page: 1
      ctrl.transactions = []
      loadTxs($skip: 0, $top: ctrl.pagination.nbItems)

    ctrl.loadMoreTransactions = ->
      ctrl.pagination.page += 1
      offset = (ctrl.pagination.page - 1) * ctrl.pagination.nbItems
      loadTxs($skip: offset, $top: ctrl.pagination.nbItems)

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
          ctrl.onTransactionsChange(
            EventEmitter({ count: ctrl.transactions.length })
          )
        (err)->
          # TODO: display error alert
      )

    ctrl.onReconcileTransactions = ({transaction, matches, apps})->
      ctrl.reconcileData =
        transaction: transaction
        matches: matches
        apps: apps
      ctrl.reconciling = true
      ctrl.onReconciling(EventEmitter(isReconciling: true))

    ctrl.onTransactionReconciled = (args)->
      ctrl.reconcileData = null
      ctrl.reconciling = false
      ctrl.onReconciling(EventEmitter(isReconciling: false))
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
          ctrl.onTransactionsChange(
            EventEmitter({ count: ctrl.transactions.length })
          )
        (err)->
          # TODO: display error alert
      )

    # Private

    loadTxs = (params)->
      ctrl.loading = true
      # TODO: move to store
      TransacTxsService.get('pending', params: params).then(
        (response)->
          ctrl.transactions = ctrl.transactions.concat(response.transactions)
          ctrl.onTransactionsChange(
            EventEmitter({ count: ctrl.transactions.length })
          )
        (error)->
        # TODO: display error alert
      )
      .finally(-> ctrl.loading = false)

    return
})
