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
      # appName = _.get(match, 'app_name')
      date = TransacTxsService.formatDisplayDate(_.get(match, 'created_at'))
      # if appName then "#{date}, from #{appName}" else date

    return
})
