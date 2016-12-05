angular.module('app.services').factory('notifications', function ($window, device, serverConfig, $http) {
    function getEndpoints() {
      return $http.get(serverConfig.url + '/api/endpoints/').then(function (response) {
        return response.data;
      });
    }

    function registerDevice(deviceType, token) {
      getEndpoints().then(function (endpoints) {
        var tokenNotRegistered = !_(endpoints).chain().pluck('token').include(token).value()
        if (tokenNotRegistered) {
          console.log('my token is not yet registered, about to proceed')
          $http.post(serverConfig.url + '/api/endpoints/', {type: deviceType, token: token}).then(function(response){
            console.log('token successfully registered')
          },function (response) {
            console.error('Cannot add notification token');
            if (response.data) {
              console.error(angular.toJson(response.data));
            }
            console.log(response)
            alert('Failed to registed your device to push notifications. This may happen when you login on another device under your account. Please logout and login on this device.')
          });
        } else {
          console.log('my token was already registered')
        }
      }, function(error){
        alert('failed to registed device '+token+' to push notifications due to :'+JSON.stringify(error))
      });
    }

  function init() {
    if($window.PushNotification == null)
      return false // we are in browser (or plugin not installed)

    push = $window.PushNotification.init({
      "android": {"senderID": serverConfig.senderID, "icon": "pushnotificationlogo", "iconColor": "#030366"},
      "ios": {"alert": "true", "badge": "true", "sound": "true", "categories": {
        // https://github.com/PowerlineApp/powerline-mobile/issues/226 
        "comment-mentioned": {
          "yes": {"callback": "app.open", "title": "Open", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "influence": { // user wants to follow you
          "yes": {"callback": "app.approve", "title": "Approve", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "post-created": { // followed user created a Post
          "yes": {"callback": "app.upvote", "title": "Upvote", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "user-petition-created": { // followed user created an User Petition
          "yes": {"callback": "app.sign", "title": "Sign", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "post": { 
          "yes": {"callback": "app.upvote", "title": "Upvote", "foreground": true, "destructive": false},
          "no": {"callback": "app.downvote", "title": "Downvote", "foreground": true, "destructive": false}
        },
        "post-mentioned": { 
          "yes": {"callback": "app.open", "title": "Open", "foreground": true, "destructive": false},
        },
        "user_petition": {
          "yes": {"callback": "app.sign", "title": "Sign", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "post-is-boosted": { 
          "yes": {"callback": "app.upvote", "title": "Upvote", "foreground": true, "destructive": false},
          "no": {"callback": "app.downvote", "title": "Downvote", "foreground": true, "destructive": false}
        }, 
        "own-post-is-boosted": {
          "yes": {"callback": "app.open", "title": "Open", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },    
        "user-petition-is-boosted": {
          "yes": {"callback": "app.sign", "title": "Sign", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "own-user-petition-is-boosted": {
          "yes": {"callback": "app.open", "title": "Open", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        }, 
        "invite": { // you were been invited to group
          "yes": {"callback": "app.join", "title": "Join", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": true, "destructive": false}
        },
        "group-permissions-changed": {
          "yes": {"callback": "app.open", "title": "Open", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": true, "destructive": false}
        },
        "own-user-petition-commented": {
          "yes": {"callback": "app.open", "title": "View", "foreground": true, "destructive": false},
          "no": {"callback": "app.mute", "title": "Mute", "foreground": false, "destructive": false}
        },
        "own-post-commented": {
          "yes": {"callback": "app.open", "title": "View", "foreground": true, "destructive": false},
          "no": {"callback": "app.mute", "title": "Mute", "foreground": false, "destructive": false}
        },
        "follow-user-petition-commented": {
          "yes": {"callback": "app.open", "title": "View", "foreground": true, "destructive": false},
          "no": {"callback": "app.mute", "title": "Mute", "foreground": false, "destructive": false}
        },        
        "follow-post-commented": {
          "yes": {"callback": "app.open", "title": "View", "foreground": true, "destructive": false},
          "no": {"callback": "app.mute", "title": "Mute", "foreground": false, "destructive": false}
        },
        // is seems there is no own-user-petition-signed
        "own-post-voted": {
          "yes": {"callback": "app.open", "title": "View", "foreground": true, "destructive": false},
          "no": {"callback": "app.mute", "title": "Mute", "foreground": false, "destructive": false}
        },
        //// LEADER CONTENT ///////////////////////////////////////
        "announcement": {
          "yes": {"callback": "app.share", "title": "Share", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "group_question": {
          "yes": {"callback": "app.open", "title": "Respond", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "group_petition": {
          "yes": {"callback": "app.sign", "title": "Sign", "foreground": true, "destructive": false},
          "no": {"callback": "app.open", "title": "View", "foreground": false, "destructive": false}
        },
        "group_news": {
          "yes": {"callback": "app.open", "title": "Open", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "group_event": {
          "yes": {"callback": "app.rsvp", "title": "RSVP", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "group_payment_request": {
          "yes": {"callback": "app.donate", "title": "Donate", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "group_payment_request_crowdfunding": {
          "yes": {"callback": "app.donate", "title": "Donate", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
        "comment-replied":  {
          "yes": {"callback": "app.reply", "title": "Reply", "foreground": true, "destructive": false},
          "no": {"callback": "app.ignore", "title": "Ignore", "foreground": false, "destructive": false}
        },
     }}
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

      if(data.additionalData && data.additionalData.additionalData && data.additionalData.additionalData.badgeCount){
        push.setApplicationIconBadgeNumber(function(response) {
          // success
        }, function(error) {
          console.log('push notification: setApplicationIconBadgeNumber failed: ');
          console.log(error)
        }, data.additionalData.additionalData.badgeCount);        
      }

      if (data.additionalData && Number(data.additionalData.foreground)) {
        navigator.notification.beep(1);
        navigator.vibrate(500);
      }

      service.confirmNotificationIsProcessed(data)
    });

    push.on('error', function(error) {
        console.log("push notification plugin error:");
        console.log(error);
    });
  }

  var service = {
    init: init,
    confirmNotificationIsProcessed: function(data){
      var notificationID = null
      if(data.additionalData && data.additionalData.additionalData && data.additionalData.additionalData.notId)
        notificationID = data.additionalData.additionalData.notId
 
      if(!device.isAndroid && notificationID){
        push.finish(function() {
           // success
        }, function(error) {
            console.log('error while confirming notification with id' +notificationID);
            console.log(error)
        }, notificationID);
      }
    }
  }

  return service
})