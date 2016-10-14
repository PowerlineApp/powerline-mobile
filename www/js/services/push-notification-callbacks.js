angular.module('app.services').factory('pushNotificationCallbacks', 
function ($location, $timeout, follows, posts, userPetitions, petitions, groups, $rootScope, notifications) {
  // we must use global app.* variable to store callbacks
  // becuase push notification plugin is from phonegap, which uses 'app'

  var visitAandThenB = function(urlA, urlB){
    $rootScope.showSpinner()
    $location.path(urlA) // tweak to have back button in detail
    $timeout(function(){
      $rootScope.hideSpinner()
      $location.path(urlB);
    }, 2000);    
  }

  var visitMainPageAndThen = function(url){   
    visitAandThenB('/main', url)
  }


  app = {
    view: function(data){
      var isPost = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'post'
      var isUserPetition = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'user-petition'
      var isPetition = data.additionalData.type == 'group_petition'
      var isNews = data.additionalData.type == 'group_news'

      if(isPost){
        var eid = data.additionalData.entity.target.id
        visitMainPageAndThen('/post/' + eid)
      } else if(isUserPetition){
        var eid = data.additionalData.entity.target.id
        visitMainPageAndThen('/user-petition/' + eid)   
      } else if(isPetition){
        var petitionID = data.additionalData.entity.id
        visitMainPageAndThen('/petition/' + petitionID)
      } else if(isNews){
        var newsID = data.additionalData.entity.id
        visitMainPageAndThen('/question/news/' + newsID)
      }

      notifications.confirmNotificationIsProcessed(data)
    },
    open: function(data){
      var isPollNews = data.additionalData.type == 'group_news'
      var isGroup = data.additionalData.type == 'group-permissions-changed'
      var isPost = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'post'
      var isUserPetition = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'user-petition'
      if(isPollNews){
        var nID = data.additionalData.entity.id
        visitMainPageAndThen('/question/news/' + nID) 
      } else if(isGroup){
        var gID = data.additionalData.entity.target.id
        visitMainPageAndThen('/group/' + gID) 
      } else if(isPost){
        var eid = data.additionalData.entity.target.id
        visitMainPageAndThen('/post/' + eid)
      } else if(isUserPetition){
        var eid = data.additionalData.entity.target.id
        visitMainPageAndThen('/user-petition/' + eid)
      } 
      notifications.confirmNotificationIsProcessed(data)
    },
    rsvp: function(data){
      var isPollEvent = data.additionalData.type == 'group_event'
      if(isPollEvent){
        var pID = data.additionalData.entity.id
        visitMainPageAndThen('/leader-event/' + pID) 
      }
      notifications.confirmNotificationIsProcessed(data)
    },
    share: function(data){
      visitMainPageAndThen('/messages')
      notifications.confirmNotificationIsProcessed(data)
    },
    join: function(data){
      var groupID = data.additionalData.entity.id
      groups.join(groupID).finally(function(){
        visitMainPageAndThen('/group/' + groupID)
      })
      notifications.confirmNotificationIsProcessed(data)
    },
    donate: function(data){
      var isPollPayment = data.additionalData.type == 'group_payment_request'
      var isCrowdfundPayment = data.additionalData.type == 'group_payment_request_crowdfunding'
      var pID = data.additionalData.entity.id
      if(isPollPayment)
        visitMainPageAndThen('/payment-polls/payment-request/' + pID) 
       else if (isCrowdfundPayment)
        visitMainPageAndThen('/payment-polls/crowdfunding-payment-request/' + pID) 
      
      notifications.confirmNotificationIsProcessed(data)
    },
    respond: function(data){
      var t = data.additionalData.type
      var eid = data.additionalData.entity.id
      if(t == 'group_question')
        visitMainPageAndThen('/questions/' + eid)     
      notifications.confirmNotificationIsProcessed(data)   
    },
    mute: function(data){
      if(data.additionalData.entity.target.type == 'post'){
        var postID = data.additionalData.entity.target.id
        posts.unsubscribeFromNotifications(postID)
      } 
      notifications.confirmNotificationIsProcessed(data)
    },

    approve: function(data){
      var userID = data.additionalData.entity.target.id
      follows.getOrCreateUser(userID).approve()
      visitMainPageAndThen('/influences');
      notifications.confirmNotificationIsProcessed(data)
    },

    ignore: function(data){
      // do nothing
      notifications.confirmNotificationIsProcessed(data)
    },

    upvote: function(data){
      var postID = data.additionalData.entity.target.id
      posts.upvote(postID).then(function(){
        visitMainPageAndThen('/post/' + postID);
        $rootScope.showToast('Your vote was recorded.')
      })
      notifications.confirmNotificationIsProcessed(data)
    },

    downvote: function(data){
      var postID = data.additionalData.entity.target.id
      posts.downvote(postID).then(function(){
        visitMainPageAndThen('/post/' + postID);
        $rootScope.showToast('Your vote was recorded.')
      })
      notifications.confirmNotificationIsProcessed(data)
    },

    sign: function(data){
      var isUserPetition = data.additionalData.entity && data.additionalData.entity.target && (data.additionalData.entity.target.type == 'user-petition' || data.additionalData.entity.target.type == 'user-petition-boosted')
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
      notifications.confirmNotificationIsProcessed(data)
    },

    reply: function(data){
      app.view(data)
    }

  }

  // the actual service
  return {
    initialize: function(){}
  }
})