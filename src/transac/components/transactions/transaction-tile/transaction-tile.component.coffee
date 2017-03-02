angular.module('transac.transactions').component('transactionTile', {
  bindings: {
    transaction: '<'
    checked: '<'
    onSelect: '&'
  },
  templateUrl: 'components/transactions/transaction-tile',
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->

    ctrl.onSelectTx = ()->
      ctrl.onSelect(EventEmitter(tx: ctrl.transaction))

    ctrl.onSelectTxField = ->
      # ctrl.onSelect(EventEmitter(tx: ctrl.transaction, attrs: {}))

    return

})
