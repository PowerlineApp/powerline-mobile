angular.module('app.controllers').controller('guide', function ($scope, layout) {

  layout.setBodyClass('hidden-header light guide');

  $scope.item = 0;

  $scope.items = ['Quick Tour'];

  $scope.back = function () {
    if (0 === $scope.item) {
      return;
    }
    $scope.item--;
  };

  $scope.next = function () {
    if (6 === $scope.item) {
      return;
    }
    $scope.item++;
  };

  $scope.$watch('item', function (value) {
    $scope.title = $scope.items[value];
  });
}).controller('guide.confirm', function ($scope, layout) {

  layout.setBodyClass('hidden-header light');

});
