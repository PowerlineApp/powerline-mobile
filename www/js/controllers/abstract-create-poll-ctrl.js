angular.module('app.controllers').controller('abstractCreatePollCtrl',function ($scope, $stateParams, groups, $ionicPopup) {
  $scope.data = {}

  $scope.prepareGroupPicker = function(isLeaderContent){
    $scope.groupID = $stateParams.groupID;
    $scope.groups = groups.groupsWhereUserCanCreateContent(isLeaderContent);
    if ($scope.groupID) 
      $scope.data.group = groups.getGroup($scope.groupID)
    else 
      $scope.data.openChoices = true;
  }

  $scope.validate = function(){
    // implement in inherited controller
  }
  $scope.send = function(){
    // implement in inherited controller
  }

  $scope.sendButtonClicked = function(doNotShowMemberCountAlert){
    if($scope.validate()){
      $scope.showSpinner();
      if(doNotShowMemberCountAlert)
        $scope.send()
      else {
        $scope.data.group.members().then(function(members){
          $scope.hideSpinner();
          var memberCount = members.length
          var msg = 'You are about to send this to all '+memberCount+' group members. Are you sure?'
          var confirmPopup = $ionicPopup.confirm({
            title: 'Create new content',
            cssClass: 'popup-by-ionic',
            template: msg
          });

          confirmPopup.then(function(res) {
            if(res) 
              $scope.send()
          });
        })
      }

    }
  }

  $scope.validationAlert = function(msg){
   $ionicPopup.alert({
     cssClass: 'popup-by-ionic',
     title: 'Validation warning',
     template: msg
   });
  }

  $scope.createContentAlert = function(msg){
   $ionicPopup.alert({
     cssClass: 'popup-by-ionic',
     title: 'Failed to create content',
     template: msg
   });
  }
})