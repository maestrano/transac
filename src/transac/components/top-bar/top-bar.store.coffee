###
#   @desc Store for TopBar Filters & menus state management
###
angular.module('transac.top-bar').service('TransacTopBarStore', ($q, MENUS, FILTERS_MENU)->

  _self = @

  state =
    menus: MENUS
    selectedMenu: _.find(MENUS, 'active')
    filtersMenu: FILTERS_MENU
    filters: $filter: []
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
        # Remove old search from filters
        _.pull(state.filters.$filter, state.lastSearchQuery)
        # Save search as last searched
        state.lastSearchQuery = payload
        # Update filters with latest search
        state.filters.$filter.push(payload) unless _.isEmpty(payload)
      when 'applyFilter'
        filter = payload
        switch filter.type
          when '$orderby'
            # Only one $orderby filter can be selected
            filters = _.filter(state.filtersMenu, 'type', '$orderby')
            _.each(filters, (f)->
              f.selected = false
              return
            )
            filter.selected = true
            state.filters.$orderby = "#{filter.attr} #{filter.value}"
          when '$filter'
            filter.selected = !filter.selected
            query = "#{filter.attr} #{filter.cmd} #{filter.value}"
            if filter.selected
              state.filters.$filter.push(query)
              state.filters.$filter = _.uniq(state.filters.$filter)
            else
              _.pull(state.filters.$filter, query)
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

  return @

)
