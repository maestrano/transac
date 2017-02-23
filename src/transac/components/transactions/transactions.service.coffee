#
# Transactions Component Service
#
angular.module('transac.transactions').service('TransactionsService', ($http)->

  # GET http://localhost:8080/api/v2/org-fbcy/transaction_logs/pending
  @get = ->
    url = '/bower_components/transac/src/transac/components/transactions/transactions.json'
    $http.get(url).then(
      (response)->
        # Transactions are returned grouped by entity, flatten for simpler display.
        _.flatten(_.values(response.data))
      (error)->
        console.error(error)
    )

  return @
)
