angular.module('app.controllers').controller('influences.followers',function ($scope, follows) {

  $scope.data = follows.getUsersFollowingCurrentUser();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getUsersFollowingCurrentUser();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getUsersFollowingCurrentUser();
  });

  $scope.remove = function (userFollowingCurrentUser) {
    $scope.confirmAction('Are you sure?').then(function () {
      follows.stopFollower(userFollowingCurrentUser);
      $scope.data = follows.getUsersFollowingCurrentUser();
    });
  };

})