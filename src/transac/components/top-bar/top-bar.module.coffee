###
#   @desc Components for the Transac! library Top Bar Menu feature.
###
angular.module('transac.top-bar',
  [
    # deps
  ])
  .constant('MENUS', [
    { title: 'Transactions', type: 'pending', active: true, itemsCount: 0 }
    { title: 'History', type: 'historical', active: false, itemsCount: 0 }
  ])
  .constant('FILTERS_MENU', [
    # Sorting
    {label: 'Ascending', type: '$orderby', attr: 'created_at', value: 'asc', selected: true}
    {label: 'Descending', type: '$orderby', attr: 'created_at', value: 'desc', selected: false}
    {divider: true}
    # Actions
    {label: 'Create', type: '$filter', attr: 'action', cmd: 'eq', value: "'CREATE'", selected: false}
    {label: 'Update', type: '$filter', attr: 'action', cmd: 'eq', value: "'UPDATE'", selected: false}
    {divider: true}
    {label: 'Only Duplicates', type:'duplicates', value: 'include', selected: false}
    {label: 'No Duplicates', type:'duplicates', value: 'exclude', selected: false}
    {divider: true}
    # Entities
    {label: 'Items', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Item/", selected: false}
    {label: 'Purchase Orders', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/PurchaseOrder/", selected: false}
    {label: 'Invoices', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Invoice/", selected: false}
    {label: 'Accounts', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Account/", selected: false}
    {label: 'Organizations', type: '$filter', attr: 'entity_type', cmd: 'match', value: "/Organization/", selected: false}
  ])
  # EventEmitter wrapper for emitting events through component '&' callbacks.
  .value('EventEmitter', (payload)-> { $event: payload })
