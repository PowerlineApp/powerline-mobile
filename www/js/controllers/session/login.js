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
          $scope.alert('Wrong username or password, or no internet connection', null, 'Error', 'OK');
        } else {
          $scope.alert('Incorrect username or password', null, 'Error', 'OK');
        }
      }
    );

  };

  $scope.facebookLogin = function () {
    $scope.showSpinner();
    facebook.logout().finally(function(){
      facebook.login().then(function (params) {
        // this is sort of hack -- we don't know if user is registered or not
        // so that we try to register him, and disregarding the outcome (success == was not registered yet, failure == is already registered)
        // we login the user
        session.registerUserFromFacebook(params).finally(function(){
          session.facebookLogin(params).then(function () {
            $scope.hideSpinner();
            if (!session.is_registration_complete) {
              $scope.path('/profile-for-facebook-newscomers');
            } else {
              $scope.path('/main');
            }
          }, function (response) {
            $scope.hideSpinner();
            if (302 === response.status) {
              facebook.setRegistrationFormData(params).then(function () {
                $scope.path('/registration');
              }, function() {
                $scope.path('/registration');
              });
            } else if (400 === response.status) {
              $scope.hideSpinner();
              $scope.alert('Facebook login failed', null, 'Error', 'OK');
            } 
            
          });
        })

      }, function (error) {
        $scope.hideSpinner();
        console.log('facebook.login failed with:')
        console.log(error)
        $scope.alert(JSON.stringify(error), null, 'Error', 'OK');
      });
    })
  };

  $scope.forgotPassword = function () {
    $scope.path('/forgot-password');
  };

}).controller('session.logout', function ($scope, $location, session, $window) {
  $scope.showSpinner();
  session.logout();
});
