###
#   @desc Store for TopBar Filters & menus state management
###
angular.module('transac.top-bar').service('TransacTopBarStore', ($q, MENUS, FILTERS_MENU)->

  _self = @

  state =
    menus: MENUS
    selectedMenu: _.find(MENUS, 'active')
    filtersMenu: FILTERS_MENU
    filters: {}
    lastSearchQuery: ''

  callbacks = {}
  callbacks.dispatched = $q.defer()

  ###
  #   @desc Subscribe to notifications on state change via the dispatch method
  #   @returns {Promise} A promise to the latest state
  ###
  @subscribe = ->
    callbacks.dispatched.promise

  ###
  #   @desc Dispatch actions mutating the filters & menus state managed by this Store.
  ###
  @dispatch = (action, payload=null)->
    switch action
      when 'selectMenu'
        _.each(state.menus, (menu) ->
          menu.active = false
          return
        )
        payload.active = true
        state.selectedMenu = payload
      when 'updateMenuCount'
        menu = _.find(state.menus, 'type', payload.menuType)
        menu.itemsCount = payload.itemsCount
      when 'updateSearchFilter'
        state.filters.$filter = buildFilterQuery(payload)
      when 'selectFilter'
        # Only one $orderby filter can be selected
        if payload.type == '$orderby'
          filters = _.filter(state.filtersMenu, 'type', '$orderby')
          _.each(filters, (f)->
            f.selected = false
            return
          )
          payload.selected = true
        else
          payload.selected = !payload.selected
      when 'applyFilters'
        orderbyFilter = _.find(_.filter(state.filtersMenu, 'type': '$orderby'), 'selected')
        state.filters.$orderby = "#{orderbyFilter.attr} #{orderbyFilter.value}"
        state.filters.$filter = buildFilterQuery()
    notify()
    _self.getState()

  ###
  #   @desc Get the latest state object
  #   @returns {Object} The latest state object
  ###
  @getState = ->
    state

  # Private

  notify = ->
    callbacks.dispatched.notify(_self.getState())
    return

  buildFilterQuery = (extraFilters=[])->
    query = ""
    filters = _.filter(state.filtersMenu, 'type': '$filter', 'selected': true).concat(extraFilters)
    _.each(filters, (filter, index)->
      query += "#{filter.attr} #{filter.cmd} #{filter.value}"
      query += " AND " unless index == (filters.length - 1)
      return
    )
    query

  return @

)
