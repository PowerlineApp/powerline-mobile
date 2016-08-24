angular.module('app.controllers').controller('createUserPetitionCtrl',function ($scope, $stateParams, $document, userPetitions, groups, profile, homeCtrlParams, $rootScope) {
  $scope.groupID = $stateParams.groupID;

  $scope.groups = groups.groupsJoinedByCurrentUser();

  $scope.expires_intervals = [
    {
      value: 1,
      label: '1 day'
    },
    {
      value: 3,
      label: '3 days'
    },
    {
      value: 7,
      label: '7 days'
    },
    {
      value: 30,
      label: '30 days'
    }
  ];
  $scope.data = {
    is_outsiders_sign: false
  };

  if ($stateParams.groupID) {
    $scope.data.group = _($scope.groups).find(function (item) {
      return item.id === Number($stateParams.groupID);
    });
  } else {
    $scope.data.openChoices = true;
  }

  $scope.user_expire_interval = $scope.expires_intervals[2];
  $scope.petition_types = ['quorum', 'open letter', 'long petition'];
  $scope.profile = profile.get();

  $scope.create = function(petitionForm) {
    if (petitionForm.$invalid) {
      $scope.formClass = 'error';
      if (petitionForm.petition_body.$error.required) {
        $scope.alert('No message entered', null, 'Error', 'OK');
      } else if (petitionForm.group.$error.required) {
        $scope.alert('No group selected', null, 'Error', 'OK');
      } else {
        $scope.alert(errorFormMessage(petitionForm)[0], null, 'Error', 'OK');
      }
    } else {
      $scope.showSpinner();

      var groupID = petitionForm.group.$modelValue.id
      var title = petitionForm.title.$modelValue
      var body = petitionForm.petition_body.$modelValue

      userPetitions.create(groupID, title, body).then(function(){
        homeCtrlParams.loaded = false;
        // TODO: refresh activities because user petition was successfully create and this new activity should appear
        $scope.hideSpinner();
        $rootScope.showToast('User petition successfully created!');
        $rootScope.back();
      }).catch(function(response){
        $scope.hideSpinner();
        if (response.status === 406) {
          $scope.alert('Your limit of petitions per month is reached for this group', null, 'Error', 'OK');
          return;
        }
        if (response.data && response.data.errors) {
          _(response.data.errors).each(function (error) {
            var property = camelcase2underscore(error.property);
            if (petitionForm[property]) {
              petitionForm[property].$setValidity('required', false);
            }
          });
          if (response.data.errors.length) {
            $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
          }
          $scope.formClass = 'error';
        } else {
          $scope.alert('Error occurred', null, 'Error', 'OK');
        }        
      })



    }
  }

  var $body = $document.find('body');
  $scope.$on('resize', function () {
    $scope.$digest();
  });

  $scope.height = function () {
    return $body.height() - 56 - 42;
  };

  var start = new Date();
  var month = start.getMonth();
  start.setDate(0);
  // petitions.loadByParams({user: session.user_id, start: start.toUTCString()}).then(function (collection) {
  //   _($scope.groups).each(function (group) {
  //     group.available = group.petition_per_month - collection.reduce(function (memo, petition) {
  //       if (petition.get('group').id === group.id && petition.get('created_at').getMonth() === month) {
  //         memo++;
  //       }
  //       return memo;
  //     }, 0);
  //   });
  // });
})