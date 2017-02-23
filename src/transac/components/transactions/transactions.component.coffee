#
# Transactions Component
#
angular.module('transac.transactions').component('transactions', {
  bindings: {
  }
  templateUrl: 'components/transactions'
  controller: (TransactionsService, $timeout)->
    ctrl = this

    ctrl.$onInit = ->
      TransactionsService.getPendingTransactions().then(
        (transactionGroups)->
          ctrl.transactions = _.flatten(_.values(transactionGroups))
          console.log('transactions: ', ctrl.transactions)
        (error)->
          # display error message
      )

    ctrl.onTransactionCommit = ($event)->
      id = $event.transaction.transaction_log.id
      ctrl.transactions = _.reject(ctrl.transactions, (t)-> t.transaction_log.id == id)

    return
})
