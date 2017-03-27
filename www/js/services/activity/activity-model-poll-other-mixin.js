function PollOtherMixin(serverConfig, $http){
  this.subscribeToNotifications = function(){
    var eventID = this.get('entity').id
    var that = this
    return $http.put(serverConfig.url + '/api/v2/user/polls/'+eventID) .then(function(){
      that.markAsSubscribed()
    })
  }

  this.unsubscribeFromNotifications = function(){
    var eventID = this.get('entity').id
    var that = this
    return $http.delete(serverConfig.url + '/api/v2/user/polls/'+eventID) .then(function(){
      that.markAsUnsubscribed()
    })
  }

  this.markAsSubscribed = function(){
      var pollInfo = this.get('poll')
      pollInfo.is_subscribed = true
      this.set('poll', pollInfo)
  }

  this.markAsUnsubscribed = function(){
      var pollInfo = this.get('poll')
      pollInfo.is_subscribed = false
      this.set('poll', pollInfo)
  }

  this.userIsSubscribedToNotifications = function(){
    return this.get('poll') && this.get('poll').is_subscribed
  }

  this.creatorName = function(){
    if(this.get('user'))
      return this.get('user').official_title
    else
      return this.groupName()
  }

  this.ownerName = function(){
    return this.groupName()
  }
  
  this.groupName = function(){
    return this.get('owner').official_name
  }

  this.getCreator = function(){
    return this.get('user')
  }

  this.refreshPriorityZone = function(){
    // TODO
  }
}
