angular.module('app.services').factory('users', function ($http, serverConfig) {
  return {
    load: function (id) {
      return $http.get(serverConfig.url + '/api/v2/users/' + id).then(function (response) {        
        return response.data;
      });
    },
    findByUsername: function(username) {
      return $http.get(serverConfig.url + '/api-public/users/', {params: {username: username}}).then(function(response) {
        return response.data;
      });
    }
  };
});
