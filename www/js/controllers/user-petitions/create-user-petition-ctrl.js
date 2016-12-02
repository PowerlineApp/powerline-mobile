angular.module('app.controllers').controller('createUserPetitionCtrl',function ($scope, $stateParams, $document, userPetitions, groups, profile, $rootScope, $controller) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});
  $scope.prepareGroupPicker(false)
  
  $scope.profile = profile.get();
  $scope.data.title = ''
  $scope.data.petition_body = ''

  $scope.validate = function(){
    if($scope.data.title.length == 0){
      $scope.validationAlert('Title cannot be blank.')
      return false
    }

    if($scope.data.petition_body.length == 0){
      $scope.validationAlert('Petition body cannot be blank.')
      return false
    }     

    return true
  }
  $scope.send = function(petitionForm) {
    $scope.showSpinner();

    var title = $scope.data.title 
    var body = $scope.data.petition_body

    userPetitions.create($scope.data.group.id, title, body).then(function(response){
      $scope.hideSpinner();
      $rootScope.showToast('User petition successfully created!');
      $scope.updateActivityNewsfeed()
      $rootScope.path('/user-petition/'+response.data.id);
    }).catch(function(response){
      $scope.hideSpinner();
      if (response.data && response.data.errors && response.data.errors.errors) {
          $scope.createContentAlert(response.data.errors.errors[0]);
        $scope.formClass = 'error';
      } else {
        $scope.createContentAlert('Error occurred');
      }        
    })
  }

  var $body = $document.find('body');
  $scope.$on('resize', function () {
    $scope.$digest();
  });

  $scope.height = function () {
    return $body.height() - 56 - 42;
  };

})