#
# Transac! Root Component
#
angular.module('transac.merge').component('merge', {
  bindings: {
    mergeData: '<'
    onMergeComplete: '&'
  },
  templateUrl: 'components/merge',
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->

    ctrl.publish = ->
      ctrl.onMergeComplete(
        EventEmitter({
          id: ctrl.mergeData.transaction.transaction_log.id
          callback: ctrl.mergeData.callback
        })
      )

    return
})
