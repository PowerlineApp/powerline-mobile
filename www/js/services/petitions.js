angular.module('app.services').factory('petitions',function ($q, session, serverConfig, $http, $sce, iParse) {

  var PetitionInstance = function(rawData){
    this._load = function(data){
      this.body = data.petition_body
      this.html_body = $sce.trustAsHtml(iParse.wrapHashTags(iParse.wrapLinks(data.petition_body)))
      this.owner = {
        id: data.group.id,
        avatar: data.group.avatar_file_path,
        type: 'group',
        name: data.group.official_title
      }

      this.votingOptions = data.options

      this.created_at_date = new Date(data.published_at)
      this.expired_at_date = new Date(this.created_at_date.getTime() + 86400000)
      this.title = data.petition_title
      this.id = data.id
      this.myAnswerID = null
      if(data.answer_entity && data.answer_entity.id)
        this.myAnswerID = data.answer_entity.id
    }

    this._load(rawData)

    this.expired = function(){
      return (this.expired_at_date <= new Date())
    }

    this.ownedByCurrentUser = function(){
      return(false)
    }

    this.signedForPetitionCount = function(){
      return(this.votingOptions[0].votes_count)
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

    this.isSignedByMe = function(){
      return this.myAnswerID
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

    this.sign = function(privacy){
      // TODO: refresh appropriate activity
      var voteOptionID = this.votingOptions[0].id
      var data = {privacy: privacy, option_id : voteOptionID, id: this.id, comment: ''}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/poll/question/' + this.id + '/answer/add', payload, headers).then(this.reload.bind(this))
    }

    this.unsign = function(){
      // TODO: refresh appropriate activity
       var voteOptionID = this.votingOptions[0].id
       return $http.delete(serverConfig.url + '/api/petition/' + this.id + '/answers/' + voteOptionID).then(this.reload.bind(this))
    }

    this.reload = function(){
      var that = this
      $http.get(serverConfig.url + '/api/poll/question/'+this.id).then(function (response) {
        that._load(response.data)
      });
    }
  }

  var service = {
    get: function(petitionID){
      var d = $q.defer();
      $http.get(serverConfig.url + '/api/poll/question/'+petitionID).then(function (response) {
        var petition = new PetitionInstance(response.data)
        d.resolve(petition)
      });  

      return d.promise;    
    },

    sign: function(petitionID){
      var d = $q.defer();
      this.get(petitionID).then(function(petition){
        var privacy = 0
        petition.sign(privacy).then(function(){
          d.resolve()
        })
      })
      return d.promise;  
    },

    unsign: function(petitionID){
      var d = $q.defer();
      this.get(petitionID).then(function(petition){
        petition.unsign().then(function(){
          d.resolve()
        })
      })
      return d.promise;       
    },

    subscribeToNotifications: function(petitionID){
      return $http.put(serverConfig.url + '/api/v2/user/polls/'+petitionID)      
    },
    unsubscribeFromNotifications: function(petitionID){
      return $http.delete(serverConfig.url + '/api/v2/user/polls/'+petitionID)      
    }
  }

  return service
})