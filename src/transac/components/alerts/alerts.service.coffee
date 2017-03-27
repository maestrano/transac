angular.module('transac.alerts').service('TransacAlertsService', (toastr, TOASTR_OPTS)->

  @send = (type, message, title=null, options={})->
    options = angular.merge({}, TOASTR_OPTS[type], options)
    toastr[type](_.capitalize(message), title, options)

  return @
)
