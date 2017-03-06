#
# Transactions Component Service
#
angular.module('transac.transactions').service('TransacTxsService', ($http, TransacUserService, DEV_AUTH)->

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

  # Get pending or historical transactions
  # GET /api/v2/org-fbcy/transaction_logs/{pending|history}
  @get = (type='pending')->
    orgUid = if _self.developer() then DEV_AUTH.orgUid else TransacUserService.getCurrentOrg().uid
    url = "https://api-connec-sit.maestrano.io/api/v2/#{orgUid}/transaction_logs/#{type}"
    $http.get(url, _self.HTTP_CONFIG).then(
      (response)->
        transactions: response.data.transactions
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
  @commit = (url, resource, mappings=[])->
    # acceptedParams = ['group_id', 'commit', 'auto_commit', 'pull_disabled', 'push_disabled']
    params =
      # mappings: _.map(mappings, (m)-> _.pick(m, acceptedParams))
      mappings: mappings
    $http.put(url, params, _self.HTTP_CONFIG).then(
      (response)->
        transaction: response.data[resource]
      (err)->
        console.error(err)
        err
    )

  # Find matching transacations rated with a score representing duplicate likelyhood.
  # GET /api/v2/org-fbcy/organizations/b1733560-d577-0134-317d-74d43510c326/matches
  @matches = (url, resource, params={})->
    params = angular.merge({}, _self.HTTP_CONFIG, params)
    $http.get(url, params).then(
      (response)->
        matches: response.data[resource] || []
        pagination: response.data.pagination
      (err)->
        console.error(err)
        err
    )

  # Merge transactions, reconciling duplicate records.
  # PUT http://localhost:8080/api/v2/org-fbcy/accounts/a7c747f0-d577-0134-317d-74d43510c326/merge
  # {
  #   "ids": ["a7ca3ab0-d441-0134-17b1-74d43510c326", "a7ca3ab0-d443-0134-17b4-74d43510c326"],
  #   "accounts" => {
  #     'name' => 'Business Bank Account',
  #     'description' => 'The account to keep'
  #   }
  # }
  @merge = (url, resource, params={})->
    $http.put(url, params, _self.HTTP_CONFIG).then(
      (response)->
        transaction: response.data[resource]
      (err)->
        console.error(err)
        err
    )

  ##
  ## Txs Display Formatting Methods
  ##

  # Format title based on tx action & resource type
  @formatTitle = (transaction)->
    action = transaction.transaction_log.action.toLowerCase()
    resource = transaction.transaction_log.resource_type
    formatted_resource = _.capitalize(_.words(resource).join(' '))
    title = switch resource
      when 'credit_notes'
        "#{_.get(transaction.changes, 'transaction_number')} (#{_.get(transaction.changes, 'type')})"
      else
        _.get(transaction.changes, 'name', 'No name found')

    "#{action} #{formatted_resource}: #{title}"

  # Format a matching transaction's title on resource type.
  @formatMatchTitle = (transaction)->
    title = switch transaction.resource_type
      when 'organizations'
        # Determine type of organization (e.g customer, supplier)
        key = _.map(transaction, (v, k)->
          return k if _.includes(k, ['is_']) && v == true
        )
        key = _.compact(key)[0]
        type = key.split('_').slice(-1)
        "#{type}: #{transaction.name}"
      else
        _.get(transaction, 'name', 'No name found')
    title

  ###
  #   @desc Formats transaction object by selecting resource relevant attributes for display.
  #   @param {object} [txChanges] A tx changes object
  #   @param {string} [resource] Tx resource type e.g 'accounts'
  #   @returns {object} Formatted transaction display fields by resource type
  #   @TODO: Define all accepted attributes for each possible resource type (and possibly move these attr lists out into a constant)
  ###
  @getFormattedChanges = (txChanges, resource)->
    attributes = switch resource
      when 'organizations'
        ['name', 'status', 'address', 'email', 'phone', 'referred_leads', 'website']
      when 'tax_codes'
        ['name', 'reference', 'sale_tax_rate', 'sale_taxes', 'status', 'tax_type']
      when 'accounts'
        ['name', 'reference', 'code', 'currency', 'description', 'status']
      else
        # Default to all fields
        []
    acceptedChanges = _.pick(txChanges, attributes)
    acceptedChanges = if _.isEmpty(acceptedChanges) then txChanges else acceptedChanges
    _.each(['updated_at', 'created_at'], (key)->
      acceptedChanges[key] = moment(_.get(txChanges, key)).format('MMM d, Y h:m')
      return
    )
    _self.flattenObject(acceptedChanges)


  # Flatten nested objects to display all changes fields simply.
  @flattenObject = (x, result = {}, prefix = null)->
    if _.isObject(x)
      _.each(x, (v, k)-> _self.flattenObject(v, result, (if prefix then prefix + '_' else '') + k))
    else
      result[prefix] = x
    result

  return @
)
