function PostMixin(posts){
  this.isAnswered = function(){
    return(this.get('answers') && this.get('answers').length > 0)
  }
  this.isUnanswered = function(){
    return !this.isAnswered()
  }

  this.canVote = function(){
    var notAnswered = this.isUnanswered()
    var notExpired = !this.isExpired()
    var notOwnedByMe = !this.isOwn()

    return notAnswered && notExpired && notOwnedByMe
  } 

  this.canUndoVote = function(){
    return this.isAnswered() && !this.isExpired()
  }

  this.upvote = function(){
    var postID = this.get('entity').id
    var that = this
    return posts.upvote(postID).then(function(){
        that.set('answers', ['whatever'])
    })
  }

  this.downvote = function(){
    var postID = this.get('entity').id
    var that = this
    return posts.downvote(postID).then(function(){
        that.set('answers', ['whatever'])
    })
  }

  this.undoVote = function(){
    var postID = this.get('entity').id
    var that = this
    return posts.unvote(postID).then(function(answer){
      that.set('answers', [])
    })
  }

  this.userIsSubscribedToNotifications = function(){
    return this.get('post') && this.get('post').is_subscribed
  }

  this.subscribeToNotifications = function(){
    var postID = this.get('entity').id
    var that = this
    return posts.subscribeToNotifications(postID).then(function (response) {
      that.set('post', {is_subscribed: true})
    })
  }

  this.unsubscribeFromNotifications = function(){
    var postID = this.get('entity').id
    var that = this
    return posts.subscribeToNotifications(postID).then(function (response) {
      that.set('post', {is_subscribed: false})
    })
  }
}