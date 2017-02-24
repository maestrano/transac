angular.module('transac.merge', [
])
# EventEmitter wrapper for emitting events through component '&' callbacks.
.value('EventEmitter', (payload)-> { $event: payload })
