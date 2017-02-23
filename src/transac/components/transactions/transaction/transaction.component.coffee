#
# Transaction Component
#
angular.module('transac.transaction').component('transaction', {
  bindings: {
    transaction: '<'
    onCommit: '&'
  }
  templateUrl: 'components/transactions/transaction'
  controller: (TransactionService, EventEmitter)->
    ctrl = this

    # Action Recipies
    # “approve all the time” = `commit: true, auto_commit: true, push_disabled: false, pull_disabled: false`
    # “approve once” = `commit: true, auto_commit: false, push_disabled: false, pull_disabled: false`
    # “never share this record” = `commit: false, auto_commit: false, push_disabled: true, pull_disabled: false`
    # “deny once” = `commit: false, auto_commit: false, push_disabled: false, pull_disabled: false`

    ctrl.$onInit = ->
      # Prepare transaction changes hash for display
      ctrl.changes = TransactionService.flattenChanges(ctrl.transaction.changes)
      # Select to share with all apps by default
      _.each(ctrl.transaction.mappings, (m)-> m.sharedWith = true)
      # Match transaction for potential duplicates
      TransactionService.matches(ctrl.transaction.links.matches).then(
        (transactions)->
          ctrl.matches = transactions
        (error)->
          # handle error
      )

    ctrl.title = ()->
      TransactionService.formatTitle(ctrl.transaction)

    ctrl.matchTitle = (transaction)->
      TransactionService.formatMatchTitle(transaction)

    ctrl.hasMatches = ->
      ctrl.matches && ctrl.matches.length

    ctrl.selectOnClick = ()->
      ctrl.isSelected = !ctrl.isSelected

    ctrl.approveOnClick = (auto=false)->
      # TODO: should auto_commit be force set false when m.commit is false?
      _.each(ctrl.transaction.mappings, (m)->
        m.commit = m.sharedWith
        m.auto_commit = auto
        return
      )
      TransactionService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)
      ctrl.onCommit(
        EventEmitter({ transaction: ctrl.transaction })
      )

    ctrl.denyOnClick = (auto=false)->
      # TODO: should push_disabled be force set false when m.commit is true?
      _.each(ctrl.transaction.mappings, (m)->
        m.commit = !m.sharedWith
        m.push_disabled = auto
        return
      )
      TransactionService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)
      ctrl.onCommit(
        EventEmitter({ transaction: ctrl.transaction })
      )

    ctrl.mergeOnClick = ()->
      console.log('merge view!')

    ctrl.selectAppOnClick = ($event, mapping)->
      mapping.sharedWith = !mapping.sharedWith

    return
})
