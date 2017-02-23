angular.module('transac.transaction',
  [
    # deps
  ]
)
# EventEmitter wrapper for emitting events through component '&' callbacks.
.value('EventEmitter', (payload)-> { $event: payload })
