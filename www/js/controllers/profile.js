angular.module('app.controllers').controller('profile', function ($scope, topBar, profile, $window, layout, errorFormMessage, session, iStorage, flurry, homeCtrlParams, groups, formUtils) {

  $scope.view = {editMode: false};

  var edit = {
    btnClass: 'btn-save',
    click: send
  };

  var view = {
    btnClass: 'btn-pencil',
    click: function () {
      $scope.view.editMode = true;
    }
  };

  topBar.reset()
    .set('menu', true)
    .set('title', 'Profile')
    .set('right', view)
  ;

  $scope.$watch('view.editMode', function (value) {
    topBar.set('right', value ? edit : view);
  });

  layout.setContainerClass('profile-1');

  flurry.log('my profile');

  $scope.profile = profile.get();
  $scope.profileManager = profile;

  $scope.data = {};

  $scope.percent = 0;

  $scope.$watch(profile.getPercentCompleted, function (newValue) {
    $scope.percent = newValue;
  });

  $scope.loading = true;
  profile.load().then(loaded, loaded);

  function loaded() {
    $scope.loading = false;
    $scope.profile = profile.get();

    topBar.set('menu', $scope.profile.is_registration_complete);
    if (!$scope.profile.is_registration_complete) {
      topBar.set('menu', false);
      $scope.alert('Please fill out required fields in order to fully expirience Powerline', null, 'Info', 'OK');
    }

    setFormData();
  }

  function setFormData() {
    $scope.data = _({}).extend($scope.profile);
  }

  function send() {
    $scope.profileForm.$filled = true;
    if ($scope.profileForm.$invalid) {
      $scope.formClass = 'error';
      $scope.alert(errorFormMessage($scope.profileForm)[0], null, 'Error', 'OK');
      _(formUtils.getErrorFields($scope.profileForm)).each(function (field) {
        $scope.$broadcast('i-group.openBySelector', '[name=' + field.$name + ']');
      });
    } else {
      if ((new Date()).getFullYear() - (new Date($scope.data.birth)).getFullYear() < 13) {
        return $scope.alert('Sorry - you must be 13 or older in order to use Powerline!', null, '', 'OK');
      }
      _($scope.profileForm).each(function (item) {
        if ('object' === typeof item && item.hasOwnProperty('$name')) {
          $scope.profile[item.$name] = item.$modelValue;
        }
      });

      $scope.loading = true;
      $scope.profile.$save({
        action: 'update',
        step: 0
      }, function () {
        groups.loadUserGroups().finally(function () {
          $scope.loading = false;
          homeCtrlParams.loaded = false;
        });
        $scope.profile.avatar_src_prefix = null;
        flurry.log('profile updated');

        topBar.set('menu', true);
        iStorage.set('is_registration_complete', $scope.profile.is_registration_complete);
        session.is_registration_complete = $scope.profile.is_registration_complete;

        $scope.alert('Profile successfully updated', null, 'Success', 'OK');
        $scope.view.editMode = false;
      }, function (response) {
        var data = response.data;
        $scope.loading = false;
        if (data && data.errors) {
          _(data.errors).each(function (error) {
            if ($scope.profileForm[error.property]) {
              $scope.profileForm[error.property].$setValidity('required', false);
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
  }

  $scope.pickPicture = function () {
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
  };

  $scope.nonSelectedInterests = function (item) {
    return !_.contains($scope.data.interests, item);
  };

  $scope.removeInterest = function (item) {
    $scope.data.interests = _.without($scope.data.interests, item);
  };
}).controller('profile-step2', function ($scope, topBar, layout, errorFormMessage, $location, profile) {
  topBar.reset();
  layout.setBodyClass('hidden-header light');

  $scope.profile = profile.get();
  $scope.data = _({}).extend($scope.profile);
  $scope.view = {editMode: true};
  $scope.percent = 0;

  $scope.$watch(profile.getPercentCompleted, function (newValue) {
    $scope.percent = newValue;
  });

  $scope.profileManager = profile;
  $scope.send = function() {
    $scope.profileForm.$filled = true;
    if ($scope.profileForm.$invalid) {
      $scope.alert(errorFormMessage($scope.profileForm)[0], null, 'Error', 'OK');
    } else {
      _($scope.profileForm).each(function (item) {
        if ('object' === typeof item && item.hasOwnProperty('$name')) {
          $scope.profile[item.$name] = item.$modelValue;
        }
      });

      $scope.loading = true;
      $scope.profile.$save({
        action: 'update',
        step: 0
      }, function () {
        $location.path('/profile-3');
      }, function (response) {
        var data = response.data;
        $scope.loading = false;
        if (data && data.errors) {
          _(data.errors).each(function (error) {
            if ($scope.profileForm[error.property]) {
              $scope.profileForm[error.property].$setValidity('required', false);
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
}).controller('profile-step3', function ($scope, topBar, layout, $location, profile) {
  topBar.reset();
  layout.setBodyClass('hidden-header light');

  $scope.profile = profile.get();
  $scope.data = _({}).extend($scope.profile);
  $scope.view = {editMode: true};
  $scope.percent = 0;

  $scope.$watch(profile.getPercentCompleted, function (newValue) {
    $scope.percent = newValue;
  });

  $scope.profileManager = profile;

  $scope.send = function() {
    $scope.profileForm.$filled = true;
    if ($scope.profileForm.$invalid) {
    } else {
      _($scope.profileForm).each(function (item) {
        if ('object' === typeof item && item.hasOwnProperty('$name')) {
          $scope.profile[item.$name] = item.$modelValue;
        }
      });

      $scope.loading = true;
      $scope.profile.$save({
        action: 'update',
        step: 0
      }, function () {
        $location.path('/guide');
      }, function () {
        $scope.loading = false;
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
