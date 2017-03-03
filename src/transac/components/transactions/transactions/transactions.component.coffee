angular.module('transac.transactions').component('transactions', {
  bindings: {
    onTransactionsChange: '&'
    onReconciling: '&'
  }
  templateUrl: 'components/transactions/transactions'
  controller: (EventEmitter, TransactionsService)->
    ctrl = this

    ctrl.$onInit = ->
      ctrl.reconciling = false
      ctrl.loading = true
      # TODO: move to store
      TransactionsService.get().then(
        (response)->
          ctrl.transactions = response.transactions
          ctrl.onTransactionsChange(
            EventEmitter({ count: ctrl.transactions.length })
          )
        (error)->
          # TODO: display error alert
      )
      .finally(-> ctrl.loading = false)

    ctrl.onTransactionCommit = ({transaction})->
      # TODO: move to transactions.component
      TransactionsService.commit(
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
        transaction: TransactionsService.formatChanges(transaction)
        matches: _.map(matches, (m)-> TransactionsService.formatChanges(m))
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
      TransactionsService.merge(
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

    return
})
