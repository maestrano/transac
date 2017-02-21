#
# Transactions Component
#
angular.module('transac.transactions').component('transactions', {
  bindings: {
  }
  templateUrl: 'components/transactions'
  controller: (TransactionsService)->
    ctrl = this

    ctrl.$onInit = ->
      TransactionsService.getPendingTransactions().then(
        (transactionGroups)->
          ctrl.transactions = _.flatten(_.values(transactionGroups))
          console.log('transactions: ', ctrl.transactions)
        (error)->
          # display error message
      )

    return
})
