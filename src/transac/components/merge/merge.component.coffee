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
      console.log('mergeData: ', ctrl.mergeData)
      ctrl.transactions = [].concat(ctrl.mergeData.transaction, ctrl.mergeData.matches)
      # ctrl.transactions = [1,2,3,4,5,6]
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
