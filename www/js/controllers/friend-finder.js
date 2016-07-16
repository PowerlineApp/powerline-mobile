angular.module('app.controllers').controller('friend-finder', function ($scope, friendFinder, follows) {
  
  $scope.friends = []
  $scope.search = function(){
    $scope.showSpinner();
    friendFinder.search().then(function(response){
      $scope.friends = response
      $scope.hideSpinner();
    })
  }

  $scope.add = function (friend) {
    console.log('todo')
  };
})

