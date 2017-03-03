(function() {
  angular.module('maestrano.transac', ['transac.components', 'transac.common', 'ngSanitize']).config([
    '$httpProvider', function($httpProvider) {
      $httpProvider.defaults.headers.common['Accept'] = 'application/json';
      return $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
    }
  ]);

}).call(this);

(function() {
  angular.module('transac.common', ['transac.top-bar']);

}).call(this);

(function() {
  angular.module('transac.components', ['transac.user', 'transac.transactions']);

}).call(this);

(function() {
  angular.module('transac.top-bar', []).constant("MENUS", [
    {
      title: 'Transactions',
      active: true
    }, {
      title: 'History',
      active: false
    }
  ]).value('EventEmitter', function(payload) {
    return {
      $event: payload
    };
  });

}).call(this);

(function() {
  angular.module('transac.user', []);

}).call(this);

(function() {
  angular.module('transac.transactions', ['transac.user']).value('EventEmitter', function(payload) {
    return {
      $event: payload
    };
  }).constant('DEV_AUTH', {
    apiKey: '9f59b930-ded2-0134-88ae-0dc5706ed3c0',
    apiSecret: 'YG4pnBBqY4zkVXuGcR1nwg',
    orgUid: 'org-fbba'
  });

}).call(this);

angular.module('maestrano.transac').run(['$templateCache', function($templateCache) {$templateCache.put('transac','<div ng-if="$ctrl.transacReady">\n  <top-bar ng-show="$ctrl.isTopBarShown" on-select-menu="$ctrl.onTopBarSelectMenu($event)" transactions-count="$ctrl.transactionsCount"></top-bar>\n\n  <transactions on-transactions-change="$ctrl.updateTransactionsCount($event)" on-reconciling="$ctrl.toggleTopBar($event)"></transactions>\n</div>\n<div ng-if="!$ctrl.transacReady">\n  <p>Loading...</p>\n</div>\n\n');
$templateCache.put('common/top-bar','<div class="menu">\n  <a href="" class="menu-tab" ng-class="{ \'active\': menu.active }" ng-click="$ctrl.onMenuItemClick(menu)" ng-repeat="menu in $ctrl.menus track by $index">\n    <h5>{{::menu.title}} ({{$ctrl.getCount(menu)}})</h5>\n  </a>\n</div>\n');
$templateCache.put('components/transactions/transaction','<div ng-class="{ \'selected\': $ctrl.isSelected }">\n  <div class="summary">\n    <a href="" class="summary-title" ng-click="$ctrl.selectOnClick()">\n      <div class="summary-title-caption">\n        <span>{{::$ctrl.title()}}</span>\n      </div>\n      <div class="summary-title-warning">\n        <div ng-if="$ctrl.hasMatches()">\n          <i class="fa fa-exclamation-triangle fa-lg"></i>\n          <span>This record may be a duplicate</span>\n        </div>\n      </div>\n    </a>\n    <div class="summary-actions">\n      <button type="button" class="summary-actions-action--deny" ng-click="$ctrl.denyOnClick()">\n        <i class="fa fa-times fa-2x"></i>\n      </button>\n      <button type="button" class="summary-actions-action--approve" ng-click="$ctrl.approveOnClick(true)">\n        <i class="fa fa-check fa-2x"></i>\n      </button>\n    </div>\n  </div>\n  <div class="detail" ng-if="$ctrl.isSelected">\n    <div class="row">\n      <div class="col-md-6 detail-section no-gutters">\n        <transaction-changes changes="$ctrl.changes"></transaction-changes>\n      </div>\n      <div class="col-md-3 detail-section no-gutters">\n        <div class="detail-section-title">\n          <h5>Select apps to share with:</h5>\n        </div>\n        <div class="detail-section-app" ng-repeat="mapping in ::$ctrl.transaction.mappings track by mapping.group_id" ng-click="$ctrl.selectAppOnClick($event, mapping)">\n          <span>{{::mapping.app_name}}</span>\n          <input type="checkbox" ng-checked="mapping.sharedWith">\n        </div>\n      </div>\n      <div class="col-md-3 detail-section no-gutters">\n        <div class="detail-section-action detail-section-action--approve" ng-click="$ctrl.approveOnClick()">\n          <span>Approve only this time</span>\n          <button type="button">\n            <i class="fa fa-check fa-2x"></i>\n          </button>\n        </div>\n        <div class="detail-section-action detail-section-action--deny" ng-click="$ctrl.denyOnClick(true)">\n          <span>Never share this record</span>\n          <button type="button">\n            <i class="fa fa-ban"></i>\n          </button>\n        </div>\n        <div class="detail-section-action detail-section-action--duplicate" ng-click="$ctrl.reconcileOnClick()" ng-if="$ctrl.hasMatches()">\n          <span>This record is a duplicate</span>\n          <button type="button">\n            <i class="fa fa-link fa-2x"></i>\n          </button>\n        </div>\n      </div>\n    </div>\n    <div ng-if="$ctrl.hasMatches()">\n      <div class="row detail-spacers">\n        <div class="detail-spacers-spacer detail-spacers-spacer--left"></div>\n        <div class="detail-spacers-title">\n          <div>\n            <i class="fa fa-exclamation fa-lg"></i>\n            <span>Potential Duplicates</span>\n          </div>\n        </div>\n        <div class="detail-spacers-spacer detail-spacers-spacer--right"></div>\n      </div>\n      <div class="row">\n        <div class="col-md-12 col-xs-12 detail-section detail-section-matches">\n          <div ng-repeat="match in ::$ctrl.matches" class="detail-section-matches-match">\n            {{::$ctrl.matchTitle(match)}}\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-changes','<div class="table-responsive">\n  <table class="table table-striped borderless">\n    <tr>\n      <th ng-if="$ctrl.onSelect">Tick</th>\n      <th>Field</th>\n      <th>Value</th>\n    </tr>\n    <tr ng-repeat="(key, value) in ::$ctrl.changes">\n      <td ng-if="$ctrl.onSelect"><input type="checkbox"></td>\n      <td>{{::key}}</td>\n      <td>{{::value}}</td>\n    </tr>\n  </table>\n</div>\n');
$templateCache.put('components/transactions/transaction-reconcile','<div class="top-panel">\n  <button class="top-panel_action-btns" ng-click="$ctrl.back()">\n    <i class="fa fa-angle-double-left fa-2x"></i>\n  </button>\n  <div class="top-panel_title">\n    <span>Reconcile duplicate records</span>\n  </div>\n  <button class="top-panel_action-btns right-align" ng-if="$ctrl.isNextBtnShown()" ng-click="$ctrl.next()">\n    <i class="fa fa-angle-double-right fa-2x"></i>\n  </button>\n  <button class="top-panel_action-btns top-panel_action-btns--done right-align" ng-if="!$ctrl.editing" ng-click="$ctrl.publish()">\n    <i class="fa fa-check fa-2x"></i>\n  </button>\n</div>\n<div class="edit" ng-show="$ctrl.editing">\n  <div class="edit_tx">\n    <transaction-tile  ng-repeat="tx in ::$ctrl.transactions track by tx.id" transaction="::tx" checked="$ctrl.isTxChecked(tx)" on-select="$ctrl.onSelect($event)"></transaction-tile>\n  </div>\n</div>\n<div class="review" ng-if="!$ctrl.editing">\n  <div class="review_tx">\n    <transaction-tile transaction="$ctrl.selectedTx" title="$ctrl.selectedTxTitle" subtitle="$ctrl.selectedTxSubtitle"></transaction-tile>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-tile','<div class="tx-tile">\n  <div class="tx-tile_topbar row no-gutters" ng-class="{\'no-click\': !$ctrl.isOnSelectDefined()}" ng-click="$ctrl.onSelectTx()">\n    <div class="tx-tile_topbar_checkbox" ng-if="$ctrl.isOnSelectDefined()">\n      <input type="checkbox" ng-checked="$ctrl.checked">\n    </div>\n    <div class="tx-tile_topbar_text">\n      <h5>{{::$ctrl.title}}</h5>\n      <span>{{::$ctrl.subtitle}}</span>\n    </div>\n  </div>\n  <transaction-changes changes="::$ctrl.transaction.formatted"></transaction-changes>\n</div>\n');
$templateCache.put('components/transactions/transactions','<div ng-if="!$ctrl.loading">\n  <div ng-hide="$ctrl.reconciling">\n    <!-- <transactions-controls></transactions-controls> -->\n    <transaction transaction="transaction" ng-repeat="transaction in $ctrl.transactions track by transaction.transaction_log.id" on-commit="$ctrl.onTransactionCommit($event)" on-reconcile="$ctrl.onReconcileTransactions($event)"></transaction>\n  </div>\n  <div ng-if="$ctrl.reconciling">\n    <transaction-reconcile transaction="$ctrl.reconcileData.transaction" matches="$ctrl.reconcileData.matches" apps="$ctrl.reconcileData.apps" on-reconciled="$ctrl.onTransactionReconciled($event)"></transaction-reconcile>\n  </div>\n</div>\n<div ng-if="$ctrl.loading">\n  <p>Loading Transactions...</p>\n</div>\n');}]);
(function() {
  angular.module('maestrano.transac').component('transac', {
    bindings: {},
    templateUrl: 'transac',
    controller: ["TransacUserService", function(TransacUserService) {
      var ctrl, loadUser;
      ctrl = this;
      loadUser = function() {
        return TransacUserService.fetch().then(function(user) {
          ctrl.transacReady = true;
          return console.log(user);
        }, function(err) {
          ctrl.transacReady = true;
          return ctrl.transacLoadError = true;
        });
      };
      ctrl.$onInit = function() {
        ctrl.transacReady = false;
        ctrl.isTopBarShown = true;
        ctrl.transactionsCount = 0;
        return loadUser();
      };
      ctrl.onTopBarSelectMenu = function(arg) {
        var menu;
        menu = arg.menu;
        return console.log('selected menu: ', menu);
      };
      ctrl.updateTransactionsCount = function(arg) {
        var count, topbar;
        count = arg.count, topbar = arg.topbar;
        return ctrl.transactionsCount = count;
      };
      ctrl.toggleTopBar = function(arg) {
        var isReconciling;
        isReconciling = arg.isReconciling;
        return ctrl.isTopBarShown = !isReconciling;
      };
    }]
  });

}).call(this);

(function() {
  angular.module('transac.top-bar').component('topBar', {
    bindings: {
      onSelectMenu: '&',
      transactionsCount: '<'
    },
    templateUrl: 'common/top-bar',
    controller: ["MENUS", "EventEmitter", function(MENUS, EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        return ctrl.menus = MENUS;
      };
      ctrl.onMenuItemClick = function(menu) {
        _.each(ctrl.menus, function(menu) {
          menu.active = false;
        });
        menu.active = true;
        return ctrl.onSelectMenu(EventEmitter({
          menu: menu
        }));
      };
      ctrl.getCount = function(menu) {
        return (menu.title && ctrl[menu.title.toLowerCase() + 'Count']) || 0;
      };
    }]
  });

}).call(this);

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
      service.get = function() {
        return angular.copy(service.user);
      };
      service.getCurrentOrg = function() {
        if (_.isEmpty(service.user)) {
          return {};
        }
        return _.find(service.user.organizations, function(org) {
          return org.id === service.user.currentOrgId;
        });
      };
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
          service.user = angular.merge(response[0], response[1]);
          return service.user;
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

(function() {
  angular.module('transac.transactions').service('TransactionsService', ["$http", "TransacUserService", "DEV_AUTH", function($http, TransacUserService, DEV_AUTH) {
    var _self;
    _self = this;
    _self.HTTP_CONFIG = {};
    this.developer = function() {
      if (!_.isUndefined(_self._developer)) {
        return _self.developer;
      }
      if (DEV_AUTH.apiKey && DEV_AUTH.apiSecret && DEV_AUTH.orgUid) {
        _self.HTTP_CONFIG = {
          headers: {
            'Authorization': 'Basic ' + window.btoa(DEV_AUTH.apiKey + ":" + DEV_AUTH.apiSecret)
          }
        };
        return _self._developer = true;
      } else {
        _self.HTTP_CONFIG = {
          params: {
            sso_session: TransacUserService.get().sso_session
          }
        };
        return _self._developer = false;
      }
    };
    this.get = function(type) {
      var orgUid, url;
      if (type == null) {
        type = 'pending';
      }
      orgUid = _self.developer() ? DEV_AUTH.orgUid : TransacUserService.getCurrentOrg().uid;
      url = "https://api-connec-sit.maestrano.io/api/v2/" + orgUid + "/transaction_logs/" + type;
      return $http.get(url, _self.HTTP_CONFIG).then(function(response) {
        return {
          transactions: response.data.transactions
        };
      }, function(err) {
        console.error(err);
        return err;
      });
    };
    this.commit = function(url, resource, mappings) {
      var params;
      if (mappings == null) {
        mappings = [];
      }
      params = {
        mappings: mappings
      };
      return $http.put(url, params, _self.HTTP_CONFIG).then(function(response) {
        return {
          transaction: response.data[resource]
        };
      }, function(err) {
        console.error(err);
        return err;
      });
    };
    this.matches = function(url, resource, params) {
      if (params == null) {
        params = {};
      }
      params = angular.merge({}, _self.HTTP_CONFIG, params);
      return $http.get(url, params).then(function(response) {
        return {
          matches: response.data[resource] || [],
          pagination: response.data.pagination
        };
      }, function(err) {
        console.error(err);
        return err;
      });
    };
    this.merge = function(url, resource, params) {
      if (params == null) {
        params = {};
      }
      return $http.put(url, params, _self.HTTP_CONFIG).then(function(response) {
        return {
          transaction: response.data[resource]
        };
      }, function(err) {
        console.error(err);
        return err;
      });
    };
    this.formatTitle = function(transaction) {
      var action, entity, formatted_entity, title;
      action = transaction.transaction_log.action.toLowerCase();
      entity = transaction.transaction_log.resource_type;
      formatted_entity = _.capitalize(_.words(entity).join(' '));
      title = (function() {
        switch (entity) {
          case 'credit_notes':
            return (_.get(transaction.changes, 'transaction_number')) + " (" + (_.get(transaction.changes, 'type')) + ")";
          default:
            return _.get(transaction.changes, 'name', 'No name found');
        }
      })();
      return action + " " + formatted_entity + ": " + title;
    };
    this.formatMatchTitle = function(transaction) {
      var key, title, type;
      title = (function() {
        switch (transaction.resource_type) {
          case 'organizations':
            key = _.map(transaction, function(v, k) {
              if (_.includes(k, ['is_']) && v === true) {
                return k;
              }
            });
            key = _.compact(key)[0];
            type = key.split('_').slice(-1);
            return type + ": " + transaction.name;
          default:
            return _.get(transaction, 'name', 'No name found');
        }
      })();
      return title;
    };
    this.formatChanges = function(transaction) {
      var accepted_changes, attributes;
      attributes = (function() {
        switch (transaction.resource_type) {
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
      accepted_changes = _.pick(transaction, attributes);
      accepted_changes = _.isEmpty(accepted_changes) ? transaction : accepted_changes;
      transaction.formatted = _self.flattenObject(accepted_changes);
      return transaction;
    };
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

(function() {
  angular.module('transac.transactions').component('transaction', {
    bindings: {
      transaction: '<',
      onCommit: '&',
      onReconcile: '&'
    },
    templateUrl: 'components/transactions/transaction',
    controller: ["TransactionsService", "EventEmitter", function(TransactionsService, EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.changes = TransactionsService.flattenObject(ctrl.transaction.changes);
        _.each(ctrl.transaction.mappings, function(m) {
          return m.sharedWith = true;
        });
        return TransactionsService.matches(ctrl.transaction.links.matches, ctrl.transaction.transaction_log.resource_type).then(function(response) {
          return ctrl.matches = response.matches;
        }, function(err) {});
      };
      ctrl.title = function() {
        return TransactionsService.formatTitle(ctrl.transaction);
      };
      ctrl.matchTitle = function(transaction) {
        return TransactionsService.formatMatchTitle(transaction);
      };
      ctrl.hasMatches = function() {
        return ctrl.matches && ctrl.matches.length;
      };
      ctrl.selectOnClick = function() {
        return ctrl.isSelected = !ctrl.isSelected;
      };
      ctrl.approveOnClick = function(auto) {
        if (auto == null) {
          auto = false;
        }
        _.each(ctrl.transaction.mappings, function(m) {
          m.commit = m.sharedWith;
          m.auto_commit = auto;
        });
        return ctrl.onCommit(EventEmitter({
          transaction: ctrl.transaction
        }));
      };
      ctrl.denyOnClick = function(auto) {
        if (auto == null) {
          auto = false;
        }
        _.each(ctrl.transaction.mappings, function(m) {
          m.commit = !m.sharedWith;
          m.push_disabled = auto;
        });
        return ctrl.onCommit(EventEmitter({
          transaction: ctrl.transaction
        }));
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

(function() {
  angular.module('transac.transactions').component('transactionChanges', {
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

(function() {
  angular.module('transac.transactions').component('transactionReconcile', {
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

(function() {
  angular.module('transac.transactions').component('transactionTile', {
    bindings: {
      transaction: '<',
      title: '<?',
      subtitle: '<?',
      checked: '<?',
      onSelect: '&?'
    },
    templateUrl: 'components/transactions/transaction-tile',
    controller: ["EventEmitter", function(EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.title || (ctrl.title = 'Transaction');
        return ctrl.subtitle || (ctrl.subtitle = ctrl.transaction.app_name ? "From " + ctrl.transaction.app_name : '');
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

(function() {
  angular.module('transac.transactions').component('transactions', {
    bindings: {
      onTransactionsChange: '&',
      onReconciling: '&'
    },
    templateUrl: 'components/transactions/transactions',
    controller: ["EventEmitter", "TransactionsService", function(EventEmitter, TransactionsService) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.reconciling = false;
        ctrl.loading = true;
        return TransactionsService.get().then(function(response) {
          ctrl.transactions = response.transactions;
          return ctrl.onTransactionsChange(EventEmitter({
            count: ctrl.transactions.length
          }));
        }, function(error) {})["finally"](function() {
          return ctrl.loading = false;
        });
      };
      ctrl.onTransactionCommit = function(arg) {
        var transaction;
        transaction = arg.transaction;
        return TransactionsService.commit(transaction.links.commit, transaction.transaction_log.resource_type, transaction.mappings).then(function(response) {
          ctrl.transactions = _.reject(ctrl.transactions, function(tx) {
            return tx.transaction_log.id === transaction.transaction_log.id;
          });
          return ctrl.onTransactionsChange(EventEmitter({
            count: ctrl.transactions.length
          }));
        }, function(err) {});
      };
      ctrl.onReconcileTransactions = function(arg) {
        var apps, matches, transaction;
        transaction = arg.transaction, matches = arg.matches, apps = arg.apps;
        ctrl.reconcileData = {
          transaction: TransactionsService.formatChanges(transaction),
          matches: _.map(matches, function(m) {
            return TransactionsService.formatChanges(m);
          }),
          apps: apps
        };
        ctrl.reconciling = true;
        return ctrl.onReconciling(EventEmitter({
          isReconciling: true
        }));
      };
      ctrl.onTransactionReconciled = function(args) {
        var transaction;
        ctrl.reconcileData = null;
        ctrl.reconciling = false;
        ctrl.onReconciling(EventEmitter({
          isReconciling: false
        }));
        if (args == null) {
          return;
        }
        transaction = _.find(ctrl.transactions, function(tx) {
          return tx.transaction_log.id === args.txId;
        });
        if (transaction == null) {
          return;
        }
        return TransactionsService.merge(transaction.links.merge, transaction.transaction_log.resource_type, args.mergeParams).then(function(response) {
          ctrl.transactions = _.reject(ctrl.transactions, function(tx) {
            return tx.transaction_log.id === transaction.transaction_log.id;
          });
          return ctrl.onTransactionsChange(EventEmitter({
            count: ctrl.transactions.length
          }));
        }, function(err) {});
      };
    }]
  });

}).call(this);
