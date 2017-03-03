##
## This is the transactions module. It includes all of our components for the Transactions feature.
##
angular.module('transac.transactions',
  [
    'transac.user'
  ])
  # EventEmitter wrapper for emitting events through component '&' callbacks.
  .value('EventEmitter', (payload)-> { $event: payload })
  # Add Connec API! basic auth keys - DO NOT COMMIT.
  # Note: this is temporary while the app is in early stages of developement.
  .constant('DEV_AUTH',
    apiKey: ''
    apiSecret: ''
    orgUid: ''
  )
