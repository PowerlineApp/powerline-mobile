angular.module('app.controllers').controller('createPollEventCtrl',function ($scope, $stateParams,questions, groups, profile, $http, serverConfig, $rootScope) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;

  $scope.send = function(){
    var groupID = $scope.data.group.id
  }
})