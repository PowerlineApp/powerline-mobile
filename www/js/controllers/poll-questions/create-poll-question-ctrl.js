angular.module('app.controllers').controller('createPollQuestionCtrl',function ($scope, $controller, questions, $rootScope, $q) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});
  $scope.data.question_text = ''
  $scope.answers = [{answer_text: ''}, {answer_text: ''}]

  $scope.removeAnswer = function(index){
    if($scope.answers.length <= 2)
      $scope.validationAlert('You must provide at least two answers.')
    else
      $scope.answers.splice(index, 1);
  }

  $scope.addAnswer = function(){
    $scope.answers.push({answer_text: ''})
  }

  $scope.validate = function(){
    if($scope.data.question_text.length == 0){
      $scope.validationAlert('Question text cannot be blank.')
      return false
    }

    var isThereNonEmptyAnswer = false
    $scope.answers.forEach(function(a){
      if(a.answer_text.length == 0)
        isThereNonEmptyAnswer = true
    })

    if(isThereNonEmptyAnswer){
      $scope.validationAlert('Answer cannot be blank.')
      return false      
    }

    return true
  }

  $scope.send = function(){
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
        $scope.createContentAlert('You are not allowed to create Poll in this group')
      else
        $scope.createContentAlert('Error occured while creating Poll: '+JSON.stringify(error.data))
    })
  }


})