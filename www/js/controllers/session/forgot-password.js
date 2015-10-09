angular.module('app.controllers').controller('session.forgot-password', function ($scope, session, flurry, layout, $ionicSideMenuDelegate) {
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.data = {};

  flurry.log('forgot password');

  $scope.sendEmail = function () {
    $scope.loading = true;
    session.forgotPassword($scope.data.email).then(function () {
      $scope.alert('Please check your email', null, 'Success', 'OK');
      flurry.log('request new password');
      $scope.loading = false;
      $scope.path('/login');
    }, function (response) {
      if (404 === response.status) {
        $scope.alert('User is not found', null, 'Error', 'OK');
      }
      if (400 === response.status) {
        $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
      }
      $scope.loading = false;
    });
  };
});