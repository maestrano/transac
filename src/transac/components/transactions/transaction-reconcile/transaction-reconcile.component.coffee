###
#   @desc Displays tx and tx matches side-by-side, responsibile for tx and tx attribute selection, emitting which tx / tx attributes should be merged.
#   @require transac-tx-tile component.
#   @binding {Object} [transaction] A formatted transaction (match transaction object structure).
#   @binding {Array<Object>} [matches] List of matches (potential dups).
#   @binding {Array<string>} [apps] List of applications the transaction will be published to.
#   @binding {Function} [onReconciled] Callback fired on publish reconcilations.
###
angular.module('transac.transactions').component('transacTxReconcile', {
  bindings: {
    transaction: '<'
    matches: '<'
    apps: '<'
    onReconciled: '&'
  },
  templateUrl: 'components/transactions/transaction-reconcile',
  controller: ($window, EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->
      $window.scrollTo(0, 0)
      ctrl.editing = true
      ctrl.transactions = [].concat(ctrl.transaction, ctrl.matches)
      ctrl.selectedTx = {}
      ctrl.txsSelectionMap = {}
      # Init select transaction checkbox model
      _.each(_.map(ctrl.transactions, (tx)-> tx.id), (id)->
        ctrl.txsSelectionMap[id] = false
        return
      )

    ctrl.onSelect = ({tx})->
      # Only one transactions can be selected at a time
      _.each(ctrl.txsSelectionMap, (v, k)->
        ctrl.txsSelectionMap[k] = false if k != tx.id
        return
      )
      ctrl.txsSelectionMap[tx.id] = true
      ctrl.selectedTx = _.find(ctrl.transactions, (tx)-> ctrl.txsSelectionMap[tx.id])

    ctrl.isTxChecked = (tx)->
      ctrl.txsSelectionMap[tx.id]

    ctrl.hasSelectedTx = ->
      !_.isEmpty(ctrl.selectedTx)

    ctrl.isTxDeselected = (tx)->
      ctrl.hasSelectedTx() && !ctrl.isTxChecked(tx)

    ctrl.isNextBtnShown = ->
      ctrl.editing && ctrl.hasSelectedTx()

    ctrl.next = ->
      return unless ctrl.isNextBtnShown()
      ctrl.selectedTxTitle = 'Reconciled Record'
      ctrl.selectedTxSubtitle = "will be updated in #{ctrl.apps.join(', ')}"
      ctrl.editing = false

    ctrl.publish = ->
      ctrl.onReconciled(
        EventEmitter(
          txId: ctrl.transaction.id
          mergeParams:
            ids: _.map(ctrl.matches, (m)-> m.id)
            # TODO: merge tx fields
        )
      )

    ctrl.back = ->
      if ctrl.editing then ctrl.onReconciled(EventEmitter(null)) else ctrl.editing = true

    return
})
