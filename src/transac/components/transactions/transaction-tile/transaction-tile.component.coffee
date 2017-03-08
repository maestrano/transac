###
#   @desc A 'tile' shaped transaction card for viewing tx / match tx changes and selecting the tx / tx attributes.
#   @require transac-tx-changes component.
#   @binding {object} [transaction] A formatted transaction object (match transaction object structure).
#   @binding {string=} [title] Tx tile topbar title.
#   @binding {string=} [subtitle] Tx tile topbar subtitle.
#   @binding {boolean=} [checked] Bind whether the transaction is checked.
#   @binding {Function=} [onSelect] Callback event fired on tx-tile topbar click.
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
      ctrl.subtitle ||= ctrl.buildSubtitle()
      ctrl.formattedTxAttrs = TransacTxsService.formatAttributes(ctrl.transaction, ctrl.transaction.resource_type)

    ctrl.buildSubtitle = ->
      # For when transaction is a transaction
      return "From #{ctrl.transaction.app_name}" if ctrl.transaction.app_name
      # For when transaction is a match
      matchTxLogs = ctrl.transaction.transaction_logs
      if _.isEmpty(matchTxLogs) then '' else "From #{matchTxLogs[0].app_name}"

    ctrl.isOnSelectDefined = ->
      !_.isUndefined(ctrl.onSelect)

    ctrl.onSelectTx = ()->
      return unless ctrl.isOnSelectDefined()
      ctrl.onSelect(EventEmitter(tx: ctrl.transaction))

    ctrl.onSelectTxField = ->
      # ctrl.onSelect(EventEmitter(tx: ctrl.transaction, attrs: {}))

    return

})
