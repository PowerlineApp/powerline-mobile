function PollPetitionMixin(petitions){
  this.canSign = function(){
    var notExpired = !this.isExpired()
    var notOwnedByMe = !this.isOwn()
    var notSignedByMe = !this.isSignedbyMe()

    return notExpired && notOwnedByMe && notSignedByMe       
  }

  this.canUnsign = function(){
    return this.isSignedbyMe()
  }

  this.isSignedbyMe = function(){
    return this.get('answered')
  }

  this.refreshPriorityZone = function(){
    if(this.isSignedbyMe() || !this.isUnread())
      this.removeFromPriorityZone()
  }

  this.markAsSigned = function(){
    this.set('answered', true)
    this.refreshPriorityZone()
  }

  this.markAsUnsigned = function(){
    this.set('answered', false)
    this.refreshPriorityZone()
  }

  this.sign = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.sign(petitionID).then(function(){
      that.markAsSigned()
    })
  }

  this.unsign = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.unsign(petitionID).then(function(){
      that.markAsUnsigned()
    })
  }

  this.userIsSubscribedToNotifications = function(){
    return this.get('poll') && this.get('poll').is_subscribed
  }

  this.subscribeToNotifications = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.subscribeToNotifications(petitionID).then(function (response) {
      that.markAsSubscribed()
    })
  }

  this.unsubscribeFromNotifications = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.unsubscribeFromNotifications(petitionID).then(function (response) {
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

  this.creatorName = function(){
    if(this.get('user'))
      return this.get('user').official_title
    else
      return this.groupName()
  }

  this.groupName = function(){
    return this.get('owner').official_name
  }

  this.getCreator = function(){
    return this.get('user')
  }
}