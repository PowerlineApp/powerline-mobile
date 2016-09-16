angular.module('app.services').factory('pushNotificationCallbacks', 
function ($location, $timeout, follows, posts, userPetitions) {
  // we must use global app.* variable to store callbacks
  // becuase push notification plugin is from phonegap, which uses 'app'

  var visitMainPageAndThen = function(url){
    $location.path('/main') // tweak to have back button in detail
    $timeout(function(){
      $location.path(url);
    }, 1000);    
  }

  app = {
    view: function(data){
      var t = data.additionalData.entity.target.type
      var eid = data.additionalData.entity.target.id
      if(t == 'post')
        visitMainPageAndThen('/post/' + eid)
      else if(t == 'user-petition')
        visitMainPageAndThen('/user-petition/' + eid)        
    },
    respond: function(data){
      var t = data.additionalData.type
      var eid = data.additionalData.entity.id
      if(t == 'group_question')
        visitMainPageAndThen('/questions/' + eid)        
    },
    mute: function(data){
      if(data.additionalData.entity.target.type == 'post'){
        var postID = data.additionalData.entity.target.id
        posts.unsubscribeFromNotifications(postID)
      } 
    },

    approve: function(data){
      var userID = data.additionalData.entity.target.id
      follows.getOrCreateUser(userID).approve()
      visitMainPageAndThen('/influences');
    },

    ignore: function(data){
      ionic.Platform.exitApp();
    },

    upvote: function(data){
      if(data.additionalData.entity.target.type == 'post'){
        var postID = data.additionalData.entity.target.id
        posts.upvote(postID).then(function(){
          visitMainPageAndThen('/post/' + postID);
        })
      }
    },

    sign: function(data){
      if(data.additionalData.entity.target.type == 'user-petition'){
        var userPetitionID = data.additionalData.entity.target.id
        userPetitions.sign(userPetitionID).then(function(){
          visitMainPageAndThen('/user-petition/' + userPetitionID);
        })
      }
    }

  }

  // the actual service
  return {
    initialize: function(){}
  }
})