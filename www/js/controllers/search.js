angular.module('app.controllers').controller('search', function ($scope, $ionicScrollDelegate, search, layout, $cacheFactory, flurry) {
  
  var cache = $cacheFactory.get('searchController');

  flurry.log('search');

  $scope.query = cache.get('query');
  $scope.data = cache.get('data');

  $scope.search = function (query) {
    $scope.data = null;
    $scope.showSpinner();;
    search.load(query).then(function (data) {
      $scope.data = data;
      $scope.hideSpinner();;
      cache.put('query', query);
      cache.put('data', data);
      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollTop(true);
    }, function () {
      $scope.hideSpinner();;
    });
  };

  if ($scope.query && !$scope.data) {
    $scope.search($scope.query);
  }

  layout.setContainerClass('search-screen');
});
