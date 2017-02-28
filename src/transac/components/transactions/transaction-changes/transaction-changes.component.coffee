angular.module('transac.transactions').component('transactionChanges', {
  bindings: {
    changes: '<'
    onSelectAll: '&?'
    onSelect: '&?'
  }
  templateUrl: 'components/transactions/transaction-changes'
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->

    return
})
