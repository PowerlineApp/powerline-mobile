angular.module('app.services').factory('followedByCurrentUser',
  function ($http, serverConfig){

    var service = {}
    service.users = []

    service.load = function(){
      return $http.get(serverConfig.url + '/api/v2/user/followings').then(function(response){
        service.users = response.data.payload
      })
    }

    return service
})