angular.module('app.services').factory('FriendFinder', function ($http, serverConfig, Sha1, follows, $q, device) {

  getContactEmailsInBrowser = function(){
    var deferred = $q.defer();
    deferred.resolve(['peter11@test.com', 'peter1@test.com', 'peter10@test.com', 'peter12@test.com'])
    return deferred.promise
  }

  var getContactEmailsOnSmartphone = function(){
    var deferred = $q.defer();

     var  onSuccess = function(rawContacts){
      try {
        var contactsSize = rawContacts.length
        var emails = []
        rawContacts.forEach(function(rawContact, i){
          if(rawContact.emails && 0 < rawContact.emails.length){
            var email = rawContact.emails[0].value
            emails.push(email) 
          }
        })

        deferred.resolve(emails)
        
      } catch(error){
        console.log('error while processing contacts')
        console.log(error)
        deferred.reject(error)
      }
    }

    var onError = function(error){
      console.log('error while quering phone for contacts')
      console.log(error)
      deferred.reject(error)
    }
    
    var options = new ContactFindOptions();
    options.multiple = true;
    var fields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];

    navigator.contacts.find(fields, onSuccess, onError, options)
    return deferred.promise
  }

  var unfollowedFriends = function(friends, following){
      followingIDs = following.map(function(fo){return fo.get('user').id})
      uf = []
      friends.forEach(function(friend){
        if(followingIDs.indexOf(friend.id) == -1)
          uf.push(friend)
      })
      return uf
  }

  var friendFinderService = {
    search : function(){
      var deferred = $q.defer();
      var emailsPromise;
      if(device.isSmartphone())
        emailsPromise = getContactEmailsOnSmartphone()
      else
        emailsPromise = getContactEmailsInBrowser()

      emailsPromise.then(function(emails){
        var emailsForHttp = []
        emails.forEach(function(email){
          emailsForHttp.push('emails[]='+Sha1.hash(email))
        })
        var params = emailsForHttp.join('&')

        $http.get(serverConfig.url + '/api/search/friends?'+params).then(function(response){
          follows.loadAndGetFollowing().then(function(following){
            var friends = response.data
            deferred.resolve(unfollowedFriends(friends, following))
          })
        })
      })

      return deferred.promise
    }
  }

  return friendFinderService
})