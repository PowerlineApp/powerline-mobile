angular.module('app', [
  'ionic',
  'ngIOS9UIWebViewPatch',
  'app.config',
  'app.controllers',
  'app.directives',
  'app.filters',
  'app.services',
  'ngSanitize',
  'ngAnimate',
  'JsCollection',
  'pasvaz.bindonce',
  'uiGmapgoogle-maps',
  'jett.ionic.scroll.sista',
  'ngLetterAvatar',
  'ionic-toast'
]).config(function ($ionicConfigProvider, $httpProvider) {

  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  $httpProvider.interceptors.push('authInterceptor');
  
  $ionicConfigProvider.views.transition('android');
  //$ionicConfigProvider.scrolling.jsScrolling(false);

  //$locationProvider.html5Mode(false);

}).config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
    //    key: 'your api key',
    v: '3.18',
    libraries: 'places'
    });
}]);
