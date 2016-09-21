angular.module('app.services').factory('GroupModel', function(groupsInvites, $http, $q, serverConfig) {
  var model = function(){
    this.fillWith = function(data){
      $.extend(this, data)
      this.upper_title = this.official_title.toUpperCase();
    },

    this.members = function(){
      return $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/users').then(function(response){
        return(response.data.payload)
      })  
    }

    this.fieldsToFillOnJoin = function(){
      var deferred = $q.defer();
      var that = this
      if(that._fieldsToFillOnJoin)
        deferred.resolve(that._fieldsToFillOnJoin);
      else {
        $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/fields').then(function(response){
          that._fieldsToFillOnJoin = response.data || []
          deferred.resolve(that._fieldsToFillOnJoin);
        })  
      }
      return deferred.promise;   
    }

    this.userHasInvitation = function(){
      return groupsInvites.hasInvite(this.id)
    }

    this.groupTypeIsCommon = function(){
      return this.group_type == 0
    },

    this.groupMembershipIsPublic = function(){
      return this.membership_control == 'public' // 0
    },

    this.groupMembershipIsApproval = function(){
      return this.membership_control == 'approval' // 1
    },

    this.groupMembershipIsPasscode = function(){
      return this.membership_control == 'passcode' // 2
    },

    this.isPasscodeRequiredOnJoin = function(){
      return !this.userHasInvitation() && this.groupMembershipIsPasscode()
    },

    this.getTitle = function () {
      return this.acronym || this.official_title;
    },

    this.getIconWhite = function () {
      return this.groupTypeIsCommon() ? this.avatar_file_path : 'images/v2/icons/location-group-white.png';
    },

    this.getIcon = function () {
      return this.groupTypeIsCommon() ? this.avatar_file_path : 'images/v2/icons/location-group.png';
    },

    this.joinedByCurrentUser = function(){
      return(this.joined == 1)
    }

    this.unjoin = function(){
      var that = this
      return $http.delete(serverConfig.url + '/api/v2/user/groups/' + this.id).then(function(){
        that.joined = 0
      })
    }

    this.followAllMembers = function(){
      return $http.put(serverConfig.url + '/api/v2/user/group-followers/' + this.id)    
    }

    this.addQuestionRequiredOnJoin = function(questionText){
        var data = {field_name: questionText}
        var payload = JSON.stringify(data)
        var headers = {headers: {'Content-Type': 'application/json'}}
        return $http.post(serverConfig.url + '/api/v2/groups/'+this.id+'/fields', payload, headers).then(function(response){
          return(response)
        })
    },

    this.setMembeshipControlToPasscode = function(passcode){
        var data = {membership_control: 'passcode', 
            membership_passcode: passcode}
        var payload = JSON.stringify(data)
        var headers = {headers: {'Content-Type': 'application/json'}}
        return $http.put(serverConfig.url + '/api/v2/groups/'+this.id+'/membership', payload, headers).then(function(response){
          return(response)
        })
    }
  }

  return model
})

