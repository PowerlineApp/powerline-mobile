angular.module('app.services').factory('follows', function ($http,serverConfig, $q) {

  var UserFollowedByCurrentUser = function(userData){
    this.first_name = userData.first_name
    this.last_name = userData.last_name
    this.avatar_file_name = userData.avatar_file_name
    this.user_id = userData.id
    this.username = userData.username
    this.full_name = userData.full_name

    this.isApproved = function(){
      return(this.date_approval != null)
    }

    this.stopMeFollowingHim = function(){
      $http.delete(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }
  }

  var UserFollowingCurrentUser = function(userData){
    this.first_name = userData.first_name
    this.last_name = userData.last_name
    this.avatar_file_name = userData.avatar_file_name
    this.user_id = userData.id
    this.username = userData.username
    this.date_approval = userData.date_approval
    this.full_name = userData.full_name
    this.is_mock = userData.is_mock

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
      return $http.patch(serverConfig.url + '/api/v2/user/followers/'+this.user_id)
    }

    this.unApprove = function(){
      return $http.delete(serverConfig.url + '/api/v2/user/followers/'+this.user_id)
    }

    this.followBack = function(){
      return $http.put(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }

    this.unFollowByCurrentUser = function(){
      return $http.delete(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }
  }

  var UserFollowableByCurrentUser = function(userData){
    this.first_name = userData.first_name
    this.last_name = userData.last_name
    this.avatar_file_name = userData.avatar_file_name
    this.user_id = userData.id
    this.username = userData.username    
    this.full_name = userData.full_name

    this.followByCurrentUser = function(){
      return $http.put(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }
  }

  var service = {}
  service.loaded = false
  service.usersFollowedByCurrentUser = []
  service.usersFollowingCurrentUser = []

  service.load = function(){
    var p1 = $http.get(serverConfig.url + '/api/v2/user/followings').then(function(response){
      service.usersFollowedByCurrentUser = []
      response.data.payload.forEach(function(userData){
        var u = new UserFollowedByCurrentUser(userData)
        service.usersFollowedByCurrentUser.push(u)
      })
    })

    var p2 = $http.get(serverConfig.url + '/api/v2/user/followers').then(function(response){
      service.usersFollowingCurrentUser = []
      response.data.payload.forEach(function(userData){
        var u = new UserFollowingCurrentUser(userData)
        service.usersFollowingCurrentUser.push(u)
      })
    })

    var deferred = $q.defer();
    $q.all([p1, p2]).then(function(){
      service.loaded = true
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
    return this.usersFollowingCurrentUser
  }

  service.getUsersFollowedByCurrentUser = function(){
    return this.usersFollowedByCurrentUser
  }

  service.loadSuggested = function (friends) {
      return $http.post(serverConfig.url + '/api/profile/facebook-friends', friends).then(function (response) {
        return response.data;
      });
  }

  service.getFollowing = service.getUsersFollowedByCurrentUser

  service.getUserFollowedByCurrentUser = function(uID){
    var u = service.usersFollowedByCurrentUser.find(function(user){
      return user.user_id == uID
    })

    return u
  }

  service.getUserFollowingCurrentUser = function(uID){
    var u = service.usersFollowingCurrentUser.find(function(user){
      return user.user_id == uID
    })

    if(u == null)
      u = new UserFollowingCurrentUser({id: uID, is_mock: true})
    return u
  }

  service.currentUserWantsToFollowUser = function(uIDtoFollow){
    return $http.put('/api/v2/user/followings/'+uIDtoFollow)
  }

  service.size = function(){
    return(service.usersFollowedByCurrentUser.length + service.usersFollowingCurrentUser.length)
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
          return new UserFollowableByCurrentUser(userData);
        });
      });
  }

  return service
});
