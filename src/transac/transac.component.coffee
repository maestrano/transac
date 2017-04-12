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
      ctrl.filters = null
      loadUser()

    ctrl.onTxsCmpInit = ({api})->
      ctrl.txsCmpApi = api

    ctrl.onTopBarCmpInit = ({api})->
      ctrl.topBarCmpApi = api

    ctrl.onTopBarFilter = ({selectedMenu, filters})->
      ctrl.filters = filters
      ctrl.txsCmpApi.filterTxs(selectedMenu.type, filters)

    ctrl.onRefreshTxs = ({type})->
      TransacTxsDispatcher.reloadTxs(type)

    ctrl.updateTransactionsCount = (paginationTotals)->
      ctrl.topBarCmpApi.updateMenusItemsCount(paginationTotals)

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
