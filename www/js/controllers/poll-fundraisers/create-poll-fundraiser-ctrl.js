angular.module('app.controllers').controller('createPollFundraiserCtrl',function ($scope, $stateParams, $document, groups, profile, homeCtrlParams, $rootScope, $q, questions, $http, serverConfig, device) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); 
  $scope.data = {
    title_text: '', 
    description_text: '',
    goal_amount: '',
    end_of_event_date: tomorrow,
    end_of_event_hour: '12:00',
    custom_amount_amount_desc: ''
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

  $scope.answers = [{amount_desc: ''}, {amount_desc: ''}]

  $scope.removeAnswer = function(index){
    if($scope.answers.length <= 2)
      $scope.alert('You must provide at least two answers.')
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

  var createPollCrowdfunding = function(title, description, groupID, endOfEventDate, endOfEventTime, goalAmount){
    var year = endOfEventDate.getUTCFullYear()
    var month = String(endOfEventDate.getMonth()+1)
    if(month.length == 1)
      month = '0'+mount
    var day = String(endOfEventDate.getDate())
    if(day.length == 1)
      day = '0'+day

    var crowdfunding_deadline = year+'/'+month+'/'+day+' '+endOfEventTime+':00' //"2016-09-30 09:52:33"
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

  $scope.send = function(){
    var title = $scope.data.title_text
    var description = $scope.data.description_text
    var isCrowdfunding = $scope.data.is_crowdfunding
    var goalAmount = Number($scope.data.goal_amount)
    var endOfEventDate = $scope.data.end_of_event_date
    var endOfEventTime = $scope.data.end_of_event_hour
    var customAmountEnabled = $scope.data.custom_amount_enabled
    var customAmountDesc = $scope.data.custom_amount_amount_desc

    if(title.length == 0){
      alert('Title cannot be blank')
      return false
    }   
    if(description.length == 0){
      alert('Description cannot be blank')
      return false
    }
    if(isCrowdfunding && isNaN(goalAmount)){
      alert('Goal amount must be a number, e.g. 400 or 199.99')
      return false
    }
    if(isCrowdfunding &&  goalAmount < 0){
      alert('Goal amount must be greater than zero')
      return false
    }
    var now = new Date()
    if(isCrowdfunding && endOfEventDate < now){
      alert('End of Event (day) must be in future')
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
      $scope.alert('Answer amount must be a number and cannot be blank.')
      return false      
    }

    if(answerAmountIsSubzero){
      $scope.alert('Answer amount must be greater than zero.')
      return false       
    }

    if(isThereNonEmptyAnswerDesc){
      $scope.alert('Answer description cannot be blank.')
      return false      
    }

    if(customAmountEnabled && customAmountDesc.length == 0){
      $scope.alert('Custom amount description cannot be blank.')
      return false     
    }

    $scope.showSpinner();

    var groupID = $scope.data.group.id

    var createRequest = null
    if(isCrowdfunding)
      createRequest = createPollCrowdfunding(title, description, groupID, endOfEventDate, endOfEventTime, goalAmount)
    else 
      createRequest = createPollPayment(title, description, groupID)

    createRequest.then(function(response){
      var pollID = response.data.id
      var requests = []
      $scope.answers.forEach(function(answer){
        var r = addAmountToPayment(pollID, answer.amount, answer.amount_desc)
        requests.push(r)
      })

      if(customAmountEnabled){
        var r = addCustomAmountToPayment(pollID, customAmountDesc)
        requests.push(r)
      }

      $q.all(requests).then(function(){
        questions.publishPoll(pollID).then(function(){
          $scope.hideSpinner();
          $rootScope.showToast('Fundraiser successfully created!');
          $rootScope.back();
        }, function(error){
          $scope.hideSpinner();
          console.log('publish fundraising failed')
          console.log(error)
          alert('Failed to publish fundraising: '+JSON.stringify(error))
        })
      }, function(error){
        $scope.hideSpinner();
        console.log('add payment answer failed')
        console.log(error)
        alert('Failed to add one of the payment options: '+JSON.stringify(error))
      })

    }, function(error){
      $scope.hideSpinner();
      console.log('Failed to create poll')
      console.log(error)
      if(error.status == 500)
        alert('Your group must have a bank account verified before you can publish a fundraiser. Please visit Group Settings to setup and verify bank account information.')
      else
      alert('Failed to create poll due to: '+JSON.stringify(error))
    })
  }

})