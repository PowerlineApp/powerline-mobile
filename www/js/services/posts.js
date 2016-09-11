angular.module('app.services').factory('posts',function ($q, session, serverConfig, $http, $sce, iParse, $rootScope) {

  var PostInstance = function(rawData){
    this._load = function(data){
      this.body = data.body

      var pre_parsed_html_body = data.html_body
      if(data.html_body.length == 0)
        pre_parsed_html_body = this.body
      this.html_body = $sce.trustAsHtml(iParse.wrapHashTags(iParse.wrapLinks(pre_parsed_html_body)))

      this.owner = {
        id: data.user.id,
        avatar: data.user.avatar_file_name,
        type: 'user',
        name: data.user.first_name + ' ' + data.user.last_name
      }

      this.votes = data.votes
      this.upvoteResultsInPercents = 0
      this.downvoteResultsInPercents = 0
      var upvoteCount = 0
      var downvoteCount = 0
      this.votes.forEach(function(vote){
        if(vote.option == 1)
          upvoteCount++
        else if(vote.option == 2)
          downvoteCount++
      })
      if(upvoteCount + downvoteCount > 0){
        this.upvoteResultsInPercents = parseInt(upvoteCount / (upvoteCount + downvoteCount ) * 100)
        this.downvoteResultsInPercents = parseInt(downvoteCount / (upvoteCount + downvoteCount ) * 100)
      }

      this.created_at_date = new Date(data.created_at)
      this.expired_at_date = new Date(data.expired_at);
      this._isBoosted = data.boosted
      this.title = data.title
      this.id = data.id
    }

    this._load(rawData)

    this.expired = function(){
      return(this.expired_at_date <= new Date())
    }

    this.isBoosted = function(){
      return this._isBoosted
    }

    this.getMyAnswerType = function(){
      var myAnswer = this.votes.find(function(answers){
        return answers.user.id == session.user_id
      })

      // TODO resolve proper attribute
      if(myAnswer){
        if(myAnswer.option == 1)
          return 'upvote'
        else if(myAnswer.option == 2)
          return 'downvote'
        else 
          return 'ignore'
      }
      else 
        return null
    }

    this.ownedByCurrentUser = function(){
      return(session.user_id === this.owner.id)
    }

    this.updateBodyText = function(){
      var that = this
      var data = {body: this.body}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/posts/' + this.id, payload, headers).then(function(resp) {
        that._load(resp.data)
      });
    }

    this.delete = function(){
       return $http.delete(serverConfig.url + '/api/v2/posts/' + this.id)     
    }

    this.vote = function(answerType){
      var postID = this.id
      var alreadyAnswered = this.getMyAnswerType()
      var unvoteRequest;
      if(alreadyAnswered)
        unvoteRequest = service.unvote(postID)
      else
        unvoteRequest = $q.resolve();

      return unvoteRequest.then(function(){
        $rootScope.$emit('post.voted', postID);

        if(answerType == 'upvote')
          return service.upvote(postID)
        else if(answerType == 'downvote')
          return service.downvote(postID)
        else if(answerType == 'ignore')
          return service.ignore(postID)
        else
          console.log('post.vote -- unknown answer type: '+answerType)
      })
    }
  }

  var service = {
    get: function(postID){
      var d = $q.defer();
      $http.get(serverConfig.url + '/api/v2/posts/'+postID).then(function (response) {
        var post = new PostInstance(response.data)
        d.resolve(post)
      });  

      return d.promise;    
    },
    create: function(groupID, body){
      var data = {body:body}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/posts', payload, headers).then(function(response) {
        return(response)
      })
    },

    upvote: function(postID){
      var payload = JSON.stringify({option:'upvote'})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/posts/'+postID+'/vote', payload, headers)
    },

    downvote: function(postID){
      var payload = JSON.stringify({option:'downvote'})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/posts/'+postID+'/vote', payload, headers)
    },

    ignore: function(postID){
      var payload = JSON.stringify({option:'ignore'})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/posts/'+postID+'/vote', payload, headers)
    },

    unvote: function(postID){
      return $http.delete(serverConfig.url + '/api/v2/posts/'+postID+'/vote')
    },

    subscribeToNotifications: function(postID){
      return $http.put(serverConfig.url + '/api/v2/user/posts/'+postID)      
    },
    unsubscribeFromNotifications: function(postID){
      return $http.delete(serverConfig.url + '/api/v2/user/posts/'+postID)      
    },

    getComments: function(postID){
      return $http.get(serverConfig.url + '/api/v2/posts/'+postID+'/comments').then(function(response){
        return response.data.payload
      })
    },

    addComment: function(postID, parentCommentID, commentText){
      var payload = JSON.stringify({
        comment_body:commentText,
        parent_comment: parentCommentID
      })
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/posts/'+postID+'/comments', payload, headers)
    },

    deleteComment: function(commentID){
      return $http.delete(serverConfig.url + '/api/v2/post-comments/'+commentID) 
    },

    updateComment: function(commentID, commentText){
      var payload = JSON.stringify({
        comment_body:commentText,
      })
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/post-comments/'+commentID, payload, headers)
    }
  }

  return service
})