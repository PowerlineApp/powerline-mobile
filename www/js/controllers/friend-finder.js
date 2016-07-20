angular.module('app.controllers').controller('friendFinderController', function ($scope, FriendFinder) {
  
  $scope.friends = []
  $scope.noResults = false
  $scope.search = function(){
    $scope.showSpinner();
    FriendFinder.search().then(function(response){
      $scope.friends = response
      $scope.noResults = $scope.friends.length == 0
      $scope.hideSpinner();
    })
  }

  $scope.add = function (friend) {
    FriendFinder.follow(friend).then(function(){
       $scope.showToast('Follow request sent!');
       friend.followButtonClicked = true
    })
  };
})

