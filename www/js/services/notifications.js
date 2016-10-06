angular.module('app.services').factory('notifications', function ($window, device, serverConfig) {
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
      console.log('succesfully registered to push notifications with ID: '+data.registrationId+' using senderID: '+serverConfig.senderID)
    });
    
    push.on('notification', function(data) {
      console.log('received push notification:')
      console.log(JSON.stringify(data))

      if(data.count){
        push.setApplicationIconBadgeNumber(function() {
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