angular.module('app.controllers').controller('influences',function ($scope, $location, influencesCD, follows, $rootScope) {

  function loadFollowsFromServer(showSpinner){
    if(showSpinner){
      $scope.showSpinner();
    }
    follows.load().then(function () {
      $scope.$broadcast('scroll.refreshComplete');
      if(showSpinner){
        $scope.hideSpinner();
      }
    }, function () {
      $scope.$broadcast('scroll.refreshComplete');
      if(showSpinner){
        $scope.hideSpinner();
      }
    });
  }

  $scope.view = influencesCD.view;

  $scope.pullToRefresh = function(){
    loadFollowsFromServer();
  };

  $scope.$watch(function () {
    return influencesCD.view;
  }, function () {
    $scope.view = influencesCD.view;
  });
  
  $rootScope.$on('influences-updated', function(){
    loadFollowsFromServer(true);
  });
  
  //if this page is opened from menu or there is not data, we should refresh data
  $scope.$on('$ionicView.enter', function(){
    if(!follows.size()  || follows.containsMockUsers)
      loadFollowsFromServer(true);
  });
  
})