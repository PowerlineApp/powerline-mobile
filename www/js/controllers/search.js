angular.module('app.controllers').controller('search', function ($scope, $ionicScrollDelegate, search, layout, $cacheFactory) {
  
  var cache = $cacheFactory.get('searchController');
  
  $scope.search = function (query) {
    $scope.data = null;
    $scope.lastUsedQuery = null
    $scope.showSpinner();;
    search.load(query).then(function (data) {
      $scope.data = data;
      $scope.hideSpinner();;
      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollTop(true);
      $scope.lastUsedQuery = query
    }, function () {
      $scope.hideSpinner();;
    });
  };

  $scope.$on('$ionicView.enter', function() {
    $scope.lastUsedQuery = null
    $scope.query = cache.get('query');
    $scope.data = null
    if ($scope.query)
      $scope.search($scope.query);
  })

  layout.setContainerClass('search-screen');
});
