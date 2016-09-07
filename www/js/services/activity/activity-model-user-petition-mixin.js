function UserPetitionMixin(userPetitions) {
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
  }

  this.markAsUnsigned = function(){
    this.set('answers', [])
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
    return this.get('petition') && this.get('petition').is_subscribed
  }

  this.subscribeToNotifications = function(){
    var userPetitionID = this.get('entity').id
    var that = this
    return userPetitions.subscribeToNotifications(userPetitionID).then(function (response) {
      that.set('petition', {is_subscribed: true})
    })
  }

  this.unsubscribeFromNotifications = function(){
    var userPetitionID = this.get('entity').id
    var that = this
    return userPetitions.subscribeToNotifications(userPetitionID).then(function (response) {
      that.set('petition', {is_subscribed: false})
    })
  }
}