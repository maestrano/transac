#
# Transactions Component
#
angular.module('transac.transactions').component('transactions', {
  bindings: {
  },
  templateUrl: 'components/transactions',
  controller: ()->
    this.transactions = [
      {name: 'First Transaction'}
      {name: 'Second Transaction'}
    ]

    return
})
