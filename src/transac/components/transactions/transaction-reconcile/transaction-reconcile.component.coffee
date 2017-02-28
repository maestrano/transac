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
      ctrl.duplicates = [].concat(ctrl.transaction, ctrl.matches)

    ctrl.next = ->
      ctrl.editing = false

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
