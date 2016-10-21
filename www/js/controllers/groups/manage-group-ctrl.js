angular.module('app.controllers').controller('manageGroupCtrl',function ($scope, groups, $stateParams, $ionicPopup) {
  var groupID = parseInt($stateParams.id)
  $scope.data = {}
  groups.loadAllDetails(groupID).then(function(){
    $scope.group = groups.get(groupID);
    console.log($scope.group)

    if($scope.group.membership_control == 'public')
     $scope.data.membership_control = $scope.membershipControlOptions[0]
    else if($scope.group.membership_control == 'approval')
      $scope.data.membership_control = $scope.membershipControlOptions[1]
    else if($scope.group.membership_control == 'passcode')
      $scope.data.membership_control = $scope.membershipControlOptions[2]

    groups.loadPermissions(groupID).then(function (permissionModel) {
      $scope.group.currentPermissions = permissionModel.get('required_permissions')
      $scope.group.currentPermissions.forEach(function(permissionID){
        $scope.data.selectedPermissions[permissionID] = true
      })
    })
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

  $scope.data.membership_control = {}
  $scope.data.membership_control_passcode = ''

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

  $scope.membershipControlOptions = [
    {name: 'Public (Open to all)', value: 'public'},
    {name: 'Approval (User is approved by group leader)', value: 'approval'},
    {name: 'Passcode (User must provide correct passcode to enter)', value: 'passcode'}]

  //////// GROUP PERMISSIONS /////////////////////////////////////////////

  $scope.allGroupPermissions = groups.permissionsLabels
  $scope.data.selectedPermissions = {}

  var activePermissions = function(){
    var activePermissionsIDs = []
    Object.keys($scope.data.selectedPermissions).forEach(function(k){
      if($scope.data.selectedPermissions[k])
        activePermissionsIDs.push(k)
    })
    return activePermissionsIDs
  }

  $scope.groupPermissionsAltered = function(){
    if($scope.group == null)
      return false

    var originalPermission = $scope.group.currentPermissions
    return JSON.stringify(originalPermission)!=JSON.stringify(activePermissions());
  }

  $scope.saveGroupPermissions = function(){
    var activePermissionsIDs = activePermissions()
    $scope.group.changeGroupPermissions(activePermissionsIDs).then(function(){
      $scope.showToast('Group permissions altered successfully.')
      $scope.group.currentPermissions = activePermissionsIDs
    })
  }
})