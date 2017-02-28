##
## This is the transactions module. It includes all of our components for the Transactions feature.
##
angular.module('transac.transactions',
  [
    # deps
  ])
  # EventEmitter wrapper for emitting events through component '&' callbacks.
  .value('EventEmitter', (payload)-> { $event: payload })
