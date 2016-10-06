angular.module('app.services').factory('notifications', function ($window, device, serverConfig, $http) {
    function getEndpoints() {
      return $http.get(serverConfig.url + '/api/endpoints/').then(function (response) {
        return response.data;
      });
    }

    function registerDevice(deviceType, token) {
      getEndpoints().then(function (endpoints) {
        if (!_(endpoints).chain().pluck('token').include(token).value()) {
          console.log('my token is not yet registered, about to proceed')
          $http.post(serverConfig.url + '/api/endpoints/', {type: deviceType, token: token}).then(function(response){
            console.log('token successfully registered')
          },function (response) {
            console.error('Cannot add notification token');
            if (response.data) {
              console.error(angular.toJson(response.data));
            }
          });
        } else {
          console.log('my token was already registered')
        }
      });
    }

  function init() {
    push = $window.PushNotification.init({
      "android": {"senderID": serverConfig.senderID, "icon": "notification_icon"},
      "ios": {"alert": "true", "badge": "true", "sound": "true", "categories": {
            "own-post-commented": {
                "yes": {
                    "callback": "app.accept", "title": "Accept", "foreground": true, "destructive": false
                },
                "no": {
                    "callback": "app.reject", "title": "Reject", "foreground": true, "destructive": false
                },
                "maybe": {
                    "callback": "app.maybe", "title": "Maybe", "foreground": true, "destructive": false
                }
      }}}
    });
    push.on('registration', function(data) {
      var token = data.registrationId
      console.log('succesfully registered to push notifications with token: '+token+' using senderID: '+serverConfig.senderID)
      if(device.isAndroid)
        registerDevice('android', token)
      else
        registerDevice('ios', token)
    });
    
    push.on('notification', function(data) {
      console.log('received push notification:')
      console.log(JSON.stringify(data))

      if(data.count){
        push.setApplicationIconBadgeNumber(function(response) {
          // success
        }, function(error) {
          console.log('push notification: setApplicationIconBadgeNumber failed: ');
          console.log(error)
        }, data.count);        
      }

      if (data.additionalData && Number(data.additionalData.foreground)) {
        navigator.notification.beep(1);
        navigator.vibrate(500);
      }
    });

    push.on('error', function(error) {
        console.log("push notification plugin error:");
        console.log(error);
    });
  }

  return {
    init: init
  };
})