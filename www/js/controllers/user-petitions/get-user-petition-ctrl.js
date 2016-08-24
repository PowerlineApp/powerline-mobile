angular.module('app.controllers').controller('getUserPetitionCtrl',function ($scope, topBar, $stateParams, loaded, $cacheFactory, $state,
                                   homeCtrlParams, activity, layout, $ionicPopup, $rootScope, userPetitions) {
                                   
  var cache = $cacheFactory.get('petitionController');
  $scope.petition = cache.get($stateParams.id);

  if (!$scope.userPetition) {
    $scope.showSpinner();
  }

  userPetitions.get($stateParams.id).then(function (userPetition) {
    $scope.hideSpinner();
    $scope.userPetition = userPetition;
      
  $scope.inEditMode = false;
  $scope.deleteClicked = false;

  $scope.onEditBtnClicked = function(){
    $scope.inEditMode = !$scope.inEditMode;
    if(!$scope.inEditMode)
      $scope.userPetition.updateBodyText()
  };

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

/////////////////////////////////////////////////////////////////      




  if (userPetition.answer_id) {
      $scope.answer_message = 'Your response “' + userPetition.getOptionLabel(userPetition.answer_id) + '” was sent to “' + userPetition.group.official_title + '” group';
    }
    cache.put($stateParams.id, userPetition);
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

  $scope.$watch('userPetition', function (userPetition) {
    if (userPetition && userPetition.user) { // we need to wait for the real object (and not promise)
      $scope.shareBody = userPetition.petition_body;
      $scope.shareTitle = userPetition.title;
      $scope.shareImage = userPetition.share_picture;
      if (userPetition.expired() || userPetition.ownedByCurrentUser()) {
          $scope.subview = 'templates/user-petitions/results-long-petition.html';
      } else {
          $scope.subview = 'templates/user-petitions/take-action-long-petition.html';
      }

      if (userPetition.answer_id && userPetition.answer_id === 3) {
        $scope.current = userPetition.options[2];
      }
    }
  });

  $scope.answer = function () {
    $scope.showSpinner();
    userPetitions.sign($scope.userPetition.id).then(function(){
      $state.reload()
      homeCtrlParams.loaded = false;
    })
  };
  
  $scope.unsign = function () {
    $scope.showSpinner();
    userPetitions.unsign($scope.userPetition.id).then(function(){
      $state.reload()
      homeCtrlParams.loaded = false;
    })
  };

})