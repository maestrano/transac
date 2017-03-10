###
#   @desc "Tabs" style topbar menu component
#   @require transac-search-bar component ($compiled)
#   @binding {Function=} [onInitMenu] Callback fired $onInit, emitting the default selected menu
#   @binding {Function} [onSelectMenu] Callback fired when a menu tab is clicked, emitting the selected menu
#   @binding {number} [pendingTxsCount] number of pending transactions
#   @binding {number} [historyTxsCount] number of history transactions
###
angular.module('transac.top-bar').component('transacTopBar', {
  bindings: {
    onInitMenu: '&?'
    onSelectMenu: '&'
    onSearch: '&'
    pendingTxsCount: '<'
    # historyTxsCount: '<'
  },
  templateUrl: 'components/top-bar',
  controller: (MENUS, EventEmitter, $compile, $scope)->
    ctrl = this;

    # Public

    ctrl.$onInit = ()->
      ctrl.isSearchBarShown = false
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

    ctrl.toggleSearch = ($event)->
      return ctrl.searchBarApi.clearSearchText() if ctrl.isEditingSearchBar
      if ctrl.isSearchBarShown then contractSearchBar($event) else expandSearchBar($event)

    ctrl.onSearchBarInit = ({api})->
      ctrl.searchBarApi = api

    ctrl.onSearchBarSubmit = (args)->
      args.selectedMenu = ctrl.selectedMenu
      ctrl.onSearch(EventEmitter(args))

    ctrl.onSearchBarChange = ({isEditing})->
      ctrl.isEditingSearchBar = isEditing

    # Private

    expandSearchBar = ($event)->
      searchBarCmp = """
        <transac-search-bar
          on-init="onSearchBarInit($event)"
          on-submit="onSearchBarSubmit($event)"
          on-change="onSearchBarChange($event)">
        </transac-search-bar>
      """
      $menu = angular.element($event.currentTarget.parentElement).find('.top-bar_menu')
      # Add relevant ctrl locals onto $compile $scope ($compile requires a $scope object).
      angular.merge($scope,
        onSearchBarInit: ctrl.onSearchBarInit
        onSearchBarSubmit: ctrl.onSearchBarSubmit
        onSearchBarChange: ctrl.onSearchBarChange
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
