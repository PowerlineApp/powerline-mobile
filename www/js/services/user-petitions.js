angular.module('app.services').factory('userPetitions',function ($q, session, serverConfig, $http, $sce, iParse) {

  var UserPetitionInstance = function(data){
    this.body = data.body
    this.html_body = $sce.trustAsHtml(iParse.wrapHashTags(iParse.wrapLinks(data.html_body)))

    this.owner = {
      id: data.user.id,
      avatar: data.user.avatar_file_name,
      type: 'user',
      name: data.user.first_name + ' ' + data.user.last_name
    }

    this.votes_count = 0
    this.created_at_date = new Date(data.created_at)
    this.expired_at_date = new Date(data.expire_at);
    this.title = data.title
    this.id = data.id

    this.expired = function(){
      return(this.expired_at_date <= new Date())
    }

    this.ownedByCurrentUser = function(){
      return(session.user_id === this.owner.id)
    }
  }

  var service = {
    get: function(userPetitionID){
      var d = $q.defer();
      $http.get(serverConfig.url + '/api/v2/user-petitions/'+userPetitionID).then(function (response) {
        var userPetition = new UserPetitionInstance(response.data)
        d.resolve(userPetition)
      });  

      return d.promise;    
    }
  }

  return service
})