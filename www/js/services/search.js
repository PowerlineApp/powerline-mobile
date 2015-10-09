angular.module('app.services').factory('search', function($http, serverConfig, petitions) {

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

  return {
    load: function(query) {
      return (query && '#' === query[0]) ? petitionSearch(query) : profileSearch(query);
    },
    searchUsers: function(query) {
      return $http.get(serverConfig.url + '/api/users/', {params: {q: query}})
        .then(function(resp) {
          return resp.data;
        })
      ;
    }
  };
});