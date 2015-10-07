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


}).run(function ($location, layout, $document, $rootScope, $window, iStorageMemory, $state, $ionicPlatform) {

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

  iStorageMemory.put('home-activities-need-load', true);

  //add Wrapper class for each state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    var stateKey = toState.name.substr(4);
    var wrapperClasses = [];
    var lightClassStates = ['terms', 'forgotPassword', 'registration', 'registrationStep2', 'registrationStep3', 'guide', 'guideConfirm'];
    if (lightClassStates.indexOf(stateKey) !== -1) {
      wrapperClasses.push('light');
    }
    if (['guide'].indexOf(stateKey) !== -1) {
      wrapperClasses.push('guide');
    }
    if (['main', 'newActivities'].indexOf(stateKey) !== -1) {
      wrapperClasses.push('news-feed');
    }
    $rootScope.wrapperClass = wrapperClasses.join(' ');
  });

}).config(function ($compileProvider) {
//    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel):/);
}).config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
    //    key: 'your api key',
    v: '3.18',
    libraries: 'places'
    });
}]);
