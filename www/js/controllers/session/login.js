angular.module('app.controllers').controller('session.login',function ($scope, homeCtrlParams, session, facebook, $timeout, $ionicSideMenuDelegate, $ionicHistory) {
  $ionicSideMenuDelegate.canDragContent(false);
  
  $scope.keepLogged = {value: true};
  $scope.data = {};

  $scope.hideSpinner();

  $scope.login = function () {
    if (!$scope.data.username || !$scope.data.password) {
      $scope.alert('All fields required', null, 'Error', 'OK');
      return;
    }
    $scope.showSpinner();
    session.login($scope.data, $scope.keepLogged.value).then(
      function () {
        //clear cache and history
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        homeCtrlParams.loaded = false;
        $timeout(function(){
          $scope.hideSpinner();
          if (!session.is_registration_complete) {
            $scope.path('/profile');
          } else {
            $scope.path('/main');
          }
        }, 500);
      },
      function (status) {
        $scope.hideSpinner();
        if (!status) {
          $scope.alert('Check your connection', null, 'Error', 'OK');
        } else {
          $scope.alert('Incorrect username or password', null, 'Error', 'OK');
        }
      }
    );

  };

  $scope.facebookLogin = function () {
    var promise = $timeout(function () {
      $scope.loading = false;
    }, 2000);
    $scope.loading = true;
    facebook.login().then(function (params) {
      $timeout.cancel(promise);
      $scope.loading = true;
      // this is sort of hack -- we don't know if user is registered or not
      // so that we try to register him, and disregarding the outcome (success == was not registered yet, failure == is already registered)
      // we login the user
      session.registerUserFromFacebook(params).finally(function(){
        session.facebookLogin(params).then(function () {
          if (!session.is_registration_complete) {
            $scope.path('/profile');
          } else {
            $scope.path('/main');
          }
        }, function (response) {
          if (302 === response.status) {
            facebook.setRegistrationFormData(params).then(function () {
              $scope.path('/registration');
            }, function() {
              $scope.path('/registration');
            });
          } else if (400 === response.status) {
            $scope.alert('Facebook login failed', null, 'Error', 'OK');
          } 
          $scope.loading = false;
        });
      })

    }, function (error) {
      console.log('facebook.login failed with:')
      console.log(error)
      $scope.alert(error, null, 'Error', 'OK');
      $scope.loading = false;
    });

  };

  $scope.forgotPassword = function () {
    $scope.path('/forgot-password');
  };

}).controller('session.logout', function ($scope, $location, session, $window) {
  $scope.showSpinner();
  session.logout();
});
