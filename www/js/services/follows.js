angular.module('app.services').factory('follows', function ($http,serverConfig, $q, $rootScope) {

  var FUser = function(userData, role){
    this.first_name = userData.first_name
    this.last_name = userData.last_name
    this.avatar_file_name = userData.avatar_file_name
    this.user_id = userData.id
    this.username = userData.username
    this.date_approval = userData.date_approval
    this.full_name = userData.full_name
    this.roles = [role]

    this.isFollowingCurrentUser = function(){
      return(_.include(this.roles, 'isFollowingCurrentUser'))
    }

    this.isFollowedByCurrentUser = function(){
      return(_.include(this.roles, 'isFollowedByCurrentUser'))
    }

    this.addRole = function(role){
      this.roles.push(role)
      this.roles = _.uniq(this.roles)
    }

    this.removeRole = function(role){
      this.roles = _.without(this.roles, role)
    }

    this.stopHimFromFollowingMe = function(){
      return $http.delete(serverConfig.url + '/api/v2/user/followers/'+this.user_id)
    }

    this.isAlsoFollowedByCurrentUser = function(){
      return service.usersFollowedByCurrentUser.find(function(u){
        return u.user_id == this.user_id
      })
    }

    this.isApprovedByCurrentUser = function(){
      return(this.date_approval != null)
    }

    this.approve = function(){
      this.date_approval = new Date()
      return $http.patch(serverConfig.url + '/api/v2/user/followers/'+this.user_id)
    }

    this.unApprove = function(){
      this.date_approval = null
      return $http.delete(serverConfig.url + '/api/v2/user/followers/'+this.user_id)
    }

    this.followBack = function(){
      return $http.put(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }

    this.followByCurrentUser = function(){
      this.addRole('isFollowedByCurrentUser')
      return $http.put(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }

    this.unFollowByCurrentUser = function(){
      this.removeRole('isFollowedByCurrentUser')
      return $http.delete(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }

    this.isApproved = function(){
      return(this.date_approval != null)
    }

    this.stopMeFollowingHim = function(){
      $http.delete(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }
  }

  var service = {}
  service.loaded = false

  service.users = []

  service.load = function(){
    service.users = []

    var p1 = $http.get(serverConfig.url + '/api/v2/user/followings').then(function(response){
      response.data.payload.forEach(function(userData){
        var uID = userData.id
        var u = service.getUser(uID)
        if(u)
          u.addRole('isFollowedByCurrentUser')
        else{
          u = new FUser(userData, 'isFollowedByCurrentUser')
          service.users.push(u)
        }
      })
    })

    var p2 = $http.get(serverConfig.url + '/api/v2/user/followers').then(function(response){
      response.data.payload.forEach(function(userData){
        var uID = userData.id
        var u = service.getUser(uID)
        if(u)
          u.addRole('isFollowingCurrentUser')
        else{
          u = new FUser(userData, 'isFollowingCurrentUser')
          service.users.push(u)
        }
      })
    })

    var deferred = $q.defer();
    $q.all([p1, p2]).then(function(){
      service.loaded = true
      $rootScope.$broadcast('follows-loaded');
      deferred.resolve()
    })

    return deferred.promise
  }

  service.stopFollowing = function(userFollowedByCurrentUser){
    userFollowedByCurrentUser.stopMeFollowingHim()
    this.usersFollowedByCurrentUser = _.without(this.usersFollowedByCurrentUser, userFollowedByCurrentUser)
  }

  service.stopFollower = function(userFollowingCurrentUser){
    userFollowingCurrentUser.stopHimFromFollowingMe()
    this.usersFollowingCurrentUser = _.without(this.usersFollowingCurrentUser, userFollowingCurrentUser)
  }

  service.getUsersFollowingCurrentUser = function(){
    return this.users.filter(function(u){return u.isFollowingCurrentUser()})
  }

  service.getUsersFollowedByCurrentUser = function(){
    return this.users.filter(function(u){return u.isFollowedByCurrentUser()})
  }

  service.loadSuggested = function (friends) {
      return $http.post(serverConfig.url + '/api/profile/facebook-friends', friends).then(function (response) {
        return response.data;
      });
  }

  service.getFollowing = service.getUsersFollowedByCurrentUser

  service.getUser = function(uID){
    return service.users.find(function(user){
      return user.user_id == uID
    })
  }

  service.getOrCreateUser = function(uID){
    var u = service.getUser(uID)
    
    if(u == null){
      u = new FUser({id: uID})
      service.users.push(u)
    }
      
    return u
  }

  service.currentUserWantsToFollowUser = function(uIDtoFollow){
    return $http.put('/api/v2/user/followings/'+uIDtoFollow)
  }

  service.size = function(){
    return(service.users.length)
  }

  service.searchForUsersFollowableByCurrentUser = function(queryText, page, max_count){
      var params = {
        unfollowing: 1,
        q: queryText,
        page: page || 1,
        max_count: max_count || 50
      };

      return $http.get(serverConfig.url + '/api/users/?' + angular.element.param(params)).then(function (response) {
        return _(response.data).map(function (userData) {
          return new FUser(userData);
        });
      });
  }

  return service
});
