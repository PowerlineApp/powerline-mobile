angular.module('app.controllers').controller('createPollDiscussionCtrl',function ($scope, $stateParams, $document, questions, groups, profile, homeCtrlParams, $rootScope, $q) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {discussion_description: ''}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;

})