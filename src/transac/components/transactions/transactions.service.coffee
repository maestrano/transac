#
# Transactions Component Service
#
angular.module('transac.transactions').service('TransactionsService', ($http, TransacUserService, DEV_AUTH)->

  _self = @

  _self.HTTP_CONFIG = {}

  # Dev config for reaching Connec! with Basic Auth (add keys in transaction.module.coffee).
  @developer = ->
    return _self.developer unless _.isUndefined(_self._developer)
    if DEV_AUTH.apiKey && DEV_AUTH.apiSecret && DEV_AUTH.orgUid
      _self.HTTP_CONFIG = headers: { 'Authorization': 'Basic ' + window.btoa("#{DEV_AUTH.apiKey}:#{DEV_AUTH.apiSecret}") }
      _self._developer = true
    else
      _self.HTTP_CONFIG = params: { sso_session: TransacUserService.get().sso_session }
      _self._developer = false

  # GET /api/v2/org-fbcy/transaction_logs/pending
  @get = (params={})->
    orgUid = if _self.developer() then DEV_AUTH.orgUid else TransacUserService.getCurrentOrg().uid
    url = "https://api-connec-sit.maestrano.io/api/v2/#{orgUid}/transaction_logs/pending"
    params = angular.merge({}, _self.HTTP_CONFIG, params)
    $http.get(url, params).then(
      (response)->
        response.data.transactions
      (err)->
        console.error(err)
        err
    )

  # Commit transcation, reconciling records.
  # PUT /api/v2/org-fbcy/accounts/a7c747f0-d577-0134-317d-74d43510c326/commit
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
    console.log('TransactionsService.commit ', url, params)

  # Find matching transacations rated with a score representing duplicate likelyhood.
  # GET /api/v2/org-fbcy/organizations/b1733560-d577-0134-317d-74d43510c326/matches
  @matches = (url, entity, params={})->
    params = angular.merge({}, _self.HTTP_CONFIG, params)
    $http.get(url, params).then(
      (response)->
        matches: response.data[entity] || []
        pagination: response.data.pagination
      (err)->
        console.error(err)
        err
    )

  ##
  ## Txs Display Formatting Methods
  ##

  # Format title depending on transaction entity type
  @formatTitle = (transaction)->
    action = transaction.transaction_log.action.toLowerCase()
    entity = transaction.transaction_log.resource_type
    formatted_entity = _.capitalize(_.words(entity).join(' '))
    title = switch entity
      when 'credit_notes'
        "#{_.get(transaction.changes, 'transaction_number')} (#{_.get(transaction.changes, 'type')})"
      else
        _.get(transaction.changes, 'name', 'No name found')

    "#{action} #{formatted_entity}: #{title}"

  # Format a matching transaction's title on resource type.
  @formatMatchTitle = (transaction)->
    title = switch transaction.resource_type
      when 'organizations'
        key = _.map(transaction, (v, k)->
          return k if _.includes(k, ['is_']) && v == true
        )
        key = _.compact(key)[0]
        type = key.split('_').slice(-1)
        "#{type}: #{transaction.name}"
      else
        _.get(transaction, 'name', 'No name found')
    title

  # Add a object to the transaction with relevant 'changes' by resource types for display.
  @formatChanges = (transaction)->
    attributes = switch transaction.resource_type
      when 'organizations'
        ['name', 'status', 'address', 'email', 'phone', 'referred_leads', 'website']
      when 'tax_codes'
        ['name', 'reference', 'sale_tax_rate', 'sale_taxes', 'status', 'tax_type']
      when 'accounts'
        ['name', 'reference', 'code', 'currency', 'description', 'status']
      else
        []
    accepted_changes = _.pick(transaction, attributes)
    # Default to all fields
    # TODO: define all accepted changes attributes for each entity
    accepted_changes = if _.isEmpty(accepted_changes) then transaction else accepted_changes
    transaction.formatted = _self.flattenObject(accepted_changes)
    transaction

  # Flatten nested objects to display all changes fields simply.
  # TODO: try lodash _.flatMapDeep
  @flattenObject = (x, result = {}, prefix = null)->
    if _.isObject(x)
      _.each(x, (v, k)-> _self.flattenObject(v, result, (if prefix then prefix + '_' else '') + k))
    else
      result[prefix] = x
    result

  return @
)
