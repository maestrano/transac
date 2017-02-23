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
      ctrl.transactionsCount = 0

    ctrl.onTopBarSelectMenu = ({menu})->
      console.log('selected menu: ', menu)

    ctrl.updateTransactionsCount = ({count})->
      ctrl.transactionsCount = count

    return
})
