angular.module('app.controllers').controller('session.forgot-password', function ($scope, session, layout, $ionicSideMenuDelegate) {
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.data = {};

  $scope.sendEmail = function () {
    $scope.showSpinner();
    session.forgotPassword($scope.data.email).then(function () {
      $scope.alert('Please check your email', null, 'Success', 'OK');
      $scope.hideSpinner();
      $scope.path('/login');
    }, function (response) {
      if (404 === response.status) {
        $scope.alert('User is not found', null, 'Error', 'OK');
      }
      if (400 === response.status) {
        $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
      }
      $scope.hideSpinner();
    });
  };
});