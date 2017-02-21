#
# Transaction Component
#
angular.module('transac.transaction').component('transaction', {
  bindings: {
    transaction: '<'
  }
  templateUrl: 'components/transactions/transaction'
  controller: (TransactionService)->
    ctrl = this

    ctrl.$onInit = ->

    ctrl.title = ()->
      TransactionService.formatTitle(ctrl.transaction)

    ctrl.expandDetailsOnClick = ()->
      ctrl.isDetailExpanded = !ctrl.isDetailExpanded

    ctrl.commitOnClick = ()->
      mappings = ctrl.transaction.mappings
      console.log('commit click!', mappings)
      TransactionService.commit(ctrl.transaction.links.commit, mappings)

    ctrl.denyOnClick = ()->
      mappings = ctrl.transaction.mappings
      console.log('deny click!', mappings)

    return
})
