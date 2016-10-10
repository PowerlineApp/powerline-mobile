angular.module('app.controllers').controller('createPollFundraiserCtrl',function ($scope, $stateParams, $document, groups, profile, homeCtrlParams, $rootScope, $q) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {end_of_event_hour: '12:00'}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;

  $scope.hours = []
  for(i=0; i<24; i++){
    var v = i+':00'
    if(v.length == 4)
      v = '0' + v
    $scope.hours.push(v)
  }

  $scope.answers = [{answer_text: ''}, {answer_text: ''}]

  $scope.removeAnswer = function(index){
    if($scope.answers.length <= 2)
      $scope.alert('You must provide at least two answers.')
    else
      $scope.answers.splice(index, 1);
  }

  $scope.addAnswer = function(){
    $scope.answers.push({answer_text: ''})
  }

  $scope.send = function(){
    console.log($scope.data)
  }

})