###
#   @desc Components for the Transac! library Top Bar Menu feature.
###
angular.module('transac.top-bar',
  [
    # deps
  ])
  .constant('MENUS', [
    { title: 'Transactions', active: true },
    { title: 'History', active: false },
  ])
  # EventEmitter wrapper for emitting events through component '&' callbacks.
  .value('EventEmitter', (payload)-> { $event: payload })
