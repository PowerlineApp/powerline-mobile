angular.module('app.controllers').controller('createPetitionCtrl',function ($scope, $stateParams,petitions, groups, profile, $http, serverConfig, $rootScope) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {title: '', petition_body: ''}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;

  $scope.send = function(){
    if($scope.data.title.length == 0){
      alert('Petition title cannot be blank.')
      return false
    }
    if($scope.data.petition_body.length == 0){
      alert('Petition text cannot be blank.')
      return false
    }

    var groupID = $scope.data.group.id
    $scope.showSpinner();
    petitions.create($scope.data.title,$scope.data.petition_body,groupID).then(function(response){
        $scope.hideSpinner();
        $rootScope.showToast('Petition successfully created!');
        $rootScope.back();
    }, function(error){
      $scope.hideSpinner();
      if(error.status == 403)
        $scope.alert('You are not allowed to create petition in this group')
      else
        $scope.alert('Error occured while creating petition: '+JSON.stringify(error.data))
    })
  }
})