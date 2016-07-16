angular.module('app.controllers').controller('friend-finder', function ($scope, friendFinder) {
  $scope.search = function(){
    friendFinder.search().then(function(a){
      console.log(a)
    })
  }
})

