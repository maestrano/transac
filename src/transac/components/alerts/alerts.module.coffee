###
#   @desc Components for providing Alert messaging for the application, via toastr notifications.
###
angular.module('transac.alerts',
  [
    # deps
    'toastr'
    'ngAnimate'
  ])
  .config(['toastrConfig',
    (toastrConfig)->
      angular.merge(toastrConfig,
        # TODO: this timeOut config isn't working?
        timeOut: 1500
        positionClass: 'toast-top-right'
        # TODO: also not working
        preventDuplicates: false
        progressBar: true
      )
  ])
  .constant('TOASTR_OPTS',
    success:
      timeOut: 800
    info:
      timeOut: 800
    error:
      timeOut: 1500
  )
