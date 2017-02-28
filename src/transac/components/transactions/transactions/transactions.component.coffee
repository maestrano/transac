#
# Transactions Component
#
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
      # TODO: move to store
      TransactionsService.get().then(
        (transactions)->
          ctrl.transactions = transactions
          ctrl.onTransactionsChange(
            EventEmitter({ count: ctrl.transactions.length })
          )
        (error)->
          # display error message
      )

    ctrl.onTransactionCommit = ({transaction})->
      # TODO: move to store
      ctrl.transactions = _.reject(ctrl.transactions, (t)-> t.transaction_log.id == transaction.transaction_log.id)
      ctrl.onTransactionsChange(
        EventEmitter({ count: ctrl.transactions.length })
      )

    ctrl.onReconcileTransactions = ({transaction, matches})->
      ctrl.reconcileData =
        transaction: TransactionsService.buildFormattedChanges(transaction)
        matches: _.map(matches, (m)-> TransactionsService.buildFormattedChanges(m))
      ctrl.reconciling = true
      ctrl.onReconciling(EventEmitter(isReconciling: true))

    ctrl.onTransactionReconciled = (args)->
      ctrl.reconcileData = null
      ctrl.reconciling = false
      ctrl.onReconciling(EventEmitter(isReconciling: false))
      return unless args?
      # TODO: move to store
      ctrl.transactions = _.reject(ctrl.transactions, (t)-> t.transaction_log.id == args.id)
      ctrl.onTransactionsChange(
        EventEmitter({ count: ctrl.transactions.length })
      )

    return
})
