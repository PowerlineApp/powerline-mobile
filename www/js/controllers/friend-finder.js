angular.module('app.controllers').controller('friendFinderController', function ($scope, FriendFinder) {
  
  $scope.friends = []
  $scope.search = function(){
    $scope.showSpinner();
    FriendFinder.search().then(function(response){
      $scope.friends = response
      $scope.hideSpinner();
    })
  }

  $scope.add = function (friend) {
    FriendFinder.follow(friend).then(function(){
       $scope.showToast('Follow request sent!');
    })
  };
})

