###
#   @desc Components for the Transac! library Top Bar Menu feature.
###
angular.module('transac.top-bar',
  [
    # deps
  ])
  .constant('MENUS', [
    { title: 'Transactions', type: 'pending', active: true }
    { title: 'History', type: 'history', active: false }
  ])
  # EventEmitter wrapper for emitting events through component '&' callbacks.
  .value('EventEmitter', (payload)-> { $event: payload })
