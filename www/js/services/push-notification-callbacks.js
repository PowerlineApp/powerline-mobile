angular.module('app.services').factory('pushNotificationCallbacks', 
function ($location, $timeout, follows, posts, userPetitions, petitions) {
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
      var isPost = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'post'
      var isUserPetition = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'user-petition'
      var isPetition = data.additionalData.type == 'group_petition'
      
      if(isPost){
        var eid = data.additionalData.entity.target.id
        visitMainPageAndThen('/post/' + eid)
      } else if(isUserPetition){
        var eid = data.additionalData.entity.target.id
        visitMainPageAndThen('/user-petition/' + eid)   
      } else if(isPetition){
        var petitionID = data.additionalData.entity.id
        visitMainPageAndThen('/petition/' + petitionID)
      }
    },
    open: function(data){
      var isPollNews = data.additionalData.type == 'group_news'
      if(isPollNews){
        var nID = data.additionalData.entity.id
        visitMainPageAndThen('/question/news/' + nID) 
      }
    },
    rsvp: function(data){
      var isPollEvent = data.additionalData.type == 'group_event'
      if(isPollEvent){
        var pID = data.additionalData.entity.id
        visitMainPageAndThen('/leader-event/' + pID) 
      }
    },
    donate: function(data){
      var isPollPayment = data.additionalData.type == 'group_payment_request'
      var isCrowdfundPayment = data.additionalData.type == 'group_payment_request_crowdfunding'
      var pID = data.additionalData.entity.id
      if(isPollPayment)
        visitMainPageAndThen('/payment-polls/payment-request/' + pID) 
       else if (isCrowdfundPayment)
        visitMainPageAndThen('/payment-polls/crowdfunding-payment-request/' + pID) 
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
      var isUserPetition = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'user-petition'
      var isPetition = data.additionalData.type == 'group_petition'
      if(isUserPetition){
        var userPetitionID = data.additionalData.entity.target.id
        userPetitions.sign(userPetitionID).then(function(){
          visitMainPageAndThen('/user-petition/' + userPetitionID);
        })
      } else if (isPetition){
        var petitionID = data.additionalData.entity.id
        petitions.sign(petitionID).then(function(){
          visitMainPageAndThen('/petition/' + petitionID)
        })
      }
    }

  }

  // the actual service
  return {
    initialize: function(){}
  }
})