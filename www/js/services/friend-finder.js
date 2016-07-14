angular.module('app.services').factory('friendFinder', function ($http, serverConfig, Sha1) {

  var service = {
    search : function(){
      var emails = ['peter11@test.com', 'peter1@test.com', 'peter10@test.com']
      var emailsForHttp = []
      emails.forEach(function(email){
        emailsForHttp.push('emails[]='+Sha1.hash(email))
      })
      var params = emailsForHttp.join('&')
      return $http.get(serverConfig.url + '/api/search/friends?'+params).then(function(response){
        return(response.data)
      })
    }
  }

  return service
})