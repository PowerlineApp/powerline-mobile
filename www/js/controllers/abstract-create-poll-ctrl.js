angular.module('app.controllers').controller('abstractCreatePollCtrl',function ($scope, $stateParams, groups) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {}
  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;

  $scope.validate = function(){
    // implement in inherited controller
  }
  $scope.send = function(){
    // implement in inherited controller
  }

  $scope.sendButtonClicked = function(){
    if($scope.validate()){
      $scope.showSpinner();
      $scope.data.group.members().then(function(members){
        $scope.hideSpinner();
        var memberCount = members.length
        var msg = 'You are about to send this to all '+memberCount+' group members. Are you sure?'
        $scope.confirmAction(msg, 'Warning').then(function () {
          $scope.send()
        });
      })
    }
  }
})