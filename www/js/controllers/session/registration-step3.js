angular.module('app.controllers').controller('session.registration-step3',
  function ($scope, topBar, session, $location, $window, iStorageMemory, profile, layout, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.showSpinner();
    
    profile.load().then(function () {
      $scope.user = profile.get();
      $scope.hideSpinner();
    }, function () {
      $scope.hideSpinner();
    });

    $scope.percent = 0;

    $scope.$watch(profile.getPercentCompleted, function (newValue) {
      $scope.percent = newValue;
    });

    $scope.skip = function () {
      $location.path('/main');
    };
  });
