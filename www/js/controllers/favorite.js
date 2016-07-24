angular.module('app.controllers').controller('favorite', function ($scope, favorite, ActivityModel) {
  $scope.hasNoFavorites = false
  $scope.showSpinner()
  favorite.load().then(function(favorites){
    $scope.activities = favorites.map(function(f){
      return new ActivityModel(f.detail)
    })
    $scope.hasNoFavorites = ($scope.activities.length == 0)
    $scope.hideSpinner();
  })
})

