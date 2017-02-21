#
# Transactions Component Service
#
angular.module('transac.transactions').service('TransactionsService', ($http)->

  # GET http://localhost:8080/api/v2/org-fbcy/transaction_logs/pending
  @getPendingTransactions = ->
    url = '/bower_components/transac/src/transac/components/transactions/transactions.json'
    $http.get(url).then(
      (transactions)-> transactions.data
      (error)-> console.error(error)
    )

  return @
)
