###
#   @desc A 'tile' shaped transaction card for viewing tx changes and selecting the tx.
#   @component requires transac-tx-changes.
#   @binding {object} [transaction] A formatted transaction object (match transaction object structure).
#   @binding {string=} [title] Tx tile topbar title.
#   @binding {string=} [subtitle] Tx tile topbar subtitle.
#   @binding {boolean=} [checked] Bind whether the transaction is checked.
#   @binding {function=} [onSelect] Callback event fired on tx-tile topbar click.
###
angular.module('transac.transactions').component('transacTxTile', {
  bindings: {
    transaction: '<'
    title: '<?'
    subtitle: '<?'
    checked: '<?'
    onSelect: '&?'
  },
  templateUrl: 'components/transactions/transaction-tile',
  controller: (EventEmitter, TransacTxsService)->
    ctrl = this

    ctrl.$onInit = ->
      ctrl.title ||= 'Transaction'
      ctrl.subtitle ||= if ctrl.transaction.app_name then "From #{ctrl.transaction.app_name}" else ''
      ctrl.formattedTxAttrs = TransacTxsService.formatAttributes(ctrl.transaction, ctrl.transaction.resource_type)

    ctrl.isOnSelectDefined = ->
      !_.isUndefined(ctrl.onSelect)

    ctrl.onSelectTx = ()->
      return unless ctrl.isOnSelectDefined()
      ctrl.onSelect(EventEmitter(tx: ctrl.transaction))

    ctrl.onSelectTxField = ->
      # ctrl.onSelect(EventEmitter(tx: ctrl.transaction, attrs: {}))

    return

})
