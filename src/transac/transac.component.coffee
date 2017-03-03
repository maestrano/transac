#
# Transac! Root Component
#
angular.module('maestrano.transac').component('transac', {
  bindings: {
  },
  templateUrl: 'transac',
  controller: (TransacUserService)->
    ctrl = this

    loadUser = ->
      TransacUserService.fetch().then(
        (user)->
          ctrl.transacReady = true
          console.log(user)
        (err)->
          ctrl.transacReady = true
          ctrl.transacLoadError = true
      )

    ctrl.$onInit = ->
      ctrl.transacReady = false
      ctrl.isTopBarShown = true
      ctrl.transactionsCount = 0
      loadUser()

    ctrl.onTopBarSelectMenu = ({menu})->
      console.log('selected menu: ', menu)

    ctrl.updateTransactionsCount = ({count, topbar})->
      ctrl.transactionsCount = count

    ctrl.toggleTopBar = ({isReconciling})->
      ctrl.isTopBarShown = !isReconciling

    return
})
