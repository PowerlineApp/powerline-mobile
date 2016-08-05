angular.module('app.services').factory('microPetitions', function ($http, serverConfig) {
  var service = {}

  service.signLongPetition = function(microPetitionID){
      var payload = JSON.stringify({option: 'upvote'})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/micro-petitions/' + microPetitionID + '/answer', payload, headers).then(function(resp) {
        return resp.data;
      });
  }

  service.unsignLongPetition = function(microPetitionID){
      return $http.delete(serverConfig.url + '/api/v2/micro-petitions/'+microPetitionID+'/answer')
  }

  return service
})