
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
  angular.module('transac.components', ['transac.user', 'transac.top-bar', 'transac.transactions']);

}).call(this);


/*
 *   @desc Components for the Transac! library Top Bar Menu feature.
 */

(function() {
  angular.module('transac.top-bar', []).constant('MENUS', [
    {
      title: 'Transactions',
      type: 'pending',
      active: true
    }, {
      title: 'History',
      type: 'history',
      active: false
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
  angular.module('transac.transactions', ['transac.user', 'infinite-scroll']).value('EventEmitter', function(payload) {
    return {
      $event: payload
    };
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
    controller: ["TransacUserService", function(TransacUserService) {
      var ctrl, loadUser;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.transacReady = false;
        ctrl.isTopBarShown = true;
        ctrl.pendingTxsCount = 0;
        ctrl.historyTxCount = 0;
        return loadUser();
      };
      ctrl.onTxsComponentInit = function(arg) {
        var api;
        api = arg.api;
        return ctrl.txsCmpApi = api;
      };
      ctrl.onTopBarSelectMenu = function(arg) {
        var menu;
        menu = arg.menu;
        return ctrl.txsCmpApi.reloadTxs(menu.type);
      };
      ctrl.onTopBarSearch = function(arg) {
        var params, query, selectedMenu;
        query = arg.query, selectedMenu = arg.selectedMenu;
        params = query ? {
          $filter: query
        } : null;
        return ctrl.txsCmpApi.reloadTxs(selectedMenu.type, params, true);
      };
      ctrl.updateTransactionsCount = function(arg) {
        var historyTxsCount, pendingTxsCount;
        pendingTxsCount = arg.pendingTxsCount, historyTxsCount = arg.historyTxsCount;
        ctrl.pendingTxsCount = pendingTxsCount;
        return ctrl.historyTxsCount = historyTxsCount;
      };
      ctrl.toggleTopBar = function(arg) {
        var isReconciling;
        isReconciling = arg.isReconciling;
        return ctrl.isTopBarShown = !isReconciling;
      };
      loadUser = function() {
        return TransacUserService.fetch().then(null, function(err) {
          return ctrl.transacLoadError = true;
        })["finally"](function() {
          return ctrl.transacReady = true;
        });
      };
    }]
  });

}).call(this);


/*
 *   @desc "Tabs" style topbar menu component
 *   @require transac-search-bar component ($compiled)
 *   @binding {Function=} [onInitMenu] Callback fired $onInit, emitting the default selected menu
 *   @binding {Function} [onSelectMenu] Callback fired when a menu tab is clicked, emitting the selected menu
 *   @binding {number} [pendingTxsCount] number of pending transactions
 *   @binding {number} [historyTxsCount] number of history transactions
 */

(function() {
  angular.module('transac.top-bar').component('transacTopBar', {
    bindings: {
      onInitMenu: '&?',
      onSelectMenu: '&',
      onSearch: '&',
      pendingTxsCount: '<'
    },
    templateUrl: 'components/top-bar',
    controller: ["MENUS", "EventEmitter", "$compile", "$scope", function(MENUS, EventEmitter, $compile, $scope) {
      var contractSearchBar, ctrl, expandSearchBar;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.isSearchBarShown = false;
        ctrl.menus = angular.copy(MENUS);
        ctrl.selectedMenu = _.find(ctrl.menus, 'active');
        if (ctrl.onInitMenu != null) {
          return ctrl.onInitMenu(EventEmitter({
            menu: ctrl.selectedMenu
          }));
        }
      };
      ctrl.onMenuItemClick = function(menu) {
        if (_.isEqual(menu, ctrl.selectedMenu)) {
          return;
        }
        _.each(ctrl.menus, function(menu) {
          menu.active = false;
        });
        menu.active = true;
        ctrl.selectedMenu = menu;
        return ctrl.onSelectMenu(EventEmitter({
          menu: ctrl.selectedMenu
        }));
      };
      ctrl.getCount = function(menu) {
        return (menu.title && ctrl[menu.type + 'TxsCount']) || 0;
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
      ctrl.onSearchBarInit = function(arg) {
        var api;
        api = arg.api;
        return ctrl.searchBarApi = api;
      };
      ctrl.onSearchBarSubmit = function(args) {
        args.selectedMenu = ctrl.selectedMenu;
        return ctrl.onSearch(EventEmitter(args));
      };
      ctrl.onSearchBarChange = function(arg) {
        var isEditing;
        isEditing = arg.isEditing;
        return ctrl.isEditingSearchBar = isEditing;
      };
      expandSearchBar = function($event) {
        var $menu, searchBarCmp;
        searchBarCmp = "<transac-search-bar\n  on-init=\"onSearchBarInit($event)\"\n  on-submit=\"onSearchBarSubmit($event)\"\n  on-change=\"onSearchBarChange($event)\">\n</transac-search-bar>";
        $menu = angular.element($event.currentTarget.parentElement).find('.top-bar_menu');
        angular.merge($scope, {
          onSearchBarInit: ctrl.onSearchBarInit,
          onSearchBarSubmit: ctrl.onSearchBarSubmit,
          onSearchBarChange: ctrl.onSearchBarChange
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
          return $q.reject(err);
        });
      };
      return service;
    };
    _$get.$inject = ['$q', '$log'];
    provider.$get = _$get;
    return provider;
  });

}).call(this);

angular.module('maestrano.transac').run(['$templateCache', function($templateCache) {$templateCache.put('transac','<div ng-if="$ctrl.transacReady">\n  <transac-top-bar ng-show="$ctrl.isTopBarShown" on-select-menu="$ctrl.onTopBarSelectMenu($event)" on-search="$ctrl.onTopBarSearch($event)" pending-txs-count="$ctrl.pendingTxsCount" history-txs-count="$ctrl.historyTxsCount"></transac-top-bar>\n\n  <transac-txs on-init="$ctrl.onTxsComponentInit($event)" on-transactions-change="$ctrl.updateTransactionsCount($event)" on-reconciling="$ctrl.toggleTopBar($event)"></transac-txs>\n</div>\n<div ng-if="!$ctrl.transacReady">\n  <p>Loading...</p>\n</div>\n');
$templateCache.put('components/top-bar','<div class="top-bar">\n  <div class="top-bar_menu">\n    <a href="" class="top-bar_menu_tab top-bar_menu_flex-item" ng-class="{ \'active\': menu.active }" ng-click="$ctrl.onMenuItemClick(menu)" ng-repeat="menu in $ctrl.menus track by $index">\n      <h5>{{::menu.title}} ({{$ctrl.getCount(menu)}})</h5>\n    </a>\n    <!-- $compiles transac-search-bar cmp here (see controller) -->\n  </div>\n  <button class="top-bar_toggle-search-btn" ng-click="$ctrl.toggleSearch($event)">\n    <i class="fa fa-2x fa-fw" ng-class="{ \'fa-search\': !$ctrl.isEditingSearchBar, \'fa-times\': $ctrl.isEditingSearchBar }" aria-hidden="true"></i>\n  </button>\n</div>\n');
$templateCache.put('components/top-bar/search-bar','<input type="text" placeholder="Search Transactions..." ng-model="$ctrl.search.text" ng-keypress="$ctrl.submitOnKeypress($event)" ng-change="$ctrl.onSearchChange()">\n');
$templateCache.put('components/transactions/transaction','<div ng-class="{ \'selected\': $ctrl.isSelected }">\n  <div class="summary">\n    <a href="" class="summary_content" ng-click="$ctrl.selectOnClick()">\n      <div class="summary_content_icon">\n        <i class="fa {{$ctrl.icon()}} fa-2x" aria-hidden="true"></i>\n      </div>\n      <div class="summary_content_caption">\n        <div class="summary_content_caption_title">\n          <span>{{::$ctrl.title()}}</span>\n        </div>\n        <div class="summary_content_caption_subtitle">\n          <span>{{::$ctrl.subtitle()}}</span>\n        </div>\n      </div>\n      <div class="summary_content_warning">\n        <div ng-if="$ctrl.hasMatches()">\n          <i class="fa fa-exclamation-triangle fa-lg" aria-hidden="true"></i>\n          <span>This record may be a duplicate</span>\n        </div>\n      </div>\n    </a>\n    <div class="summary_actions">\n      <button type="button" class="summary_actions_action--deny" ng-click="$ctrl.denyOnClick()">\n        <i class="fa fa-times fa-2x"></i>\n      </button>\n      <button type="button" class="summary_actions_action--approve" ng-click="$ctrl.approveOnClick(true)">\n        <i class="fa fa-check fa-2x"></i>\n      </button>\n    </div>\n  </div>\n  <div class="detail" ng-if="$ctrl.isSelected">\n    <div class="row">\n      <div class="col-md-6 detail_section no-gutters">\n        <transac-tx-changes changes="$ctrl.formattedChanges"></transac-tx-changes>\n      </div>\n      <div class="col-md-3 detail_section no-gutters">\n        <div class="detail_section_title">\n          <h5>Select apps to share with:</h5>\n        </div>\n        <div class="detail_section_app" ng-repeat="mapping in ::$ctrl.transaction.mappings" ng-click="$ctrl.selectAppOnClick($event, mapping)">\n          <span>{{::mapping.app_name}}</span>\n          <input type="checkbox" ng-checked="mapping.sharedWith">\n        </div>\n      </div>\n      <div class="col-md-3 detail_section no-gutters">\n        <div class="detail_section_action detail_section_action--approve" ng-click="$ctrl.approveOnClick()">\n          <span>Approve only this time</span>\n          <button type="button">\n            <i class="fa fa-check fa-2x"></i>\n          </button>\n        </div>\n        <div class="detail_section_action detail_section_action--deny" ng-click="$ctrl.denyOnClick(true)">\n          <span>Never share this record</span>\n          <button type="button">\n            <i class="fa fa-ban"></i>\n          </button>\n        </div>\n        <div class="detail_section_action detail_section_action--duplicate" ng-click="$ctrl.reconcileOnClick()" ng-if="$ctrl.hasMatches()">\n          <span>This record is a duplicate</span>\n          <button type="button">\n            <i class="fa fa-link fa-2x"></i>\n          </button>\n        </div>\n      </div>\n    </div>\n    <div ng-if="$ctrl.hasMatches()">\n      <div class="row detail_dup-line-break">\n        <div class="detail_dup-line-break_spacer detail_dup-line-break_spacer--left"></div>\n        <div class="detail_dup-line-break_title">\n          <div>\n            <i class="fa fa-exclamation fa-lg" aria-hidden="true"></i>\n            <span>Potential Duplicates</span>\n          </div>\n        </div>\n        <div class="detail_dup-line-break_spacer detail_dup-line-break_spacer--right"></div>\n      </div>\n      <div class="row">\n        <div class="col-md-12 col-xs-12 detail_section detail_section_matches">\n          <transac-tx-matches matches="::$ctrl.matches"></transac-tx-matches>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-changes','<div class="table-responsive">\n  <table class="table table-striped borderless">\n    <tr>\n      <th ng-if="$ctrl.onSelect">Tick</th>\n      <th>Field</th>\n      <th>Value</th>\n    </tr>\n    <tr ng-repeat="(key, value) in ::$ctrl.changes">\n      <td ng-if="$ctrl.onSelect"><input type="checkbox"></td>\n      <td>{{::key}}</td>\n      <td>{{::value}}</td>\n    </tr>\n  </table>\n</div>\n');
$templateCache.put('components/transactions/transaction-reconcile','<div class="top-panel">\n  <button class="top-panel_action-btns" ng-click="$ctrl.back()">\n    <i class="fa fa-angle-double-left fa-2x"></i>\n  </button>\n  <div class="top-panel_title">\n    <span>Reconcile duplicate records</span>\n  </div>\n  <button class="top-panel_action-btns right-align" ng-if="$ctrl.isNextBtnShown()" ng-click="$ctrl.next()">\n    <i class="fa fa-angle-double-right fa-2x"></i>\n  </button>\n  <button class="top-panel_action-btns top-panel_action-btns--done right-align" ng-if="!$ctrl.editing" ng-click="$ctrl.publish()">\n    <i class="fa fa-check fa-2x"></i>\n  </button>\n</div>\n<div class="edit" ng-show="$ctrl.editing">\n  <div class="edit_tx">\n    <transac-tx-tile  ng-repeat="tx in ::$ctrl.transactions track by tx.id" transaction="::tx" checked="$ctrl.isTxChecked(tx)" on-select="$ctrl.onSelect($event)"></transac-tx-tile>\n  </div>\n</div>\n<div class="review" ng-if="!$ctrl.editing">\n  <div class="review_tx">\n    <transac-tx-tile transaction="::$ctrl.selectedTx" title="::$ctrl.selectedTxTitle" subtitle="::$ctrl.selectedTxSubtitle"></transac-tx-tile>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-matches','<div ng-repeat="match in ::$ctrl.matches" class="match">\n  <div class="match_caption">\n    <div class="match_caption_title">\n      <span>{{::$ctrl.title(match)}}</span>\n    </div>\n    <div class="match_caption_subtitle">\n      <span>{{::$ctrl.subtitle(match)}}</span>\n    </div>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-tile','<div class="tx-tile">\n  <div class="tx-tile_topbar row no-gutters" ng-class="{\'no-click\': !$ctrl.isOnSelectDefined()}" ng-click="$ctrl.onSelectTx()">\n    <div class="tx-tile_topbar_checkbox" ng-if="$ctrl.isOnSelectDefined()">\n      <input type="checkbox" ng-checked="$ctrl.checked" disabled>\n    </div>\n    <div class="tx-tile_topbar_text">\n      <h5>{{::$ctrl.title}}</h5>\n      <div class="tx-tile_topbar_text_subtitle">\n        <p>{{::$ctrl.subtitle}}</p>\n      </div>\n    </div>\n  </div>\n  <transac-tx-changes changes="::$ctrl.formattedTxAttrs"></transac-tx-changes>\n</div>\n');
$templateCache.put('components/transactions/transactions','<div ng-hide="$ctrl.reconciling" infinite-scroll="$ctrl.loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="$ctrl.isPaginationDisabled()">\n  <!-- <transac-txs-controls></transac-txs-controls> -->\n  <transac-tx transaction="transaction" ng-repeat="transaction in $ctrl.transactions track by transaction.transaction_log.id" on-commit="$ctrl.onTransactionCommit($event)" on-reconcile="$ctrl.onReconcileTransactions($event)"></transac-tx>\n  <div ng-if="$ctrl.loading" class="loading">\n    <i class="fa fa-spinner fa-spin fa-3x" aria-hidden="true"></i>\n  </div>\n  <div ng-if="!$ctrl.loading" class="manual-load">\n    <div ng-if="($ctrl.txsType == \'pending\')">\n      <button ng-click="$ctrl.loadMore()">{{$ctrl.isPaginationDisabled() ? \'Retry\' : \'Scroll for more\'}}</button>\n    </div>\n    <div ng-if="($ctrl.txsType == \'history\')">\n      <span>Coming Soon</span>\n    </div>\n  </div>\n</div>\n<div ng-if="$ctrl.reconciling">\n  <transac-tx-reconcile transaction="$ctrl.reconcileData.transaction" matches="$ctrl.reconcileData.matches" apps="$ctrl.reconcileData.apps" on-reconciled="$ctrl.onTransactionReconciled($event)"></transac-tx-reconcile>\n</div>\n');}]);

/*
 *   @desc Contains business logic for Transactions & Matches.
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
     *   @http GET /api/v2/org-fbcy/transaction_logs/{pending|history}
     *   @param {string} [type] Type of transactions e.g 'pending', 'history'
     *   @returns {Promise<Object>} A promise to the list of Transactions and pagination data.
     */
    this.get = function(type, params) {
      var orgUid, url;
      if (type == null) {
        type = 'pending';
      }
      if (params == null) {
        params = {};
      }
      orgUid = DEV_AUTH.orgUid || TransacUserService.getCurrentOrg().uid;
      url = "https://api-connec-sit.maestrano.io/api/v2/" + orgUid + "/transaction_logs/" + type;
      params = angular.merge({}, _self.getHttpConfig(), params);
      return $http.get(url, params).then(function(response) {
        return {
          transactions: response.data.transactions,
          pagination: response.data.pagination
        };
      }, function(err) {
        $log.error('TransacTxsService Error: ', err);
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
        $log.error('TransacTxsService Error: ', err);
        return $q.reject(err);
      });
    };

    /*
     *   @desc Find matching transacations rated with a score representing duplicate likelyhood.
     *   @http GET /api/v2/org-fbcy/organizations/b1733560-d577-0134-317d-74d43510c326/matches
     *   @param {string} [url] Transaction links matches URL.
     *   @param {string} [resource] Transaction resource type.
     *   @param {Object} [params] Params to serialise into GET request URL.
     *   @returns {Promise<Object>} A promise to the matching transactions & pagination data.
     */
    this.matches = function(url, resource, params) {
      if (params == null) {
        params = {};
      }
      params = angular.merge({}, _self.getHttpConfig(), params);
      return $http.get(url, params).then(function(response) {
        return {
          matches: response.data[resource] || [],
          pagination: response.data.pagination
        };
      }, function(err) {
        $log.error('TransacTxsService Error: ', err);
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
        $log.error('TransacTxsService Error: ', err);
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
            return (_.get(transaction.changes, 'transaction_number')) + " (" + (_.get(transaction.changes, 'type')) + ")";
          default:
            return _.get(transaction.changes, 'name', 'No name found');
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
      var acceptedAttrs, acceptedTxAttrs;
      acceptedAttrs = (function() {
        switch (resource) {
          case 'organizations':
            return ['name', 'status', 'address', 'email', 'phone', 'referred_leads', 'website'];
          case 'tax_codes':
            return ['name', 'reference', 'sale_tax_rate', 'sale_taxes', 'status', 'tax_type'];
          case 'accounts':
            return ['name', 'reference', 'code', 'currency', 'description', 'status'];
          default:
            return [];
        }
      })();
      acceptedTxAttrs = _.pick(txAttrs, acceptedAttrs);
      acceptedTxAttrs = _.isEmpty(acceptedTxAttrs) ? txAttrs : acceptedTxAttrs;
      _.each(['updated_at', 'created_at'], function(key) {
        acceptedTxAttrs[key] = _self.formatDisplayDate(_.get(txAttrs, key));
      });
      return _self.flattenObject(acceptedTxAttrs);
    };

    /*
     *   @desc Format datestring into Transac! date display format
     *   @param {string} [date] A date string
     *   @return {string} A formatted date string
     */
    this.formatDisplayDate = function(date) {
      return $window.moment(date).format('MMM d, Y h:m');
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
 *   @desc Search bar component that builds a API query string, and emits change events.
 *   @binding {Function} [onSubmit] Callback fired on keypress with keyCode 13 (enter)
 *   @binding {Function=} [onChange] Callback fired on input ngChange
 *   @binding {Function=} [onInit]  Callback fired on component initialize, emitting an api for exposing cmp methods to the parent component
 */

(function() {
  angular.module('transac.top-bar').component('transacSearchBar', {
    bindings: {
      onSubmit: '&',
      onChange: '&?',
      onInit: '&?'
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
        var args;
        if ($event == null) {
          $event = {};
        }
        if (force == null) {
          force = false;
        }
        if (!($event.keyCode === 13 || force)) {
          return;
        }
        if (ctrl.search.text) {
          args = {
            query: "reference match /" + ctrl.search.text + "/"
          };
        } else {
          args = {
            query: null
          };
        }
        return ctrl.onSubmit(EventEmitter(args));
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
      onCommit: '&',
      onReconcile: '&'
    },
    templateUrl: 'components/transactions/transaction',
    controller: ["$element", "$timeout", "EventEmitter", "TransacTxsService", function($element, $timeout, EventEmitter, TransacTxsService) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.formattedChanges = TransacTxsService.formatAttributes(ctrl.transaction.changes, ctrl.transaction.transaction_log.resource_type);
        _.each(ctrl.transaction.mappings, function(m) {
          return m.sharedWith = true;
        });
        return TransacTxsService.matches(ctrl.transaction.links.matches, ctrl.transaction.transaction_log.resource_type).then(function(response) {
          return ctrl.matches = response.matches;
        }, function(err) {});
      };
      ctrl.title = function() {
        return TransacTxsService.formatTitle(ctrl.transaction);
      };
      ctrl.subtitle = function() {
        var action, date, fromApps, toApps;
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
        return date + ", from " + (fromApps.join(', ')) + " to " + (toApps.join(', '));
      };
      ctrl.icon = function() {
        switch (ctrl.transaction.transaction_log.action.toLowerCase()) {
          case 'create':
            return 'fa-plus-circle';
          case 'update':
            return 'fa-pencil-square';
        }
      };
      ctrl.hasMatches = function() {
        return ctrl.matches && ctrl.matches.length;
      };
      ctrl.selectOnClick = function() {
        return ctrl.isSelected = !ctrl.isSelected;
      };
      ctrl.approveOnClick = function(auto) {
        var el;
        if (auto == null) {
          auto = false;
        }
        el = $element;
        el.addClass('deleting');
        _.each(ctrl.transaction.mappings, function(m) {
          m.commit = m.sharedWith;
          m.auto_commit = auto;
        });
        return ctrl.onCommit(EventEmitter({
          transaction: ctrl.transaction
        })).then(function(res) {
          return $timeout(function() {
            if (!res.success) {
              return el.removeClass('deleting');
            }
          }, 300);
        });
      };
      ctrl.denyOnClick = function(auto) {
        var el;
        if (auto == null) {
          auto = false;
        }
        el = $element;
        el.addClass('deleting');
        _.each(ctrl.transaction.mappings, function(m) {
          m.commit = !m.sharedWith;
          m.push_disabled = auto;
        });
        return ctrl.onCommit(EventEmitter({
          transaction: ctrl.transaction
        })).then(function(res) {
          return $timeout(function() {
            if (!res.success) {
              return el.removeClass('deleting');
            }
          }, 300);
        });
      };
      ctrl.reconcileOnClick = function() {
        var transaction;
        if (!ctrl.hasMatches()) {
          return;
        }
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
    controller: ["EventEmitter", function(EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
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
      ctrl.isSelectedTxSelected = function() {
        return !_.isEmpty(ctrl.selectedTx);
      };
      ctrl.isNextBtnShown = function() {
        return ctrl.editing && ctrl.isSelectedTxSelected();
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
        var appName, date, matchTxLog;
        matchTxLog = match.transaction_logs[0];
        appName = _.get(matchTxLog, 'app_name');
        date = TransacTxsService.formatDisplayDate(_.get(matchTxLog, 'created_at'));
        if (appName) {
          return date + ", from " + appName;
        } else {
          return date;
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
      title: '<?',
      subtitle: '<?',
      checked: '<?',
      onSelect: '&?'
    },
    templateUrl: 'components/transactions/transaction-tile',
    controller: ["EventEmitter", "TransacTxsService", function(EventEmitter, TransacTxsService) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.title || (ctrl.title = 'Transaction');
        ctrl.subtitle || (ctrl.subtitle = ctrl.buildSubtitle());
        return ctrl.formattedTxAttrs = TransacTxsService.formatAttributes(ctrl.transaction, ctrl.transaction.resource_type);
      };
      ctrl.buildSubtitle = function() {
        var matchTxLogs;
        if (ctrl.transaction.app_name) {
          return "From " + ctrl.transaction.app_name;
        }
        matchTxLogs = ctrl.transaction.transaction_logs;
        if (_.isEmpty(matchTxLogs)) {
          return '';
        } else {
          return "From " + matchTxLogs[0].app_name;
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
 *   @binding {Function=} [onTransactionsChange] Callback fired on change to stored txs model
 *   @binding {Function=} [onReconciling] Callback fired on reconcile tx with matches (dups)
 *   @binding {Function=} [onInit] Callback fired on component initialize, emitting an api for exposing cmp methods to the parent component
 */

(function() {
  angular.module('transac.transactions').component('transacTxs', {
    bindings: {
      txsType: '<?',
      onInit: '&?',
      onTransactionsChange: '&?',
      onReconciling: '&?'
    },
    templateUrl: 'components/transactions/transactions',
    controller: ["$q", "EventEmitter", "TransacTxsService", function($q, EventEmitter, TransacTxsService) {
      var ctrl, loadTxs, onTransactionsChange;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.transactions = [];
        ctrl.txsType || (ctrl.txsType = 'pending');
        ctrl.reconciling = false;
        ctrl.pagination = {
          limit: 10,
          page: 1,
          total: 0
        };
        ctrl.pagination.defaultParams = {
          $skip: 0,
          $top: ctrl.pagination.limit
        };
        ctrl.cacheParams = null;
        loadTxs();
        if (ctrl.onInit != null) {
          ctrl.api = {
            reloadTxs: ctrl.reload
          };
          return ctrl.onInit(EventEmitter({
            api: ctrl.api
          }));
        }
      };
      ctrl.loadMore = function() {
        var offset, params;
        if (ctrl.isPaginationDisabled()) {
          return loadTxs(ctrl.cacheParams);
        }
        ctrl.pagination.page += 1;
        offset = (ctrl.pagination.page - 1) * ctrl.pagination.limit;
        params = {
          $skip: offset,
          $top: ctrl.pagination.limit
        };
        if (ctrl.cachedParams) {
          angular.merge(params, ctrl.cachedParams);
        }
        return loadTxs(params);
      };
      ctrl.reload = function(type, params, cacheParams) {
        if (type == null) {
          type = ctrl.txsType;
        }
        if (params == null) {
          params = null;
        }
        if (cacheParams == null) {
          cacheParams = false;
        }
        ctrl.txsType = type;
        ctrl.cachedParams = cacheParams ? params : null;
        ctrl.transactions.length = 0;
        ctrl.pagination.page = 1;
        return loadTxs(params, type);
      };
      ctrl.isPaginationDisabled = function() {
        return ctrl.loading || ctrl.pagination.total <= 0;
      };
      ctrl.onTransactionCommit = function(arg) {
        var transaction;
        transaction = arg.transaction;
        return TransacTxsService.commit(transaction.links.commit, transaction.transaction_log.resource_type, transaction.mappings).then(function(response) {
          ctrl.transactions = _.reject(ctrl.transactions, function(tx) {
            return tx.transaction_log.id === transaction.transaction_log.id;
          });
          onTransactionsChange(ctrl.pagination.total -= 1);
          return $q.when({
            success: true
          });
        }, function(err) {
          return $q.when({
            success: false
          });
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
        var transaction;
        ctrl.reconcileData = null;
        ctrl.reconciling = false;
        if (ctrl.onReconciling) {
          ctrl.onReconciling(EventEmitter({
            isReconciling: false
          }));
        }
        if (args == null) {
          return;
        }
        transaction = _.find(ctrl.transactions, function(tx) {
          return tx.transaction_log.id === args.txId;
        });
        if (transaction == null) {
          return;
        }
        return TransacTxsService.merge(transaction.links.merge, transaction.transaction_log.resource_type, args.mergeParams).then(function(response) {
          ctrl.transactions = _.reject(ctrl.transactions, function(tx) {
            return tx.transaction_log.id === transaction.transaction_log.id;
          });
          return onTransactionsChange(ctrl.pagination.total -= 1);
        }, function(err) {});
      };
      loadTxs = function(params, type) {
        if (params == null) {
          params = null;
        }
        if (type == null) {
          type = ctrl.txsType;
        }
        ctrl.loading = true;
        params || (params = ctrl.cachedParams || ctrl.pagination.defaultParams);
        return TransacTxsService.get(type, {
          params: params
        }).then(function(response) {
          ctrl.transactions = ctrl.transactions.concat(response.transactions);
          ctrl.pagination.total = response.pagination.total;
          ctrl.cacheParams = null;
          return onTransactionsChange();
        }, function(error) {
          return ctrl.pagination.total = 0;
        })["finally"](function() {
          return ctrl.loading = false;
        });
      };
      onTransactionsChange = function(txsCount) {
        var obj;
        if (txsCount == null) {
          txsCount = ctrl.pagination.total;
        }
        if (_.isUndefined(ctrl.onTransactionsChange)) {
          return;
        }
        return ctrl.onTransactionsChange(EventEmitter((
          obj = {},
          obj[ctrl.txsType + "TxsCount"] = txsCount,
          obj
        )));
      };
    }]
  });

}).call(this);
