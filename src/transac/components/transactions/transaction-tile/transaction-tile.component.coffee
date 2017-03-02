angular.module('transac.transactions').component('transactionTile', {
  bindings: {
    transaction: '<'
    checked: '<?'
    onSelect: '&?'
  },
  templateUrl: 'components/transactions/transaction-tile',
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->

    ctrl.isOnSelectDefined = ->
      !_.isUndefined(ctrl.onSelect)

    ctrl.onSelectTx = ()->
      return unless ctrl.isOnSelectDefined()
      ctrl.onSelect(EventEmitter(tx: ctrl.transaction))

    ctrl.onSelectTxField = ->
      # ctrl.onSelect(EventEmitter(tx: ctrl.transaction, attrs: {}))

    return

})
