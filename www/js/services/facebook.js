angular.module('app.services').factory('facebook', function ($window, $q, $rootScope, iStorageMemory, stateAbbreviations) {
  var FB, uid, friends = [];


  function loadProfile(params) {
    var deferred = $q.defer();
    FB.api(uid + '/?fields=email,first_name,last_name,picture,gender,location,hometown,birthday,link',
            ['public_profile', 'email', 'user_friends'], function (fu) {
      var data = {
        facebook_id: params.facebook_id,
        facebook_token: params.facebook_token,
        country: 'US',
        email: fu.email,
        email_confirm: fu.email,
        first_name: fu.first_name,
        last_name: fu.last_name,
        avatar_file_name: fu.pic,
        sex: fu.gender ? fu.gender[0].toUpperCase() + fu.gender.slice(1, fu.gender.length) : '',
        facebook_link: fu.link
      };

      if (fu.address) {
        data.address1 = fu.address.street;
        data.city = fu.address.city;
        data.state = stateAbbreviations.US[fu.address.state];
        data.zip = fu.address.zip;
      }
      if (fu.birthday) {
        data.birth = fu.birthday;
      }

      if (fu.picture && fu.picture.data) {
        data.avatar_file_name = fu.picture.data.url;
      }

      if (fu.email) {
        data.username = fu.email.split('@')[0];
      }

      iStorageMemory.put('registration-form-data', data);
      deferred.resolve(data);
      $rootScope.execApply();
    }, function (error) {
      console.log('')
      console.log(error)
      var data = {
        facebook_id: params.facebook_id,
        facebook_token: params.facebook_token
      };

      deferred.resolve(data);
    });

    return deferred.promise;
  }

  return {
    init: function () {
      if(typeof(FB) == 'undefined')
        FB = $window.facebookConnectPlugin;
    },
    // use this when you experience on login: "Error validating access token: Session does not match current stored session. This may be because the user changed the password since the time the session was created or may be due to a system error."
    logout: function(){
      FB.logout(function(resp){
        console.log('facebook logout successful')
        console.log(resp)
      }, function(error){
        console.log('facebook logout failed')
        console.log(error)
      })
    },
    login: function () {
      var deferred = $q.defer();
      
      this.init()
      // this.logout()
      // return deferred.promise
      FB.login(['public_profile', 'email'], function (response) {
        if (response.status === 'connected') {
          uid = response.authResponse.userID || response.authResponse.userId;
          deferred.resolve({
            facebook_token: response.authResponse.accessToken,
            facebook_id: uid
          });
        } else {
          console.log('facebook login failed (not connected):')
          console.log(response)
          deferred.reject('Facebook login failed');
        }
        $rootScope.execApply();
      }, function (error) {
        console.log('facebook login failed with error:')
        console.log(error)
        deferred.reject('Facebook login failed: '+error);
      });

      return deferred.promise;
    },
    loadProfile: loadProfile,
    setRegistrationFormData: function (params) {
      return loadProfile(params).then(function (data) {
        iStorageMemory.put('registration-form-data', data);

        return data;
      });
    },
    share: function (params) {
      var deferred = $q.defer();

      FB.ui({
        method: 'feed',
        name: params.name,
        link: params.link,
        picture: params.picture,
        description: params.description
      }, function (response) {
        deferred.resolve(response);
        $rootScope.execApply();
      }
      );
      return deferred.promise;
    },
    loadFriends: function () {
      FB.api('/me/friends', [], function (response) {
        if (response.data) {
          friends = _.pluck(response.data, 'id');
        }
      });
    },
    getFriends: function () {
      return friends;
    }
  };
})