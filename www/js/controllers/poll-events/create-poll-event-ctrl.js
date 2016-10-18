angular.module('app.controllers').controller('createPollEventCtrl',function ($scope, $stateParams,questions, $http, serverConfig, $rootScope, $controller, $q) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});

  var tomorrow = new Date();
  tomorrow.setMinutes(0)
  tomorrow.setDate(tomorrow.getDate() + 1); 
  $scope.data.start_day = tomorrow
  $scope.data.start_hour = '12:00'
  $scope.data.end_day = new Date(tomorrow); // we need to clone othwerwise they will be treated as one object later in validations
  $scope.data.end_hour = '12:00'
  $scope.data.title = ''
  $scope.data.desc = ''

  $scope.answers = [{desc: ''}, {desc: ''}]
  $scope.removeAnswer = function(index){
    if($scope.answers.length <= 2)
      $scope.alert('You must provide at least two answers.')
    else
      $scope.answers.splice(index, 1);
  }

  $scope.addAnswer = function(){
    $scope.answers.push({desc: ''})
  }

  $scope.hours = []
  for(i=0; i<24; i++){
    var v = i+':00'
    if(v.length == 4)
      v = '0' + v
    $scope.hours.push(v)
  }

  var now = new Date()
  var offset = now.getTimezoneOffset() / 60
  if(offset < 0)
    $scope.local_time_offset = 'GMT+'+offset*(-1)+'h'
  else
    $scope.local_time_offset = 'GMT+'+offset+'h'

  $scope.validate = function(){
    if($scope.data.title.length == 0){
      alert('Title cannot be blank.')
      return false
    }
    if($scope.data.desc.length == 0){
      alert('Description cannot be blank.')
      return false
    }

    now = new Date()
    var startHour = Number($scope.data.start_hour.split(':')[0])
    var startTime = $scope.data.start_day
    startTime.setHours(startHour)
    var endHour = Number($scope.data.end_hour.split(':')[0])
    var endTime = $scope.data.end_day
    endTime.setHours(endHour)

    if(startTime < now){
      alert('Event cannot start in the past.')
      return false
    }
    
    if(endTime < startTime){
      alert('End date must be after start date.')
      return false
    }   

    var isThereNonEmptyAnswer = false
    $scope.answers.forEach(function(a){
      if(a.desc.length == 0)
        isThereNonEmptyAnswer = true
    })

    if(isThereNonEmptyAnswer){
      $scope.alert('RSVP answer cannot be blank.')
      return false      
    }
    return true
  }

  $scope.send = function(){
    var startHour = Number($scope.data.start_hour.split(':')[0])
    var startTime = $scope.data.start_day
    startTime.setHours(startHour)
    var endHour = Number($scope.data.end_hour.split(':')[0])
    var endTime = $scope.data.end_day
    endTime.setHours(endHour)
    
    var groupID = $scope.data.group.id
    var title = $scope.data.title
    var desc = $scope.data.desc

    $scope.showSpinner(); 
    var createRequest = questions.createPollEvent(groupID, title, desc, startTime, endTime)
    createRequest.then(function(response){
      var pollID = response.data.id
      var addAnswerRequests = []
      $scope.answers.forEach(function(answer){
        var r = questions.addOptionToPoll(pollID, answer.desc)
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