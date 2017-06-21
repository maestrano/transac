###
#   @desc Render transaction changes attributes into a responsive table with selectable / checkable head & fields, emitting selection results.
#   @binding {Object} [changes] Transaction changes object
#   @binding {Function=} [onSelect] Callback fired on select all / select field.
###
angular.module('transac.transactions').component('transacTxChanges', {
  bindings: {
    changes: '<'
    onSelect: '&?'
  }
  templateUrl: 'components/transactions/transaction-changes'
  controller: (EventEmitter)->
    ctrl = this

    ctrl.$onInit = ->

    return
})
