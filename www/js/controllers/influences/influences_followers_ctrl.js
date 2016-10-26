angular.module('app.controllers').controller('influences.followers',function ($scope, follows) {

  $scope.data = follows.getUsersFollowingCurrentUser();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getUsersFollowingCurrentUser();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getUsersFollowingCurrentUser();
  });

  $scope.remove = function (userFollowingCurrentUser) {
    $scope.confirmAction('Do you want to stop '+userFollowingCurrentUser.username+' from following you?').then(function () {
      userFollowingCurrentUser.unApprove().then(function(){
        follows.load();
      })
      
    });
  };

  $scope.approve = function (userFollowingCurrentUser) {
    $scope.confirmAction('Do you want to approve '+userFollowingCurrentUser.username+'?').then(function () {
      userFollowingCurrentUser.approve().then(function(){
        follows.load();
      })
      
    });
  };

})