angular.module('app.controllers').controller('influences.following',function ($scope, follows) {

  $scope.data = follows.getUsersFollowedByCurrentUser();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getUsersFollowedByCurrentUser();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getUsersFollowedByCurrentUser();
  });

  $scope.unfollow = function (userFollowedByCurrentUser) {
    $scope.confirmAction('Do you want to stop following '+userFollowedByCurrentUser.username+'?').then(function () {
      userFollowedByCurrentUser.unFollowByCurrentUser()
      $scope.data = follows.getUsersFollowedByCurrentUser();
    });
  };

})