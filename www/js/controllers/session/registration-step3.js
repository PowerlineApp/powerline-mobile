angular.module('app.controllers').controller('session.registration-step3',
  function ($scope, topBar, session, $location, $window, iStorageMemory, profile, layout, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.loading = true;
    
    profile.load().then(function () {
      $scope.user = profile.get();
      $scope.loading = false;
    }, function () {
      $scope.loading = false;
    });

    $scope.percent = 0;

    $scope.$watch(profile.getPercentCompleted, function (newValue) {
      $scope.percent = newValue;
    });

    $scope.skip = function () {
      $location.path('/main');
    };
  });
