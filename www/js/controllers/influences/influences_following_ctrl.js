angular.module('app.controllers').controller('influences.following',function ($scope, follows) {

  $scope.data = follows.getUsersFollowedByCurrentUser();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getUsersFollowedByCurrentUser();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getUsersFollowedByCurrentUser();
  });

  $scope.unfollow = function (userFollowedByCurrentUser) {
    $scope.confirmAction('Are you sure?').then(function () {
      follows.stopFollowing(userFollowedByCurrentUser)
      $scope.data = follows.getUsersFollowedByCurrentUser();
    });
  };

})