function PollEventMixin(serverConfig, $http){
  this.subscribeToNotifications = function(){
    var eventID = this.get('entity').id
    var that = this
    return $http.put(serverConfig.url + '/api/v2/user/polls/'+eventID) .then(function(){
      var pollInfo = that.get('poll')
      pollInfo.is_subscribed = true
      that.set('poll', pollInfo)
    })
  }

  this.unsubscribeFromNotifications = function(){
    var eventID = this.get('entity').id
    var that = this
    return $http.delete(serverConfig.url + '/api/v2/user/polls/'+eventID) .then(function(){
      var pollInfo = that.get('poll')
      pollInfo.is_subscribed = false
      that.set('poll', pollInfo)
    })
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

  this.groupName = function(){
    return this.get('owner').official_title
  }

  this.getCreator = function(){
    return this.get('user')
  }

  this.markAsAnswered = function(){
    this.set('answered', true)
    this.refreshPriorityZone()
  }

  this.isAnswered = function(){
    this.get('answered')
  }

  this.refreshPriorityZone = function(){
    if(this.isAnswered())
      this.removeFromPriorityZone()
  }
}