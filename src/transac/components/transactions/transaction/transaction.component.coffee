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
      ctrl.changes = TransactionService.flattenChanges(ctrl.transaction.changes)
      # set default commit for each mapping to true
      _.each(ctrl.transaction.mappings, (m)-> m.commit = true)

    ctrl.title = ()->
      TransactionService.formatTitle(ctrl.transaction)

    ctrl.selectOnClick = ()->
      ctrl.isSelected = !ctrl.isSelected

    ctrl.commitOnClick = ()->
      console.log('commit click!', ctrl.transaction.mappings)
      TransactionService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)

    ctrl.denyOnClick = ()->
      console.log('deny click!', ctrl.transaction.mappings)

    ctrl.selectAppOnClick = ($event, mapping)->
      mapping.commit = !mapping.commit
      console.log('select app!', mapping)

    return
})
