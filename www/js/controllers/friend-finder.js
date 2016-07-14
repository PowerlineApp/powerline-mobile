angular.module('app.controllers').controller('friendFinderController', function ($scope, FriendFinder, follows) {
  
  $scope.friends = []
  $scope.search = function(){
    $scope.showSpinner();
    FriendFinder.search().then(function(response){
      $scope.friends = response
      $scope.hideSpinner();
    })
  }

  $scope.add = function (friend) {
    console.log('todo')
  };
})

