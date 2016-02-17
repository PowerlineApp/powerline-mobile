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

  function petitionSearch(query) {
    return petitions.loadByHashTag(query).then(function (data) {
      return {petitions: data};
    });
  }

  //to prevent continous api calls
  var _lastUserSearchDefer = null;
  var _isSearchingUsers = false;
  return {
    load: function (query) {
      return (query && '#' === query[0]) ? petitionSearch(query) : profileSearch(query);
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