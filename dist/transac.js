
/*
 *   @desc The Maestrano Transac! Library!
 */

(function() {
  angular.module('maestrano.transac', ['transac.components', 'transac.common']).config([
    '$httpProvider', function($httpProvider) {
      $httpProvider.defaults.headers.common['Accept'] = 'application/json';
      return $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
    }
  ]);

}).call(this);


/*
 *   @desc The Common module is the container reference for all application specific components
 */

(function() {
  angular.module('transac.common', []);

}).call(this);


/*
 *   @desc The Components module is the container reference for all reusable modules. Modules added as depenedencies here should be decoupled.
 */

(function() {
  angular.module('transac.components', ['transac.user', 'transac.alerts', 'transac.top-bar', 'transac.transactions']);

}).call(this);


/*
 *   @desc Components for providing Alert messaging for the application, via toastr notifications.
 */

(function() {
  angular.module('transac.alerts', ['toastr', 'ngAnimate']).config([
    'toastrConfig', function(toastrConfig) {
      return angular.merge(toastrConfig, {
        timeOut: 1500,
        positionClass: 'toast-top-right',
        preventDuplicates: false,
        progressBar: true
      });
    }
  ]).constant('TOASTR_OPTS', {
    success: {
      timeOut: 800
    },
    info: {
      timeOut: 800
    },
    error: {
      timeOut: 1500
    }
  });

}).call(this);


/*
 *   @desc Components for the Transac! library Top Bar Menu feature.
 */

(function() {
  angular.module('transac.top-bar', []).constant('MENUS', [
    {
      title: 'Transactions',
      type: 'pending',
      active: true,
      itemsCount: 0
    }, {
      title: 'History',
      type: 'historical',
      active: false,
      itemsCount: 0
    }
  ]).constant('FILTERS_MENU', [
    {
      label: 'Ascending',
      type: '$orderby',
      attr: 'created_at',
      value: 'asc',
      selected: true
    }, {
      label: 'Descending',
      type: '$orderby',
      attr: 'created_at',
      value: 'desc',
      selected: false
    }, {
      divider: true
    }, {
      label: 'Create',
      type: '$filter',
      attr: 'action',
      cmd: 'eq',
      value: "'CREATE'",
      selected: false
    }, {
      label: 'Update',
      type: '$filter',
      attr: 'action',
      cmd: 'eq',
      value: "'UPDATE'",
      selected: false
    }, {
      divider: true
    }, {
      label: 'Only Duplicates',
      type: 'duplicates',
      value: 'include',
      selected: false
    }, {
      label: 'No Duplicates',
      type: 'duplicates',
      value: 'exclude',
      selected: false
    }, {
      divider: true
    }, {
      label: 'Items',
      type: '$filter',
      attr: 'entity_type',
      cmd: 'match',
      value: "/Item/",
      selected: false
    }, {
      label: 'Purchase Orders',
      type: '$filter',
      attr: 'entity_type',
      cmd: 'match',
      value: "/PurchaseOrder/",
      selected: false
    }, {
      label: 'Invoices',
      type: '$filter',
      attr: 'entity_type',
      cmd: 'match',
      value: "/Invoice/",
      selected: false
    }, {
      label: 'Accounts',
      type: '$filter',
      attr: 'entity_type',
      cmd: 'match',
      value: "/Account/",
      selected: false
    }, {
      label: 'Organizations',
      type: '$filter',
      attr: 'entity_type',
      cmd: 'match',
      value: "/Organization/",
      selected: false
    }
  ]).value('EventEmitter', function(payload) {
    return {
      $event: payload
    };
  });

}).call(this);


/*
 *   @desc Components for configuring, managing & displaying the current user state.
 */

(function() {
  angular.module('transac.user', []);

}).call(this);


/*
 *   @desc Components for viewing & reconciling transactions, composing the Maestrano Transactions feature.
 */

(function() {
  angular.module('transac.transactions', ['transac.user', 'transac.alerts', 'infinite-scroll', 'ngAnimate']).value('EventEmitter', function(payload) {
    return {
      $event: payload
    };
  }).constant('TXS_EVENTS', {
    closeAllTxs: 'close-all-txs'
  }).value('THROTTLE_MILLISECONDS', 1000).constant('DEV_AUTH', {
    apiKey: '',
    apiSecret: '',
    orgUid: ''
  });

}).call(this);


/*
 *   @desc Transac! Root Component - embeds the library feature components.
 */

(function() {
  angular.module('maestrano.transac').component('transac', {
    bindings: {},
    templateUrl: 'transac',
    controller: ["$q", "TransacUserService", "TransacTxsDispatcher", "TransacTxsService", "TransacAlertsService", function($q, TransacUserService, TransacTxsDispatcher, TransacTxsService, TransacAlertsService) {
      var ctrl, loadPaginationTotals, loadUser;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.transacReady = false;
        ctrl.isTopBarShown = true;
        ctrl.filters = null;
        return loadUser().then(function() {
          return loadPaginationTotals();
        });
      };
      ctrl.onTxsCmpInit = function(arg) {
        var api;
        api = arg.api;
        return ctrl.txsCmpApi = api;
      };
      ctrl.onTopBarCmpInit = function(arg) {
        var api;
        api = arg.api;
        return ctrl.topBarCmpApi = api;
      };
      ctrl.onTopBarFilter = function(arg) {
        var filters, selectedMenu;
        selectedMenu = arg.selectedMenu, filters = arg.filters;
        ctrl.filters = filters;
        return ctrl.txsCmpApi.filterTxs({
          type: selectedMenu.type,
          params: filters
        });
      };
      ctrl.onRefreshTxs = function(arg) {
        var type;
        type = arg.type;
        return TransacTxsDispatcher.reloadTxs({
          type: type,
          params: ctrl.filters
        });
      };
      ctrl.updateTransactionsCount = function(paginationTotals) {
        return ctrl.topBarCmpApi.updateMenusItemsCount(paginationTotals);
      };
      ctrl.toggleTopBar = function(arg) {
        var isReconciling;
        isReconciling = arg.isReconciling;
        return ctrl.isTopBarShown = !isReconciling;
      };
      ctrl.updateTxsLoadingStatus = function(arg) {
        var loading;
        loading = arg.loading;
        return ctrl.isTxsLoading = loading;
      };
      loadUser = function() {
        return TransacUserService.fetch().then(null, function(err) {
          TransacAlertsService.send(err.message.type, err.message.text);
          return ctrl.transacLoadError = true;
        })["finally"](function() {
          return ctrl.transacReady = true;
        });
      };
      loadPaginationTotals = function() {
        return $q.all([
          TransacTxsService.get({
            type: 'historical',
            params: {
              $top: 1,
              $skip: 0
            }
          }), TransacTxsService.get({
            type: 'pending',
            params: {
              $top: 1,
              $skip: 0
            }
          })
        ]).then(function(results) {
          return ctrl.updateTransactionsCount({
            'historical': results[0].pagination.total,
            'pending': results[1].pagination.total
          });
        });
      };
    }]
  });

}).call(this);

(function() {
  angular.module('transac.alerts').service('TransacAlertsService', ["toastr", "TOASTR_OPTS", function(toastr, TOASTR_OPTS) {
    this.send = function(type, message, title, options) {
      if (title == null) {
        title = null;
      }
      if (options == null) {
        options = {};
      }
      options = angular.merge({}, TOASTR_OPTS[type], options);
      return toastr[type](_.capitalize(message), title, options);
    };
    return this;
  }]);

}).call(this);

angular.module('maestrano.transac').run(['$templateCache', function($templateCache) {$templateCache.put('transac','<div ng-if="$ctrl.transacReady">\n  <transac-top-bar ng-show="$ctrl.isTopBarShown" is-menu-loading="$ctrl.isTxsLoading" on-init="$ctrl.onTopBarCmpInit($event)" on-filter="$ctrl.onTopBarFilter($event)" on-refresh="$ctrl.onRefreshTxs($event)"></transac-top-bar>\n\n  <transac-txs on-init="$ctrl.onTxsCmpInit($event)" filters="$ctrl.filters" on-transactions-change="$ctrl.updateTransactionsCount($event)" on-reconciling="$ctrl.toggleTopBar($event)" on-loading-change="$ctrl.updateTxsLoadingStatus($event)"></transac-txs>\n</div>\n<div ng-if="!$ctrl.transacReady">\n  <p>Loading...</p>\n</div>\n');
$templateCache.put('components/top-bar','<div class="top-bar">\n  <transac-filters-selector filters-menu="$ctrl.filtersMenu" on-select="$ctrl.onFilterSelect($event)" on-submit="$ctrl.onFiltersSubmit($event)" is-disabled="$ctrl.isMenuLoading"></transac-filters-selector>\n  <div class="refresh-txs">\n    <div type="button" ng-class="{\'loading\': $ctrl.isMenuLoading }" ng-click="$ctrl.onRefreshTxsClick()">\n      <i class="fa fa-refresh fa-2x fa-fw"></i>\n    </div>\n  </div>\n  <div class="menu">\n    <a href="" class="tab" ng-class="{ \'active\': menu.active, \'loading\': $ctrl.isMenuLoading }" ng-click="$ctrl.onMenuItemClick(menu)" ng-repeat="menu in $ctrl.menus track by $index">\n      <h5>{{::menu.title}} ({{menu.itemsCount}})</h5>\n      <div class="line"></div>\n    </a>\n    <!-- $compiles transac-search-bar cmp here (see controller) -->\n  </div>\n  <button class="toggle-search-btn" ng-class="{ \'loading\': $ctrl.isMenuLoading }" ng-click="$ctrl.toggleSearch($event)" ng-disabled="$ctrl.isMenuLoading">\n    <i class="fa fa-2x fa-fw" ng-class="{ \'fa-search\': !$ctrl.isEditingSearchBar, \'fa-times\': $ctrl.isEditingSearchBar }" aria-hidden="true"></i>\n  </button>\n</div>\n');
$templateCache.put('components/top-bar/filters-selector','<div class="filters-selector">\n  <div class="btn-group" uib-dropdown on-toggle="$ctrl.toggleSelector(open)" auto-close="outsideClick">\n    <button id="dropdown-toggle-btn" type="button" class="btn btn-primary" ng-class="{ \'disabled\': $ctrl.isDisabled }" ng-click="$ctrl.toggleSelector()" uib-dropdown-toggle>\n      <i class="fa fa-filter fa-2x fa-fw" aria-hidden="true"></i>\n    </button>\n    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="dropdown-toggle-btn">\n      <li role="{{!item.divider ? \'menuitem\' : \'\'}}" ng-repeat="item in $ctrl.filtersMenu" ng-class="{ \'divider\': item.divider }">\n        <a href="" ng-if="!$ctrl.divider" ng-class="{ \'selected\': item.selected }" ng-click="$ctrl.selectFilterOnClick(item)">{{item.label}}</a>\n      </li>\n    </ul>\n  </div>\n</div>\n');
$templateCache.put('components/top-bar/search-bar','<input type="text" placeholder="Search transactions..." ng-model="$ctrl.search.text" ng-keypress="$ctrl.submitOnKeypress($event)" ng-change="$ctrl.onSearchChange()">\n');
$templateCache.put('components/transactions/transaction','<div ng-class="{ \'selected\': $ctrl.isSelected }">\n  <!-- TODO: move to component -->\n  <div class="tx-summary">\n    <a href="" class="content" ng-click="$ctrl.selectOnClick()" ng-class="{ \'no-pointer\': $ctrl.historical }">\n      <div class="icon">\n        <i class="fa {{$ctrl.icon()}} fa-2x" aria-hidden="true"></i>\n      </div>\n      <div class="caption">\n        <div class="title">\n          <span>{{::$ctrl.title()}}</span>\n        </div>\n        <div class="subtitle">\n          <span>{{::$ctrl.subtitle()}}</span>\n        </div>\n      </div>\n      <div class="warning" ng-if="$ctrl.hasMatches()" ng-class="{ \'hide\': $ctrl.isSelected }">\n        <div>\n          <i class="fa fa-exclamation-triangle fa-lg" aria-hidden="true"></i>\n          <span class="hidden-xs hidden-sm">This record may be a duplicate</span>\n        </div>\n      </div>\n    </a>\n    <div class="actions" ng-class="{ \'hide\': $ctrl.isSelected }" ng-if="!$ctrl.historical">\n      <div type="button" class="transac-icon transac-fab action deny" ng-click="$ctrl.denyOnClick()" uib-tooltip="Deny only this time" tooltip-popup-delay="300">\n        <i class="fa fa-times fa-2x fa-fw"></i>\n      </div>\n      <div type="button" class="transac-icon transac-fab action approve" ng-click="$ctrl.approveOnClick(true)" uib-tooltip="Always share this record" tooltip-popup-delay="300">\n        <i class="fa fa-check fa-2x fa-fw"></i>\n      </div>\n      <!-- <div type="button" class="transac-icon transac-fab action merge" ng-if="$ctrl.isActionMade(\'merge\')">\n        <i class="fa fa-link fa-2x fa-fw"></i>\n      </div> -->\n    </div>\n  </div>\n  <div class="tx-detail" ng-if="$ctrl.isSelected">\n    <div class="row is-flex">\n      <div class="col-md-8 col-xs-12 no-gutters">\n        <transac-tx-changes changes="$ctrl.formattedChanges"></transac-tx-changes>\n      </div>\n      <div class="col-md-4 col-xs-12 no-gutters">\n        <div class="row apps no-gutters">\n          <div class="title">\n            <h5>Select apps to share with:</h5>\n          </div>\n          <div class="app" ng-repeat="mapping in ::$ctrl.getPendingMappings()" ng-click="$ctrl.selectAppOnClick($event, mapping)">\n            <span>{{::mapping.app_name}}</span>\n            <input type="checkbox" ng-checked="mapping.sharedWith">\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="row" ng-if="$ctrl.canReconcileRecords() && !$ctrl.historical">\n      <div class="col-md-12 col-xs-12">\n        <div class="row dup-line-break">\n          <div class="spacer left"></div>\n          <div class="title">\n            <div>\n              <i class="fa fa-exclamation fa-lg" aria-hidden="true"></i>\n              <span>Potential Duplicates</span>\n            </div>\n          </div>\n          <div class="spacer right"></div>\n        </div>\n        <div class="row">\n          <div class="col-md-12 col-xs-12 matches">\n            <transac-tx-matches matches="::$ctrl.matches"></transac-tx-matches>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="row">\n      <div class="col-md-12 col-xs-12 no-gutters actions-bar">\n        <div class="wrapper">\n          <div type="button" class="transac-icon transac-fab action dups" ng-if="$ctrl.canReconcileRecords()" ng-click="$ctrl.reconcileOnClick()" uib-tooltip="Merge duplicate records" tooltip-popup-delay="300">\n            <i class="fa fa-link fa-2x fa-fw"></i>\n          </div>\n          <div type="button" class="transac-icon transac-fab action deny" ng-click="$ctrl.denyOnClick(true)" uib-tooltip="Never share this record" tooltip-popup-delay="300">\n            <i class="fa fa-times fa-2x first"/><i class="fa fa-times fa-2x second"/>\n          </div>\n          <div type="button" class="transac-icon transac-fab action approve-once" ng-click="$ctrl.approveOnClick()" uib-tooltip="Approve only this time" tooltip-popup-delay="300">\n            <i class="fa fa-check fa-2x"></i><span>x1</span>\n          </div>\n          <div type="button" class="transac-icon transac-fab action deny-once" ng-click="$ctrl.denyOnClick()" uib-tooltip="Deny only this time" tooltip-popup-delay="300">\n            <i class="fa fa-times fa-2x fa-fw"></i>\n          </div>\n          <div type="button" class="transac-icon transac-fab action approve" ng-click="$ctrl.approveOnClick(true)" uib-tooltip="Always share this record" tooltip-popup-delay="300">\n            <i class="fa fa-check fa-2x fa-fw"></i>\n          </div>\n        </div>\n        <!-- Button style actions, kept incase we want to go back to this. -->\n        <!-- <div class="wrapper">\n          <div type="button" class="transac-btn transac-raised action approve" ng-click="$ctrl.approveOnClick(true)" uib-tooltip="Always share this record" tooltip-popup-delay="300">\n            <span>Always share</span>\n            <i class="fa fa-check fa-fw"></i>\n          </div>\n          <div type="button" class="transac-btn transac-raised action deny-once" ng-click="$ctrl.denyOnClick()" uib-tooltip="Deny only this time" tooltip-popup-delay="300">\n            <span>Do not share</span>\n            <i class="fa fa-times fa-2x fa-fw"></i>\n          </div>\n          <div type="button" class="transac-btn transac-raised action approve-once" ng-click="$ctrl.approveOnClick()" uib-tooltip="Approve only this time" tooltip-popup-delay="300">\n            <span>Share once</span>\n            <i class="fa fa-check fa-2x"></i><span class="icon-text">x1</span>\n          </div>\n          <div type="button" class="transac-btn transac-raised action deny" ng-click="$ctrl.denyOnClick(true)" uib-tooltip="Never share this record" tooltip-popup-delay="300">\n            <span>Never share</span>\n            <i class="fa fa-times fa-2x first"/><i class="fa fa-times fa-2x second"/>\n          </div>\n          <div type="button" class="transac-btn transac-raised action dups" ng-if="$ctrl.hasMatches()" ng-click="$ctrl.reconcileOnClick()" uib-tooltip="Merge duplicate records" tooltip-popup-delay="300">\n            <span>Merge Duplicates</span>\n            <i class="fa fa-link fa-2x fa-fw"></i>\n          </div>\n        </div> -->\n\n      </div>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-changes','<div class="table-responsive">\n  <table class="table table-striped borderless">\n    <tr>\n      <th ng-if="$ctrl.onSelect">Tick</th>\n      <th>Field</th>\n      <th>Value</th>\n    </tr>\n    <tr ng-repeat="(key, value) in ::$ctrl.changes">\n      <td ng-if="$ctrl.onSelect"><input type="checkbox"></td>\n      <td>{{::key}}</td>\n      <td>{{::value}}</td>\n    </tr>\n  </table>\n</div>\n');
$templateCache.put('components/transactions/transaction-matches','<div ng-repeat="match in ::$ctrl.matches" class="match">\n  <div class="caption">\n    <div class="title">\n      <span ng-bind="::$ctrl.title(match)"></span>\n    </div>\n    <div class="subtitle">\n      <span ng-bind="::$ctrl.subtitle(match)"></span>\n    </div>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-reconcile','<div class="top-panel">\n  <div class="top-panel-btn back" ng-click="$ctrl.back()">\n    <div class="action-button"><i class="fa fa-angle-double-left fa-2x"></i></div>\n    <span class="action-label">Back</span>\n  </div>\n  <div class="title">\n    <span>Reconcile duplicate records</span>\n  </div>\n  <div class="top-panel-btn next align-right" ng-if="$ctrl.isNextBtnShown()" ng-click="$ctrl.next()">\n    <span class="action-label">Next</span>\n    <div class="action-button"><i class="fa fa-angle-double-right fa-2x"></i></div>\n  </div>\n  <div class="top-panel-btn done align-right" ng-if="!$ctrl.editing" ng-click="$ctrl.publish()">\n    <span class="action-label">Publish</span>\n    <div class="action-button"><i class="fa fa-check fa-2x"></i></div>\n  </div>\n</div>\n<div class="edit" ng-show="$ctrl.editing">\n  <div class="wrapper">\n    <transac-tx-tile  ng-repeat="tx in ::$ctrl.transactions track by tx.id" transaction="::tx" resource-type="::$ctrl.transaction.resource_type" checked="$ctrl.isTxChecked(tx)" deselected="$ctrl.isTxDeselected(tx)" on-select="$ctrl.onSelect($event)"></transac-tx-tile>\n  </div>\n</div>\n<div class="review" ng-if="!$ctrl.editing">\n  <div class="wrapper">\n    <transac-tx-tile transaction="::$ctrl.selectedTx" resource-type="::$ctrl.transaction.resource_type" checked="true" title="::$ctrl.selectedTxTitle" subtitle="::$ctrl.selectedTxSubtitle"></transac-tx-tile>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-tile','<div class="tile" ng-class="{ \'deselected\': $ctrl.deselected, \'selected\': $ctrl.checked }">\n  <div class="topbar row no-gutters" ng-class="{\'no-click\': !$ctrl.isOnSelectDefined()}" ng-click="$ctrl.onSelectTx()">\n    <div class="topbar-checkbox" ng-if="$ctrl.isOnSelectDefined()">\n      <input type="checkbox" ng-checked="$ctrl.checked" disabled>\n    </div>\n    <div class="topbar-text">\n      <h5>{{::$ctrl.title}}</h5>\n      <div class="topbar-text-subtitle">\n        <p>{{::$ctrl.subtitle}}</p>\n      </div>\n    </div>\n  </div>\n  <transac-tx-changes changes="::$ctrl.formattedTxAttrs"></transac-tx-changes>\n</div>\n');
$templateCache.put('components/transactions/transactions','<div ng-hide="$ctrl.reconciling" infinite-scroll="$ctrl.loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="$ctrl.isPaginationDisabled()">\n  <transac-tx transaction="transaction" historical="$ctrl.isHistorical()" ng-repeat="transaction in $ctrl.transactions track by transaction.transaction_log.id" on-commit="$ctrl.onTransactionCommit($event)" on-reconcile="$ctrl.onReconcileTransactions($event)"></transac-tx>\n  <div ng-if="$ctrl.loading" class="loading">\n    <i class="fa fa-spinner fa-spin fa-3x" aria-hidden="true"></i>\n  </div>\n  <div ng-if="!$ctrl.loading" class="manual-load">\n    <button ng-click="$ctrl.loadMore()" ng-if="!$ctrl.isPaginationDisabled()">Scroll for more</button>\n    <p ng-if="$ctrl.allTxsFound()">All results</p>\n    <p ng-if="$ctrl.noTxsFound()">No results</p>\n  </div>\n</div>\n<div ng-if="$ctrl.reconciling">\n  <transac-tx-reconcile transaction="$ctrl.reconcileData.transaction" matches="$ctrl.reconcileData.matches" apps="$ctrl.reconcileData.apps" on-reconciled="$ctrl.onTransactionReconciled($event)"></transac-tx-reconcile>\n</div>\n');}]);

/*
 *   @desc "Tabs" style topbar menu component
 *   @require transac-search-bar component ($compiled)
 *   @binding {Function=} [onInit] Callback fired $onInit, emitting the default selected menu
 *   @binding {Function} [onSelectMenu] Callback fired when a menu tab is clicked, emitting the selected menu
 *   @binding {Object} [menusItemsCount] values for menus items count indicator
 *   @binding {number} [menusItemsCount.pending] number of pending menu items
 *   @binding {number} [menusItemsCount.historical] number of historical menu items
 *   @binding {boolean} [isMenuLoading] Disables clicks & animates menu loader when true
 */

(function() {
  angular.module('transac.top-bar').component('transacTopBar', {
    bindings: {
      onInit: '&?',
      onFilter: '&',
      onRefresh: '&',
      menusItemsCount: '<?',
      isMenuLoading: '<?'
    },
    templateUrl: 'components/top-bar',
    controller: ["$compile", "$scope", "EventEmitter", "TransacTopBarStore", "TransacTopBarDispatcher", function($compile, $scope, EventEmitter, TransacTopBarStore, TransacTopBarDispatcher) {
      var contractSearchBar, ctrl, expandSearchBar, initTopBarState, updateMenusItemsCount;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.isSearchBarShown = false;
        initTopBarState();
        if (ctrl.onInit != null) {
          return ctrl.onInit(EventEmitter({
            api: {
              selectedMenu: ctrl.selectedMenu,
              updateMenusItemsCount: updateMenusItemsCount
            }
          }));
        }
      };
      ctrl.$onDestroy = function() {
        return TransacTopBarDispatcher.resetTopBarState();
      };
      ctrl.$onChanges = function(changes) {
        if (changes.isMenuLoading != null) {
          return $scope.isMenuLoading = changes.isMenuLoading.currentValue;
        }
      };
      ctrl.onMenuItemClick = function(menu) {
        var selectedMenu;
        if (ctrl.isMenuLoading) {
          return;
        }
        if (_.isEqual(menu, ctrl.selectedMenu)) {
          return;
        }
        selectedMenu = TransacTopBarDispatcher.selectMenu(menu);
        return ctrl.onFilter(EventEmitter({
          selectedMenu: selectedMenu,
          filters: ctrl.filters
        }));
      };
      ctrl.toggleSearch = function($event) {
        if (ctrl.isEditingSearchBar) {
          return ctrl.searchBarApi.clearSearchText();
        }
        if (ctrl.isSearchBarShown) {
          return contractSearchBar($event);
        } else {
          return expandSearchBar($event);
        }
      };
      ctrl.onRefreshTxsClick = function() {
        var state, type;
        if (ctrl.isMenuLoading) {
          return;
        }
        state = TransacTopBarStore.getState();
        type = state.selectedMenu.type;
        return ctrl.onRefresh(EventEmitter({
          type: type
        })).then(function() {
          var menu;
          menu = _.find(state.menus, function(m) {
            return m.type === type;
          });
          return TransacTopBarDispatcher.selectMenu(menu);
        });
      };
      ctrl.onSearchBarInit = function(arg) {
        var api;
        api = arg.api;
        return ctrl.searchBarApi = api;
      };
      ctrl.onSearchBarSubmit = function(arg) {
        var filter, filters;
        filter = arg.filter;
        filters = TransacTopBarDispatcher.updateSearchFilter(filter);
        return ctrl.onFilter(EventEmitter({
          selectedMenu: ctrl.selectedMenu,
          filters: filters
        }));
      };
      ctrl.onSearchBarChange = function(arg) {
        var isEditing;
        isEditing = arg.isEditing;
        return ctrl.isEditingSearchBar = isEditing;
      };
      ctrl.onFilterSelect = function(arg) {
        var selectedFilter;
        selectedFilter = arg.selectedFilter;
        return TransacTopBarDispatcher.selectFilter(selectedFilter);
      };
      ctrl.onFiltersSubmit = function() {
        var filters;
        filters = TransacTopBarDispatcher.applyFilters();
        return ctrl.onFilter(EventEmitter({
          selectedMenu: ctrl.selectedMenu,
          filters: filters
        }));
      };
      initTopBarState = function() {
        ctrl.menus = TransacTopBarStore.getState().menus;
        ctrl.filters = TransacTopBarStore.getState().filters;
        ctrl.filtersMenu = TransacTopBarStore.getState().filtersMenu;
        ctrl.selectedMenu = TransacTopBarStore.getState().selectedMenu;
        return TransacTopBarStore.subscribe().then(null, null, function(state) {
          ctrl.menus = state.menus;
          ctrl.filters = state.filters;
          ctrl.filtersMenu = state.filtersMenu;
          return ctrl.selectedMenu = state.selectedMenu;
        });
      };
      updateMenusItemsCount = function(menusItemsCount) {
        return TransacTopBarDispatcher.updateMenusItemsCount(menusItemsCount);
      };
      expandSearchBar = function($event) {
        var $menu, searchBarCmp;
        searchBarCmp = "<transac-search-bar\n  on-init=\"onSearchBarInit($event)\"\n  on-submit=\"onSearchBarSubmit($event)\"\n  on-change=\"onSearchBarChange($event)\"\n  is-disabled=\"isMenuLoading\">\n</transac-search-bar>";
        $menu = angular.element($event.currentTarget.parentElement).find('.menu');
        angular.merge($scope, {
          onSearchBarInit: ctrl.onSearchBarInit,
          onSearchBarSubmit: ctrl.onSearchBarSubmit,
          onSearchBarChange: ctrl.onSearchBarChange,
          isMenuLoading: ctrl.isMenuLoading
        });
        $menu.append($compile(searchBarCmp)($scope));
        ctrl.isSearchBarShown = true;
      };
      contractSearchBar = function($event) {
        var $searchBar;
        $searchBar = angular.element($event.currentTarget.parentElement).find('transac-search-bar');
        $searchBar.addClass('remove-search-bar');
        $searchBar.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function() {
          $searchBar.remove();
          return ctrl.isSearchBarShown = false;
        });
      };
    }]
  });

}).call(this);


/*
 *   @desc Service responsible for dispatching messages to alert the Topbar state with methods that represent actions made for the view layer.
 */

(function() {
  angular.module('transac.transactions').service('TransacTopBarDispatcher', ["$q", "TransacTopBarStore", function($q, TransacTopBarStore) {
    var _self;
    _self = this;
    this.selectMenu = function(menu) {
      var state;
      state = TransacTopBarStore.dispatch('selectMenu', menu);
      return state.selectedMenu;
    };
    this.updateMenusItemsCount = function(menusItemsCount) {
      return _.each(menusItemsCount, function(itemsCountValue, menuTypeKey) {
        TransacTopBarStore.dispatch('updateMenuCount', {
          menuType: menuTypeKey,
          itemsCount: itemsCountValue
        });
      });
    };
    this.updateSearchFilter = function(filters) {
      var state;
      state = TransacTopBarStore.dispatch('updateSearchFilter', filters);
      return state.filters;
    };
    this.selectFilter = function(filter) {
      TransacTopBarStore.dispatch('selectFilter', filter);
    };
    this.applyFilters = function() {
      var state;
      state = TransacTopBarStore.dispatch('applyFilters');
      return state.filters;
    };

    /*
     *   @desc Reset Top Bar store state
     */
    this.resetTopBarState = function() {
      TransacTopBarStore.dispatch('clearAllFilters');
    };
    return this;
  }]);

}).call(this);


/*
 *   @desc Store for TopBar Filters & menus state management
 */

(function() {
  angular.module('transac.top-bar').service('TransacTopBarStore', ["$q", "MENUS", "FILTERS_MENU", function($q, MENUS, FILTERS_MENU) {
    var _self, buildFilterQuery, callbacks, notify, state;
    _self = this;
    state = {
      menus: angular.copy(MENUS),
      selectedMenu: _.find(MENUS, 'active'),
      filtersMenu: angular.copy(FILTERS_MENU),
      filters: {},
      lastSearchQuery: ''
    };
    callbacks = {};
    callbacks.dispatched = $q.defer();

    /*
     *   @desc Subscribe to notifications on state change via the dispatch method
     *   @returns {Promise} A promise to the latest state
     */
    this.subscribe = function() {
      return callbacks.dispatched.promise;
    };

    /*
     *   @desc Dispatch actions mutating the filters & menus state managed by this Store.
     */
    this.dispatch = function(action, payload) {
      var duplicatesFilter, filters, menu, orderbyFilter;
      if (payload == null) {
        payload = null;
      }
      switch (action) {
        case 'selectMenu':
          _.each(state.menus, function(menu) {
            menu.active = false;
          });
          payload.active = true;
          state.selectedMenu = payload;
          break;
        case 'updateMenuCount':
          menu = _.find(state.menus, 'type', payload.menuType);
          menu.itemsCount = payload.itemsCount;
          break;
        case 'updateSearchFilter':
          state.filters.$filter = buildFilterQuery(payload);
          break;
        case 'selectFilter':
          if (payload.type === '$orderby') {
            filters = _.filter(state.filtersMenu, 'type', payload.type);
            _.each(filters, function(f) {
              return f.selected = false & void 0;
            });
            payload.selected = true;
          } else if (payload.type === 'duplicates') {
            if (payload.selected) {
              payload.selected = !payload.selected;
            } else {
              filters = _.filter(state.filtersMenu, 'type', payload.type);
              _.each(filters, function(f) {
                return f.selected = false & void 0;
              });
              payload.selected = true;
            }
          } else {
            payload.selected = !payload.selected;
          }
          break;
        case 'applyFilters':
          orderbyFilter = _.find(_.filter(state.filtersMenu, {
            'type': '$orderby'
          }), 'selected');
          state.filters.$orderby = orderbyFilter.attr + " " + orderbyFilter.value;
          duplicatesFilter = _.find(_.filter(state.filtersMenu, {
            'type': 'duplicates'
          }), 'selected');
          if (duplicatesFilter != null) {
            state.filters.duplicates = "" + duplicatesFilter.value;
          } else {
            delete state.filters.duplicates;
          }
          state.filters.$filter = buildFilterQuery();
          break;
        case 'clearAllFilters':
          state.filtersMenu = angular.copy(FILTERS_MENU);
          state.filters = {};
          state.lastSearchQuery = '';
      }
      notify();
      return _self.getState();
    };

    /*
     *   @desc Get the latest state object
     *   @returns {Object} The latest state object
     */
    this.getState = function() {
      return state;
    };
    notify = function() {
      callbacks.dispatched.notify(_self.getState());
    };
    buildFilterQuery = function(extraFilters) {
      var filters, query;
      if (extraFilters == null) {
        extraFilters = [];
      }
      query = "";
      filters = _.filter(state.filtersMenu, {
        'type': '$filter',
        'selected': true
      }).concat(extraFilters);
      _.each(filters, function(filter, index) {
        query += filter.attr + " " + filter.cmd + " " + filter.value;
        if (index !== (filters.length - 1)) {
          query += " AND ";
        }
      });
      return query;
    };
    return this;
  }]);

}).call(this);


/*
 *   @desc Provider configuration & service business logic for the current user state.
 */

(function() {
  angular.module('transac.user').provider('TransacUserService', function() {
    var _$get, options, provider;
    provider = this;
    options = {
      user: null,
      organizations: null
    };
    provider.configure = function(data) {
      return angular.extend(options, data);
    };
    _$get = function($q, $log) {
      var service;
      service = this;
      service.user = {};

      /*
       *   @returns {Object} Current user model
       */
      service.get = function() {
        return angular.copy(service.user);
      };

      /*
       *   @returns {Object} Currently selected organization
       */
      service.getCurrentOrg = function() {
        if (_.isEmpty(service.user)) {
          return {};
        }
        return _.find(service.user.organizations, function(org) {
          return org.id === service.user.currentOrgId;
        });
      };

      /*
       *   @desc Retrieves & update store with latest User data
       *   @returns {Promise<Object>} A promise to the current user
       */
      service.fetch = function() {
        var promises;
        promises = _.map(options, function(callback, key) {
          if (callback != null) {
            return callback();
          } else {
            return $q.reject("transac error: no " + key + " callback configured.");
          }
        });
        return $q.all(promises).then(function(response) {
          service.user = angular.merge({}, response[0], response[1]);
          return service.get();
        }, function(err) {
          $log.error(err);
          return $q.reject({
            message: {
              text: "Failed to load User for Transac!",
              type: 'error'
            }
          });
        });
      };
      return service;
    };
    _$get.$inject = ['$q', '$log'];
    provider.$get = _$get;
    return provider;
  });

}).call(this);


/*
 *   @desc Service responsible for dispatching messages to retrieve data and/or alter the Transactions state in methods that represent actions made from the view layer.
 */

(function() {
  angular.module('transac.transactions').service('TransacTxsDispatcher', ["$q", "$log", "$timeout", "TransacTxsStore", "TransacTxsService", "TransacAlertsService", function($q, $log, $timeout, TransacTxsStore, TransacTxsService, TransacAlertsService) {
    var _self;
    _self = this;

    /*
     *   @desc Load transactions & set pagination total
     *   @param {Object} [options=]
     *   @param {string} [options.url=] A custom url for the request (a pagination url)
     *   @param {string} [options.type=] Type of transactions e.g 'pending', 'historical'
     *   @param {Object} [options.params=] Pagination & filter params for the request
     *   @param {boolean} [options.excludeParams=] Prevent option.params being passed onto TransacTxsService, typically for using api url links instead of state pagination params.
     *   @returns {Promise<Object>} whether the load was successful or not
     */
    this.loadTxs = function(options) {
      var currentPgnState, pgnParams;
      if (options == null) {
        options = {};
      }
      if (!TransacTxsStore.getState().loading) {
        TransacTxsStore.dispatch('loadingTxs', true);
      }
      if (options.type) {
        TransacTxsStore.dispatch('setTxsType', options.type);
      }
      if (!options.excludeParams) {
        currentPgnState = TransacTxsStore.getState().pagination;
        pgnParams = {
          $skip: currentPgnState.skip,
          $top: currentPgnState.top
        };
        options.params = angular.merge({}, pgnParams, options.params);
      }
      return TransacTxsService.get(options).then(function(response) {
        TransacTxsStore.dispatch('addTxs', response.transactions);
        TransacTxsStore.dispatch('setPgn', response.pagination);
        return true;
      }, function() {
        var msg;
        msg = 'Failed to load transactions';
        TransacAlertsService.send('error', msg, 'Error');
        return $q.reject({
          message: {
            text: msg,
            type: 'error'
          }
        });
      })["finally"](function() {
        return TransacTxsStore.dispatch('loadingTxs', false);
      });
    };

    /*
     *   @desc Paginates Transactions
     *   @param {string} [url] for retrieving paginated transactions
     *   @returns {Promise<Object>} whether the load more txs was successful or not
     */
    this.paginateTxs = function(url) {
      TransacTxsStore.dispatch('loadingTxs', true);
      return _self.loadTxs({
        url: url,
        excludeParams: true
      });
    };

    /*
     *   @desc Load transactions & set pagination total
     *   @param {Object} [options]
     *   @param {Object} [option.type=] Type of transaction
     *   @param {Object} [options.params=] pagination & filter parameters for the request
     *   @returns {Promise<Object>} whether the load was successful or not
     */
    this.reloadTxs = function(options) {
      if (options == null) {
        options = {};
      }
      if (!_self.reloadLocked) {
        _self.reloadLocked = true;
        TransacTxsStore.dispatch('loadingTxs', true);
        TransacTxsStore.dispatch('removeAllTxs');
        TransacTxsStore.dispatch('resetPgnSkip');
        return _self.loadTxs(options).then(function() {
          return _self.reloadLocked = false;
        });
      } else {
        return $timeout(function() {
          $log.warn("Reload Transactions locked: retrying in 5sec");
          return _self.reloadTxs(options);
        }, 500);
      }
    };

    /*
     *   @desc Commit a transaction & update pagination total
     *   @params See service method comments
     *   @returns {Promise<Object>} whether the commit was successful or not
     */
    this.commitTx = function(url, resource, mappings) {
      var deferred;
      deferred = $q.defer();
      TransacTxsStore.dispatch('minusPgnTotal', 1);
      $timeout((function() {
        return deferred.notify(true);
      }), 0);
      TransacTxsService.commit(url, resource, mappings).then(function(res) {
        TransacTxsStore.dispatch('removeTx', res.transaction.id);
        return deferred.resolve({
          data: res,
          message: {
            text: 'Commit transaction success',
            type: 'success'
          }
        });
      }, function() {
        TransacTxsStore.dispatch('plusPgnTotal', 1);
        $timeout((function() {
          return deferred.notify(true);
        }), 0);
        return deferred.reject({
          message: {
            text: 'Commit transaction failed',
            type: 'error'
          }
        });
      });
      return deferred.promise;
    };

    /*
     *   @desc Merge a transaction's duplicates & update pagination total
     *   @param {Object} [args] Arguments for the merge action
     *   @param {Object} [args.txId] Transaction id
     *   @param {Object} [args.mergeParams] Body params for the merge PUT request
     *   @returns {Promise<Object>} whether the commit was successful or not
     */
    this.mergeTxs = function(args) {
      var deferred, tx;
      deferred = $q.defer();
      if (args == null) {
        deferred.reject({
          message: {
            text: 'Merge cancelled',
            type: 'info'
          }
        });
      } else {
        tx = _.find(TransacTxsStore.getState().transactions, function(t) {
          return t.transaction_log.id === args.txId;
        });
        if (tx == null) {
          if (tx == null) {
            deferred.reject({
              message: {
                text: 'No transaction found, merge failed',
                type: 'error'
              }
            });
          }
        } else {
          TransacTxsStore.dispatch('loadingTxs');
          TransacTxsService.merge(tx.links.merge, tx.transaction_log.resource_type, args.mergeParams).then(function(res) {
            return deferred.resolve({
              message: {
                text: tx.transaction_log.reference + " merged successfully",
                type: 'success'
              }
            });
          }, function() {
            return deferred.reject({
              message: {
                text: tx.transaction_log.reference + " failed to merge",
                type: 'error'
              }
            });
          });
        }
      }
      return deferred.promise;
    };

    /*
     *   @desc Reset Transactions store state
     */
    this.resetTxsState = function() {
      TransacTxsStore.dispatch('removeAllTxs');
      TransacTxsStore.dispatch('resetPgnSkip');
    };
    return this;
  }]);

}).call(this);


/*
 *   @desc Backend Service for Transactions & Matches.
 */

(function() {
  angular.module('transac.transactions').service('TransacTxsService', ["$log", "$http", "$q", "$window", "TransacUserService", "DEV_AUTH", function($log, $http, $q, $window, TransacUserService, DEV_AUTH) {
    var _self;
    _self = this;
    _self.HTTP_CONFIG = {};

    /*
     *   @desc Invoke to configure basic auth (add keys in transaction.module.coffee), if no keys are provided, sso_session will be used.
     *   @returns {boolean} Whether dev api creds are configured or sso token is being used.
     */
    this.getHttpConfig = function() {
      if (!_.isEmpty(_self.HTTP_CONFIG)) {
        return _self.HTTP_CONFIG;
      }
      if (DEV_AUTH.apiKey && DEV_AUTH.apiSecret) {
        return _self.HTTP_CONFIG = {
          headers: {
            'Authorization': 'Basic ' + window.btoa(DEV_AUTH.apiKey + ":" + DEV_AUTH.apiSecret)
          }
        };
      } else {
        return _self.HTTP_CONFIG = {
          params: {
            sso_session: TransacUserService.get().sso_session
          }
        };
      }
    };

    /*
     *   @desc Get pending or historical unreconcilled Transactions.
     *   @http GET /api/v2/org-fbcy/transaction_logs/{pending|historical}
     *   @param {Object} [options=]
     *   @param {Object} [options.url=] A custom url for the request (a pagination url)
     *   @param {string} [options.type=] Type of transactions e.g 'pending', 'historical'
     *   @param {Object} [options.params=] Parameters for the GET request.
     *   @returns {Promise<Object>} A promise to the list of Transactions and pagination data.
     */
    this.get = function(options) {
      var orgUid, params, type, url;
      if (options == null) {
        options = {};
      }
      type = options.type || 'pending';
      orgUid = DEV_AUTH.orgUid || TransacUserService.getCurrentOrg().uid;
      url = options.url || ("https://api-connec-sit.maestrano.io/api/v2/" + orgUid + "/transaction_logs/" + type);
      params = angular.merge({}, _self.getHttpConfig(), options);
      return $http.get(url, params).then(function(response) {
        if (!(response.status === 200 && (response.data != null))) {
          $log.error('TransacTxsService Error - no data found: ', response);
          return $q.reject(response);
        } else {
          return {
            transactions: response.data.transactions || [],
            pagination: response.data.pagination || {}
          };
        }
      }, function(err) {
        $log.error('TransacTxsService Error: failed to get transactions', err);
        return $q.reject(err);
      });
    };

    /*
     *   @desc Commit transcation, reconciling the record.
     *   @http PUT /api/v2/org-fbcy/accounts/a7c747f0-d577-0134-317d-74d43510c326/commit
     *   @httpBody
     *   {
     *     'mappings:'[{
     *       'group_id'=>'cld-abc',
     *       'commit'=>true,
     *       'auto_commit'=>true,
     *       'pull_disabled'=>false,
     *       'push_disabled'=>false
     *     }]
     *   }
     *   @param {string} [url] Transaction links commit URL.
     *   @param {string} [resource] Transaction resource type.
     *   @param {array} [mappings] Transaction mappings to include in http body of PUT request.
     *   @returns {Promise<Object>} A promise to the commited Transaction.
     */
    this.commit = function(url, resource, mappings) {
      var params;
      if (mappings == null) {
        mappings = [];
      }
      params = {
        mappings: mappings
      };
      return $http.put(url, params, _self.getHttpConfig()).then(function(response) {
        return {
          transaction: response.data[resource]
        };
      }, function(err) {
        $log.error('TransacTxsService Error: failed to commit transaction', err);
        return $q.reject(err);
      });
    };

    /*
     *   @desc [DEPRECIATED] Find matching transacations rated with a score representing
     *   duplicate likelyhood.
     *   @http GET /api/v2/org-fbcy/organizations/b1733560-d577-0134-317d-74d43510c326/matches
     *   @param {string} [url] Transaction links matches URL.
     *   @param {string} [resource] Transaction resource type.
     *   @param {Object} [params] Params to serialise into GET request URL.
     *   @returns {Promise<Object>} A promise to the matching transactions & pagination data.
     */

    /*
     *   @desc Take transaction_matches and queries for the full objects for display.
     *   @http /api/v2/org-fbcy/organizations/b1733560-d577-0134-317d-74d43510c326
     *   @param {Array<Object>} Transaction matches.
     *   @param {string} Transaction resource type.
     *   @param {Object} [params] Params to serialise into GET request URL.
     *   @returns {Promise<Array>} A promise to the matching transactions.
     */
    this.matches = function(txMatches, resource, params) {
      var queries;
      if (params == null) {
        params = {};
      }
      params = angular.merge({}, _self.getHttpConfig(), params);
      queries = _.map(txMatches, function(match) {
        return $http.get(match.links.show, params);
      });
      return $q.all(queries).then(function(responses) {
        return {
          matches: _.compact(_.map(responses, function(response) {
            return response.data && response.data[resource];
          }))
        };
      }, function(err) {
        $log.error('TransacTxsService Error: failed to load matches', err);
        return $q.reject(err);
      });
    };

    /*
     *   @desc Merge transactions and transaction attributes, reconciling duplicate records.
     *   @http PUT http://localhost:8080/api/v2/org-fbcy/accounts/a7c747f0-d577-0134-317d-74d43510c326/merge
     *   @httpBody
     *   {
     *     "ids": ["a7ca3ab0-d441-0134-17b1-74d43510c326", "a7ca3ab0-d443-0134-17b4-74d43510c326"],
     *     "accounts" => {
     *       'name' => 'Business Bank Account',
     *       'description' => 'The account to keep'
     *     }
     *   }
     *   @param {string} [url] Transaction links merge URL.
     *   @param {string} [resource] Transaction resource type.
     *   @param {Object} [params] Params to include in http body of PUT request.
     *   @returns {Promise<Object>} A promise to updated Transaction.
     */
    this.merge = function(url, resource, params) {
      if (params == null) {
        params = {};
      }
      return $http.put(url, params, _self.getHttpConfig()).then(function(response) {
        return {
          transaction: response.data[resource]
        };
      }, function(err) {
        $log.error('TransacTxsService Error: failed to merge transactions', err);
        return $q.reject(err);
      });
    };

    /*
     *   @desc Format tx title based on action & resource type.
     *   @param {Object} [transaction] A Transaction object.
     *   @returns {string} A formatted tx title.
     */
    this.formatTitle = function(transaction) {
      var action, formatted_resource, resource, title;
      action = transaction.transaction_log.action.toLowerCase();
      resource = transaction.transaction_log.resource_type;
      formatted_resource = _.capitalize(_.words(resource).join(' '));
      title = (function() {
        switch (resource) {
          case 'credit_notes':
            return (_.get(transaction.transaction_log, 'reference', 'No reference found')) + " (" + (_.get(transaction.changes, 'type', '-')) + ")";
          case "invoices":
            return (_.get(transaction.transaction_log, 'reference', 'No reference found')) + " (" + (_.get(transaction.changes, 'type', '-')) + ")";
          case 'purchase_orders':
            return (_.get(transaction.transaction_log, 'reference', 'No reference found')) + " (" + (_.get(transaction.changes, 'type', '-')) + ")";
          default:
            return _.get(transaction.transaction_log, 'reference', 'No reference found');
        }
      })();
      return action + " " + formatted_resource + ": " + title;
    };

    /*
     *   @desc Format a matching transaction title based on resource type.
     *   @param {Object} [match] A Matched Transaction object.
     *   @returns {string} A formatted matching tx title.
     */
    this.formatMatchTitle = function(match) {
      var key, title, type;
      title = (function() {
        switch (match.resource_type) {
          case 'organizations':
            key = _.map(match, function(v, k) {
              if (_.includes(k, ['is_']) && v === true) {
                return k;
              }
            });
            key = _.compact(key)[0];
            type = key.split('_').slice(-1);
            return type + ": " + match.name;
          default:
            return _.get(match, 'name', 'No name found');
        }
      })();
      return title;
    };

    /*
     *   @desc Formats transaction object by selecting resource relevant attributes for display.
     *   @param {Object} [txAttrs] Tx attributes object.
     *   @param {string} [resource] Tx resource type e.g 'accounts'.
     *   @returns {Object} Formatted transaction attributes by resource type.
     *   @TODO: Define all accepted attributes for each possible resource type (and possibly move these attr lists out into a constant).
     */
    this.formatAttributes = function(txAttrs, resource) {
      var acceptedTxAttrs, acceptedTxDates;
      if (txAttrs == null) {
        txAttrs = {};
      }
      acceptedTxAttrs = (function() {
        switch (resource) {
          case 'organizations':
            return {
              plain: ['name', 'status', 'address', 'email', 'phone', 'referred_leads', 'website'],
              dates: []
            };
          case 'tax_codes':
            return {
              plain: ['name', 'reference', 'sale_tax_rate', 'sale_taxes', 'status', 'tax_type'],
              dates: []
            };
          case 'accounts':
            return {
              plain: ['name', 'reference', 'code', 'currency', 'description', 'status'],
              dates: []
            };
          case 'items':
            return {
              plain: ['code', 'description', 'is_inventoried', 'name', 'purchase_price', 'sale_price', 'status'],
              dates: []
            };
          case 'purchase_orders':
            return {
              plain: ['amount', 'lines', 'status', 'title', 'transaction_number', 'type'],
              dates: ['transaction_date']
            };
          case 'invoices':
            return {
              plain: ['amount', 'balance', 'deposit', 'lines', 'status', 'tax_calculation', 'title', 'transaction_number', 'type'],
              dates: ['transaction_date', 'due_date']
            };
          default:
            return {
              plain: []
            };
        }
      })();
      acceptedTxDates = ['updated_at', 'created_at'].concat(acceptedTxAttrs.dates);
      acceptedTxAttrs = _.pick(txAttrs, acceptedTxAttrs.plain);
      acceptedTxAttrs = _.isEmpty(acceptedTxAttrs) ? txAttrs : acceptedTxAttrs;
      _.each(acceptedTxDates, function(key) {
        acceptedTxAttrs[key] = _self.formatDisplayDate(_.get(acceptedTxAttrs, key));
      });
      return _self.flattenObject(acceptedTxAttrs);
    };

    /*
     *   @desc Format datestring into Transac! date display format
     *   @param {string} [date] A date string
     *   @return {string} A formatted date string
     */
    this.formatDisplayDate = function(date) {
      return $window.moment(date).format('MMM d, Y h:mma');
    };

    /*
     *   @desc Flatten nested objects to display all changes fields simply.
     *   @param {Object} [x] Object to flatten.
     *   @returns {Object} Flattened object.
     */
    this.flattenObject = function(x, result, prefix) {
      if (result == null) {
        result = {};
      }
      if (prefix == null) {
        prefix = null;
      }
      if (_.isObject(x)) {
        _.each(x, function(v, k) {
          return _self.flattenObject(v, result, (prefix ? prefix + '_' : '') + k);
        });
      } else {
        result[prefix] = x;
      }
      return result;
    };
    return this;
  }]);

}).call(this);


/*
 *   @desc Store for Transactions state management
 */

(function() {
  angular.module('transac.transactions').service('TransacTxsStore', ["$q", function($q) {
    var _self, callbacks, notify, state;
    _self = this;
    state = {
      txsType: 'pending',
      transactions: [],
      pagination: {
        top: 20,
        skip: 0,
        total: 0
      },
      loading: false
    };
    callbacks = {};
    callbacks.dispatched = $q.defer();

    /*
     *   @desc Subscribe to notifications on state change via the dispatch method
     *   @returns {Promise} A promise to the latest state
     */
    this.subscribe = function() {
      return callbacks.dispatched.promise;
    };

    /*
     *   @desc Dispatch actions mutating the txs & paginations state managed by this Store.
     *   @param {string} [action] The action being made which selects the state change behaviour
     *   @param {any} [payload] Data to set / use to determine new state for the given action
     *   @returns {Object} The latest state object
     */
    this.dispatch = function(action, payload) {
      if (payload == null) {
        payload = null;
      }
      switch (action) {
        case 'setTxsType':
          state.txsType = payload;
          break;
        case 'addTxs':
          state.transactions = state.transactions.concat(payload);
          break;
        case 'removeTx':
          _.remove(state.transactions, function(tx) {
            return tx.transaction_log.id === payload;
          });
          break;
        case 'removeAllTxs':
          state.transactions.length = 0;
          break;
        case 'loadingTxs':
          state.loading = payload;
          break;
        case 'setPgn':
          angular.merge(state.pagination, payload);
          break;
        case 'resetPgnSkip':
          state.pagination.skip = 0;
          break;
        case 'minusPgnTotal':
          state.pagination.total -= payload;
          break;
        case 'plusPgnTotal':
          state.pagination.total += payload;
      }
      notify();
      return _self.getState();
    };

    /*
     *   @desc Get the latest state object
     *   @returns {Object} The latest state object
     */
    this.getState = function() {
      return state;
    };
    notify = function() {
      callbacks.dispatched.notify(_self.getState());
    };
    return this;
  }]);

}).call(this);


/**
 *  @description Selectable filters component that builds filter params, and emits a submit event.
 *  @binding {Array<Object>} [filtersMenu] Collection of filter menu objects
 *  @binding {Function} [onSubmit] Callback fired on submit (dropdown 'outsideClick') if changes to selections
 *  @binding {Function} [onSelect] Callback fired when a filter menu item is selected.
 *  @binding {boolean=} [isDisabled] disables the dropdown
 */

(function() {
  angular.module('transac.top-bar').component('transacFiltersSelector', {
    bindings: {
      filtersMenu: '<',
      onSubmit: '&',
      onSelect: '&',
      isDisabled: '<?'
    },
    templateUrl: 'components/top-bar/filters-selector',
    controller: ["EventEmitter", function(EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        return ctrl.wasSelectionMade = false;
      };
      ctrl.toggleSelector = function(open) {
        if (ctrl.isDisabled) {
          return;
        }
        if (!ctrl.wasSelectionMade) {
          return;
        }
        if (open == null) {
          return;
        }
        ctrl.wasSelectionMade = false;
        if (!open) {
          return ctrl.onSubmit(EventEmitter(null));
        }
      };
      ctrl.selectFilterOnClick = function(filter) {
        ctrl.wasSelectionMade = true;
        return ctrl.onSelect(EventEmitter({
          selectedFilter: filter
        }));
      };
    }]
  });

}).call(this);


/*
 *   @desc Search bar component that builds a API query string, and emits change events.
 *   @binding {Function} [onSubmit] Callback fired on keypress with keyCode 13 (enter)
 *   @binding {Function=} [onChange] Callback fired on input ngChange
 *   @binding {Function=} [onInit]  Callback fired on component initialize, emitting an api for exposing cmp methods to the parent component
 *   @binding {boolean=} [isDisabled] prevents onSubmit being fired
 */

(function() {
  angular.module('transac.top-bar').component('transacSearchBar', {
    bindings: {
      onSubmit: '&',
      onChange: '&?',
      onInit: '&?',
      isDisabled: '<?'
    },
    templateUrl: 'components/top-bar/search-bar',
    controller: ["EventEmitter", "$scope", function(EventEmitter, $scope) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.search = {
          text: ''
        };
        if (ctrl.onInit != null) {
          return ctrl.onInit(EventEmitter({
            api: {
              clearSearchText: ctrl.clearSearchText
            }
          }));
        }
      };
      ctrl.onSearchChange = function() {
        if (ctrl.onChange != null) {
          return ctrl.onChange(EventEmitter({
            isEditing: !!ctrl.search.text.length
          }));
        }
      };
      ctrl.submitOnKeypress = function($event, force) {
        var filter;
        if ($event == null) {
          $event = {};
        }
        if (force == null) {
          force = false;
        }
        if (ctrl.isDisabled) {
          return;
        }
        if (!($event.keyCode === 13 || force)) {
          return;
        }
        if (ctrl.search.text) {
          filter = {
            attr: 'reference',
            cmd: 'match',
            value: "/" + ctrl.search.text + "/"
          };
        } else {
          filter = null;
        }
        return ctrl.onSubmit(EventEmitter({
          filter: filter
        }));
      };
      ctrl.clearSearchText = function() {
        ctrl.search.text = '';
        ctrl.submitOnKeypress(null, true);
        return ctrl.onSearchChange();
      };
    }]
  });

}).call(this);


/*
 *   @desc Displays a horizontal Transaction list item, expandable details section on click, and actions to reconcile the transaction.
 *   @require transac-tx-changes component.
 *   @binding {Object} [transaction] A transaction
 *   @binding {Function} [onCommit] Callback fired on commit transaction (approve or deny)
 *   @binding {Function} [onReconcile] Callback fired on reconcile matches found (potential dups)
 */

(function() {
  angular.module('transac.transactions').component('transacTx', {
    bindings: {
      transaction: '<',
      historical: '<?',
      onCommit: '&',
      onReconcile: '&'
    },
    templateUrl: 'components/transactions/transaction',
    controller: ["$element", "$timeout", "$document", "$scope", "EventEmitter", "TransacTxsService", "TransacAlertsService", "TXS_EVENTS", function($element, $timeout, $document, $scope, EventEmitter, TransacTxsService, TransacAlertsService, TXS_EVENTS) {
      var ctrl, loadMatches;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.historical || (ctrl.historical = false);
        if (ctrl.historical) {
          $element.addClass('historical');
        }
        ctrl.formattedChanges = TransacTxsService.formatAttributes(ctrl.transaction.changes, ctrl.transaction.transaction_log.resource_type);
        _.each(ctrl.transaction.mappings, function(m) {
          return m.sharedWith = true;
        });
        return $scope.$on(TXS_EVENTS.closeAllTxs, function() {
          return ctrl.isSelected = false;
        });
      };
      ctrl.title = function() {
        return TransacTxsService.formatTitle(ctrl.transaction);
      };
      ctrl.subtitle = function() {
        var action, date, fromApps, fromStr, toApps, toStr;
        action = ctrl.transaction.transaction_log.action.toLowerCase();
        date = _.get(ctrl.formattedChanges, action + "d_at");
        fromApps = _.compact(_.map(ctrl.transaction.mappings, function(m) {
          if (!m.pending) {
            return m.app_name;
          }
        }));
        toApps = _.compact(_.map(ctrl.transaction.mappings, function(m) {
          if (m.pending) {
            return m.app_name;
          }
        }));
        fromStr = "" + (!_.isEmpty(fromApps) ? ", from " + (fromApps.join(', ')) : "");
        toStr = "" + (!(_.isEmpty(toApps) || !fromStr) ? " to " + (toApps.join(', ')) : "");
        return "" + date + fromStr + toStr;
      };
      ctrl.icon = function() {
        switch (ctrl.transaction.transaction_log.action.toLowerCase()) {
          case 'create':
            return 'fa-plus-circle';
          case 'update':
            return 'fa-pencil-square';
        }
      };
      ctrl.getPendingMappings = function() {
        return _.select(ctrl.transaction.mappings, {
          pending: true
        });
      };
      ctrl.hasMatches = function() {
        return ctrl.transaction && ctrl.transaction.matching_records && ctrl.transaction.matching_records.length;
      };
      ctrl.canReconcileRecords = function() {
        return !_.isEmpty(ctrl.matches);
      };
      ctrl.selectOnClick = function() {
        if (ctrl.historical) {
          return;
        }
        ctrl.isSelected = !ctrl.isSelected;
        if (ctrl.isSelected) {
          angular.element($document[0].body).animate({
            scrollTop: $element.offset().top
          });
          return loadMatches();
        }
      };
      ctrl.approveOnClick = function(auto) {
        if (auto == null) {
          auto = false;
        }
        $element.addClass('commiting');
        _.each(ctrl.transaction.mappings, function(m) {
          m.commit = m.sharedWith;
          m.auto_commit = auto;
        });
        return ctrl.onCommit(EventEmitter({
          transaction: ctrl.transaction,
          action: 'approve',
          auto: auto
        })).then(null, function(res) {
          return $timeout(function() {
            return $element.removeClass('commiting');
          }, 300);
        });
      };
      ctrl.denyOnClick = function(auto) {
        if (auto == null) {
          auto = false;
        }
        $element.addClass('commiting');
        _.each(ctrl.transaction.commitingings, function(m) {
          m.commit = !m.sharedWith;
          m.push_disabled = auto;
        });
        return ctrl.onCommit(EventEmitter({
          transaction: ctrl.transaction,
          action: 'refuse',
          auto: auto
        })).then(null, function(res) {
          return $timeout(function() {
            return $element.removeClass('commiting');
          }, 300);
        });
      };
      ctrl.reconcileOnClick = function() {
        var transaction;
        if (!(ctrl.hasMatches() && ctrl.canReconcileRecords())) {
          return;
        }
        $element.addClass('reconciling');
        transaction = angular.merge({}, ctrl.transaction.transaction_log, ctrl.transaction.changes);
        return ctrl.onReconcile(EventEmitter({
          transaction: transaction,
          matches: ctrl.matches,
          apps: _.map(ctrl.transaction.mappings, function(m) {
            return m.app_name;
          })
        }));
      };
      ctrl.selectAppOnClick = function($event, mapping) {
        return mapping.sharedWith = !mapping.sharedWith;
      };
      loadMatches = function() {
        if (!_.isEmpty(ctrl.matches)) {
          return;
        }
        return TransacTxsService.matches(ctrl.transaction.matching_records, ctrl.transaction.transaction_log.resource_type).then(function(response) {
          return ctrl.matches = response.matches;
        }, function() {
          return TransacAlertsService.send('error', 'Failed to load potential duplicates', 'Error');
        });
      };
    }]
  });

}).call(this);


/*
 *   @desc Render transaction changes attributes into a responsive table with selectable / checkable head & fields, emitting selection results.
 *   @binding {Object} [changes] Transaction changes object
 *   @binding {Function=} [onSelect] Callback fired on select all / select field.
 */

(function() {
  angular.module('transac.transactions').component('transacTxChanges', {
    bindings: {
      changes: '<',
      onSelect: '&?'
    },
    templateUrl: 'components/transactions/transaction-changes',
    controller: ["EventEmitter", function(EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {};
    }]
  });

}).call(this);


/*
 *   @desc Displays horizontal match list items.
 *   @binding {Array<object>} [matches] List of match transactions
 */

(function() {
  angular.module('transac.transactions').component('transacTxMatches', {
    bindings: {
      matches: '<'
    },
    templateUrl: 'components/transactions/transaction-matches',
    controller: ["EventEmitter", "TransacTxsService", function(EventEmitter, TransacTxsService) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {};
      ctrl.title = function(match) {
        return TransacTxsService.formatMatchTitle(match);
      };
      ctrl.subtitle = function(match) {
        var date;
        return date = TransacTxsService.formatDisplayDate(_.get(match, 'created_at'));
      };
    }]
  });

}).call(this);


/*
 *   @desc Displays tx and tx matches side-by-side, responsibile for tx and tx attribute selection, emitting which tx / tx attributes should be merged.
 *   @require transac-tx-tile component.
 *   @binding {Object} [transaction] A formatted transaction (match transaction object structure).
 *   @binding {Array<Object>} [matches] List of matches (potential dups).
 *   @binding {Array<string>} [apps] List of applications the transaction will be published to.
 *   @binding {Function} [onReconciled] Callback fired on publish reconcilations.
 */

(function() {
  angular.module('transac.transactions').component('transacTxReconcile', {
    bindings: {
      transaction: '<',
      matches: '<',
      apps: '<',
      onReconciled: '&'
    },
    templateUrl: 'components/transactions/transaction-reconcile',
    controller: ["$window", "EventEmitter", function($window, EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        $window.scrollTo(0, 0);
        ctrl.editing = true;
        ctrl.transactions = [].concat(ctrl.transaction, ctrl.matches);
        ctrl.selectedTx = {};
        ctrl.txsSelectionMap = {};
        return _.each(_.map(ctrl.transactions, function(tx) {
          return tx.id;
        }), function(id) {
          ctrl.txsSelectionMap[id] = false;
        });
      };
      ctrl.onSelect = function(arg) {
        var tx;
        tx = arg.tx;
        _.each(ctrl.txsSelectionMap, function(v, k) {
          if (k !== tx.id) {
            ctrl.txsSelectionMap[k] = false;
          }
        });
        ctrl.txsSelectionMap[tx.id] = true;
        return ctrl.selectedTx = _.find(ctrl.transactions, function(tx) {
          return ctrl.txsSelectionMap[tx.id];
        });
      };
      ctrl.isTxChecked = function(tx) {
        return ctrl.txsSelectionMap[tx.id];
      };
      ctrl.hasSelectedTx = function() {
        return !_.isEmpty(ctrl.selectedTx);
      };
      ctrl.isTxDeselected = function(tx) {
        return ctrl.hasSelectedTx() && !ctrl.isTxChecked(tx);
      };
      ctrl.isNextBtnShown = function() {
        return ctrl.editing && ctrl.hasSelectedTx();
      };
      ctrl.next = function() {
        if (!ctrl.isNextBtnShown()) {
          return;
        }
        ctrl.selectedTxTitle = 'Reconciled Record';
        ctrl.selectedTxSubtitle = "will be updated in " + (ctrl.apps.join(', '));
        return ctrl.editing = false;
      };
      ctrl.publish = function() {
        return ctrl.onReconciled(EventEmitter({
          txId: ctrl.transaction.id,
          mergeParams: {
            ids: _.map(ctrl.matches, function(m) {
              return m.id;
            })
          }
        }));
      };
      ctrl.back = function() {
        if (ctrl.editing) {
          return ctrl.onReconciled(EventEmitter(null));
        } else {
          return ctrl.editing = true;
        }
      };
    }]
  });

}).call(this);


/*
 *   @desc A 'tile' shaped transaction card for viewing tx / match tx changes and selecting the tx / tx attributes.
 *   @require transac-tx-changes component.
 *   @binding {object} [transaction] A formatted transaction object (match transaction object structure).
 *   @binding {string=} [title] Tx tile topbar title.
 *   @binding {string=} [subtitle] Tx tile topbar subtitle.
 *   @binding {boolean=} [checked] Bind whether the transaction is checked.
 *   @binding {Function=} [onSelect] Callback event fired on tx-tile topbar click.
 */

(function() {
  angular.module('transac.transactions').component('transacTxTile', {
    bindings: {
      transaction: '<',
      resourceType: '<',
      title: '<?',
      subtitle: '<?',
      checked: '<?',
      deselected: '<?',
      onSelect: '&?'
    },
    templateUrl: 'components/transactions/transaction-tile',
    controller: ["EventEmitter", "TransacTxsService", function(EventEmitter, TransacTxsService) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.title || (ctrl.title = 'Transaction');
        ctrl.subtitle || (ctrl.subtitle = ctrl.buildSubtitle());
        return ctrl.formattedTxAttrs = TransacTxsService.formatAttributes(ctrl.transaction, ctrl.resourceType);
      };
      ctrl.buildSubtitle = function() {
        if (ctrl.transaction.app_name) {
          return "From " + ctrl.transaction.app_name;
        }
      };
      ctrl.isOnSelectDefined = function() {
        return !_.isUndefined(ctrl.onSelect);
      };
      ctrl.onSelectTx = function() {
        if (!ctrl.isOnSelectDefined()) {
          return;
        }
        return ctrl.onSelect(EventEmitter({
          tx: ctrl.transaction
        }));
      };
      ctrl.onSelectTxField = function() {};
    }]
  });

}).call(this);


/*
 *   @desc The root component of the transactions module. Responsible for displaying transactions and delegating requests to reconcile to the tx service.
 *   @require transac-tx component
 *   @require transac-tx-reconcile component
 *   @require infinite-scroll directive (external)
 *   @binding {string=} [txsType] The type of transactions to load, e.g 'pending', 'historical'
 *   @binding {Object=} [filters] An object containing filters params to apply to load txs requests (Connec! api filter spec)
 *   @binding {Function=} [onInit] Callback fired $onInit, emitting upward an api.
 *   @binding {Function=} [onTransactionsChange] Callback fired on change to stored txs model
 *   @binding {Function=} [onReconciling] Callback fired on reconcile tx with matches (dups)
 *   @binding {Function=} [onLoadingChange] Callback fired when txs loading state is changed
 */

(function() {
  angular.module('transac.transactions').component('transacTxs', {
    bindings: {
      txsType: '<?',
      filters: '<?',
      onInit: '&?',
      onTransactionsChange: '&?',
      onReconciling: '&?',
      onLoadingChange: '&?'
    },
    templateUrl: 'components/transactions/transactions',
    controller: ["$q", "$element", "$document", "$window", "$scope", "$timeout", "EventEmitter", "TransacTxsDispatcher", "TransacTxsStore", "TransacAlertsService", "TXS_EVENTS", function($q, $element, $document, $window, $scope, $timeout, EventEmitter, TransacTxsDispatcher, TransacTxsStore, TransacAlertsService, TXS_EVENTS) {
      var ctrl, initTxsState, onFilterTxs, onTxsChange, scrollToReconcilingTx;
      ctrl = this;
      $document[0].addEventListener('keydown', function(e) {
        if (e.keyCode === 27) {
          $scope.$broadcast(TXS_EVENTS.closeAllTxs);
          return $window.scrollTo(0, 0);
        }
      }, false);
      ctrl.$onInit = function() {
        ctrl.reconciling = false;
        if (ctrl.onInit != null) {
          ctrl.onInit(EventEmitter({
            api: {
              filterTxs: onFilterTxs
            }
          }));
        }
        initTxsState();
        return TransacTxsDispatcher.loadTxs({
          type: ctrl.txsType
        }).then(function() {
          return onTxsChange();
        });
      };
      ctrl.$onDestroy = function() {
        return TransacTxsDispatcher.resetTxsState();
      };
      ctrl.loadMore = function() {
        if (ctrl.isPaginationDisabled()) {
          return;
        }
        return TransacTxsDispatcher.paginateTxs(ctrl.pagination.next);
      };
      ctrl.isPaginationDisabled = function() {
        return ctrl.loading || ctrl.reconciling || ctrl.noTxsFound() || ctrl.allTxsFound();
      };
      ctrl.allTxsFound = function() {
        return !ctrl.loading && ctrl.transactions.length && (ctrl.transactions.length === ctrl.pagination.total);
      };
      ctrl.noTxsFound = function() {
        return !ctrl.loading && !ctrl.transactions.length && !ctrl.pagination.total;
      };
      ctrl.isHistorical = function() {
        return ctrl.txsType === 'historical';
      };
      ctrl.onTransactionCommit = function(arg) {
        var action, auto, transaction;
        transaction = arg.transaction, action = arg.action, auto = arg.auto;
        return TransacTxsDispatcher.commitTx(transaction.links.commit, transaction.transaction_log.resource_type, transaction.mappings).then(null, function(err) {
          TransacAlertsService.send(err.message.type, "Failed to " + action + " sharing of " + transaction.transaction_log.reference);
          return $q.reject(err);
        }, function() {
          var phrase;
          phrase = auto ? action + "d ongoing sharing for" : action + "d sharing for";
          TransacAlertsService.send('success', phrase + " " + transaction.transaction_log.reference);
          return onTxsChange();
        });
      };
      ctrl.onReconcileTransactions = function(arg) {
        var apps, matches, transaction;
        transaction = arg.transaction, matches = arg.matches, apps = arg.apps;
        ctrl.reconcileData = {
          transaction: transaction,
          matches: matches,
          apps: apps
        };
        ctrl.reconciling = true;
        if (ctrl.onReconciling) {
          return ctrl.onReconciling(EventEmitter({
            isReconciling: true
          }));
        }
      };
      ctrl.onTransactionReconciled = function(args) {
        return TransacTxsDispatcher.mergeTxs(args).then(function(res) {
          TransacAlertsService.send(res.message.type, res.message.text);
          TransacTxsDispatcher.reloadTxs({
            type: ctrl.txsType,
            params: ctrl.filters
          });
          return res;
        }, function(err) {
          TransacAlertsService.send(err.message.type, err.message.text);
          return $q.reject(err);
        })["finally"](function() {
          ctrl.reconcileData = null;
          ctrl.reconciling = false;
          if (ctrl.onReconciling) {
            ctrl.onReconciling(EventEmitter({
              isReconciling: false
            }));
          }
          return $timeout((function() {
            return scrollToReconcilingTx();
          }), 0);
        });
      };
      initTxsState = function() {
        ctrl.txsType = TransacTxsStore.getState().txsType;
        ctrl.transactions = TransacTxsStore.getState().transactions;
        ctrl.pagination = TransacTxsStore.getState().pagination;
        ctrl.loading = TransacTxsStore.getState().loading;
        return TransacTxsStore.subscribe().then(null, null, function(state) {
          ctrl.txsType = state.txsType;
          ctrl.transactions = state.transactions;
          ctrl.pagination = state.pagination;
          ctrl.loading = state.loading;
          return ctrl.onLoadingChange(EventEmitter({
            loading: ctrl.loading
          }));
        });
      };
      onFilterTxs = function(options) {
        return TransacTxsDispatcher.reloadTxs(options).then(function() {
          return onTxsChange();
        });
      };
      onTxsChange = function() {
        var obj;
        if (!_.isUndefined(ctrl.onTransactionsChange)) {
          return ctrl.onTransactionsChange(EventEmitter((
            obj = {},
            obj["" + ctrl.txsType] = ctrl.pagination.total,
            obj
          )));
        }
      };
      scrollToReconcilingTx = function() {
        var selectedTxEl;
        selectedTxEl = $element.find('.reconciling .selected');
        if (_.isEmpty(selectedTxEl.get())) {
          return;
        }
        angular.element($document[0].body).animate({
          scrollTop: selectedTxEl.offset().top
        });
        selectedTxEl.parent().removeClass('reconciling');
      };
    }]
  });

}).call(this);
