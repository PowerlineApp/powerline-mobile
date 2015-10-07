angular.module('app.controllers').controller('guide', function ($scope, layout, $ionicSideMenuDelegate) {
  $ionicSideMenuDelegate.canDragContent(false);
  
  $scope.data = {};
  $scope.data.item = 0;

  $scope.data.items = ['Quick Tour'];

  $scope.back = function () {
    if (0 === $scope.data.item) {
      return;
    }
    $scope.data.item--;
  };

  $scope.next = function () {
    if (6 === $scope.data.item) {
      return;
    }
    $scope.data.item++;
  };

  $scope.$watch('data.item', function (value) {
    $scope.data.title = $scope.data.items[value];
  });
  
}).controller('guide.confirm', function ($scope, layout, $ionicSideMenuDelegate) {
  $ionicSideMenuDelegate.canDragContent(false);
});
