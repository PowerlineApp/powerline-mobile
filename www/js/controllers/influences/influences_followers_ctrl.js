angular.module('app.controllers').controller('influences.followers',function ($scope, follows) {

  $scope.data = follows.getApprovedFollowers();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getApprovedFollowers();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getApprovedFollowers();
  });

  $scope.remove = function (follows) {
    $scope.confirmAction('Are you sure?').then(function () {
      follows.unapprove();
    });
  };

})