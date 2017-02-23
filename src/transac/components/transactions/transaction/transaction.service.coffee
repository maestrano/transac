angular.module('transac.transaction').service('TransactionService', ($http)->

  _self = @

  # Commit transcation, reconciling records.
  # PUT http://localhost:8080/api/v2/org-fbcy/accounts/a7c747f0-d577-0134-317d-74d43510c326/commit
  # {
  #   'mappings:'[{
  #     'group_id'=>'cld-abc',
  #     'commit'=>true,
  #     'auto_commit'=>true,
  #     'pull_disabled'=>false,
  #     'push_disabled'=>false
  #   }]
  # }
  # group_id: group_id of the application to commit transaction to
  # commit: (true/false) notify application of the transaction
  # auto_commit: (true/false) automatically notify this application of future updates
  # pull_disabled: (true/false) rejects update coming from this application
  # push_disabled: (true/false) do not notify this application of updates
  @commit = (url, mappings=[])->
    acceptedParams = ['group_id', 'commit', 'auto_commit', 'pull_disabled', 'push_disabled']
    params =
      mappings: _.map(mappings, (m)-> _.pick(m, acceptedParams))
    console.log('TransactionService.commit ', url, params)

  # Find matching transacations rated with a score representing duplicate likelyhood.
  # GET http://localhost:8080/api/v2/org-fbcy/organizations/b1733560-d577-0134-317d-74d43510c326/matches
  @matches = (url, entity)->
    console.log('TransactionService.match', url)
    isOrganization = _.includes(url, 'organizations')
    url = '/bower_components/transac/src/transac/components/transactions/matching-transactions.json'
    $http.get(url).then(
      (transactions)->
        # Temporary stub
        return [] unless isOrganization
        # TODO: API should just return the list rather than groups by entity.
        transactions.data.organizations
      (error)-> console.error(error)
    )

  # Format title depending on transaction entity type
  # TODO: dynamic way of building the titles?
  #     - compile transcluded components into <transaction>? e.g <account> or <credit-note>
  #     - API handled?
  @formatTitle = (transaction)->
    action = transaction.transaction_log.action.toLowerCase()
    entity = transaction.transaction_log.entity_type.split('::').slice(-1)[0].toLowerCase()
    title = switch entity
      when 'account'
        _.get(transaction.changes, 'name', 'No account name found')
      when 'creditnote'
        "#{_.get(transaction.changes, 'transaction_number')} (#{_.get(transaction.changes, 'type')})"
      when 'organization'
        _.get(transaction.changes, 'name', 'No organization name found')
    "#{action} #{entity}: #{title}"

  # Format a matching transaction's title on resource type.
  # TODO: change API changes hash for more UI friendly layout.
  @formatMatchTitle = (transaction)->
    title = switch transaction.resource_type
      when 'organizations'
        key = _.map(transaction, (v, k)->
          return k if _.includes(k, ['is_']) && v == true
        )
        key = _.compact(key)[0]
        type = key.split('_').slice(-1)
        "Pending Transaction | Create #{type}: #{transaction.name}"
    title

  # Flatten nested objects to display all changes fields simply.
  # TODO: change API changes hash for more UI friendly layout.
  @flattenChanges = (x, result = {}, prefix = null)->
    if _.isObject(x)
      _.each(x, (v, k)-> _self.flattenChanges(v, result, k))
    else
      result[prefix] = x
    result

  return @
)
