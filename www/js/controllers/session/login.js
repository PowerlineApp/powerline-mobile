angular.module('app.controllers').controller('session.login',function ($scope, $location, session, facebook, $timeout, flurry, $ionicSideMenuDelegate, $ionicHistory) {
  $ionicSideMenuDelegate.canDragContent(false);
  
  $scope.keepLogged = true;
  $scope.data = {};

  flurry.log('login');
  

  $scope.login = function () {
    if (!$scope.data.username || !$scope.data.password) {
      $scope.alert('All fields required', null, 'Error', 'OK');
      return;
    }
    $scope.loading = true;
    session.login($scope.data, $scope.keepLogged).then(
      function () {
        //clear cache and history
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        flurry.log('logged in');
        if (!session.is_registration_complete) {
          $scope.path('/profile');
        } else {
          $scope.path('/main');
        }
      },
      function (status) {
        $scope.loading = false;
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
      session.facebookLogin(params).then(function () {
        flurry.log('logged in from facebook');
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
    }, function (error) {
      $scope.alert(error, null, 'Error', 'OK');
      $scope.loading = false;
    });

  };

  $scope.forgotPassword = function () {
    $scope.path('/forgot-password');
  };

}).controller('session.logout', function ($scope, $location, session, $window, flurry) {
  flurry.log('logout');

  if (!session.getToken()) {
    if($window.navigator.app){
      $window.navigator.app.exitApp();
    }else{
      $location.path('/login');
    }
    return;
  }

  session.logout();
  if ($window.device && $window.device.platform === 'Android') {
    $window.navigator.app.loadUrl('file:///android_asset/www/index.html');
  } else {
    $window.location.reload();
  }
});
