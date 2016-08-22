angular.module('app.controllers').controller('influence.profile',
  function ($scope, users, follows, $stateParams, $state, profile, activity, $rootScope) {

  var id = parseInt($stateParams.id, 10);

  $scope.showSpinner();
  users.load(id).then(function (data) {
    $scope.data = data;
    $scope.hideSpinner();
  }, function () {
    $scope.hideSpinner();
  });

  $scope.follow = null
  if (profile.get() && profile.get().id !== id) {
    $scope.follow = follows.getByUserId(id);
  }
  $scope.isFollowedAndApproved = function(){
    return ($scope.follow && $scope.follow.isFollow() && $scope.follow.isApproved())
  }

  $scope.changeStatus = function (status) {
    if ('unfollow' === status) {
      $scope.confirmAction('Are you sure?').then(function () {
        $scope.follow[status]().then(function(){
        $rootScope.$broadcast('influences-updated');
        $state.reload();
      }, $state.reload);
        $rootScope.$broadcast('influences-updated');
      });
    } else {
      $scope.follow[status]().then(function(){
        $rootScope.$broadcast('influences-updated');
        $scope.showToast('Follow request sent!');
        $state.reload();
      }, $state.reload);
    }
  };

  if ($scope.follow && $scope.follow.get('status')) {
    activity.fetchFollowingActivities($scope.follow.get('user').id).then(function(activities) {
      $scope.activities = activities.models;
    });
  }

})