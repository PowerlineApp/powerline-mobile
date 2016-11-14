angular.module('app.services').factory('petitions',function ($q, session, serverConfig, $http, $sce, iParse, $rootScope) {

  var PetitionInstance = function(rawData){
    this._load = function(data){
      this.body = data.petition_body
      this.html_body = $sce.trustAsHtml(iParse.wrapHashTags(iParse.wrapLinks(data.petition_body)))
      this.owner = {
        id: data.group.id,
        avatar: data.group.avatar_file_path,
        type: 'group',
        name: data.group.official_name
      }

      this.votingOptions = data.options
      this.created_at_date = new Date(data.published_at)
      this.expired_at_date = new Date(data.expire_at)
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
      var voteOptionID = this.votingOptions[0].id
      var data = {privacy: privacy, option_id : voteOptionID, id: this.id, comment: ''}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      var that = this
      return $http.post(serverConfig.url + '/api/poll/question/' + this.id + '/answer/add', payload, headers).then(function(){
        that.reload()
        $rootScope.$emit('petition.signed', that.id);
      })
    }

    this.unsign = function(){
       var voteOptionID = this.votingOptions[0].id
       var that = this
       return $http.delete(serverConfig.url + '/api/petition/' + this.id + '/answers/' + voteOptionID).then(function(){
        that.reload()
        $rootScope.$emit('petition.unsigned', that.id);
      })
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
      // see https://github.com/PowerlineApp/powerline-mobile/issues/195#issuecomment-243477778
      // for details why we make two http request in sign/unsign
      this.get(petitionID).then(function(petition){
        var privacy = 'public'
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
    },

    create: function(title, description, groupID, sectionsToPublishIn){
      var data = {petition_title: title, 
        petition_body: description, 
        subject: '.', // not sure what is this, but backend will fail to create petition wihtout it
        type: 'petition'} 

      if(sectionsToPublishIn)
        data.group_sections = sectionsToPublishIn
        
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      var createPetitionRequest = $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
      var d = $q.defer();

      createPetitionRequest.then(function(response){
        var petitionID = response.data.id
        var addOptionsRequests = []
        addOptionsRequests.push(service.addOption(petitionID, 'sign'))
        addOptionsRequests.push(service.addOption(petitionID, 'unsign'))
        $q.all(addOptionsRequests).then(function(){
          service.publish(petitionID).then(function(){
            d.resolve(petitionID)
          }, function(error){
            console.log('failed to publish petition')
            console.log(error)
            d.reject(error)
          })
        })
      }, function(error){
          console.log('failed to create petition')
          console.log(error)
        d.reject(error)
      })

      return d.promise
    },

    addOption: function(petitionID, optionName){
      var data = {value : optionName}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}

      return $http.post(serverConfig.url + '/api/v2/polls/'+petitionID+'/options', payload, headers)
    },

    publish: function(petitionID){
      var data = {}
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.patch(serverConfig.url + '/api/v2/polls/'+petitionID, payload, headers)
    }
  }

  return service
})