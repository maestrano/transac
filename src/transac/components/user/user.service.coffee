angular.module('transac.user').provider('TransacUserService', ()->

  provider = @
  # Private Defaults
  # ------------------------------------------------
  options = {
    user: null, # @params Function -> returns Promise
    organizations: null # @params Function -> return Promise
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

    service.get = ->
      return angular.copy(service.user)

    service.fetch = ->
      promises = _.map(options, (callback, key)->
        if callback? then callback() else $q.reject("transac error: no #{key} callback configured.")
      )
      return $q.all(promises).then(
        (response) ->
          service.user = angular.merge(response[0], response[1])
          return service.user
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
