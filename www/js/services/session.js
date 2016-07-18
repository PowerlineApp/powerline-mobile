angular.module('app.services').factory('session', function (serverConfig, $http, $q, iStorage, $rootScope, $location, $window, facebook) {

  var session = {
    login: function (data, keepLogged) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        url: serverConfig.url + '/api/secure/login',
        data: angular.element.param(data),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success(function (data) {
        if (keepLogged) {
          iStorage.set('token', data.token);
          iStorage.set('user_id', data.id);
          iStorage.set('is_registration_complete', data.is_registration_complete);
        }
        session.token = data.token;
        session.user_id = data.id;
        session.is_registration_complete = data.is_registration_complete;
        deferred.resolve(data);
      }).error(function (data, status) {
        deferred.reject(status);
      });
      return deferred.promise;
    },

    registerUserFromFacebook: function(params){
      facebook.loadProfile(params).then(function(profileData){
        var payload = JSON.stringify(profileData)
        var headers = {headers: {'Content-Type': 'application/json'}}
        $http.post(serverConfig.url + '/api/secure/registration-facebook', payload, headers).then(function(response){
          console.log(response)
        }, function(error){
          console.log('failed to register user from facebook:')
          console.log(error)
        })  
      })
    },
    facebookLogin: function (params) {
      return $http({
        method: 'POST',
        url: serverConfig.url + '/api/secure/facebook/login',
        data: angular.element.param(params)
      }).then(function (response) {
        iStorage.set('token', response.data.token);
        iStorage.set('user_id', response.data.id);
        iStorage.set('is_registration_complete', response.data.is_registration_complete);
        session.token = response.data.token;
        session.user_id = response.data.id;
        session.is_registration_complete = response.data.is_registration_complete;
        return response;
      });
    },
    registration: function (data) {
      return $http({
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        url: serverConfig.url + '/api/secure/registration',
        data: JSON.stringify(data)
      }).then(function (response) {
        session.token = response.data.token;
        session.user_id = response.data.id;
        session.is_registration_complete = response.data.is_registration_complete;

        iStorage.set('token', response.data.token);
        iStorage.set('user_id', response.data.id);
        iStorage.set('is_registration_complete', response.data.is_registration_complete);

        return response;
      });
    },
    forgotPassword: function (email) {
      var data = {
        email: email
      };
      return $http.post(serverConfig.url + '/api/secure/forgot-password', angular.element.param(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    },
    logout: function () {
      iStorage.clear()
      session.token = null;
      session.user_id = null;
      session.is_registration_complete = null;
      
      $location.path('/login');
      setTimeout(function(){$window.location.reload()}, 100)      
    }
  };

  session.getToken = function () {
    return session.token;
  };

  session.token = iStorage.get('token');
  session.user_id = iStorage.get('user_id');
  session.is_registration_complete = iStorage.get('is_registration_complete');

  if (session.token) {
    $http.defaults.headers.common.Token = session.token;
  }

  $rootScope.$watch(session.getToken, function () {
    $http.defaults.headers.common.Token = session.token;
  });

  return session;
}).factory('profile', function ($resource, serverConfig, $q, iStorage, $rootScope) {

  var percents = {
    avatar: 6,
    first_name: 6,
    last_name: 6,
    birth: 6,
    address1: 6,
    city: 6,
    state: 6,
    zip: 6,
    email: 6,
    phone: 6,
    sex: 5,
    race: 5,
    employment_status: 5,
    marital_status: 5,
    party: 5,
    philosophy: 5,
    donor: 5,
    registration: 5
  };

  var Profile = $resource(serverConfig.url + '/api/profile/:action', null, {
    getSuggested: {
      isArray: true,
      method: 'POST'
    }
  });

  var profile;

  var service = {
    get: function () {
      return profile;
    },
    load: function () {
      var deferred = $q.defer();
      var newProfile = Profile.get({}, function () {
        newProfile.interests = newProfile.interests || [];
        profile = newProfile;
        deferred.resolve(profile);
      }, function () {
        deferred.reject(arguments);
      });
      return deferred.promise;
    },
    getPercentCompleted: function () {
      return _(profile).reduce(function (memo, item, key) {
        return memo + ((item && percents[key]) ? percents[key] : 0);
      }, 0);
    },
    checkRemind: function () {
      if (service.getPercentCompleted() > 89) {
        return;
      }
      var minInterval = 604800000;
      /* WEEK */
      var reminder = iStorage.get(profile.id + '_reminder') || {count: 0, lastTime: 0};
      if (reminder.count >= 3 || Date.now() - reminder.lastTime < minInterval) {
        return;
      }

      $rootScope.confirm('Your profile isn\'t finished! Fill it out now?', function (btn) {
        if (2 === Number(btn)) {
          $rootScope.path('/profile');
          $rootScope.execApply();
        }
      }, null, 'Ask later,Yes. Proceed!');

      reminder.count++;
      reminder.lastTime = Date.now();

      iStorage.set(profile.id + '_reminder', reminder);
    },
    sex: ['Male', 'Female'],
    orientations: ['Straight', 'Lesbian', 'Gay', 'Bisexual', 'Transgender'],
    races: ['White', 'African-American', 'Hispanic', 'Asian Pacific Islander', 'Native American'],
    incomeLevels: ['$0 - $24,999', '$25,000 - $49,999', '$50,000 - $74,999',
      '$75,000 - $99,000', '$100,000 - $249,000', '$250,000 +'],
    employmentStatuses: ['Full-time', 'Part-time', 'Self-Employed', 'Other Employment', 'None'],
    educationLevels: ['Less than High School', 'High School / GED', 'Some College', '2-Year College Degree',
      '4-Year College Degree', 'Master\'s Degree', 'PhD', 'Professional Degree'],
    maritalStatuses: ['Single - Never Married', 'Married', 'Separated', 'Divorced', 'Widow', 'Life Partner', 'Dating Partner', 'Other'],
    religions: ['Christian', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Atheist', 'Other'],
    parties: ['Democrat', 'Republican', 'Independent', 'Libertarian', 'Socialist', 'Green, Other', 'Not American (Coming Soon)', 'I Don\'t Know'],
    philosophies: ['Very Conservative', 'Conservative', 'Moderate', 'Liberal', 'Very Liberal', 'I Don\'t Know', 'Other'],
    donors: ['Frequently', 'Occasionally', 'Never'],
    registrations: ['Registered to Vote', 'Not Registered to Vote'],
    states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
      'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
      'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'AS', 'GU',
      'MP', 'PR', 'VI', 'UM'
    ],
    interests: ['Animals', 'Children', 'Community', 'Criminal Justice', 'Democracy', 'Economy', 'Education', 'Energy',
      'Environment', 'Food', 'Healthcare', 'Human Rights', 'Infrastructure', 'LGBT', 'Labor', 'Leadership',
      'NGOs', 'Peace', 'Politics', 'Poverty', 'Sustainability', 'Water', 'Women\'s Rights'],
    countries: ['US']

  };

  return service;

}).factory('authInterceptor', function ($q, $location) {
  return {
    responseError: function (response) {
      var path = $location.path();
      if (response.status === 401 && path !== '/login' && path !== '/logout') {
        $location.path('/logout');
      }
      return $q.reject(response);
    }
  };
});
