###
#   @desc Components for providing Alert messaging for the application, via toastr notifications.
###
angular.module('transac.alerts',
  [
    # deps
    'toastr'
    'ngAnimate'
  ])
  .config((toastrConfig)->
    toastrConfig.timeOut = 1500
    toastrConfig.positionClass = 'toast-top-right'
    toastrConfig.preventDuplicates = false
    toastrConfig.progressBar = true
  )
  .constant('TOASTR_OPTS',
    success:
      timeOut: 800
    info:
      timeOut: 800
    error:
      timeOut: 1500
  )
