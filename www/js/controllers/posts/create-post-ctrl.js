angular.module('app.controllers').controller('createPostCtrl',function ($scope, $stateParams, $document, posts, groups, profile, homeCtrlParams, $rootScope) {
  $scope.groupID = $stateParams.groupID;

  // TODO: show only groups for which user has not exceeded number of posts per month
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;
  
  $scope.profile = profile.get();

  $scope.create = function(postForm) {
    if (postForm.$invalid) {
      $scope.formClass = 'error';
      if (postForm.petition_body.$error.required) {
        $scope.alert('No message entered', null, 'Error', 'OK');
      } else if (postForm.group.$error.required) {
        $scope.alert('No group selected', null, 'Error', 'OK');
      } else {
        $scope.alert(errorFormMessage(postForm)[0], null, 'Error', 'OK');
      }
    } else {
      $scope.showSpinner();

      var groupID = postForm.group.$modelValue.id
      var body = postForm.petition_body.$modelValue

      posts.create(groupID, body).then(function(){
        homeCtrlParams.loaded = false;
        $scope.hideSpinner();
        $rootScope.showToast('Post successfully created!');
        $rootScope.back();
      }).catch(function(response){
        $scope.hideSpinner();
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