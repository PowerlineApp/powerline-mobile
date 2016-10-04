angular.module('app.controllers').controller('createPollQuestionCtrl',function ($scope, $stateParams, $document, questions, groups, profile, homeCtrlParams, $rootScope, $q) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {question_text: ''}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;

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
    if($scope.data.question_text.length == 0){
      $scope.alert('Question text cannot be blank.')
      return false
    }

    var isThereNonEmptyAnswer = false
    $scope.answers.forEach(function(a){
      if(a.answer_text.length == 0)
        isThereNonEmptyAnswer = true
    })

    if(isThereNonEmptyAnswer){
      $scope.alert('Answer cannot be blank.')
      return false      
    }
    $scope.showSpinner();

    var createRequest = questions.createPollQuestion($scope.data.group.id, $scope.data.question_text)
    createRequest.then(function(response){
      var pollID = response.data.id
      var addAnswerRequests = []
      $scope.answers.forEach(function(answer){
        var r = questions.addOptionToPoll(pollID, answer.answer_text)
        addAnswerRequests.push(r)
      })
      $q.all(addAnswerRequests).then(function(){
        questions.publishPoll(pollID).then(function(){
          $scope.hideSpinner();
          $rootScope.showToast('Poll successfully created!');
          $rootScope.back();
        })
      })
      
    }, function(error){
      $scope.hideSpinner();
      if(error.status == 403)
        $scope.alert('You are not allowed to create Poll in this group')
      else
        $scope.alert('Error occured while creating Poll: '+JSON.stringify(error.data))
    })
  }


})