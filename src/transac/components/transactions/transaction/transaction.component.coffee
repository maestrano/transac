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

    ctrl.approveOnClick = (auto=false)->
      _.each(ctrl.transaction.mappings, (m)-> m.auto_commit = auto)
      TransactionService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)

    ctrl.denyOnClick = (auto=false)->
      _.each(ctrl.transaction.mappings, (m)->
        m.push_disabled = auto
        m.commit = false
      )
      TransactionService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)

    ctrl.mergeOnClick = ()->
      console.log('displaying merge view!')
      ctrl.displayMergeView = true

    ctrl.selectAppOnClick = ($event, mapping)->
      mapping.commit = !mapping.commit

    return
})
