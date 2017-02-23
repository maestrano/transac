angular.module('transac.transactions', [
  'transac.transaction'
])
# EventEmitter wrapper for emitting events through component '&' callbacks.
.value('EventEmitter', (payload)-> { $event: payload })
