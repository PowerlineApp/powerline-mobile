angular.module('app.controllers').controller('influences.notifications', function ($scope, $state, layout, $q, socialActivity, SocialActivityTabManager, socialActivityHandler) {

  function loadNotifications(){
    SocialActivityTabManager.getCurrentTab().setShownAt();
    SocialActivityTabManager.getState().reload = false;
    $scope.showSpinner();
    socialActivity.load().finally(function(){
      $scope.hideSpinner();
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.tabYou = SocialActivityTabManager.getTab(0);
  $scope.tabFollowing = SocialActivityTabManager.getTab(1);
  $scope.socialActivityHandler = socialActivityHandler;
  $scope.setCurrentTab = function (tab) {
    SocialActivityTabManager.setCurrentTab(tab);
    tab.setShownAt();
    SocialActivityTabManager.getState().setup();
  };


  $scope.currentTab = SocialActivityTabManager.getCurrentTab();

  $scope.send = function (promise) {
    if(promise) {
      $scope.showSpinner();
      promise.finally(function () {
        $scope.hideSpinner();
        SocialActivityTabManager.getCurrentTab().setShownAt();
        SocialActivityTabManager.getState().setup();
      });
    } else {
      SocialActivityTabManager.getCurrentTab().setShownAt();
      SocialActivityTabManager.getState().setup();
    }
  };
  
  $scope.pullToRefresh = function(){
    SocialActivityTabManager.getState().reload = true;
    loadNotifications();
  };
  
  $scope.$on('$ionicView.enter', function(){
    if (SocialActivityTabManager.getState().reload) {
      loadNotifications();
    }
  });
  

})