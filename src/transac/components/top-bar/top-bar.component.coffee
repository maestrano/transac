###
#   @desc "Tabs" style topbar menu component
#   @require transac-search-bar component ($compiled)
#   @binding {Function=} [onInit] Callback fired $onInit, emitting the default selected menu
#   @binding {Function} [onSelectMenu] Callback fired when a menu tab is clicked, emitting the selected menu
#   @binding {Object} [menusItemsCount] values for menus items count indicator
#   @binding {number} [menusItemsCount.pending] number of pending menu items
#   @binding {number} [menusItemsCount.historical] number of historical menu items
#   @binding {boolean} [isMenuLoading] Disables clicks & animates menu loader when true
###
angular.module('transac.top-bar').component('transacTopBar', {
  bindings: {
    onInit: '&?'
    onFilter: '&'
    menusItemsCount: '<?'
    isMenuLoading: '<?'
  },
  templateUrl: 'components/top-bar',
  controller: ($compile, $scope, EventEmitter, TransacTopBarStore, TransacTopBarDispatcher)->
    ctrl = this;

    # Public

    ctrl.$onInit = ()->
      ctrl.isSearchBarShown = false
      initTopBarState()
      # Emit default active menu on init
      ctrl.onInit(
        EventEmitter(api: selectedMenu: ctrl.selectedMenu, updateMenusItemsCount: updateMenusItemsCount)
      ) if ctrl.onInit?

    ctrl.$onChanges = (changes)->
      # update $scope.isMenuLoading for the $compiled search-bar cmp scope
      $scope.isMenuLoading = changes.isMenuLoading.currentValue if changes.isMenuLoading?

    ctrl.onMenuItemClick = (menu)->
      return if ctrl.isMenuLoading
      return if _.isEqual(menu, ctrl.selectedMenu)
      selectedMenu = TransacTopBarDispatcher.selectMenu(menu)
      ctrl.onFilter(EventEmitter(selectedMenu: selectedMenu, filters: ctrl.filters))

    ctrl.toggleSearch = ($event)->
      return ctrl.searchBarApi.clearSearchText() if ctrl.isEditingSearchBar
      if ctrl.isSearchBarShown then contractSearchBar($event) else expandSearchBar($event)

    ctrl.onSearchBarInit = ({api})->
      ctrl.searchBarApi = api

    ctrl.onSearchBarSubmit = ({query})->
      filters = TransacTopBarDispatcher.updateSearchFilter(query)
      # Emit the currently applied filters, and selected menu
      ctrl.onFilter(EventEmitter(selectedMenu: ctrl.selectedMenu, filters: filters))

    ctrl.onSearchBarChange = ({isEditing})->
      ctrl.isEditingSearchBar = isEditing

    ctrl.applyFilterOnSelect = ({selectedFilter})->
      TransacTopBarDispatcher.applyFilter(selectedFilter)

    ctrl.onFiltersSubmit = ->
      ctrl.onFilter(EventEmitter(selectedMenu: ctrl.selectedMenu, filters: ctrl.filters))

    # Private

    initTopBarState = ->
      ctrl.menus = TransacTopBarStore.getState().menus
      ctrl.filters = TransacTopBarStore.getState().filters
      ctrl.filtersMenu = TransacTopBarStore.getState().filtersMenu
      ctrl.selectedMenu = TransacTopBarStore.getState().selectedMenu
      TransacTopBarStore.subscribe().then(null, null, (state)->
        # Redefine state
        ctrl.menus = state.menus
        ctrl.filters = state.filters
        ctrl.filtersMenu = state.filtersMenu
        ctrl.selectedMenu = state.selectedMenu
      )

    updateMenusItemsCount = (menusItemsCount)->
      TransacTopBarDispatcher.updateMenusItemsCount(menusItemsCount)

    expandSearchBar = ($event)->
      searchBarCmp = """
        <transac-search-bar
          on-init="onSearchBarInit($event)"
          on-submit="onSearchBarSubmit($event)"
          on-change="onSearchBarChange($event)"
          is-disabled="isMenuLoading">
        </transac-search-bar>
      """
      $menu = angular.element($event.currentTarget.parentElement).find('.top-bar_menu')
      # Add relevant ctrl locals onto $compile $scope ($compile requires a $scope object).
      # note: this does not get re-updated when data flows back through the cmp ctrl. Manually re-add it to $scope in the ctrl.$onChanges lifecycle hook.
      angular.merge($scope,
        onSearchBarInit: ctrl.onSearchBarInit
        onSearchBarSubmit: ctrl.onSearchBarSubmit
        onSearchBarChange: ctrl.onSearchBarChange
        isMenuLoading: ctrl.isMenuLoading
      )
      $menu.append($compile(searchBarCmp)($scope))
      ctrl.isSearchBarShown = true
      return

    contractSearchBar = ($event)->
      $searchBar = angular.element($event.currentTarget.parentElement).find('transac-search-bar')
      $searchBar.addClass('remove-search-bar')
      $searchBar.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', ->
        $searchBar.remove()
        ctrl.isSearchBarShown = false
      )
      return

    return
})
