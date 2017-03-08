##
## This is the transactions module. It includes all of our components for the Transactions feature.
##
angular.module('transac.transactions',
  [
    'transac.user'
    # external
    'infinite-scroll'
  ])
  # EventEmitter wrapper for emitting events through component '&' callbacks.
  .value('EventEmitter', (payload)-> { $event: payload })
  # Configured infinite-scroll to process scroll events a maximum of once every x milliseconds
  .value('THROTTLE_MILLISECONDS', 1000)
  # Add Connec API! basic auth keys - DO NOT COMMIT.
  # Note: this is temporary while the app is in early stages of developement.
  .constant('DEV_AUTH',
    apiKey: ''
    apiSecret: ''
    orgUid: ''
  )
