angular.module('app.services').factory('pushNotificationCallbacks', function ($location, $timeout, follows, posts) {
  // we must use global app.* variable to store callbacks
  // becuase push notification plugin is from phonegap, which uses 'app'

  app = {
    view: function(data){
      console.log('app.view callback fired')
      console.log(JSON.stringify(data))
      console.log(data)

      if(data.additionalData.entity.target.type == 'post'){
        $location.path('/main') // tweak to have back button in detail
        $timeout(function(){
          $location.path('/post/' + data.additionalData.entity.target.id);
        }, 0);
      }
    },

    mute: function(data){
      console.log('app.mute callback fired')
      console.log(JSON.stringify(data))
      console.log(data)      
    },

    approve: function(data){
      var userID = data.additionalData.entity.target.id
      follows.getOrCreateUser(userID).approve()

      $location.path('/main')
      $timeout(function(){
        $location.path('/influences');
      }, 0);         
    },

    ignore: function(data){
      // TODO follow request ignore

      if(data.additionalData.entity.target.type == 'post'){
        var postID = data.additionalData.entity.target.id
        posts.ignore(postID).then(function(){
          $location.path('/main')
          $timeout(function(){
            $location.path('/post/' + postID);
          }, 0);
        })
      }
    },

    upvote: function(data){
      if(data.additionalData.entity.target.type == 'post'){
        var postID = data.additionalData.entity.target.id
        posts.upvote(postID).then(function(){
          $location.path('/main')
          $timeout(function(){
            $location.path('/post/' + postID);
          }, 0);
        })
      }
    }

  }

  // the actual service
  return {
    initialize: function(){}
  }
})