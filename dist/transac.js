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
  angular.module('transac.components', ['transac.transactions']);

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
  angular.module('transac.transactions', []).value('EventEmitter', function(payload) {
    return {
      $event: payload
    };
  });

}).call(this);

(function() {
  angular.module('maestrano.transac').component('transac', {
    bindings: {},
    templateUrl: 'transac',
    controller: function() {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.isTopBarShown = true;
        return ctrl.transactionsCount = 0;
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
    }
  });

}).call(this);

angular.module('maestrano.transac').run(['$templateCache', function($templateCache) {$templateCache.put('transac','<top-bar ng-show="$ctrl.isTopBarShown" on-select-menu="$ctrl.onTopBarSelectMenu($event)" transactions-count="$ctrl.transactionsCount"></top-bar>\n\n<transactions on-transactions-change="$ctrl.updateTransactionsCount($event)" on-reconciling="$ctrl.toggleTopBar($event)"></transactions>\n');
$templateCache.put('common/top-bar','<div class="menu">\n  <a href="" class="menu-tab" ng-class="{ \'active\': menu.active }" ng-click="$ctrl.onMenuItemClick(menu)" ng-repeat="menu in $ctrl.menus track by $index">\n    <h5>{{::menu.title}} ({{$ctrl.getCount(menu)}})</h5>\n  </a>\n</div>\n');
$templateCache.put('components/transactions/transaction','<div ng-class="{ \'selected\': $ctrl.isSelected }">\n  <div class="summary">\n    <a href="" class="summary-title" ng-click="$ctrl.selectOnClick()">\n      <div class="summary-title-caption">\n        <span>{{::$ctrl.title()}}</span>\n      </div>\n      <div class="summary-title-warning">\n        <div ng-if="$ctrl.hasMatches()">\n          <i class="fa fa-exclamation-triangle fa-lg"></i>\n          <span>This record may be a duplicate</span>\n        </div>\n      </div>\n    </a>\n    <div class="summary-actions">\n      <button type="button" class="summary-actions-action--deny" ng-click="$ctrl.denyOnClick()">\n        <i class="fa fa-times fa-2x"></i>\n      </button>\n      <button type="button" class="summary-actions-action--approve" ng-click="$ctrl.approveOnClick(true)">\n        <i class="fa fa-check fa-2x"></i>\n      </button>\n    </div>\n  </div>\n  <div class="detail" ng-if="$ctrl.isSelected">\n    <div class="row">\n      <div class="col-md-6 detail-section no-gutters">\n        <transaction-changes changes="$ctrl.changes"></transaction-changes>\n      </div>\n      <div class="col-md-3 detail-section no-gutters">\n        <div class="detail-section-title">\n          <h5>Select apps to share with:</h5>\n        </div>\n        <div class="detail-section-app" ng-repeat="mapping in ::$ctrl.transaction.mappings track by mapping.group_id" ng-click="$ctrl.selectAppOnClick($event, mapping)">\n          <span>{{::mapping.app_name}}</span>\n          <input type="checkbox" ng-checked="mapping.sharedWith">\n        </div>\n      </div>\n      <div class="col-md-3 detail-section no-gutters">\n        <div class="detail-section-action detail-section-action--approve" ng-click="$ctrl.approveOnClick()">\n          <span>Approve only this time</span>\n          <button type="button">\n            <i class="fa fa-check fa-2x"></i>\n          </button>\n        </div>\n        <div class="detail-section-action detail-section-action--deny" ng-click="$ctrl.denyOnClick(true)">\n          <span>Never share this record</span>\n          <button type="button">\n            <i class="fa fa-ban"></i>\n          </button>\n        </div>\n        <div class="detail-section-action detail-section-action--duplicate" ng-click="$ctrl.reconcileOnClick()" ng-if="$ctrl.hasMatches()">\n          <span>This record is a duplicate</span>\n          <button type="button">\n            <i class="fa fa-link fa-2x"></i>\n          </button>\n        </div>\n      </div>\n    </div>\n    <div ng-if="$ctrl.hasMatches()">\n      <div class="row detail-spacers">\n        <div class="detail-spacers-spacer detail-spacers-spacer--left"></div>\n        <div class="detail-spacers-title">\n          <div>\n            <i class="fa fa-exclamation fa-lg"></i>\n            <span>Potential Duplicates</span>\n          </div>\n        </div>\n        <div class="detail-spacers-spacer detail-spacers-spacer--right"></div>\n      </div>\n      <div class="row">\n        <div class="col-md-12 col-xs-12 detail-section detail-section-matches">\n          <div ng-repeat="match in ::$ctrl.matches" class="detail-section-matches-match">\n            {{::$ctrl.matchTitle(match)}}\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');
$templateCache.put('components/transactions/transaction-changes','<div class="table-responsive">\n  <table class="table table-striped borderless">\n    <tr>\n      <th ng-if="$ctrl.onSelect">Tick</th>\n      <th>Field</th>\n      <th>Value</th>\n    </tr>\n    <tr ng-repeat="(key, value) in ::$ctrl.changes">\n      <td ng-if="$ctrl.onSelect"><input type="checkbox"></td>\n      <td>{{::key}}</td>\n      <td>{{::value}}</td>\n    </tr>\n  </table>\n</div>\n');
$templateCache.put('components/transactions/transaction-reconcile','<div class="top-panel">\n  <button class="top-panel_action-btns" ng-click="$ctrl.back()">\n    <i class="fa fa-angle-double-left fa-2x"></i>\n  </button>\n  <div class="top-panel_title">\n    <span>Reconcile duplicate records</span>\n  </div>\n  <button class="top-panel_action-btns right-align" ng-if="$ctrl.editing" ng-click="$ctrl.next()">\n    <i class="fa fa-angle-double-right fa-2x"></i>\n  </button>\n</div>\n<div class="edit" ng-show="$ctrl.editing">\n  <div class="edit_txs">\n    <div class="edit_txs_tx" ng-repeat="transaction in ::$ctrl.transactions track by transaction.id">\n      <div class="edit_txs_tx_topbar row no-gutters" ng-click="$ctrl.onSelect(transaction)">\n        <div class="edit_txs_tx_topbar_checkbox">\n          <input type="checkbox" ng-checked="$ctrl.txsSelectionMap[transaction.id]">\n        </div>\n        <div class="edit_txs_tx_topbar_text">\n          <h5>Transaction</h5>\n          <span>From {{::transaction.app_name}}</span>\n        </div>\n      </div>\n      <transaction-changes changes="::transaction.formatted"></transaction-changes>\n    </div>\n  </div>\n</div>\n<div class="review" ng-hide="$ctrl.editing">\n  <button class="review_done-btn" ng-if="!$ctrl.editing" ng-click="$ctrl.publish()">Done</button>\n</div>\n');
$templateCache.put('components/transactions/transactions','<div ng-hide="$ctrl.reconciling">\n  <!-- <transactions-controls></transactions-controls> -->\n  <transaction transaction="transaction" ng-repeat="transaction in $ctrl.transactions track by transaction.transaction_log.id" on-commit="$ctrl.onTransactionCommit($event)" on-reconcile="$ctrl.onReconcileTransactions($event)"></transaction>\n</div>\n<div ng-if="$ctrl.reconciling">\n  <transaction-reconcile transaction="$ctrl.reconcileData.transaction" matches="$ctrl.reconcileData.matches" on-reconciled="$ctrl.onTransactionReconciled($event)"></transaction-reconcile>\n</div>\n');}]);
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
  angular.module('transac.transactions').service('TransactionsService', ["$http", function($http) {
    var _self;
    _self = this;
    this.get = function() {
      var url;
      url = '/bower_components/transac/src/transac/components/transactions/transactions.json';
      return $http.get(url, opts || {}).then(function(response) {
        return _.flatten(_.values(response.data));
      }, function(error) {
        return console.error(error);
      });
    };
    this.commit = function(url, mappings) {
      var acceptedParams, params;
      if (mappings == null) {
        mappings = [];
      }
      acceptedParams = ['group_id', 'commit', 'auto_commit', 'pull_disabled', 'push_disabled'];
      params = {
        mappings: _.map(mappings, function(m) {
          return _.pick(m, acceptedParams);
        })
      };
      return console.log('TransactionsService.commit ', url, params);
    };
    this.matches = function(url, entity) {
      var isOrganization;
      isOrganization = _.includes(url, 'organizations');
      url = '/bower_components/transac/src/transac/components/transactions/transactions-matching.json';
      return $http.get(url).then(function(transactions) {
        if (!isOrganization) {
          return [];
        }
        return transactions.data.organizations;
      }, function(error) {
        return console.error(error);
      });
    };
    this.formatTitle = function(transaction) {
      var action, entity, title;
      action = transaction.transaction_log.action.toLowerCase();
      entity = transaction.transaction_log.entity_type.split('::').slice(-1)[0].toLowerCase();
      title = (function() {
        switch (entity) {
          case 'account':
            return _.get(transaction.changes, 'name', 'No account name found');
          case 'creditnote':
            return (_.get(transaction.changes, 'transaction_number')) + " (" + (_.get(transaction.changes, 'type')) + ")";
          case 'organization':
            return _.get(transaction.changes, 'name', 'No organization name found');
        }
      })();
      return action + " " + entity + ": " + title;
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
            return "Pending Transaction | Create " + type + ": " + transaction.name;
        }
      })();
      return title;
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
    this.buildFormattedChanges = function(transaction) {
      var accepted_changes;
      accepted_changes = _.pick(transaction, ['name', 'status', 'address', 'email', 'phone', 'referred_leads', 'website']);
      transaction.formatted = _self.flattenObject(accepted_changes);
      return transaction;
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
        return TransactionsService.matches(ctrl.transaction.links.matches).then(function(transactions) {
          return ctrl.matches = transactions;
        }, function(error) {});
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
        TransactionsService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings);
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
        TransactionsService.commit(ctrl.transaction.links.commit, ctrl.transaction.mappings);
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
          matches: ctrl.matches
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
      onReconciled: '&'
    },
    templateUrl: 'components/transactions/transaction-reconcile',
    controller: ["EventEmitter", function(EventEmitter) {
      var ctrl;
      ctrl = this;
      ctrl.$onInit = function() {
        ctrl.editing = true;
        ctrl.transactions = [].concat(ctrl.transaction, ctrl.matches);
        ctrl.txsSelectionMap = {};
        return _.each(_.map(ctrl.transactions, function(tx) {
          return tx.id;
        }), function(id) {
          ctrl.txsSelectionMap[id] = false;
        });
      };
      ctrl.onSelect = function(transaction) {
        _.each(ctrl.txsSelectionMap, function(v, k) {
          if (k !== transaction.id) {
            ctrl.txsSelectionMap[k] = false;
          }
        });
        return ctrl.txsSelectionMap[transaction.id] = !ctrl.txsSelectionMap[transaction.id];
      };
      ctrl.next = function() {
        return ctrl.editing = false;
      };
      ctrl.publish = function() {
        return ctrl.onReconciled(EventEmitter({
          id: ctrl.transaction.id,
          matches: _.map(ctrl.matches, function(m) {
            return m.id;
          }),
          attributes: {}
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
        return TransactionsService.get().then(function(transactions) {
          ctrl.transactions = transactions;
          return ctrl.onTransactionsChange(EventEmitter({
            count: ctrl.transactions.length
          }));
        }, function(error) {});
      };
      ctrl.onTransactionCommit = function(arg) {
        var transaction;
        transaction = arg.transaction;
        ctrl.transactions = _.reject(ctrl.transactions, function(t) {
          return t.transaction_log.id === transaction.transaction_log.id;
        });
        return ctrl.onTransactionsChange(EventEmitter({
          count: ctrl.transactions.length
        }));
      };
      ctrl.onReconcileTransactions = function(arg) {
        var matches, transaction;
        transaction = arg.transaction, matches = arg.matches;
        ctrl.reconcileData = {
          transaction: TransactionsService.buildFormattedChanges(transaction),
          matches: _.map(matches, function(m) {
            return TransactionsService.buildFormattedChanges(m);
          })
        };
        ctrl.reconciling = true;
        return ctrl.onReconciling(EventEmitter({
          isReconciling: true
        }));
      };
      ctrl.onTransactionReconciled = function(args) {
        ctrl.reconcileData = null;
        ctrl.reconciling = false;
        ctrl.onReconciling(EventEmitter({
          isReconciling: false
        }));
        if (args == null) {
          return;
        }
        ctrl.transactions = _.reject(ctrl.transactions, function(t) {
          return t.transaction_log.id === args.id;
        });
        return ctrl.onTransactionsChange(EventEmitter({
          count: ctrl.transactions.length
        }));
      };
    }]
  });

}).call(this);
