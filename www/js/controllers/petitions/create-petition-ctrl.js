angular.module('app.controllers').controller('createPetitionCtrl',function ($scope, $stateParams,petitions, groups, $http, serverConfig, $rootScope, $controller) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});
  $scope.prepareGroupPicker(true)
  
  $scope.data.title = ''
  $scope.data.petition_body = ''

  $scope.validate = function(){
    if($scope.data.title.length == 0){
      alert('Petition title cannot be blank.')
      return false
    }
    if($scope.data.petition_body.length == 0){
      alert('Petition text cannot be blank.')
      return false
    }
    return true
  }

  $scope.send = function(){
    var groupID = $scope.data.group.id
    $scope.showSpinner();
    petitions.create($scope.data.title,$scope.data.petition_body,groupID, $scope.sectionsToPublishIn()).then(function(petitionID){
        $scope.hideSpinner();
        $rootScope.showToast('Petition successfully created!');
        $rootScope.path('/petition/'+petitionID);
    }, function(error){
      $scope.hideSpinner();
      if(error.status == 403)
        $scope.alert('You are not allowed to create petition in this group')
      else
        $scope.alert('Error occured while creating petition: '+JSON.stringify(error.data))
    })
  }
})