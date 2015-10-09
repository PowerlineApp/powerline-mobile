angular.module('app.services')
  .factory('flurry', function ($window, $document, $rootScope, device, session) {

    var ANDROID_API_KEY = '824NJ8NYJGKBB9S6SW58';
    var IOS_API_KEY = '936W8Q27W73WGY68GQ5J';

    var flurry;

    return {
      init: function () {
        flurry = $window.plugins.flurry;

        if (device.isAndroid) {
          flurry.startSession(device.isAndroid ? ANDROID_API_KEY : IOS_API_KEY);
          $document.bind('pause', function () {
            flurry.endSession();
          });
          $document.bind('resume', function () {
            flurry.startSession(ANDROID_API_KEY);
          });
        } else {
          //flurry.setSessionReportsOnCloseEnabled('Yes');
          //flurry.setSessionReportsOnPauseEnabled('Yes');
        }

        $rootScope.$watch(function () {
          return session.user_id;
        }, function (value) {
          if (value) {
            flurry.setUserID(value);
          }
        });

        $rootScope.$on('$stateChangeSuccess', function () {
          flurry.logPageView();
        });
      },
      log: function (event, params) {
        if (!flurry) {
          return;
        }
        if (params) {
          flurry.logEventWithParameters(event, params);
        } else {
          flurry.logEvent(event);
        }
      }
    };
  })
;
