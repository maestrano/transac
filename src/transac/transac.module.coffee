##                                                                        ##
##                      MAESTRANO TRANSAC! LIBRARY                        ##
##                                                                        ##
############################################################################
angular.module('maestrano.transac',
  [
    'transac.components'
    'transac.common'
    'ngSanitize'
  ])
  .config(['$httpProvider',
    ($httpProvider)->
      $httpProvider.defaults.headers.common['Accept'] = 'application/json'
      $httpProvider.defaults.headers.common['Content-Type'] = 'application/json'
  ])
