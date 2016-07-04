angular.module('app.controllers').controller('favorite', function ($scope, favorite) {
  $scope.hasNoFavorites = function(){
    return($scope.favorites.lenghh == 0)
  }

  $scope.favorites = []

  favorite.load().then(function(favorites){
    $scope.favorites = favorites
  })
})

