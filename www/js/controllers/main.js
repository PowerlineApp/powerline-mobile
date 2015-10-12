/**
 * Initialize controller module
 */

angular.module('app.controllers', []).controller('AppCtrl', function($scope, mainMenu, $location, $rootScope, $cacheFactory){
  $scope.menuItems = [];
  
  $scope.placeholders = {
    search: 'Search'
  };

  $scope.data = {
    search: 'Search'
  };
  
  $scope.navigate = function (item) {
    item.navigate();
  };

  $scope.cleanSearchCache = function () {
    $cacheFactory.get('searchController').removeAll();
  };

  $scope.getWrapperClass = function () {
    var obj = {};
    obj[$rootScope.wrapperClass || ''] = true;
    return obj;
  };
  
  $scope.$watch(function () {
    return mainMenu.items;
  }, function (items) {
    $scope.menuItems = items;
  });

}).value('loaded', function (scope, callback) {
  return function () {
    scope.loading = false;
    scope.hideSpinner();
    if (_.isFunction(callback)) {
      callback.apply(this, arguments);
    }
  };
});