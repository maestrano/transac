#
# Transactions Component
#
angular.module('transac.transactions').component('transactions', {
  bindings: {
    onTransactionsChange: '&'
  }
  templateUrl: 'components/transactions'
  controller: (TransactionsService, EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->
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
      ctrl.transactions = _.reject(ctrl.transactions, (t)-> t.transaction_log.id == transaction.transaction_log.id)
      ctrl.onTransactionsChange(
        EventEmitter({ count: ctrl.transactions.length })
      )

    return
})
