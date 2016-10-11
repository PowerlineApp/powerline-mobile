angular.module('app.controllers').controller('createPollFundraiserCtrl',function ($scope, $stateParams, $document, groups, profile, homeCtrlParams, $rootScope, $q) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {
    title: '', 
    description_text: '',
    goal_amount: '',
    end_of_event_date: '',
    end_of_event_hour: '12:00'
  }

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

  $scope.answers = [{answer_text: ''}]

  $scope.removeAnswer = function(index){
    if($scope.answers.length <= 1)
      $scope.alert('You must provide at least one answer.')
    else
      $scope.answers.splice(index, 1);
  }

  $scope.addAnswer = function(){
    $scope.answers.push({answer_text: ''})
  }

  $scope.send = function(){
    var title = $scope.data.title_text
    var description = $scope.data.description_text
    var isCrowdfunding = $scope.data.is_crowdfunding
    var goalAmount = Number($scope.data.goal_amount)
    var endOfEventDate = $scope.data.end_of_event_date
    var endOfEventTime = $scope.data.end_of_event_hour
    var customAmountEnabled = $scope.data.custom_amount_enabled

    if(title.length == 0){
      alert('Title cannot be blank')
      return false
    }   
    if(description.length == 0){
      alert('Description cannot be blank')
      return false
    }
    if(isNaN(goalAmount)){
      alert('Goal amount must be a number, e.g. 400 or 199.99')
      return false
    }
    if(goalAmount < 0){
      alert('Goal amount must be a larger that zero')
      return false
    }
    if(endOfEventDate.length == 0){
      alert('End of Event (day) cannot be blank')
      return false
    }   

  }

})