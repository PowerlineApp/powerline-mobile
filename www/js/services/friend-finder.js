angular.module('app.services').factory('FriendFinder', function ($http, serverConfig, Sha1, follows, $q, device) {

  var MAX_REQUEST_SIZE = 4000 // chars

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

  var unfollowedFriends = function(friends, usersFollowedByCurrentUser){
      followingIDs = usersFollowedByCurrentUser.map(function(fo){return fo.user_id})
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
        var emailsForHttpInBatches = []
        var batchSizeInChars = 0
        var currentBatch = []

        emails.forEach(function(email){
          var text = 'emails[]='+Sha1.hash(email)
          if(MAX_REQUEST_SIZE < batchSizeInChars + text.length){
            emailsForHttpInBatches.push(currentBatch)
            currentBatch = []
            batchSizeInChars = 0
          } 
          batchSizeInChars += text.length

          currentBatch.push(text)
        })

        if(0 < currentBatch.length)
          emailsForHttpInBatches.push(currentBatch)

        var friendsWithPowerlineAccount = []
        var searchRequests = []
        emailsForHttpInBatches.forEach(function(emailBatch){
          var url = serverConfig.url + '/api/search/friends?' + emailBatch.join('&')
          var request = $http.get(url).then(function(response){
            var friends = response.data
            friendsWithPowerlineAccount.push(friends)
          })

          searchRequests.push(request)
        })
       
        $q.all(searchRequests).then(function () {
          friendsWithPowerlineAccount = _.flatten(friendsWithPowerlineAccount)
          var usersFollowedByCurrentUser = follows.getUsersFollowedByCurrentUser()
          var unFollowedFriendsWithPowerlineAccount = unfollowedFriends(friendsWithPowerlineAccount, usersFollowedByCurrentUser)
          deferred.resolve(unFollowedFriendsWithPowerlineAccount)
        });
      })

      return deferred.promise
    },

    follow: function(friend){
      var friendAsFollowable = follows.getOrCreateUser(friend.id);
      return friendAsFollowable.followByCurrentUser().then(function () {
        follows.load()
      });   
    }

  }

  return friendFinderService
})