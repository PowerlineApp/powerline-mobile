angular.module('app.controllers').controller('profile', function ($scope, profile, $window, errorFormMessage, session, iStorage, flurry, homeCtrlParams, groups, formUtils) {

  flurry.log('my profile');

  $scope.view = {editMode: false};

  $scope.profile = profile.get();
  $scope.profileManager = profile;

  $scope.data = {};

  $scope.percent = 0;

  $scope.$watch(profile.getPercentCompleted, function (newValue) {
    $scope.percent = newValue;
  });

  $scope.showSpinner();
  profile.load().then(loaded, loaded);

  function loaded() {
    $scope.hideSpinner();
    $scope.profile = profile.get();

    if (!$scope.profile.is_registration_complete) {
      $scope.alert('Please fill out required fields in order to fully expirience Powerline', null, 'Info', 'OK');
    }

    setFormData();
  }

  function setFormData() {
    $scope.data = _({}).extend($scope.profile);
  }

  $scope.send = function(profileForm) {
    profileForm.$filled = true;
    if (profileForm.$invalid) {
      $scope.formClass = 'error';
      $scope.alert(errorFormMessage(profileForm)[0], null, 'Error', 'OK');
      _(formUtils.getErrorFields(profileForm)).each(function (field) {
        $scope.$broadcast('i-group.openBySelector', '[name=' + field.$name + ']');
      });
    } else {
      if ((new Date()).getFullYear() - (new Date($scope.data.birth)).getFullYear() < 13) {
        return $scope.alert('Sorry - you must be 13 or older in order to use Powerline!', null, '', 'OK');
      }
      _(profileForm).each(function (item) {
        if ('object' === typeof item && item.hasOwnProperty('$name')) {
          $scope.profile[item.$name] = item.$modelValue;
        }
      });

      $scope.showSpinner();
      $scope.profile.$save({
        action: 'update',
        step: 0
      }, function () {
        groups.loadUserGroups().finally(function () {
          $scope.hideSpinner();
          homeCtrlParams.loaded = false;
        });
        $scope.profile.avatar_src_prefix = null;
        flurry.log('profile updated');

        iStorage.set('is_registration_complete', $scope.profile.is_registration_complete);
        session.is_registration_complete = $scope.profile.is_registration_complete;

        $scope.alert('Profile successfully updated', null, 'Success', 'OK');
        $scope.view.editMode = false;
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
  };

  $scope.pickPicture = function () {
    if($window.navigator && window.navigator.camera){
      $window.navigator.camera.getPicture(function (imageData) {
        $scope.profile.avatar_file_name = imageData;
        $scope.profile.avatar_src_prefix = 'data:image/jpeg;base64,';
        $scope.$apply();
      }, function () {
      }, {
        targetWidth: 256,
        targetHeight: 256,
        encodingType: $window.navigator.camera.EncodingType.JPEG,
        sourceType: $window.navigator.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: $window.navigator.camera.DestinationType.DATA_URL,
        allowEdit: true,
        correctOrientation: true
      });
    } else {
        $scope.profile.avatar_file_name = 'images/mock-avatar.png';
        $scope.profile.avatar_src_prefix = '';
        $scope.$apply();
    }

  };

  $scope.nonSelectedInterests = function (item) {
    return !_.contains($scope.data.interests, item);
  };

  $scope.removeInterest = function (item) {
    $scope.data.interests = _.without($scope.data.interests, item);
  };
}).controller('profile-step2', function ($scope, $ionicSideMenuDelegate, layout, errorFormMessage, $location, profile) {
  $ionicSideMenuDelegate.canDragContent(false);
  
  layout.setBodyClass('hidden-header light');

  $scope.profile = profile.get();
  $scope.data = _({}).extend($scope.profile);
  $scope.view = {editMode: true};
  $scope.percent = 0;

  $scope.$watch(profile.getPercentCompleted, function (newValue) {
    $scope.percent = newValue;
  });

  $scope.profileManager = profile;
  $scope.send = function(profileForm) {
    profileForm.$filled = true;
    if (profileForm.$invalid) {
      $scope.alert(errorFormMessage(profileForm)[0], null, 'Error', 'OK');
    } else {
      _(profileForm).each(function (item) {
        if ('object' === typeof item && item.hasOwnProperty('$name')) {
          $scope.profile[item.$name] = item.$modelValue;
        }
      });

      $scope.showSpinner();
      $scope.profile.$save({
        action: 'update',
        step: 0
      }, function () {
        $scope.hideSpinner();
        $location.path('/profile-3');
      }, function (response) {
        var data = response.data;
        $scope.hideSpinner();
        if (data && data.errors) {
          _(data.errors).each(function (error) {
            if (profileForm[error.property]) {
              profileForm[error.property].$setValidity('required', false);
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
  };
}).controller('profile-step3', function ($scope, $ionicSideMenuDelegate, layout, $location, profile) {
  $ionicSideMenuDelegate.canDragContent(false);
  
  $scope.profile = profile.get();
  $scope.data = _({}).extend($scope.profile);
  $scope.view = {editMode: true};
  $scope.percent = 0;

  $scope.$watch(profile.getPercentCompleted, function (newValue) {
    $scope.percent = newValue;
  });

  $scope.profileManager = profile;

  $scope.send = function(profileForm) {
    profileForm.$filled = true;
    if (profileForm.$invalid) {
    } else {
      _(profileForm).each(function (item) {
        if ('object' === typeof item && item.hasOwnProperty('$name')) {
          $scope.profile[item.$name] = item.$modelValue;
        }
      });

      $scope.showSpinner();
      $scope.profile.$save({
        action: 'update',
        step: 0
      }, function () {
        $scope.hideSpinner();
        $location.path('/guide');
      }, function () {
        $scope.hideSpinner();
      });
    }
  };

  $scope.nonSelectedInterests = function (item) {
    return !_.contains($scope.data.interests, item);
  };

  $scope.removeInterest = function (item) {
    $scope.data.interests = _.without($scope.data.interests, item);
  };
});
