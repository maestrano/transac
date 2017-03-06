angular.module('transac.transactions').component('transacTxChanges', {
  bindings: {
    changes: '<'
    onSelect: '&?'
  }
  templateUrl: 'components/transactions/transaction-changes'
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->

    return
})
