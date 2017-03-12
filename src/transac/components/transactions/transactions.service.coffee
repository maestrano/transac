###
#   @desc Contains business logic for Transactions & Matches.
###
angular.module('transac.transactions').service('TransacTxsService', ($log, $http, $q, $window, TransacUserService, DEV_AUTH)->

  _self = @

  _self.HTTP_CONFIG = {}

  ###
  #   @desc Invoke to configure basic auth (add keys in transaction.module.coffee), if no keys are provided, sso_session will be used.
  #   @returns {boolean} Whether dev api creds are configured or sso token is being used.
  ###
  @getHttpConfig = ->
    return _self.HTTP_CONFIG unless _.isEmpty(_self.HTTP_CONFIG)
    if DEV_AUTH.apiKey && DEV_AUTH.apiSecret
      _self.HTTP_CONFIG = headers: { 'Authorization': 'Basic ' + window.btoa("#{DEV_AUTH.apiKey}:#{DEV_AUTH.apiSecret}") }
    else
      _self.HTTP_CONFIG = params: { sso_session: TransacUserService.get().sso_session }

  ###
  #   @desc Get pending or historical unreconcilled Transactions.
  #   @http GET /api/v2/org-fbcy/transaction_logs/{pending|history}
  #   @param {string} [type] Type of transactions e.g 'pending', 'history'
  #   @returns {Promise<Object>} A promise to the list of Transactions and pagination data.
  ###
  @get = (type='pending', params={})->
    orgUid = DEV_AUTH.orgUid || TransacUserService.getCurrentOrg().uid
    url = "https://api-connec-sit.maestrano.io/api/v2/#{orgUid}/transaction_logs/#{type}"
    params = angular.merge({}, _self.getHttpConfig(), params)
    $http.get(url, params).then(
      (response)->
        transactions: response.data.transactions
        pagination: response.data.pagination
      (err)->
        $log.error('TransacTxsService Error: ', err)
        $q.reject(err)
    )

  ###
  #   @desc Commit transcation, reconciling the record.
  #   @http PUT /api/v2/org-fbcy/accounts/a7c747f0-d577-0134-317d-74d43510c326/commit
  #   @httpBody
  #   {
  #     'mappings:'[{
  #       'group_id'=>'cld-abc',
  #       'commit'=>true,
  #       'auto_commit'=>true,
  #       'pull_disabled'=>false,
  #       'push_disabled'=>false
  #     }]
  #   }
  #   @param {string} [url] Transaction links commit URL.
  #   @param {string} [resource] Transaction resource type.
  #   @param {array} [mappings] Transaction mappings to include in http body of PUT request.
  #   @returns {Promise<Object>} A promise to the commited Transaction.
  ###
  # API mapping behaviour notes:
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
    $http.put(url, params, _self.getHttpConfig()).then(
      (response)->
        transaction: response.data[resource]
      (err)->
        $log.error('TransacTxsService Error: ', err)
        $q.reject(err)
    )

  ###
  #   @desc Find matching transacations rated with a score representing duplicate likelyhood.
  #   @http GET /api/v2/org-fbcy/organizations/b1733560-d577-0134-317d-74d43510c326/matches
  #   @param {string} [url] Transaction links matches URL.
  #   @param {string} [resource] Transaction resource type.
  #   @param {Object} [params] Params to serialise into GET request URL.
  #   @returns {Promise<Object>} A promise to the matching transactions & pagination data.
  ###
  @matches = (url, resource, params={})->
    params = angular.merge({}, _self.getHttpConfig(), params)
    $http.get(url, params).then(
      (response)->
        matches: response.data[resource] || []
        pagination: response.data.pagination
      (err)->
        $log.error('TransacTxsService Error: ', err)
        $q.reject(err)
    )

  ###
  #   @desc Merge transactions and transaction attributes, reconciling duplicate records.
  #   @http PUT http://localhost:8080/api/v2/org-fbcy/accounts/a7c747f0-d577-0134-317d-74d43510c326/merge
  #   @httpBody
  #   {
  #     "ids": ["a7ca3ab0-d441-0134-17b1-74d43510c326", "a7ca3ab0-d443-0134-17b4-74d43510c326"],
  #     "accounts" => {
  #       'name' => 'Business Bank Account',
  #       'description' => 'The account to keep'
  #     }
  #   }
  #   @param {string} [url] Transaction links merge URL.
  #   @param {string} [resource] Transaction resource type.
  #   @param {Object} [params] Params to include in http body of PUT request.
  #   @returns {Promise<Object>} A promise to updated Transaction.
  ###
  @merge = (url, resource, params={})->
    $http.put(url, params, _self.getHttpConfig()).then(
      (response)->
        transaction: response.data[resource]
      (err)->
        $log.error('TransacTxsService Error: ', err)
        $q.reject(err)
    )

  ##
  ## Txs Display Formatting Methods
  ##

  ###
  #   @desc Format tx title based on action & resource type.
  #   @param {Object} [transaction] A Transaction object.
  #   @returns {string} A formatted tx title.
  ###
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

  ###
  #   @desc Format a matching transaction title based on resource type.
  #   @param {Object} [match] A Matched Transaction object.
  #   @returns {string} A formatted matching tx title.
  ###
  @formatMatchTitle = (match)->
    title = switch match.resource_type
      when 'organizations'
        # Determine type of organization (e.g customer, supplier)
        key = _.map(match, (v, k)->
          return k if _.includes(k, ['is_']) && v == true
        )
        key = _.compact(key)[0]
        type = key.split('_').slice(-1)
        "#{type}: #{match.name}"
      else
        _.get(match, 'name', 'No name found')
    title

  ###
  #   @desc Formats transaction object by selecting resource relevant attributes for display.
  #   @param {Object} [txAttrs] Tx attributes object.
  #   @param {string} [resource] Tx resource type e.g 'accounts'.
  #   @returns {Object} Formatted transaction attributes by resource type.
  #   @TODO: Define all accepted attributes for each possible resource type (and possibly move these attr lists out into a constant).
  ###
  @formatAttributes = (txAttrs, resource)->
    acceptedAttrs = switch resource
      when 'organizations'
        ['name', 'status', 'address', 'email', 'phone', 'referred_leads', 'website']
      when 'tax_codes'
        ['name', 'reference', 'sale_tax_rate', 'sale_taxes', 'status', 'tax_type']
      when 'accounts'
        ['name', 'reference', 'code', 'currency', 'description', 'status']
      else
        # Default to all fields
        []
    acceptedTxAttrs = _.pick(txAttrs, acceptedAttrs)
    acceptedTxAttrs = if _.isEmpty(acceptedTxAttrs) then txAttrs else acceptedTxAttrs
    _.each(['updated_at', 'created_at'], (key)->
      acceptedTxAttrs[key] = _self.formatDisplayDate(_.get(txAttrs, key))
      return
    )
    _self.flattenObject(acceptedTxAttrs)

  ###
  #   @desc Format datestring into Transac! date display format
  #   @param {string} [date] A date string
  #   @return {string} A formatted date string
  ###
  @formatDisplayDate = (date)->
    $window.moment(date).format('MMM d, Y h:m')

  ###
  #   @desc Flatten nested objects to display all changes fields simply.
  #   @param {Object} [x] Object to flatten.
  #   @returns {Object} Flattened object.
  ###
  @flattenObject = (x, result = {}, prefix = null)->
    if _.isObject(x)
      _.each(x, (v, k)-> _self.flattenObject(v, result, (if prefix then prefix + '_' else '') + k))
    else
      result[prefix] = x
    result

  return @
)
