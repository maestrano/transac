###
#   @desc Displays horizontal match list items.
#   @binding {Array<object>} [matches] List of match transactions
###
angular.module('transac.transactions').component('transacTxMatches', {
  bindings: {
    matches: '<'
  }
  templateUrl: 'components/transactions/transaction-matches'
  controller: (EventEmitter, TransacTxsService)->
    ctrl = this

    ctrl.$onInit = ->

    ctrl.title = (match)->
      TransacTxsService.formatMatchTitle(match)

    ctrl.subtitle = (match)->
      matchTxLog = match.transaction_logs[0]
      appName = _.get(matchTxLog, 'app_name')
      date = TransacTxsService.formatDisplayDate(_.get(matchTxLog, 'created_at'))
      if appName then "#{date}, from #{appName}" else date

    return
})
