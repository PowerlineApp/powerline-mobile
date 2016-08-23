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




    if (petition.answer_id) {
      $scope.answer_message = 'Your response “' + petition.getOptionLabel(petition.answer_id) + '” was sent to “' + petition.group.official_title + '” group';
    }
    cache.put($stateParams.id, petition);
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

  $scope.$watch('petition', function (petition) {
    if (petition && petition.user) { // we need to wait for the real object (and not promise)
      $scope.shareBody = petition.petition_body;
      $scope.shareTitle = petition.title;
      $scope.shareImage = petition.share_picture;
      if ((petition.answer_id && petition.answer_id !== 3) || petition.expired || session.user_id === petition.user.id) {
        if(petition.type == 'quorum')
          $scope.subview = 'templates/petitions/results-quorum.html';
        else
          $scope.subview = 'templates/petitions/results-long-petition.html';
      } else {
        if(petition.type == 'quorum')
          $scope.subview = 'templates/petitions/take-action-quorum.html';
        else
          $scope.subview = 'templates/petitions/take-action-long-petition.html';
      }

      if (petition.answer_id && petition.answer_id === 3) {
        $scope.current = petition.options[2];
      }
    }
  });

  $scope.answer = function () {
    $scope.showSpinner();
    microPetitions.signLongPetition($scope.petition.id).then(function(){
      $state.reload()
      homeCtrlParams.loaded = false;
    })
  };
  
  $scope.unsign = function () {
    $scope.showSpinner();
    microPetitions.unsignLongPetition($scope.petition.id).then(function(){
      $state.reload()
      homeCtrlParams.loaded = false;
    })
  };

})