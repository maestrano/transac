#
# Transactions Component
#
angular.module('transac.transactions').component('transactions', {
  bindings: {
    onTransactionsChange: '&'
    onMergeDuplicates: '&'
  }
  templateUrl: 'components/transactions'
  controller: (TransactionsService, EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->
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

    ctrl.onTransactionMerge = (args)->
      # TODO: callback not needed when connected to API (use ng-if in transac.html
      # instead of ng-show)
      angular.merge(args, callback: (id)->
        ctrl.transactions = _.reject(ctrl.transactions, (t)-> t.transaction_log.id == id)
      )
      ctrl.onMergeDuplicates(EventEmitter(args))

    return
})
