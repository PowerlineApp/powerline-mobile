angular.module('app.controllers').controller('profile', function ($scope, profile, $window, errorFormMessage, session, iStorage, homeCtrlParams, groups, formUtils) {

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
        groups.load().finally(function () {
          $scope.hideSpinner();
          homeCtrlParams.loaded = false;
        });
        $scope.profile.avatar_src_prefix = null;

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
    if($window.navigator && $window.navigator.camera){
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
        $scope.profile.avatar_file_name = `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`;
        $scope.profile.avatar_src_prefix = 'data:image/jpeg;base64,';
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
