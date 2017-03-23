###*
 *  @description Selectable filters component that builds filter params, and emits a submit event.
 *  @binding {Function} [onSubmit] Callback fired on submit (dropdown 'outsideClick') if changes to selections
 *  @binding {boolean=} [isDisabled] disables the dropdown
###
angular.module('transac.top-bar').component('transacFiltersSelector', {
  bindings: {
    onSubmit: '&'
    isDisabled: '<?'
  }
  templateUrl: 'components/top-bar/filters-selector'
  controller: (EventEmitter)->
    ctrl = this;

    ctrl.$onInit = ->
      ctrl.wasSelectionMade = false
      ctrl.filters = $filter: []
      ctrl.filtersMenu = [
        # Sorting
        {label: 'Ascending', type: '$orderby', attr: 'created_at', value: 'asc', selected: false}
        {label: 'Descending', type: '$orderby', attr: 'created_at', value: 'desc', selected: false}
        {divider: true}
        # Actions
        {label: 'Create', type: '$filter', attr: 'action', cmd: 'eq', value: "'CREATE'", selected: false}
        {label: 'Update', type: '$filter', attr: 'action', cmd: 'eq', value: "'UPDATE'", selected: false}
        {divider: true}
        # Entities
        {label: 'Items', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Item/", selected: false}
        {label: 'Purchase Orders', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/PurchaseOrder/", selected: false}
        {label: 'Invoices', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Invoice/", selected: false}
        {label: 'Accounts', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Account/", selected: false}
        {label: 'Organizations', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Organization/", selected: false}
      ]

    ctrl.toggleSelector = (open)->
      return if ctrl.isDisabled
      return unless ctrl.wasSelectionMade
      # bootstrap on-toggle method fires twice first with an open => undefined
      return unless open?
      ctrl.wasSelectionMade = false
      ctrl.onSubmit(EventEmitter(params: ctrl.filters)) unless open

    ctrl.applyFilterOnClick = (filter)->
      ctrl.wasSelectionMade = true
      switch filter.type
        when '$orderby'
          # Only one $orderby filter can be selected
          filters = _.filter(ctrl.filtersMenu, 'type', '$orderby')
          _.each(filters, (f)->
            f.selected = false
            return
          )
          filter.selected = true
          ctrl.filters.$orderby = "#{filter.attr} #{filter.value}"
        when '$filter'
          filter.selected = !filter.selected
          query = "#{filter.attr} #{filter.cmd} #{filter.value}"
          if filter.selected
            ctrl.filters.$filter.push(query)
            ctrl.filters.$filter = _.uniq(ctrl.filters.$filter)
          else
            _.pull(ctrl.filters.$filter, query)

    return

})
