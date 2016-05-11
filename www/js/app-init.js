angular.module('app').run(function ($location, layout, spinnerIndicator, $rootScope,
        $window, iStorageMemory, $cacheFactory, $state, $ionicPlatform, navigateTo, $q,
        groupsInvites, announcements, invites, follows, ionicToast) {

  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.checkURLState = function (stateName) {
    return $state.includes('app.' + stateName);
  };

  angular.element($window).bind('resize', function () {
    $rootScope.$broadcast('resize');
  });

  layout.init();

  iStorageMemory.put('home-activities-need-load', true);

  $cacheFactory('discussionController', {capacity: 5});
  $cacheFactory('petitionController', {capacity: 5});
  $cacheFactory('groupProfileController', {capacity: 5});
  var searchCache = $cacheFactory('searchController', {capacity: 2})

  //add Wrapper class for each state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    var stateKey = toState.name.substr(4);
    var wrapperClasses = [];
    var lightClassStates = ['terms', 'forgotPassword', 'registration', 'registrationStep2', 'registrationStep3',
      'guide', 'guideConfirm', 'profile2', 'profile3'];
    if (lightClassStates.indexOf(stateKey) !== -1) {
      wrapperClasses.push('light');
    }
    if (['main', 'newActivities'].indexOf(stateKey) !== -1) {
      wrapperClasses.push('news-feed');
    }
    wrapperClasses.push('wrap-' + stateKey);
    $rootScope.wrapperClass = wrapperClasses.join(' ');
  });

  $rootScope.navigateTo = navigateTo;

  // show/hide spinner globally
  $rootScope.showSpinner = function (indicator) {
    spinnerIndicator.show(indicator);
    //console.log('SHOW INDICATOR', indicator);
    $rootScope.isSpinnerShow = true;
  };
  $rootScope.hideSpinner = function (indicator) {
    spinnerIndicator.hide(indicator);
    //console.log('HIDE INDICATOR', indicator);
    $rootScope.isSpinnerShow = false;
  };

  var isFirstHomeLoaded = true;

  $rootScope.openTag = function (tag) {
    searchCache.put('query', tag);
    searchCache.put('data', null);
    $rootScope.path('/search');
  };

  $rootScope.invalidClass = function (isInvalid) {
    return isInvalid ? 'invalid' : '';
  };

  $rootScope.back = function () {
    $window.history.back();
  };

  $rootScope.openSystem = function (link) {
    $window.open(link, '_system', 'location=yes');
  };

  $rootScope.$on('home.activities-reloaded', function () {
    groupsInvites.load();
    announcements.updateNumberOfNew();
    if (isFirstHomeLoaded) {
      invites.load();
      announcements.load();
      follows.load();
    }
    isFirstHomeLoaded = false;
  });

  $rootScope.path = function (path) {
    return $location.path(path);
  };

  $rootScope.execApply = function () {
    if ($rootScope.$$phase !== '$apply' && $rootScope.$$phase !== '$digest') {
      $rootScope.$apply();
    }
  };

  $rootScope.getActiveClass = function (a, b) {
    return a === b ? 'active' : '';
  };

  $rootScope.alert = function () {
    if ($window.navigator.notification) {
      $window.navigator.notification.alert.apply(null, arguments);
    } else {
      alert(arguments[0]);
      if (arguments[1]) {
        arguments[1]();
      }
    }
  };

  $rootScope.confirmAction = function (message, title, buttonLabels) {
    var deferred = $q.defer();
    if ($window.navigator.notification) {
      $window.navigator.notification.confirm(message, function (btn) {
        if (1 === btn) {
          deferred.resolve(btn);
        } else {
          deferred.reject(btn);
        }
        $rootScope.execApply();
      }, title, buttonLabels);
    } else {
      if (confirm(message)) {
        deferred.resolve();
        $rootScope.execApply();
      }
    }
    return deferred.promise;
  };

  $rootScope.confirm = function () {
    $window.navigator.notification.confirm.apply(null, arguments);
  };
  
  $rootScope.showToast = function(message){
    ionicToast.show(message, 'bottom', false, 2500);
  };

  $rootScope.isDefaultAvatar = function (avatarUrl) {
    console.log("avatarUrl:" + JSON.stringify(avatarUrl));
    return !avatarUrl || avatarUrl.indexOf('default_user.png') !== -1
            || avatarUrl.indexOf('default_group.png') !== -1
            || avatarUrl.indexOf('default_representative.png') !== -1;
  };
});
