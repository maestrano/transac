angular.module('transac.transactions').component('transaction', {
  bindings: {
    transaction: '<'
    onCommit: '&'
    onReconcile: '&'
  }
  templateUrl: 'components/transactions/transaction'
  controller: (TransactionsService, EventEmitter)->
    ctrl = this

    # Action Recipies
    # “approve all the time” = `commit: true, auto_commit: true, push_disabled: false, pull_disabled: false`
    # “approve once” = `commit: true, auto_commit: false, push_disabled: false, pull_disabled: false`
    # “never share this record” = `commit: false, auto_commit: false, push_disabled: true, pull_disabled: false`
    # “deny once” = `commit: false, auto_commit: false, push_disabled: false, pull_disabled: false`

    ctrl.$onInit = ->
      # Prepare transaction changes hash for display
      ctrl.changes = TransactionsService.flattenObject(ctrl.transaction.changes)
      # Select to share with all apps by default
      _.each(ctrl.transaction.mappings, (m)-> m.sharedWith = true)
      # Match transaction for potential duplicates
      # TODO: Move to API
      TransactionsService.matches(ctrl.transaction.links.matches).then(
        (transactions)->
          ctrl.matches = transactions
        (error)->
          # handle error
      )

    ctrl.title = ()->
      TransactionsService.formatTitle(ctrl.transaction)

    ctrl.matchTitle = (transaction)->
      TransactionsService.formatMatchTitle(transaction)

    ctrl.hasMatches = ->
      ctrl.matches && ctrl.matches.length

    ctrl.selectOnClick = ()->
      ctrl.isSelected = !ctrl.isSelected

    ctrl.approveOnClick = (auto=false)->
      _.each(ctrl.transaction.mappings, (m)->
        m.commit = m.sharedWith
        # note: Connec! automatically sets auto_commit to false if commit is false
        m.auto_commit = auto
        return
      )
      # TODO: move to transactions.component
      TransactionsService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)
      ctrl.onCommit(
        EventEmitter({ transaction: ctrl.transaction })
      )

    ctrl.denyOnClick = (auto=false)->
      _.each(ctrl.transaction.mappings, (m)->
        m.commit = !m.sharedWith
        # note: Connec! automatically sets push_disable to false if commit is true
        m.push_disabled = auto
        return
      )
      # TODO: move to transactions.component
      TransactionsService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings)
      ctrl.onCommit(
        EventEmitter({ transaction: ctrl.transaction })
      )

    ctrl.reconcileOnClick = ()->
      return unless ctrl.hasMatches()
      # Prepare transaction for reconciliation
      transaction = angular.merge({}, ctrl.transaction.transaction_log, ctrl.transaction.changes)
      ctrl.onReconcile(
        EventEmitter({
          transaction: transaction
          matches: ctrl.matches
          # TODO: should apps reflect the selections made in the transaction "shared with"
          # checkboxes? Should only commit: true apps be included?
          apps: _.map(ctrl.transaction.mappings, (m)-> m.app_name)
        })
      )

    ctrl.selectAppOnClick = ($event, mapping)->
      mapping.sharedWith = !mapping.sharedWith

    return
})
