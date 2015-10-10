angular.module('app').run(function ($location, layout, $document, $rootScope,
        $window, iStorageMemory, $cacheFactory, $state, $ionicPlatform, navigateTo, $q,
        groupsInvites, announcements, invites, follows) {

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

  var $body = $document.find('body');
  $document.bind('scroll', function () {
    if ($document.height() <= $document.scrollTop() + $body.height()) {
      $rootScope.$broadcast('scrollEnd');
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
    var lightClassStates = ['terms', 'forgotPassword', 'registration', 'registrationStep2', 'registrationStep3', 'guide', 'guideConfirm'];
    if (lightClassStates.indexOf(stateKey) !== -1) {
      wrapperClasses.push('light');
    }
    if (['main', 'newActivities'].indexOf(stateKey) !== -1) {
      wrapperClasses.push('news-feed');
    }
    wrapperClasses.push('wrap-' + stateKey);
    $rootScope.wrapperClass = wrapperClasses.join(' ');
  });

  //receive event for show/hide spinners
  $rootScope.$on('showSpinner', function () {
    $rootScope.isSpinnerShow = true;
  });
  $rootScope.$on('hideSpinner', function () {
    $rootScope.isSpinnerShow = false;
  });

  var isFirstHomeLoaded = true;
  $rootScope.navigateTo = navigateTo;

  $rootScope.openTag = function (tag) {
    searchCache.put('query', tag);
    searchCache.put('data', null);
    $rootScope.path('/search');
  };
  
  $rootScope.getActiveClass = function (a, b) {
    return a === b ? 'active' : '';
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

  $rootScope.alert = function () {
    if ($window.navigator.notification) {
      $window.navigator.notification.alert.apply(null, arguments);
    } else {
      alert(arguments[0]);
    }
  };

  $rootScope.confirmAction = function (message, title, buttonLabels) {
    var deferred = $q.defer();
    $window.navigator.notification.confirm(message, function (btn) {
      if (1 === btn) {
        deferred.resolve(btn);
      } else {
        deferred.reject(btn);
      }
      $rootScope.execApply();
    }, title, buttonLabels);
    return deferred.promise;
  };

  $rootScope.confirm = function () {
    $window.navigator.notification.confirm.apply(null, arguments);
  };

});
