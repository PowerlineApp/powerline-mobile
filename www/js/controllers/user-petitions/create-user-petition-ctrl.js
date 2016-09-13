angular.module('app.controllers').controller('createUserPetitionCtrl',function ($scope, $stateParams, $document, userPetitions, groups, profile, homeCtrlParams, $rootScope, camelcase2underscore) {
  $scope.groupID = $stateParams.groupID;

  // TODO: show only groups for which user has not exceeded number of posts per month
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;
  
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
        $scope.hideSpinner();
        $rootScope.showToast('User petition successfully created!');
        $rootScope.back();
      }).catch(function(response){
        $scope.hideSpinner();
        if (response.status === 406) {
          $scope.alert('Your limit of petitions per month is reached for this group', null, 'Error', 'OK');
          return;
        }
        if (response.data && response.data.errors && response.data.errors.errors) {
            $scope.alert(response.data.errors.errors[0], null, 'Error', 'OK');
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

})