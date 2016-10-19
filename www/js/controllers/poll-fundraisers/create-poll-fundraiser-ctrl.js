angular.module('app.controllers').controller('createPollFundraiserCtrl',function ($scope, $stateParams, $document, $controller, $rootScope, $q, questions, $http, serverConfig) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); 
  tomorrow.setMinutes(0)
  tomorrow.setMinutes(0)
  tomorrow.setSeconds(0)
  $scope.data.title_text = ''
  $scope.data.description_text = ''
  $scope.data.goal_amount = ''
  $scope.data.end_of_event_date = tomorrow
  $scope.data.end_of_event_hour = '12:00'
  $scope.data.custom_amount_amount_desc = ''

  $scope.hours = []
  for(i=0; i<24; i++){
    var v = i+':00'
    if(v.length == 4)
      v = '0' + v
    $scope.hours.push(v)
  }

  $scope.answers = [{amount_desc: ''}, {amount_desc: ''}]

  $scope.removeAnswer = function(index){
    if($scope.answers.length <= 2)
      $scope.validationAlert('You must provide at least two answers.')
    else
      $scope.answers.splice(index, 1);
  }

  $scope.addAnswer = function(){
    $scope.answers.push({amount_desc: ''})
  }

  var createPollPayment = function(title, description, groupID){
    var data = {
      title: title,
      subject: description,
      type: 'payment_request'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
  }

  var createPollCrowdfunding = function(title, description, groupID, endOfEventDateTime, goalAmount){
    var crowdfunding_deadline = questions.toBackendUTCDateTimeString(endOfEventDateTime)
    var data = {
      title: title,
      subject: description,
      is_crowdfunding: true,
      crowdfunding_goal_amount: goalAmount,
      crowdfunding_deadline: crowdfunding_deadline,
      type: 'payment_request'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)    
  }

  var addAmountToPayment = function(pollID, amount, amountDesc){
    var data = {payment_amount: amount, 
      value : amountDesc,
      is_user_amount: false}
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+pollID+'/options', payload, headers)
  }

  var addCustomAmountToPayment = function(pollID, customAmountDesc){
    var data = {value : customAmountDesc,
      is_user_amount: true}
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+pollID+'/options', payload, headers)
  }

  $scope.showCannotRemoveWarning = function(){
    $scope.validationAlert('It is not possible to edit or remove this answer.')
  }

  $scope.validate = function(){
    var title = $scope.data.title_text
    var description = $scope.data.description_text
    var isCrowdfunding = $scope.data.is_crowdfunding
    var goalAmount = Number($scope.data.goal_amount)
    var endOfEventDateTime = $scope.data.end_of_event_date
    var endOfEventHour = Number($scope.data.end_of_event_hour.split(':')[0])
    endOfEventDateTime.setHours(endOfEventHour)
    var customAmountEnabled = $scope.data.custom_amount_enabled
    var customAmountDesc = $scope.data.custom_amount_amount_desc

    if(title.length == 0){
      $scope.validationAlert('Title cannot be blank')
      return false
    }   
    if(description.length == 0){
      $scope.validationAlert('Description cannot be blank')
      return false
    }
    if(isCrowdfunding && (isNaN(goalAmount) || goalAmount == 0)){
      $scope.validationAlert('Goal amount must be a positive number, e.g. 400 or 199.99')
      return false
    }
    if(isCrowdfunding &&  goalAmount < 0){
      $scope.validationAlert('Goal amount must be greater than zero')
      return false
    }
    var now = new Date()
    if(isCrowdfunding && endOfEventDateTime < now){
      $scope.validationAlert('End of Event must be in future')
      return false
    }

    var isThereNonEmptyAnswerDesc = false
    var answerAmountNotNumber = false
    var answerAmountIsSubzero = false
    $scope.answers.forEach(function(a){
      if(isNaN(Number(a.amount)))
        answerAmountNotNumber = true
      else if(Number(a.amount) < 0)
        answerAmountIsSubzero = true

      if(a.amount_desc.length == 0)
        isThereNonEmptyAnswerDesc = true
    })

    if(answerAmountNotNumber){
      $scope.validationAlert('Answer amount must be a number and cannot be blank.')
      return false      
    }

    if(answerAmountIsSubzero){
      $scope.validationAlert('Answer amount must be greater than zero.')
      return false       
    }

    if(isThereNonEmptyAnswerDesc){
      $scope.validationAlert('Answer description cannot be blank.')
      return false      
    }

    if(customAmountEnabled && customAmountDesc.length == 0){
      $scope.validationAlert('Custom amount description cannot be blank.')
      return false     
    }

    return true
  }

  $scope.send = function(){
    var title = $scope.data.title_text
    var description = $scope.data.description_text
    var isCrowdfunding = $scope.data.is_crowdfunding
    var goalAmount = Number($scope.data.goal_amount)
    var endOfEventDateTime = $scope.data.end_of_event_date
    var endOfEventHour = Number($scope.data.end_of_event_hour.split(':')[0])
    endOfEventDateTime.setHours(endOfEventHour)
    var customAmountEnabled = $scope.data.custom_amount_enabled
    var customAmountDesc = $scope.data.custom_amount_amount_desc

    $scope.showSpinner();

    var groupID = $scope.data.group.id

    var createRequest = null
    if(isCrowdfunding)
      createRequest = createPollCrowdfunding(title, description, groupID, endOfEventDateTime, goalAmount)
    else 
      createRequest = createPollPayment(title, description, groupID)

    createRequest.then(function(response){
      var pollID = response.data.id
      var requests = []
      var r;
      $scope.answers.forEach(function(answer){
        r = addAmountToPayment(pollID, answer.amount, answer.amount_desc)
        requests.push(r)
      })

      if(customAmountEnabled){
        r = addCustomAmountToPayment(pollID, customAmountDesc)
        requests.push(r)
      }

      r = addCustomAmountToPayment(pollID, "I don't want to donate. Mark as read.")
      requests.push(r)

      $q.all(requests).then(function(){
        questions.publishPoll(pollID).then(function(){
          $scope.hideSpinner();
          $rootScope.showToast('Fundraiser successfully created!');
          $rootScope.back();
        }, function(error){
          $scope.hideSpinner();
          console.log('publish fundraising failed')
          console.log(error)
          $scope.createContentAlert('Failed to publish fundraising: '+JSON.stringify(error))
        })
      }, function(error){
        $scope.hideSpinner();
        console.log('add payment answer failed')
        console.log(error)
        $scope.createContentAlert('Failed to add one of the payment options: '+JSON.stringify(error))
      })

    }, function(error){
      $scope.hideSpinner();
      console.log('Failed to create poll')
      console.log(error)
      if(error.status == 500)
        $scope.createContentAlert('Your group must have a bank account verified before you can publish a fundraiser. Please visit Group Settings to setup and verify bank account information.')
      else if (error.data && error.data.length > 0){
        var msg = error.data[0].message
        $scope.createContentAlert(msg)
      }
      else
      $scope.createContentAlert('Failed to create poll due to: '+JSON.stringify(error))
    })
  }

})