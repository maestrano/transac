angular.module('transac.top-bar').component('topBar', {
  bindings: {
  },
  templateUrl: 'common/top-bar',
  controller: (MENUS)->
    ctrl = this;

    ctrl.$onInit = ()->
      ctrl.menus = MENUS

    ctrl.menuItemOnClick = (menu)->
      _.each(ctrl.menus, (menu) ->
        menu.active = false
        return
      )
      menu.active = true

    return
})
