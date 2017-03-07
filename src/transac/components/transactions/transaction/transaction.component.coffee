angular.module('transac.transactions').component('transacTx', {
  bindings: {
    transaction: '<'
    onCommit: '&'
    onReconcile: '&'
  }
  templateUrl: 'components/transactions/transaction'
  controller: (EventEmitter, TransacTxsService)->
    ctrl = this

    # Action Tx Mapping Recipies
    # “approve all the time” = `commit: true, auto_commit: true, push_disabled: false, pull_disabled: false`
    # “approve once” = `commit: true, auto_commit: false, push_disabled: false, pull_disabled: false`
    # “never share this record” = `commit: false, auto_commit: false, push_disabled: true, pull_disabled: false`
    # “deny once” = `commit: false, auto_commit: false, push_disabled: false, pull_disabled: false`

    ctrl.$onInit = ->
      # Formats transaction changes for display
      ctrl.formattedChanges = TransacTxsService.formatAttributes(
        ctrl.transaction.changes
        ctrl.transaction.transaction_log.resource_type
      )
      # Select to share with all apps by default
      _.each(ctrl.transaction.mappings, (m)-> m.sharedWith = true)
      # Match transaction for potential duplicates
      # TODO: Move to API
      TransacTxsService.matches(
        ctrl.transaction.links.matches,
        ctrl.transaction.transaction_log.resource_type
      ).then(
        (response)->
          ctrl.matches = response.matches
        (err)->
          # TODO: display error alert
      )

    ctrl.title = ()->
      TransacTxsService.formatTitle(ctrl.transaction)

    ctrl.subtitle = ()->
      action = ctrl.transaction.transaction_log.action.toLowerCase()
      date = _.get(ctrl.formattedChanges, "#{action}d_at")
      fromApps = _.compact(_.map(ctrl.transaction.mappings, (m)-> m.app_name if !m.pending))
      toApps = _.compact(_.map(ctrl.transaction.mappings, (m)-> m.app_name if m.pending))
      "#{date}, from #{fromApps.join(', ')} to #{toApps.join(', ')}"

    ctrl.icon = ()->
      switch ctrl.transaction.transaction_log.action.toLowerCase()
        when 'create'
          'fa-plus-circle'
        when 'update'
          'fa-pencil-square'

    # ctrl.getTxDate = (action)->
    #   moment(_.get(ctrl.transaction.changes, "#{action}d_at")).format('MMM d, Y h:m')

    ctrl.matchTitle = (transaction)->
      TransacTxsService.formatMatchTitle(transaction)

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
      ctrl.onCommit(
        EventEmitter({ transaction: ctrl.transaction })
      )

    ctrl.reconcileOnClick = ()->
      return unless ctrl.hasMatches()
      # Prepare tx for reconciliation (formats the tx into same object structure as matches
      # to streamline the collection for display within the tx-reconcile cmp)
      transaction = angular.merge({}, ctrl.transaction.transaction_log, ctrl.transaction.changes)
      # Emit event to impac-txs cmp for binding to the impac-tx-reconcile cmp.
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
