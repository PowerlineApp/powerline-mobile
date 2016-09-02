function PollPetitionMixin(){
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

  this.markAsSigned = function(){
    this.set('answered', true)
  }

  this.markAsUnsigned = function(){
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
    return false // waiting for #202
  }

  this.subscribeToNotifications = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.subscribeToNotifications(petitionID).then(function (response) {
      // TODO waiting for #202
    })
  }

  this.unsubscribeFromNotifications = function(){
    var petitionID = this.get('entity').id
    var that = this
    return petitions.subscribeToNotifications(petitionID).then(function (response) {
      // TODO waiting for #202
    })
  }
}