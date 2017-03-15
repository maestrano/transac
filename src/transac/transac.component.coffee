###
#   @desc Transac! Root Component - embeds the library feature components.
###
angular.module('maestrano.transac').component('transac', {
  bindings: {
  },
  templateUrl: 'transac',
  controller: (TransacUserService, TransacTxsDispatcher)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.transacReady = false
      ctrl.isTopBarShown = true
      ctrl.pendingTxsCount = 0
      ctrl.historyTxCount = 0
      loadUser()

    ctrl.onTopBarSelectMenu = ({menu})->
      TransacTxsDispatcher.reloadTxs(menu.type)

    ctrl.onTopBarSearch = ({query, selectedMenu})->
      params = if query then $filter: query else null
      TransacTxsDispatcher.reloadTxs(selectedMenu.type, params, true)

    ctrl.updateTransactionsCount = ({pendingTxsCount, historyTxsCount})->
      ctrl.pendingTxsCount = pendingTxsCount
      ctrl.historyTxsCount = historyTxsCount

    ctrl.toggleTopBar = ({isReconciling})->
      ctrl.isTopBarShown = !isReconciling

    # Private

    loadUser = ->
      TransacUserService.fetch().then(null,
        (err)->
          # TODO: display alert
          # TODO: display error message
          ctrl.transacLoadError = true
      )
      .finally(-> ctrl.transacReady = true)

    return
})
