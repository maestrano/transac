#
# Transac! Root Component
#
angular.module('maestrano.transac').component('transac', {
  bindings: {
  },
  templateUrl: 'transac',
  controller: ()->
    this.title = 'Transac! root component!'

    this.onTopBarSelectMenu = ({menu})->
      console.log('selected menu: ', menu)

    return
})
