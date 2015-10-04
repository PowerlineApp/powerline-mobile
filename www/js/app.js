angular.module('app', [
  'ionic',
  'app.config',
  'app.controllers',
  'app.directives',
  'app.filters',
  'app.services',
  'ngTouch',
  'ngSanitize',
  'ngAnimate',
  'JsCollection',
  'pasvaz.bindonce',
  'uiGmapgoogle-maps'
]).config(function ($locationProvider, $httpProvider) {

  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  //$httpProvider.responseInterceptors.push('authInterceptor');
  $httpProvider.interceptors.push('authInterceptor');

  //$locationProvider.html5Mode(false);

  
}).run(function (session, $location, layout, $document, $rootScope, $window, iStorageMemory, profile/*, $ionicPlatform*/) {

  /*$ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });*/

  var $body = $document.find('body');
  $document.bind('scroll', function () {
    if ($document.height() <= $document.scrollTop() + $body.height()) {
      $rootScope.$broadcast('scrollEnd');
    }
  });

  angular.element($window).bind('resize', function () {
    $rootScope.$broadcast('resize');
  });

  layout.init();
  if (session.token) {
    if (session.is_registration_complete) {
      profile.load()
        .then(function () {
          profile.checkRemind();
        })
      ;
      if (!$location.path() || '/' === $location.path()) {
        $location.path('/main');
      }
    } else {
      $location.path('/profile');
    }
  } else {
    $location.path('/login');
  }

  iStorageMemory.put('home-activities-need-load', true);

}).config(function ($compileProvider) {
//    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel):/);
}).config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
    //    key: 'your api key',
    v: '3.18',
    libraries: 'places'
  });
}]);
