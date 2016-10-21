angular.module('app.controllers').controller('manageGroupCtrl',function ($scope, groups, $stateParams, $ionicPopup) {
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

  $scope.validationAlert = function(msg){
   $ionicPopup.alert({
     cssClass: 'popup-by-ionic',
     title: 'Validation warning',
     template: msg
   });
  }

  //////////// MEMBERSHIP CONTROL SETTINGS //////////////////////////////

  $scope.membershipControlSettingsAltered = function(){
    if(!$scope.group)
      return false

    var ch1 = $scope.group.membership_control != $scope.data.membership_control.value
    var ch2 = $scope.data.membership_control_passcode
    return ch1
  }

  $scope.saveMembershipControlSettings = function(){
    var mtype = $scope.data.membership_control.value
    var passcode =  $scope.data.membership_control_passcode

    if(mtype = 'passcode' && passcode.length == 0){
       $scope.validationAlert('Passcode cannot be blank.')
      return
    } 
    $scope.group.changeMembershipControl(mtype, passcode).then(function(){
      $scope.showToast('Group membership control altered successfully.')
      // todo refresh membershipControlSettingsAltered
    })
  }

  $scope.membershipControlSetToPasscode = function(){
    return $scope.data.membership_control.value == 'passcode'
  }

  $scope.data = {membership_control: {}, membership_control_passcode: ''}

  $scope.membershipControlOptions = [
    {name: 'Public (Open to all)', value: 'public'},
    {name: 'Approval (User is approved by group leader)', value: 'approval'},
    {name: 'Passcode (User must provide correct passcode to enter)', value: 'passcode'}]


})