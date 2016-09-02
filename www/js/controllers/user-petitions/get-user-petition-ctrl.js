angular.module('app.controllers').controller('getUserPetitionCtrl',function ($scope,  $stateParams,
                                   layout, $ionicPopup, $rootScope, userPetitions, activity) {
                                   
  if (!$scope.userPetition) {
    $scope.showSpinner();
  }

  $scope.sign = function(){
    $scope.userPetition.sign().then(function(){
      $scope.showToast('User petition signed!');
    })
  }

  $scope.unsign = function(){
    $scope.userPetition.unsign().then(function(){
      $scope.showToast('User petition unsigned!');
    })
  }

  $scope.inEditMode = false;
  $scope.onEditBtnClicked = function(){
    $scope.inEditMode = !$scope.inEditMode;
    if(!$scope.inEditMode)
      $scope.userPetition.updateBodyText().then(function(){
          activity.youShouldRefreshActivities()
          $scope.showToast('User petition description updated.');        
      })
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
        $scope.userPetition.delete().then(function(){
          activity.youShouldRefreshActivities()
          $scope.showToast('User petition deleted.');
          $scope.back();
        })
      }
    });
  };

  $scope.signedResultInPercents = 0
  userPetitions.get($stateParams.id).then(function (userPetition) {
    $scope.hideSpinner();
    $scope.userPetition = userPetition;
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

})