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
    this.refreshPriorityZone()
    this.set('answered', true)
  }

  this.markAsUnsigned = function(){
    this.refreshPriorityZone()
    this.set('answered', false)
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
    return this.get('poll').is_subscribed
  }

  this.subscribeToNotifications = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.subscribeToNotifications(petitionID).then(function (response) {
      var pollInfo = that.get('poll')
      pollInfo.is_subscribed = true
      that.set('poll', pollInfo)
    })
  }

  this.unsubscribeFromNotifications = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.subscribeToNotifications(petitionID).then(function (response) {
      var pollInfo = that.get('poll')
      pollInfo.is_subscribed = false
      that.set('poll', pollInfo)
    })
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
}