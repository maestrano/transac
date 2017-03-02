angular.module('transac.transactions').component('transactionTile', {
  bindings: {
    transaction: '<'
    title: '<?'
    subtitle: '<?'
    checked: '<?'
    onSelect: '&?'
  },
  templateUrl: 'components/transactions/transaction-tile',
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->
      ctrl.title ||= 'Transaction'
      ctrl.subtitle ||= if ctrl.transaction.app_name then "From #{ctrl.transaction.app_name}" else ''

    ctrl.isOnSelectDefined = ->
      !_.isUndefined(ctrl.onSelect)

    ctrl.onSelectTx = ()->
      return unless ctrl.isOnSelectDefined()
      ctrl.onSelect(EventEmitter(tx: ctrl.transaction))

    ctrl.onSelectTxField = ->
      # ctrl.onSelect(EventEmitter(tx: ctrl.transaction, attrs: {}))

    return

})
