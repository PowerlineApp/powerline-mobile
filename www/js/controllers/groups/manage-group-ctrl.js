angular.module('app.controllers').controller('manageGroupCtrl',function ($scope, groups, $stateParams) {
  var groupID = parseInt($stateParams.id)
  groups.loadAllDetails(groupID).then(function(){
    $scope.group = groups.get(groupID);
  })  
})