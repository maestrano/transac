angular.module('transac.transaction').service('TransactionService', ()->

  _self = @

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
  @commit = (url, mappings)->
    console.log('TransactionService.commit ', url, mappings)

  # Format title depending on transaction entity type
  # TODO: dynamic way of building the titles?
  #     - compile transcluded components into <transaction>? e.g <account> or <credit-note>
  #     - API handled?
  @formatTitle = (transaction)->
    action = transaction.transaction_log.action.toLowerCase()
    entity = transaction.transaction_log.entity_type.split('::').slice(-1)[0].toLowerCase()
    title = switch entity
      when 'account'
        _.get(transaction.changes, 'name', 'No Account Named Found')
      when 'creditnote'
        "#{_.get(transaction.changes, 'transaction_number')} (#{_.get(transaction.changes, 'type')})"
    "#{action} #{entity}: #{title}"

  # Flatten nested objects to display all changes fields simply.
  # TODO: change API for more UI friendly layout
  @flattenChanges = (x, result = {}, prefix = null)->
    if _.isObject(x)
      _.each(x, (v, k)-> _self.flattenChanges(v, result, k))
    else
      result[prefix] = x
    result

  return @
)
