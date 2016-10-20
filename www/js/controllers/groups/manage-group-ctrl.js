angular.module('app.controllers').controller('manageGroupCtrl',function ($scope, groups, $stateParams) {
  var groupID = parseInt($stateParams.id)
  groups.loadAllDetails(groupID).then(function(){
    $scope.group = groups.get(groupID);
    console.log($scope.group)

    if($scope.group.membership_control == 'public')
     $scope.data.membership_control = $scope.membershipControlOptions[0]
    else if($scope.group.membership_control == 'approval')
      $scope.data.membership_control = $scope.membershipControlOptions[1]
    else if($scope.group.membership_control == 'passcode')
      $scope.data.membership_control = $scope.membershipControlOptions[2]
  })  

  var expandedSection = null
  $scope.expand = function(sectionName){
    expandedSection = sectionName
  }

  $scope.isExpanded = function(sectionName){
    return expandedSection == sectionName
  }

  $scope.dataIsAltered = function(){
    if(!$scope.group)
      return false

    var mcChanged = $scope.group.membership_control != $scope.data.membership_control.value
    return mcChanged
  }

  $scope.membershipControlSetToPasscode = function(){
    return $scope.data.membership_control.value == 'passcode'
  }

  $scope.data = {membership_control: {}}
  $scope.membershipControlOptions = [
    {name: 'Public (Open to all)', value: 'public'},
    {name: 'Approval (User is approved by group leader)', value: 'approval'},
    {name: 'Passcode (User must provide correct passcode to enter)', value: 'passcode'}]


})