angular.module('app.controllers').controller('notifications', function ($scope, socialActivityTabManager, $location, groupsInvites, invites, announcements, $state, homeCtrlParams) {

  $scope.homeCtrlParams = homeCtrlParams;

  $scope.SAState = socialActivityTabManager.getState();

  $scope.$watch(getMessagesCount, function (messagesCount) {
    $scope.messagesCount = messagesCount;
  });

  $scope.activity = function () {
    homeCtrlParams.loaded = false;
    homeCtrlParams.filter.selectedGroup = null;
    if ('/main' !== $location.path()) {
      $location.path('/main');
    } else {
      $state.reload();
    }
  };

  $scope.goToMessages = function () {
    announcements.setViewed();
    announcements.updateNumberOfNew();
    $scope.navigateTo('path', 'messages');
  };

  $scope.followersNotifications = function () {
    $scope.SAState.reload = true;
    if ('/influences/notifications' === $location.path()) {
      $state.reload();
    } else {
      $location.path('/influences/notifications');
    }
  };

  $scope.getClass = function (path) {
    return $scope.getActiveClass(path, $location.path());
  };
  
  $scope.getActiveClass = function (a, b) {
    return a === b ? 'active' : '';
  };

  function getMessagesCount() {
    return groupsInvites.get().length + announcements.getNumberOfNew() + invites.get().size();
  }
});