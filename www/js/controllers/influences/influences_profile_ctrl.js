angular.module('app.controllers').controller('influence.profile',
  function ($scope, users, follows, $stateParams, $state, profile, UsersActivity, $rootScope, $ionicScrollDelegate, $timeout) {

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
    $scope.follow = follows.getOrCreateUser(id);
  }
  $scope.isFollowedAndApproved = function(){
    return ($scope.follow && $scope.follow.hasApprovedCurrentUser())
  }

  $scope.changeStatus = function (status) {
    if ('unfollow' === status) {
      $scope.confirmAction('Are you sure?').then(function () {
        $scope.follow.unFollowByCurrentUser().then(function(){
        $rootScope.$broadcast('influences-updated');
        $state.reload();
      }, $state.reload);
        $rootScope.$broadcast('influences-updated');
      });
    } else {
      $scope.follow.followByCurrentUser().then(function(){
        $rootScope.$broadcast('influences-updated');
        $state.reload();
      }, $state.reload);
    }
  };

/*
  if ($scope.isFollowedAndApproved()) {
    activity.fetchFollowingActivities($scope.follow.user_id).then(function(activities) {
      $scope.activities = activities.models;
    });
  }
*/
  // activities
  $scope.isLoadMore = false;
  var activityCollection = UsersActivity.getActivities();

  function refreshListOfActivities() {
    $scope.activities = activityCollection.getModels();

    //we want to wait until rendering is finished
    $timeout(function(){
      $scope.hideSpinner()
    }, 0);
  }

  function prepare() {

    activityCollection.sort();

    $scope.loading = false;
    $ionicScrollDelegate.resize();
  }

  function loadActivities(loadType) {
    var prevSize = activityCollection.size();
    UsersActivity.load(id, loadType).then(function () {
      if (loadType === 'append' && prevSize === activityCollection.size()) {
        $scope.isLoadMore = false;
      } else {
        $scope.isLoadMore = true;
      }
      prepare();

      $scope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
      refreshListOfActivities();
    });
  }

  $scope.loadMoreActivities = function () {
    loadActivities('append');
  };

  $scope.pullToRefresh = function () {
    loadActivities('clearAndLoad');
  };

  $scope.$on('activity.reload', function () {
    loadActivities('refresh');
  });

  $scope.$on('$ionicView.enter', function () {

    loadActivities('clearAndLoad');

  });

})
