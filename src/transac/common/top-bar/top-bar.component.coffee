#
# TopBar Component
#
angular.module('transac.top-bar').component('topBar', {
  bindings: {
    onSelectMenu: '&'
    transactionsCount: '<'
  },
  templateUrl: 'common/top-bar',
  controller: (MENUS, EventEmitter)->
    ctrl = this;

    ctrl.$onInit = ()->
      ctrl.menus = MENUS

    ctrl.onMenuItemClick = (menu)->
      _.each(ctrl.menus, (menu) ->
        menu.active = false
        return
      )
      menu.active = true
      ctrl.onSelectMenu(
        EventEmitter({menu: menu})
      )

    ctrl.getCount = (menu)->
      (menu.title && ctrl[menu.title.toLowerCase() + 'Count']) || 0

    return
})
