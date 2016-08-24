angular.module('app.controllers').controller('userPetitionCtrl',function ($scope, topBar, $stateParams, loaded, $cacheFactory, session, $state,
                                   homeCtrlParams, activity, layout, $ionicPopup, $rootScope, userPetitions) {
                                   
  var cache = $cacheFactory.get('petitionController');
  $scope.petition = cache.get($stateParams.id);

  if (!$scope.userPetition) {
    $scope.showSpinner();
  }

  $scope.select = function (option) {
    $scope.current = option;
  };

  
// mute: notification enabled value (true : disable, false : enable)
// hidden: show only to author
  $scope.mute = true;
  $scope.hidden = true;

  
  $scope.onClickToggleMute = function(){
    $scope.mute = !$scope.mute;
  }
/////////////////////////////////////////////////////////////////  

  userPetitions.load($stateParams.id).then(function (userPetition) {
    $scope.hideSpinner();
    $scope.userPetition = userPetition;

    //Check the petitions owner = login user
    if ($scope.userPetition){
      if ($scope.userPetition.user.id == session.user_id){
        $scope.hidden = false;
      }
      else {
        $scope.hidden = true;
      }
    }
/////////////////////////////////////////////////////////////////      

//Edit and Delete Button

  $scope.editClicked = false;
  $scope.deleteClicked = false;

  $scope.onEditBtnClicked = function(){
    if ($scope.editClicked == false){
      $scope.editClicked = true;
    }
    else {
      $scope.editClicked = false;
      $scope.petition.petition_body_parsed = $scope.petition.petition_body;
//backend operation.      
      
      petitions.update($scope.petition);
      
    }
  };


  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Post',
      template: 'Are you sure you want to delete this post?'
    });

    confirmPopup.then(function(res) {
      $scope.navigateTo = $rootScope.navigateTo;

      if(res) {

//Backend part...
        petitions.delete($scope.petition.id);
        $scope.back();
      } else {
        
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
      if ((userPetition.answer_id && userPetition.answer_id !== 3) || userPetition.expired || session.user_id === userPetition.user.id) {
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