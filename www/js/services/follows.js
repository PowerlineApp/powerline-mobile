angular.module('app.services').factory('follows', function ($http, JsCollection, JsModel, serverConfig, session) {

  var follows = new JsCollection();
  follows.model = JsModel.extend({
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
      this.set('status', 1);
      return this._put();
    },
    unapprove: function () {
      this.set('status', 0);
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
      return 1 === this.get('status');
    },
    isFollowing: function () {
      return this.get('follower').id === session.user_id;
    },
    isFollower: function () {
      return this.get('user').id === session.user_id;
    }
  });

  follows.load = function () {
    return $http.get(serverConfig.url + '/api/follow/').then(function (response) {
      follows.loaded = true;
      console.log(follows.loaded);
      return follows.set(response.data);
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
    return this.filter(function (item) {
      return item.isFollowing();
    });
  };
  follows.getFollowers = function () {
    return this.filter(function (item) {
      return item.isFollower();
    });
  };

  return follows;
});
