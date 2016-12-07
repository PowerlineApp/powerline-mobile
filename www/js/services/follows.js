angular.module('app.services').factory('follows', function ($http,serverConfig, $q, $rootScope) {

  var FUser = function(userData, role){
    this.setData = function(userData, userIsFollowingCurrentUser){
      this.first_name = userData.first_name
      this.last_name = userData.last_name
      this.avatar_file_name = userData.avatar_file_name
      this.user_id = userData.id
      this.username = userData.username
      this.full_name = userData.full_name

      if(userIsFollowingCurrentUser){
        this.is_approved_by_current_user = userData.status == 'active'
        this.is_approved_by_current_user_status = userData.status
        this.is_approved_by_current_user_date = userData.date_approval
      } else
        this.he_has_approved_current_user = userData.status == 'active'
    }

    this.roles = [role]
    var userIsFollowingCurrentUser = role == 'isFollowingCurrentUser'
    this.setData(userData, userIsFollowingCurrentUser)

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

    this.approve = function(triggerToast){
      if (typeof(triggerToast) === 'undefined') {
        triggerToast = true;
      }
      this.is_approved_by_current_user = true
      return $http.patch(serverConfig.url + '/api/v2/user/followers/' + this.user_id).success(function () {
        if (triggerToast) {
          $rootScope.showToast('Approved follow request!');
        }
      });
    }

    this.unApprove = function(){
      this.is_approved_by_current_user = false
      return $http.delete(serverConfig.url + '/api/v2/user/followers/'+this.user_id)
    }

    this.followByCurrentUser = function(triggerToast){
      if (typeof(triggerToast) === 'undefined') {
        triggerToast = true;
      }
      this.addRole('isFollowedByCurrentUser')
      return $http.put(serverConfig.url + '/api/v2/user/followings/' + this.user_id).success(function () {
        if (triggerToast) {
          $rootScope.showToast('Follow request sent!');
        }
      });
    }

    this.unFollowByCurrentUser = function(){
      this.removeRole('isFollowedByCurrentUser')
      return $http.delete(serverConfig.url + '/api/v2/user/followings/'+this.user_id)
    }

    this.hasApprovedCurrentUser = function(){
      return(this.he_has_approved_current_user)
    }

    this.isApprovedByCurrentUser = function(){
      return(this.is_approved_by_current_user)
    }
  }

  var service = {}
  service.loaded = false
  service.users = []

  service.load = function(){
    var rawFollowingsData = null
    var p1 = $http.get(serverConfig.url + '/api/v2/user/followings').then(function(response){
      rawFollowingsData = response.data.payload
    })

    var rawFollowersData = null
    var p2 = $http.get(serverConfig.url + '/api/v2/user/followers').then(function(response){
      rawFollowersData = response.data.payload
    })

    var deferred = $q.defer();
    $q.all([p1, p2]).then(function(){
      service.users = []
      rawFollowingsData.forEach(function(userData){
        var uID = userData.id
        var u = service.getUser(uID)
        if(u){
          u.addRole('isFollowedByCurrentUser')
          u.setData(userData)
        }

        else{
          u = new FUser(userData, 'isFollowedByCurrentUser')
          service.users.push(u)
        }
      })

      var userIsFollowingCurrentUser = true
      rawFollowersData.forEach(function(userData){
        var uID = userData.id
        var u = service.getUser(uID)
        if(u){
          u.addRole('isFollowingCurrentUser')
          u.setData(userData, userIsFollowingCurrentUser)
        }
        else{
          u = new FUser(userData, 'isFollowingCurrentUser')
          service.users.push(u)
        }
      })

      service.loaded = true
      $rootScope.$broadcast('follows-loaded');
      deferred.resolve()
    })

    return deferred.promise
  }

  service.getUsersFollowingCurrentUser = function(){
    var users = this.users.filter(function(u){return u.isFollowingCurrentUser()})
    return users
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
    return _.find(service.users, function(user){
      return user.user_id == uID
    })
  }

  service.containsMockUsers = function(){
    var containsMock = false
    this.users.forEach(function(u){
      if(user.roles.length == 0)
        containsMock = true
    })

    return containsMock
  }

  service.getOrCreateUser = function(uID){
    var u = service.getUser(uID)

    if(u == null){
      u = new FUser({id: uID})
      service.users.push(u)
    }

    return u
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
