###
#   @desc Transac! Root Component - embeds the library feature components.
###
angular.module('maestrano.transac').component('transac', {
  bindings: {
  },
  templateUrl: 'transac',
  controller: (TransacUserService)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.transacReady = false
      ctrl.isTopBarShown = true
      ctrl.pendingTxsCount = 0
      ctrl.historyTxCount = 0
      loadUser()

    ctrl.onTxsComponentInit = ({api})->
      ctrl.txsCmpApi = api

    ctrl.onTopBarSelectMenu = ({menu})->
      ctrl.txsCmpApi.reloadTxs(menu.type)

    ctrl.onTopBarSearch = ({query, selectedMenu})->
      params = if query then $filter: query else null
      ctrl.txsCmpApi.reloadTxs(selectedMenu.type, params)

    ctrl.updateTransactionsCount = ({pendingTxsCount, historyTxsCount})->
      ctrl.pendingTxsCount = pendingTxsCount
      ctrl.historyTxsCount = historyTxsCount

    ctrl.toggleTopBar = ({isReconciling})->
      ctrl.isTopBarShown = !isReconciling

    # Private

    loadUser = ->
      TransacUserService.fetch().then(null,
        (err)->
          ctrl.transacLoadError = true
      )
      .finally(-> ctrl.transacReady = true)

    return
})
