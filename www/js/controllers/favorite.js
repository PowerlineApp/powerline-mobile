angular.module('app.controllers').controller('favorite', function ($scope, favorite, ActivityModel) {
  $scope.hasNoFavorites = false

  $scope.$on('favorites:updated', function(event,favorites) {
    $scope.activities = favorites.map(function(f){
      return new ActivityModel(f.detail)
    })
    $scope.hasNoFavorites = ($scope.activities.length == 0)
   });

  $scope.$on('$ionicView.enter', function(){
    favorite.load()
  });
})

