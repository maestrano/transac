angular.module('transac.transactions').service('TransacTopBarDispatcher', ($q, TransacTopBarStore)->

  _self = @

  @selectMenu = (menu)->
    state = TransacTopBarStore.dispatch('selectMenu', menu)
    state.selectedMenu

  @updateMenusItemsCount = (menusItemsCount)->
    _.each(menusItemsCount, (itemsCountValue, menuTypeKey)->
      TransacTopBarStore.dispatch('updateMenuCount', menuType: menuTypeKey, itemsCount: itemsCountValue)
      return
    )

  @updateSearchFilter = (query)->
    state = TransacTopBarStore.dispatch('updateSearchFilter', query)
    state.filters

  @applyFilter = (filter)->
    state = TransacTopBarStore.dispatch('applyFilter', filter)
    state.filters

  return @
)
