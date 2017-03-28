###
#   @desc Search bar component that builds a API query string, and emits change events.
#   @binding {Function} [onSubmit] Callback fired on keypress with keyCode 13 (enter)
#   @binding {Function=} [onChange] Callback fired on input ngChange
#   @binding {Function=} [onInit]  Callback fired on component initialize, emitting an api for exposing cmp methods to the parent component
#   @binding {boolean=} [isDisabled] prevents onSubmit being fired
###
angular.module('transac.top-bar').component('transacSearchBar', {
  bindings: {
    onSubmit: '&'
    onChange: '&?'
    onInit: '&?'
    isDisabled: '<?'
  }
  templateUrl: 'components/top-bar/search-bar'
  controller: (EventEmitter, $scope)->
    ctrl = this;

    ctrl.$onInit = ()->
      ctrl.search = text: ''
      # Expose ability to clear search text to parent cmps
      ctrl.onInit(EventEmitter(api: clearSearchText: ctrl.clearSearchText)) if ctrl.onInit?

    ctrl.onSearchChange = ->
      ctrl.onChange(EventEmitter(isEditing: !!ctrl.search.text.length)) if ctrl.onChange?

    ctrl.submitOnKeypress = ($event={}, force=false)->
      return if ctrl.isDisabled
      return unless $event.keyCode == 13 || force
      if ctrl.search.text
        query = "reference match /#{ctrl.search.text}/"
      else
        query = ""
      ctrl.onSubmit(EventEmitter(query: query))

    ctrl.clearSearchText = ->
      ctrl.search.text = ''
      ctrl.submitOnKeypress(null, true)
      ctrl.onSearchChange()

    return
})
