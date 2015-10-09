angular.module('app.controllers').controller('messages', function ($scope, topBar, layout, groupsInvites, loaded, announcements, invites, flurry) {

  layout.setContainerClass('groups-notifications');
  topBar.setHomeBar();

  flurry.log('messages');

  $scope.$watch(groupsInvites.get, function () {
    $scope.items = groupsInvites.get();
  });

  $scope.loading = true;
  groupsInvites.load().then(loaded($scope), loaded($scope));
  invites.load().then(function (invites) {
    $scope.invites = invites;
  });

  $scope.reject = function (item) {
    $scope.loading = true;
    item.$reject(function () {
      groupsInvites.load().then(loaded($scope), loaded($scope));
    }, loaded($scope));
    flurry.log('reject invite');
  };

  $scope.ignoreInvite = function (invite) {
    $scope.loading = true;
    invites.remove(invite).then(loaded($scope), loaded($scope));
    flurry.log('ignore invite');
  };

  $scope.$watch(announcements.get, function () {
    $scope.announcements = announcements.get();
  });
  announcements.updateNumberOfNew();
  announcements.setViewed();

});