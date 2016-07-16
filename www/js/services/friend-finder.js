angular.module('app.services').factory('friendFinder', function ($http, serverConfig, Sha1, follows) {

  var friendFinderService = {
    search : function(){
      var emails = ['peter11@test.com', 'peter1@test.com', 'peter10@test.com', 'peter12@test.com']
      var emailsForHttp = []
      emails.forEach(function(email){
        emailsForHttp.push('emails[]='+Sha1.hash(email))
      })
      var params = emailsForHttp.join('&')
      return $http.get(serverConfig.url + '/api/search/friends?'+params).then(function(response){
        return follows.loadAndGetFollowing().then(function(following){
          followingIDs = following.map(function(fo){return fo.get('user').id})
          unFollowedFriends = []
          response.data.forEach(function(friend){
            if(followingIDs.indexOf(friend.id) == -1)
              unFollowedFriends.push(friend)
          })
          return(unFollowedFriends)
        })
      })
    }
  }

  return friendFinderService
})