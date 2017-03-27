###
#   @desc Transac! Root Component - embeds the library feature components.
###
angular.module('maestrano.transac').component('transac', {
  bindings: {
  },
  templateUrl: 'transac',
  controller: (TransacUserService, TransacTxsDispatcher, TransacAlertsService)->
    ctrl = this

    # Public

    ctrl.$onInit = ->
      ctrl.transacReady = false
      ctrl.isTopBarShown = true
      ctrl.pendingTxsCount = 0
      ctrl.historyTxCount = 0
      loadUser()

    ctrl.onTxsCmpInit = ({api})->
      ctrl.txsCmpApi = api

    ctrl.onTopBarSelectMenu = ({menu})->
      TransacTxsDispatcher.reloadTxs(menu.type)

    ctrl.onTopBarSearch = ({query, selectedMenu})->
      params = if query then $filter: query else null
      ctrl.txsCmpApi.filterTxs(selectedMenu.type, params)

    ctrl.onTopBarFilter = ({params, selectedMenu})->
      ctrl.txsCmpApi.filterTxs(selectedMenu.type, params)

    ctrl.updateTransactionsCount = ({pendingTxsCount, historyTxsCount})->
      ctrl.pendingTxsCount = pendingTxsCount
      ctrl.historyTxsCount = historyTxsCount

    ctrl.toggleTopBar = ({isReconciling})->
      ctrl.isTopBarShown = !isReconciling

    ctrl.updateTxsLoadingStatus = ({loading})->
      ctrl.isTxsLoading = loading

    # Private

    loadUser = ->
      TransacUserService.fetch().then(null,
        (err)->
          TransacAlertsService.send(err.message.type, err.message.text)
          # TODO: display error message
          ctrl.transacLoadError = true
      )
      .finally(-> ctrl.transacReady = true)

    return
})
