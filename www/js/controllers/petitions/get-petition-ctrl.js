angular.module('app.controllers').controller('getPetitionCtrl',function ($scope,  $stateParams,
                                   layout, $ionicPopup, $rootScope, petitions) {
                                   
  if (!$scope.petition) {
    $scope.showSpinner();
  }

  $scope.canSignOrUnsign = function(){
    if($scope.petition){
      var notOwner = !$scope.petition.ownedByCurrentUser()
      var notExpired = !$scope.petition.expired()
      return(notOwner && notExpired)
    } else
      return false
  }

  $scope.sign = function(){
    $scope.petition.sign()
  }

  $scope.unsign = function(){
    $scope.petition.unsign()
  }

  $scope.signedResultInPercents = 0
  petitions.get($stateParams.id).then(function (petition) {
    $scope.hideSpinner();
    $scope.petition = petition;
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

})