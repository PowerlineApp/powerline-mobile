angular.module('app.controllers').controller('abstractCreatePollCtrl',function ($scope, $stateParams, groups, $ionicPopup, $q) {
  $scope.data = {}

  $scope.prepareGroupPicker = function(isLeaderContent){
    $scope.groupID = $stateParams.groupID;
    $scope.groups = groups.groupsWhereUserCanCreateContent(isLeaderContent);
    if ($scope.groupID) 
      $scope.chooseGroup(groups.getGroup($scope.groupID))
    else 
      $scope.data.openChoices = true;
  }

  $scope.chooseGroup = function(group){
    $scope.data.group = group
    $scope.data.openChoices = false;
  }

  $scope.validate = function(){
    // implement in inherited controller
  }
  $scope.send = function(){
    // implement in inherited controller
  }

  $scope.sendButtonClicked = function(doNotShowMemberCountAlert){
    var g = $scope.data.group
    if($scope.validate()){
      $scope.showSpinner();
      if(doNotShowMemberCountAlert)
        $scope.send()
      else {
        var requests = [g.loadGroupMembers(), g.loadSections()]
        $q.all(requests).then(function(){
          $scope.hideSpinner();
          $scope.data.selectedSections = {all: true}
          var allMemberCount = g.groupMembers.length
          var msg = 'You are about to send this to all '+allMemberCount+' group members. Are you sure?'
          
          if(g.sections.length > 0){
            msg = '<p>Send to all group members or send to section(s) of a group?</p>'
            msg += '<ion-checkbox class="group-section-picker" ng-model="data.selectedSections.all" ng-change="sectionSelectionChanged(\'all\')">'
            msg += 'All ('+allMemberCount+' members)'
            msg += '</ion-checkbox>'
            g.sections.forEach(function(s){
              $scope.data.selectedSections[s.id] = false
              msg += '<ion-checkbox class="group-section-picker"'
              msg += 'ng-model="data.selectedSections['+s.id+']"'
              msg += 'ng-change="sectionSelectionChanged('+s.id+')" >'
              msg += s.title+' ('+s.members.length+' members)'
              msg += '</ion-checkbox>'
            })
          }

          var confirmPopup = $ionicPopup.confirm({
            title: 'Create New Content',
            cssClass: 'popup-by-ionic publish-content',
            content: msg,
            scope: $scope
          });

          confirmPopup.then(function(res) {
            if(res) 
              $scope.send()
          });
        })
      }
    }
  }

  $scope.sectionSelectionChanged = function(sectionID){
    activeSectionHasBeenChecked = $scope.data.selectedSections[sectionID]

    // if All is selected, deselect other options
    if(sectionID == 'all'){
      _.each($scope.data.selectedSections, function(v, k){
        if(k != 'all' && activeSectionHasBeenChecked)
          $scope.data.selectedSections[k] = false
      })

    // if other option is selected, deselect All
    } else if (sectionID != 'all' && activeSectionHasBeenChecked) 
      $scope.data.selectedSections.all = false

    // if all options are deselected, select All
    if (!(_.values($scope.data.selectedSections).includes(true)))
      $scope.data.selectedSections.all = true
  }

  $scope.sectionsToPublishIn = function(){
    var sections = []
    _.each($scope.data.selectedSections, function(v, k){
      if(k != 'all' && v)
        sections.push(k)
    })   

    if(sections.length == 0)
      return null
    else 
      return sections
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

  $scope.createIsCrowdfunderAlert = function(msg){
   $ionicPopup.alert({
     cssClass: 'popup-by-ionic',
     title: 'Make this a crowdfunder?',
     template: msg
   });
  }

})