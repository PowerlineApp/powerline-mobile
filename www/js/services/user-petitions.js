angular.module('app.services').factory('userPetitions',function ($q, session, serverConfig, $http, $sce, iParse, $rootScope) {

  var UserPetitionInstance = function(rawData){
    this._load = function(data){
      this.body = data.body
      this.html_body = $sce.trustAsHtml(iParse.wrapHashTags(iParse.wrapLinks(data.html_body)))
      this.signatures = data.signatures

      this.owner = {
        id: data.user.id,
        avatar: data.user.avatar_file_name,
        type: 'user',
        name: data.user.first_name + ' ' + data.user.last_name
      }

      this.created_at_date = new Date(data.created_at)
      this.expired_at_date = new Date(data.expire_at);
      this._isBoosted = data.boosted
      this.title = data.title
      this.id = data.id
    }

    this._load(rawData)

    this.expired = function(){
      return (this.expired_at_date <= new Date())
    }

    this.isBoosted = function(){
      return this._isBoosted
    }

    this.ownedByCurrentUser = function(){
      return(session.user_id === this.owner.id)
    }

    this.signedForPetitionCount = function(){
      return(this.signatures.length)
    }

    this.updateBodyText = function(){
      var that = this
      var data = {body: this.body}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/user-petitions/' + this.id, payload, headers).then(function(resp) {
        that._load(resp.data)
      });
    }

    this.delete = function(){
       return $http.delete(serverConfig.url + '/api/v2/user-petitions/' + this.id)     
    }

    this.isSignedByMe = function(){
      var mySignature = this.signatures.find(function(signature){
        return signature.user.id == session.user_id
      })

      return(mySignature != null)
    }

    this.canBeSigned = function(){
      return !this.isSignedByMe() && !this.expired() && !this.ownedByCurrentUser()
    }

    this.canBeUnsigned = function(){
      return this.isSignedByMe()
    }

    this.canSeeResults = function(){
      return this.ownedByCurrentUser() || this.expired()
    }

    this.sign = function(){
      var that = this
      return service.sign(this.id).then(function(){
        that.reload()
        $rootScope.$emit('userPetition.signed', that.id);
      })
    }

    this.unsign = function(){
      var that = this
      return service.unsign(this.id).then(function(){
        that.reload()
        $rootScope.$emit('userPetition.unsigned', that.id);
      })
    }

    this.reload = function(){
      var that = this
      $http.get(serverConfig.url + '/api/v2/user-petitions/'+this.id).then(function (response) {
        that._load(response.data)
      });
    }
  }

  var service = {
    get: function(userPetitionID){
      var d = $q.defer();
      $http.get(serverConfig.url + '/api/v2/user-petitions/'+userPetitionID).then(function (response) {
        var userPetition = new UserPetitionInstance(response.data)
        d.resolve(userPetition)
      });  

      return d.promise;    
    },

    create: function(groupID, title, body){
      var data = {body:body, title: title}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/user-petitions', payload, headers).then(function(response) {
        return(response)
      })
    },

    sign: function(userPetitionID){
      return $http.post(serverConfig.url + '/api/v2/user-petitions/'+userPetitionID+'/sign')
    },

    unsign: function(userPetitionID){
      return $http.delete(serverConfig.url + '/api/v2/user-petitions/'+userPetitionID+'/sign')
    },

    subscribeToNotifications: function(userPetitionID){
      return $http.put(serverConfig.url + '/api/v2/user/user-petitions/'+userPetitionID)      
    },
    unsubscribeFromNotifications: function(userPetitionID){
      return $http.delete(serverConfig.url + '/api/v2/user/user-petitions/'+userPetitionID)      
    },

    getComments: function(userPetitionID){
      return $http.get(serverConfig.url + '/api/v2/user-petitions/'+userPetitionID+'/comments').then(function(response){
        return response.data.payload
      })
    },

    addComment: function(userPetitionID, parentCommentID, commentText){
      var payload = JSON.stringify({
        comment_body:commentText,
        parent_comment: parentCommentID
      })
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/user-petitions/'+userPetitionID+'/comments', payload, headers)
    },

    deleteComment: function(commentID){
      return $http.delete(serverConfig.url + '/api/v2/user-petition-comments/'+commentID) 
    },

    updateComment: function(commentID, commentText){
      var payload = JSON.stringify({
        comment_body:commentText,
      })
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/user-petition-comments/'+commentID, payload, headers)
    }
  }

  return service
})