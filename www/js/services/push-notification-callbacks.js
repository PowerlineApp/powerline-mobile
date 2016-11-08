angular.module('app.services').factory('pushNotificationCallbacks', 
function ($location, $timeout, follows, posts, userPetitions, petitions, groups, $rootScope, notifications, announcements) {
  // we must use global app.* variable to store callbacks
  // becuase push notification plugin is from phonegap, which uses 'app'

  app = {
    view: function(data){
      app.open(data)
    },
    open: function(data){
      var isPost = false
      var isUserPetition = false
      if(data.additionalData.entity && data.additionalData.entity.target){
        var targetType = data.additionalData.entity.target.type
        isPost = (targetType == 'post' || targetType == 'post-boosted')
        isUserPetition = (targetType == 'user-petition' || targetType == 'user-petition-boosted')
      }
      var isPollNews = data.additionalData.type == 'group_news'
      var isGroup = data.additionalData.type == 'group-permissions-changed'
      var isCrowdfunding = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'group_payment_request_crowdfunding'
      var isPollNewsFromMention = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'group_news'
      var isPayment = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'group_payment_request'
      var isEvent = data.additionalData.entity && data.additionalData.entity.target && data.additionalData.entity.target.type == 'group_event'
      var isPetition = data.additionalData.type == 'group_petition'
      var isQuestion = data.additionalData.type == 'group_question' || (data.additionalData.entity && data.additionalData.entity.target && (data.additionalData.entity.target.type == 'group_question' || data.additionalData.entity.target.type == 'poll-published'))

      if(isPollNews){
        var nID = data.additionalData.entity.target.id
        $location.path('/question/news/' + nID) 
      } else if(isPollNewsFromMention){
        var eid = data.additionalData.entity.target.id
        $location.path('/question/news/' + eid) 
      } else if(isGroup){
        var gID = data.additionalData.entity.target.id
        $location.path('/group/' + gID) 
      } else if(isPost){
        var eid = data.additionalData.entity.target.id
        $location.path('/post/' + eid)
      } else if(isUserPetition){
        var eid = data.additionalData.entity.target.id
        $location.path('/user-petition/' + eid)
      }  else if(isCrowdfunding){
        var eid = data.additionalData.entity.target.id
        $location.path('/payment-polls/crowdfunding-payment-request/' + eid)
      }  else if(isPayment){
        var eid = data.additionalData.entity.target.id
        $location.path('/payment-polls/payment-request/' + eid)
      }  else if(isEvent){
        var eid = data.additionalData.entity.target.id
        $location.path('/leader-event/' + eid)
      } else if(isPetition){
        var eid = data.additionalData.entity.target.id
        $location.path('/petition/' + eid)
      } else if(isQuestion){
        var eid = data.additionalData.entity.target.id
        $location.path('/questions/' + eid)
      }
      notifications.confirmNotificationIsProcessed(data)
    },
    rsvp: function(data){
      var isPollEvent = data.additionalData.type == 'group_event'
      if(isPollEvent){
        var pID = data.additionalData.entity.target.id
        $location.path('/leader-event/' + pID) 
      }
      notifications.confirmNotificationIsProcessed(data)
    },
    share: function(data){
      announcements.load()
      $location.path('/messages')
      notifications.confirmNotificationIsProcessed(data)
    },
    join: function(data){
      var groupID = data.additionalData.entity.id
      groups.join(groupID).finally(function(){
        $location.path('/group/' + groupID)
      })
      notifications.confirmNotificationIsProcessed(data)
    },
    donate: function(data){
      var isPollPayment = data.additionalData.type == 'group_payment_request'
      var isCrowdfundPayment = data.additionalData.type == 'group_payment_request_crowdfunding'
      var pID = data.additionalData.entity.target.id
      console.log(pID)
      if(isPollPayment)
        $location.path('/payment-polls/payment-request/' + pID) 
       else if (isCrowdfundPayment)
        $location.path('/payment-polls/crowdfunding-payment-request/' + pID) 
      
      notifications.confirmNotificationIsProcessed(data)
    },
    respond: function(data){
      app.open(data)
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
      $location.path('/influences');
      notifications.confirmNotificationIsProcessed(data)
    },

    ignore: function(data){
      // do nothing
      notifications.confirmNotificationIsProcessed(data)
    },

    upvote: function(data){
      var postID = data.additionalData.entity.target.id
      posts.upvote(postID).then(function(){
        $location.path('/post/' + postID);
        $rootScope.showToast('Your vote was recorded.')
      })
      notifications.confirmNotificationIsProcessed(data)
    },

    downvote: function(data){
      var postID = data.additionalData.entity.target.id
      posts.downvote(postID).then(function(){
        $location.path('/post/' + postID);
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
          $location.path('/user-petition/' + userPetitionID);
        })
      } else if (isPetition){
        var petitionID = data.additionalData.entity.target.id
        petitions.sign(petitionID).then(function(){
          $location.path('/petition/' + petitionID)
        })
      }
      notifications.confirmNotificationIsProcessed(data)
    },

    reply: function(data){
      app.open(data)
    }

  }

  // the actual service
  return {
    initialize: function(){}
  }
})