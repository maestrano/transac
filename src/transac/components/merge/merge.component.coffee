#
# Transac! Root Component
#
angular.module('transac.merge').component('merge', {
  bindings: {
    mergeData: '<'
    onMergeComplete: '&'
  },
  templateUrl: 'components/merge',
  controller: (EventEmitter, TransactionsService)->
    ctrl = this

    ctrl.$onInit = ->
      console.log('mergeData: ', ctrl.mergeData)
      transactions = [].concat(ctrl.mergeData.transaction, ctrl.mergeData.matches)
      # TODO: refactor
      ctrl.transactions = _.each(transactions, (t) ->
        # TODO: move accepted attrs to constant by entity
        accepted_changes = _.pick(t, ['name', 'status', 'address', 'email', 'phone', 'referred_leads', 'website'])
        t.formatted = TransactionsService.flattenChanges(accepted_changes)
      )
      ctrl.editing = true

    ctrl.next = ->
      ctrl.editing = false

    ctrl.publish = ->
      ctrl.onMergeComplete(
        EventEmitter({
          id: ctrl.mergeData.transaction.id
          callback: ctrl.mergeData.callback
        })
      )

    ctrl.back = ->
      ctrl.onMergeComplete(EventEmitter(null))

    return
})
