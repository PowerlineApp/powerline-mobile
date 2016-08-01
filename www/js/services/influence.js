angular.module('app.services').factory('influence',function (InfluenceResource, influenceData, $q, iStorage, $http, serverConfig) {

  var LAST_APPROVE_FOLLOWING_QUERY_DATE = 'last-approve-following-query-date';

  var service = {
    get: function (id) {
      return influenceData.byId[id];
    },

    loadInfluence: function (id) {
      var deferred = $q.defer();
      var influence = InfluenceResource.get({id: id}, function () {
        influenceData.byId[id] = influence;
        deferred.resolve();
      }, function (data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },

    search: function (query, page, max_count) {
      var params = {
        unfollowing: 1,
        q: query,
        page: page || 1,
        max_count: max_count || 50
      };

      return $http.get(serverConfig.url + '/api/users/?' + angular.element.param(params)).then(function (response) {
        return _(response.data).map(function (item) {
          return new InfluenceResource(item);
        });
      });
    },

    loadFollowing: function () {
      var deferred = $q.defer();
      var results = InfluenceResource.following(function () {
        parse(results, 'user');
        results.loaded = true;
        influenceData.following = results;
        deferred.resolve(results);
      }, function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    loadFollowers: function () {
      var deferred = $q.defer();
      var results = InfluenceResource.followers(function () {
        parse(results, 'follower');
        influenceData.followers = results;
        deferred.resolve(results);
      }, function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    loadWaitingApproveFollowers: function () {
      var deferred = $q.defer();
      var results = InfluenceResource.waitingApproveFollowers(function () {
        parse(results, 'follower');
        influenceData.waitingApproveFollowers = results;
        deferred.resolve(results);
      }, function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    loadLastApproveFollowing: function () {
      var deferred = $q.defer();
      var lastQueryDate = iStorage.get(LAST_APPROVE_FOLLOWING_QUERY_DATE);
      var queryDate = new Date();
      if (!lastQueryDate) {
        lastQueryDate = new Date();
        lastQueryDate.setTime(lastQueryDate.getTime() - 604800000);
        lastQueryDate = lastQueryDate.toUTCString();
      }
      influenceData.lastApproveFollowing = [];

      var results = InfluenceResource.lastApproveFollowing({startDate: lastQueryDate}, function () {
        parse(results, 'user');
        iStorage.set(LAST_APPROVE_FOLLOWING_QUERY_DATE, queryDate.toUTCString());
        influenceData.lastApproveFollowing = results;
        deferred.resolve(results);
      }, function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    loadSuggested: function (friends) {
      return $http.post(serverConfig.url + '/api/profile/facebook-friends', friends).then(function (response) {
        var suggested = [];
        _(response.data).each(function (item) {
          suggested.push(new InfluenceResource(item));
        });
        return suggested;
      });
    },

    findFollowing: function (id) {
      var deferred = $q.defer();
      var result = InfluenceResource.followingById({id: id}, function () {
        parse(result, 'user');
        deferred.resolve(result);
      }, function (response) {
        deferred.reject({
          status: response.status,
          influenceItem: new InfluenceResource({id: id})
        });
      });
      return deferred.promise;
    },

    getLastApproveFollowing: function () {
      return influenceData.lastApproveFollowing;
    },

    getFollowing: function () {
      return influenceData.following;
    },

    getFollowers: function () {
      return influenceData.followers;
    },
    getWaitingApproveFollowers: function () {
      return influenceData.waitingApproveFollowers;
    }
  };

  function parse(data, property) {
    if (data.length) {
      _(data).each(function (item) {
        item.id = item[property] ? item[property].id : null;
      });
    } else {
      data.id = data[property] ? data[property].id : null;
    }
  }

  return service;

}).factory('InfluenceResource',function (serverConfig, $resource) {
  return $resource(serverConfig.url + '', null, {
    get: {
      method: 'GET',
      isArray: false,
      url: serverConfig.url + '/api/profile/info/:id'
    },

    search: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/users/find'
    },

    followers: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/profile/followers'
    },

    following: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/profile/following'
    },

    followingById: {
      method: 'GET',
      isArray: false,
      url: serverConfig.url + '/api/profile/following/:id'
    },

    changeStatus: {
      method: 'POST',
      params: {id: '@id'},
      url: serverConfig.url + '/api/profile/follow/:status/:id'
    },

    waitingApproveFollowers: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/profile/waiting-followers'
    },

    lastApproveFollowing: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/profile/last-following'
    }

  });
}).value('influenceData', {
  byId: {},
  following: [],
  followers: [],
  waitingApproveFollowers: [],
  lastApproveFollowing: []
});
