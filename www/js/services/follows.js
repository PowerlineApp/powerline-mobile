angular.module('app.services').factory('follows', function ($http, JsCollection, JsModel, serverConfig, session, $q) {

  var follows = new JsCollection();
  follows.model = JsModel.extend({
    _put2: function () {
      console.log(JSON.stringify(this))
      var payload = this.toJSON()
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.patch(serverConfig.url + '/api/v2/user/followers/' + this.get('id'), payload, headers).then(function () {
        return follows.load();
      });
    },
    _put: function () {
      return $http.put(serverConfig.url + '/api/follow/' + this.get('id'), this.toJSON()).then(function () {
        return follows.load();
      });
    },
    _post: function () {
      return $http.post(serverConfig.url + '/api/follow/', this.toJSON()).then(function () {
        return follows.load();
      });
    },
    _delete: function () {
      return $http['delete'](serverConfig.url + '/api/follow/' + this.get('id')).then(function () {
        return follows.load();
      });
    },
    collection: function () {
      return follows;
    },
    approve: function () {
      this.set('status', 'active');
      return this._put();
    },
    unapprove: function () {
      this.set('status', 'inactive');
      return this._put();
    },
    follow: function () {
      if (this.isFollower()) {
        return follows.getByUserId(this.get('follower').id)._post();
      }

      return this._post();
    },
    unfollow: function () {
      if (this.isFollowing()) {
        return this._delete();
      }

      return follows.getByUserId(this.get('follower').id)._delete();
    },
    isFollow: function () {
      return this.isFollowing() ? this.has('id') : follows.getByUserId(this.get('follower').id).has('id');
    },
    isApproved: function () {
      return 'active' === this.get('status');
    },
    isFollowing: function () {
      return this.get('follower').id === session.user_id;
    },
    isFollower: function () {
      return this.get('user').id === session.user_id;
    }
  });

  follows.load = function () {
    return $http.get(serverConfig.url + '/api/v2/user/followers').then(function (response) {
      follows.loaded = true;
      return follows.set(response.data.payload);
    });
  };
  follows.getByUserId = function (id) {
    var follow = this.find(function (item) {
      return item.get('user').id === id;
    });
    if (!follow) {
      follow = new this.model({
        status: 0,
        user: {
          id: id
        },
        follower: {
          id: session.user_id
        }
      });
    }
    return follow;
  };
  follows.getByFollowerId = function (id) {
    var follow = this.find(function (item) {
      return item.get('follower').id === id;
    });
    if (!follow) {
      follow = new this.model({
        status: 0,
        user: {
          id: session.user_id
        },
        follower: {
          id: id
        }
      });
    }
    return follow;
  };
  follows.getFollowing = function () {
    var f = this.filter(function (item) {
      return item.isFollowing();
    })
    return(f)
  };
  follows.getFollowers = function () {
    var f =  this.filter(function (item) {
      return item.isFollower();
    });
    return(f)
  };

  follows.loadAndGetFollowing = function(){
    var deferred = $q.defer();
    if(!follows.loaded){
      follows.load().then(function(){
        deferred.resolve(follows.getFollowing())
      })
    } else {
      deferred.resolve(follows.getFollowing())
    }

    return deferred.promise;
  }  

  return follows;
});
