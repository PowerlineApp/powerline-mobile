function UserPetitionMixin(userPetitions, groups) {
  this.getIcon = function () {
    return 'petition'
  }

  this.isSignedbyMe = function(){
    var isSigned = (this.get('answers') && this.get('answers').length > 0)
    return(isSigned)
  }

  this.canSign = function(){
    var notExpired = !this.isExpired()
    var notOwnedByMe = !this.isOwn()
    var notSignedByMe = !this.isSignedbyMe()
    
    return notExpired && notOwnedByMe && notSignedByMe
  }

  this.markAsSigned = function(){
    this.set('answers', ['whatever'])
    this.refreshPriorityZone()
  }

  this.markAsUnsigned = function(){
    this.set('answers', [])
    this.refreshPriorityZone()
  }

  this.sign = function(){
    var userPetitionID = this.get('entity').id
    var that = this
    return userPetitions.sign(userPetitionID).then(function(){
      that.markAsSigned()
    })
  }

  this.canUnsign = function(){
    return this.isSignedbyMe()
  }

  this.unsign = function(){
    var userPetitionID = this.get('entity').id
    var that = this
    return userPetitions.unsign(userPetitionID).then(function(){
      that.markAsUnsigned()
    })
  }

  this.userIsSubscribedToNotifications = function(){
    return this.get('user_petition') && this.get('user_petition').is_subscribed
  }

  this.subscribeToNotifications = function(){
    var userPetitionID = this.get('entity').id
    var that = this
    return userPetitions.subscribeToNotifications(userPetitionID).then(function (response) {
      that.set('user_petition', {is_subscribed: true})
    })
  }

  this.unsubscribeFromNotifications = function(){
    var userPetitionID = this.get('entity').id
    var that = this
    return userPetitions.subscribeToNotifications(userPetitionID).then(function (response) {
      that.set('user_petition', {is_subscribed: false})
    })
  }

  this.creatorName = function(){
    var name = this.get('owner').first_name + ' ' + this.get('owner').last_name
    return name
  }

  this.groupName = function(){
    var userGroup = groups.get(this.get('entity').group_id);
    if(userGroup)
      return userGroup.official_title
  }

  this.getCreator = function(){
    return this.get('owner')
  }

  this.refreshPriorityZone = function(){
    if(this.isSignedbyMe() || !this.isUnread())
      this.removeFromPriorityZone()
  }
}