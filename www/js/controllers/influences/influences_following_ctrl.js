angular.module('app.controllers').controller('influences.following',function ($scope, follows) {

  $scope.data = follows.getFollowing();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getFollowing();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getFollowing();
  });

  $scope.unfollow = function (item) {
    $scope.confirmAction('Are you sure?').then(function () {
      item.unfollow();
      follows.remove(item);
      $scope.data = follows.getFollowing();
    });
  };

})