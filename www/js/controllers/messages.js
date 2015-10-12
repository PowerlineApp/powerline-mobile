angular.module('app.controllers').controller('messages', function ($scope, groupsInvites, loaded, announcements, invites, flurry) {

  flurry.log('messages');
  
  function loadData(showSpinner){
    if(showSpinner){
      $scope.showSpinner();
    }
    
    groupsInvites.load().finally(loaded($scope));
    
    invites.load().then(function (invites) {
      $scope.invites = invites;
    });
    
  }


  $scope.reject = function (item) {
    $scope.showSpinner();
    item.$reject(function () {
      groupsInvites.load().then(loaded($scope), loaded($scope));
    }, loaded($scope));
    flurry.log('reject invite');
  };

  $scope.ignoreInvite = function (invite) {
    $scope.showSpinner();
    invites.remove(invite).then(loaded($scope), loaded($scope));
    flurry.log('ignore invite');
  };
  
  $scope.pullToRefresh = function(){
    announcements.load().finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
      
      announcements.updateNumberOfNew();
      announcements.setViewed();
    });
    loadData();
  };

  $scope.$watch(groupsInvites.get, function () {
    $scope.items = groupsInvites.get();
  });
  
  $scope.$watch(announcements.get, function () {
    $scope.announcements = announcements.get();
  });
  
  loadData(true);
  
  announcements.updateNumberOfNew();
  announcements.setViewed();

});