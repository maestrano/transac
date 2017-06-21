###
#   @desc Displays a horizontal Transaction list item, expandable details section on click, and actions to reconcile the transaction.
#   @require transac-tx-changes component.
#   @binding {Object} [transaction] A transaction
#   @binding {Function} [onCommit] Callback fired on commit transaction (approve or deny)
#   @binding {Function} [onReconcile] Callback fired on reconcile matches found (potential dups)
###
angular.module('transac.transactions').component('transacTx', {
  bindings: {
    transaction: '<'
    historical: '<?'
    onCommit: '&'
    onReconcile: '&'
  }
  templateUrl: 'components/transactions/transaction'
  controller: ($element, $timeout, $document, $scope, EventEmitter, TransacTxsService, TransacAlertsService, TXS_EVENTS)->
    ctrl = this

    # Action Tx Mapping Recipies
    # “approve all the time” = `commit: true, auto_commit: true, push_disabled: false, pull_disabled: false`
    # “approve once” = `commit: true, auto_commit: false, push_disabled: false, pull_disabled: false`
    # “never share this record” = `commit: false, auto_commit: false, push_disabled: true, pull_disabled: false`
    # “deny once” = `commit: false, auto_commit: false, push_disabled: false, pull_disabled: false`

    ctrl.$onInit = ->
      ctrl.historical ||= false
      $element.addClass('historical') if ctrl.historical
      # Formats transaction changes for display
      ctrl.formattedChanges = TransacTxsService.formatAttributes(
        ctrl.transaction.changes
        ctrl.transaction.transaction_log.resource_type
      )
      # Add shareWith attribute to mappings, set to true by default (model for ng-checked).
      _.each(ctrl.transaction.mappings, (m)-> m.sharedWith = true)
      # Broadcasted from txs component on global 'Esc' key
      $scope.$on(TXS_EVENTS.closeAllTxs, ->
        ctrl.isSelected = false
      )

    ctrl.title = ()->
      TransacTxsService.formatTitle(ctrl.transaction)

    # E.g May 1, 2017 8:20am, from Xero to Vend, SaleForce, Quickbooks
    ctrl.subtitle = ()->
      action = ctrl.transaction.transaction_log.action.toLowerCase()
      date = _.get(ctrl.formattedChanges, "#{action}d_at")
      fromApps = _.compact(_.map(ctrl.transaction.mappings, (m)-> m.app_name if !m.pending))
      toApps = _.compact(_.map(ctrl.transaction.mappings, (m)-> m.app_name if m.pending))
      fromStr = "" + unless _.isEmpty(fromApps) then ", from #{fromApps.join(', ')}" else ""
      toStr = "" + unless _.isEmpty(toApps) || !fromStr then " to #{toApps.join(', ')}" else ""
      "#{date}#{fromStr}#{toStr}"

    ctrl.icon = ()->
      switch ctrl.transaction.transaction_log.action.toLowerCase()
        when 'create'
          'fa-plus-circle'
        when 'update'
          'fa-pencil-square'

    ctrl.getPendingMappings = ->
      _.select(ctrl.transaction.mappings, pending: true)

    # Transaction is flagged with matches (potential duplicates)
    ctrl.hasMatches = ->
      ctrl.transaction && ctrl.transaction.matching_records && ctrl.transaction.matching_records.length

    # Full matches objects were found, user can progress to reconcile screen.
    ctrl.canReconcileRecords = ->
      !_.isEmpty(ctrl.matches)

    ctrl.selectOnClick = ()->
      return if ctrl.historical
      ctrl.isSelected = !ctrl.isSelected
      if ctrl.isSelected
        # Scroll to expanded transaction
        angular.element($document[0].body).animate(scrollTop: $element.offset().top)
        # Query for full matches objects
        loadMatches()

    ctrl.approveOnClick = (auto=false)->
      # Animate the commiting action
      $element.addClass('commiting')
      # Set the mappings for each app
      _.each(ctrl.transaction.mappings, (m)->
        m.commit = m.sharedWith
        # note: Connec! automatically sets auto_commit to false if commit is false
        m.auto_commit = auto
        return
      )
      # Commit the transaction
      ctrl.onCommit(
        EventEmitter(transaction: ctrl.transaction, action: 'approve', auto: auto)
      ).then(null, (res)->
        # Reshow / animate the transaction if commit was unsuccessful
        $timeout(->
          $element.removeClass('commiting')
        , 300)
      )

    ctrl.denyOnClick = (auto=false)->
      # Animate the commiting action
      $element.addClass('commiting')
      # Set the mappings for each app
      _.each(ctrl.transaction.commitingings, (m)->
        m.commit = !m.sharedWith
        # note: Connec! automatically sets push_disable to false if commit is true
        m.push_disabled = auto
        return
      )
      # Commit the transaction
      ctrl.onCommit(
        EventEmitter(transaction: ctrl.transaction, action: 'refuse', auto: auto)
      ).then(null, (res)->
        # Reshow / animate the transaction if commit was unsuccessful
        $timeout(->
          $element.removeClass('commiting')
        , 300)
      )

    ctrl.reconcileOnClick = ()->
      return unless ctrl.hasMatches() && ctrl.canReconcileRecords()
      # Mark transaction as reconciling for scroll back to element on reconcile cancel
      $element.addClass('reconciling')
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


    # Private

    loadMatches = ->
      return unless _.isEmpty(ctrl.matches)
      TransacTxsService.matches(
        ctrl.transaction.matching_records,
        ctrl.transaction.transaction_log.resource_type
      ).then(
        (response)->
          ctrl.matches = response.matches
        ->
          TransacAlertsService.send('error', 'Failed to load potential duplicates', 'Error')
      )

    return
})
