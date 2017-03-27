angular.module('app.controllers').controller('notifications', function ($scope, SocialActivityTabManager, $location, groupsInvites, invites, announcements, $state, homeCtrlParams) {

  $scope.homeCtrlParams = homeCtrlParams;

  $scope.SAState = SocialActivityTabManager.getState();

  $scope.$watch(getMessagesCount, function (messagesCount) {
    $scope.messagesCount = groupsInvites.get().length + invites.get().size();
    $scope.newAnnouncementsCount = announcements.getNumberOfNew();
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

  function getMessagesCount() {
    return groupsInvites.get().length + announcements.getNumberOfNew() + invites.get().size();
  }
});
