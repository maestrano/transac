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
      ctrl.isTopBarShown = true
      ctrl.transactionsCount = 0

    ctrl.onTopBarSelectMenu = ({menu})->
      console.log('selected menu: ', menu)

    ctrl.updateTransactionsCount = ({count, topbar})->
      ctrl.transactionsCount = count

    ctrl.toggleTopBar = ({isReconciling})->
      ctrl.isTopBarShown = !isReconciling

    return
})
