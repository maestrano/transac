##                                                                        ##
##                      MAESTRANO TRANSAC! LIBRARY                        ##
##                                                                        ##
############################################################################
### Create all modules and define dependencies.                          ###
############################################################################

# Config
angular.module('transac.config', [])
  .config(['$httpProvider',
    ($httpProvider)->
      $httpProvider.defaults.headers.common['Accept'] = 'application/json'
      $httpProvider.defaults.headers.common['Content-Type'] = 'application/json'
  ])

# Modules
angular.module('transac.components', [])
angular.module('transac.directives', [])
angular.module('transac.filters', [])
angular.module('transac.services', [])
angular.module('transac.templates', [])
angular.module('maestrano.transac',
    [
        'transac.config'
        'transac.components'
        'transac.directives'
        'transac.filters'
        'transac.services'
        'transac.templates'
        'ngSanitize'
    ])
