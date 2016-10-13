angular.module('app.controllers').controller('profileForFacebookNewscomersCtrl',function ($scope, $ionicSideMenuDelegate, profile, errorFormMessage, groups, iStorage, session, $location) {
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.age = {iAmAdult: false}

  $scope.data = profile.get(); // we must call it data due to iAddress
  if($scope.data == null){
    profile.load().then(function(){
      $scope.data = profile.get();
    })
  }

  
  $scope.submit = function(profileForm){

    profileForm.$filled = true;
    if (profileForm.$invalid) {
      $scope.alert(errorFormMessage(profileForm)[0], null, 'Error', 'OK');
      return
    } else {
      _(profileForm).each(function (item) {
        if ('object' === typeof item && item.hasOwnProperty('$name')) {
          $scope.data[item.$name] = item.$modelValue;
        }
      })
    }

    if(!$scope.age.iAmAdult){
      alert('You must be 13 or older to register to Powerline.')
      return
    }

      $scope.showSpinner();
      $scope.data.$save({
        action: 'update',
        step: 0
      }, function () {
        groups.load().finally(function () {
          $scope.hideSpinner();
          homeCtrlParams.loaded = false;
        });
        $scope.data.avatar_src_prefix = null;

        iStorage.set('is_registration_complete', $scope.data.is_registration_complete);
        session.is_registration_complete = $scope.data.is_registration_complete;

        $scope.alert('Profile successfully updated', null, 'Success', 'OK');
         $location.path('/main');
      }, function (response) {
        var data = response.data;
        $scope.hideSpinner();
        if (data && data.errors) {
          _(data.errors).each(function (error) {
            if (profileForm[error.property]) {
              profileForm[error.property].$setValidity('required', false);
              $scope.$broadcast('i-group.openBySelector', '[name=' + error.property + ']');
            }
          });
          if (data.errors.length) {
            $scope.alert(data.errors[0].message, null, 'Error', 'OK');
          }
          $scope.formClass = 'error';
        } else {
          $scope.alert('Error occurred', null, 'Error', 'OK');
        }
      });

  }
})