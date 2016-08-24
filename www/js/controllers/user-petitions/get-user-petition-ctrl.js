angular.module('app.controllers').controller('getUserPetitionCtrl',function ($scope,  $stateParams,
                                   layout, $ionicPopup, $rootScope, userPetitions) {
                                   
  if (!$scope.userPetition) {
    $scope.showSpinner();
  }

  $scope.canSignOrUnsign = function(){
    if($scope.userPetition){
      var notOwner = !$scope.userPetition.ownedByCurrentUser()
      var notExpired = !$scope.userPetition.expired()
      return(notOwner && notExpired)
    } else
      return false
  }

  $scope.sign = function(){
    $scope.userPetition.sign()
  }

  $scope.unsign = function(){
    $scope.userPetition.unsign()
  }

  $scope.inEditMode = false;
  $scope.onEditBtnClicked = function(){
    $scope.inEditMode = !$scope.inEditMode;
    if(!$scope.inEditMode)
      $scope.userPetition.updateBodyText()
  }

  $scope.deleteClicked = false;
  $scope.showDeleteConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete User Petition',
      template: 'Are you sure you want to delete this user petition?'
    });

    confirmPopup.then(function(res) {
      $scope.navigateTo = $rootScope.navigateTo;
      if(res){
        $scope.userPetition.delete()
        // TODO show toast and reload activities
        $scope.back();
      }
    });
  };

  userPetitions.get($stateParams.id).then(function (userPetition) {
    $scope.hideSpinner();
    $scope.userPetition = userPetition;
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

})