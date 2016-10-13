angular.module('app.services').factory('search', function ($http, serverConfig, petitions, $q) {

  function profileSearch(query) {
    return $http({
      method: 'GET',
      params: {query: query},
      url: serverConfig.url + '/api/search'
    }).then(function (response) {
      return response.data;
    });
  }

  function searchByHashTag(hashtag){
    var deferred = $q.defer();
    var hashtagWithoutHash = hashtag.substring(1)
    
    var results = {}

    var postsUrl = serverConfig.url + '/api/v2/posts?tag=%23'+hashtagWithoutHash
    $http.get(postsUrl).then(function (response) {
      results['posts'] = response.data.payload
      var userPetitionsUrl = serverConfig.url + '/api/v2/user-petitions?tag=%23'+hashtagWithoutHash
      return $http.get(userPetitionsUrl).then(function (response) {
        results['user-petitions'] = response.data.payload
        deferred.resolve(results)
      }); 
    }); 

    return deferred.promise 
  }

  //to prevent continous api calls
  var _lastUserSearchDefer = null;
  var _isSearchingUsers = false;
  return {
    load: function (query) {
      var isHashTagQuery = query && query[0] == '#'
      if(isHashTagQuery)
        return searchByHashTag(query)
      else
        return profileSearch(query);
    },
    searchUsers: function (query) {
      if (_isSearchingUsers && _lastUserSearchDefer) {
        _lastUserSearchDefer.resolve('abort');
      }
      var dataDefer = $q.defer();
      _isSearchingUsers = true;
      _lastUserSearchDefer = dataDefer;
      return $http.get(serverConfig.url + '/api/users/', {params: {q: query}, timeout: dataDefer.promise}).then(function (resp) {
        return resp.data;
      }).finally(function () {
        _isSearchingUsers = false;
      });
    }
  };
});