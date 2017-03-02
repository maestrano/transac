angular.module('transac.transactions').component('transactionReconcile', {
  bindings: {
    transaction: '<'
    matches: '<'
    onReconciled: '&'
  },
  templateUrl: 'components/transactions/transaction-reconcile',
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->
      ctrl.editing = true
      ctrl.transactions = [].concat(ctrl.transaction, ctrl.matches)
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
      ctrl.txsSelectionMap[tx.id] = !ctrl.txsSelectionMap[tx.id]

    ctrl.isTxChecked = (tx)->
      ctrl.txsSelectionMap[tx.id]

    ctrl.next = ->
      ctrl.editing = false
      ctrl.selectedTx = _.find(ctrl.transactions, (tx)-> ctrl.txsSelectionMap[tx.id])
      console.log('selectedTx', ctrl.selectedTx)

    ctrl.publish = ->
      ctrl.onReconciled(
        EventEmitter(
          id: ctrl.transaction.id
          matches: _.map(ctrl.matches, (m)-> m.id)
          attributes: {}
        )
      )

    ctrl.back = ->
      if ctrl.editing then ctrl.onReconciled(EventEmitter(null)) else ctrl.editing = true

    return
})
