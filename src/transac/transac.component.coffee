#
# Transac! Root Component
#
angular.module('maestrano.transac').component('transac', {
  bindings: {
  },
  templateUrl: 'transac',
  controller: ()->
    ctrl = this

    ctrl.$onInit = ->
      ctrl.isMerging = false
      ctrl.transactionsCount = 0

    ctrl.toggleMergeComponent = ->
      ctrl.isMerging = !ctrl.isMerging

    ctrl.onTopBarSelectMenu = ({menu})->
      console.log('selected menu: ', menu)

    ctrl.updateTransactionsCount = ({count})->
      ctrl.transactionsCount = count

    ctrl.renderMergeComponent = (args)->
      console.log('renderMergeComponent: ', args)
      ctrl.isMerging = true
      ctrl.mergeData = args

    ctrl.renderTransactionsComponent = ({id, callback} = {})->
      ctrl.isMerging = false
      ctrl.mergeData = null
      callback(id) if callback && id

    return
})
