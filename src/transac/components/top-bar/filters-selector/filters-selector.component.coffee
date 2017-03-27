###*
 *  @description Selectable filters component that builds filter params, and emits a submit event.
 *  @binding {Array<Object>} [filtersMenu] Collection of filter menu objects
 *  @binding {Function} [onSubmit] Callback fired on submit (dropdown 'outsideClick') if changes to selections
 *  @binding {Function} [onSelect] Callback fired when a filter menu item is selected.
 *  @binding {boolean=} [isDisabled] disables the dropdown
###
angular.module('transac.top-bar').component('transacFiltersSelector', {
  bindings: {
    filtersMenu: '<'
    onSubmit: '&'
    onSelect: '&'
    isDisabled: '<?'
  }
  templateUrl: 'components/top-bar/filters-selector'
  controller: (EventEmitter)->
    ctrl = this;

    ctrl.$onInit = ->
      ctrl.wasSelectionMade = false

    ctrl.toggleSelector = (open)->
      return if ctrl.isDisabled
      return unless ctrl.wasSelectionMade
      # bootstrap on-toggle method fires twice first with an open => undefined
      return unless open?
      ctrl.wasSelectionMade = false
      ctrl.onSubmit(EventEmitter(null)) unless open

    ctrl.applyFilterOnClick = (filter)->
      ctrl.wasSelectionMade = true
      ctrl.onSelect(EventEmitter(selectedFilter: filter))

    return

})
