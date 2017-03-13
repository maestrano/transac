###
#   @desc Provider configuration & service business logic for the current user state.
###
angular.module('transac.user').provider('TransacUserService', ()->

  provider = @
  # Private Defaults
  # ------------------------------------------------
  options = {
    user: null, # @param {Function} -> @returns Promise<User>
    organizations: null # @param {Function} -> @returns Promise<[Organization]>
  }

  # Methods accessible injected in a .config & .run function
  # ------------------------------------------------
  provider.configure = (data)->
    angular.extend(options, data)

  # #=======================================
  _$get = ($q, $log) ->
    service = @
    # Methods accessible injected in a .service function
    # ------------------------------------------------
    service.user = {}

    ###
    #   @returns {Object} Current user model
    ###
    service.get = ->
      return angular.copy(service.user)

    ###
    #   @returns {Object} Currently selected organization
    ###
    service.getCurrentOrg = ->
      return {} if _.isEmpty(service.user)
      _.find(service.user.organizations, (org)-> org.id == service.user.currentOrgId)

    ###
    #   @desc Retrieves & update store with latest User data
    #   @returns {Promise<Object>} A promise to the current user
    ###
    service.fetch = ->
      promises = _.map(options, (callback, key)->
        if callback? then callback() else $q.reject("transac error: no #{key} callback configured.")
      )
      return $q.all(promises).then(
        (response) ->
          service.user = angular.merge({}, response[0], response[1])
          return service.get()
        (err) ->
          $log.error(err)
          return $q.reject(err)
    )

    return service
  # # inject service dependencies here, and declare in _$get function args.
  _$get.$inject = ['$q', '$log'];
  # # attach provider function onto the provider object
  provider.$get = _$get

  return provider

)
