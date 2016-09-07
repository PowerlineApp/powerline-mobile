function PollOtherMixin(serverConfig, $http){
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
    return this.get('poll').is_subscribed
  }
}