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
      # Prepare transaction changes hash for display
      ctrl.changes = TransactionService.flattenChanges(ctrl.transaction.changes)
      # Set default commit for each mapping to true
      _.each(ctrl.transaction.mappings, (m)-> m.commit = true)

    ctrl.title = ()->
      TransactionService.formatTitle(ctrl.transaction)

    ctrl.selectOnClick = ()->
      ctrl.isSelected = !ctrl.isSelected

    ctrl.commitOnClick = (auto=false)->
      console.log('commit click!', auto, ctrl.transaction.mappings)
      TransactionService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)

    ctrl.denyOnClick = (auto=false)->
      console.log('deny click! ', auto, ctrl.transaction.mappings)

    ctrl.mergeOnClick = ()->
      console.log('merge click! ', ctrl.transaction.mappings)

    ctrl.selectAppOnClick = ($event, mapping)->
      mapping.commit = !mapping.commit
      console.log('select app!', mapping)

    return
})
