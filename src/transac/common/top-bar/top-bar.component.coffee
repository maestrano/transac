###
#   @desc "Tabs" style topbar menu component
#   @binding {Function=} [onInitMenu] Callback fired $onInit, emitting the default selected menu
#   @binding {Function} [onSelectMenu] Callback fired when a menu tab is clicked, emitting the selected menu
#   @binding {number} [pendingTxsCount] number of pending transactions
#   @binding {number} [historyTxsCount] number of history transactions
###
angular.module('transac.top-bar').component('transacTopBar', {
  bindings: {
    onInitMenu: '&?'
    onSelectMenu: '&'
    pendingTxsCount: '<'
    # historyTxsCount: '<'
  },
  templateUrl: 'common/top-bar',
  controller: (MENUS, EventEmitter)->
    ctrl = this;

    ctrl.$onInit = ()->
      ctrl.menus = angular.copy(MENUS)
      ctrl.selectedMenu = _.find(ctrl.menus, 'active')
      # Emit default active menu on init
      ctrl.onInitMenu(EventEmitter(menu: ctrl.selectedMenu)) if ctrl.onInitMenu?

    ctrl.onMenuItemClick = (menu)->
      return if _.isEqual(menu, ctrl.selectedMenu)
      _.each(ctrl.menus, (menu) ->
        menu.active = false
        return
      )
      menu.active = true
      ctrl.selectedMenu = menu
      ctrl.onSelectMenu(EventEmitter(menu: ctrl.selectedMenu))

    ctrl.getCount = (menu)->
      (menu.title && ctrl[menu.type + 'TxsCount']) || 0

    return
})
