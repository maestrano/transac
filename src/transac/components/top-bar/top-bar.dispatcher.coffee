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

  @updateSearchFilter = (filters)->
    state = TransacTopBarStore.dispatch('updateSearchFilter', filters)
    state.filters

  @selectFilter = (filter)->
    TransacTopBarStore.dispatch('selectFilter', filter)
    return

  @applyFilters = ->
    state = TransacTopBarStore.dispatch('applyFilters')
    state.filters

  ###
  #   @desc Reset Top Bar store state
  ###
  @resetTopBarState = ->
    TransacTopBarStore.dispatch('clearAllFilters')
    return

  return @
)
