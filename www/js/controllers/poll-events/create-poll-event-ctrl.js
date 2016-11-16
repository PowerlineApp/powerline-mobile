angular.module('app.controllers').controller('createPollEventCtrl',function ($scope, $stateParams,questions, $http, serverConfig, $rootScope, $controller, $q, SequentialAjax) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});
  $scope.prepareGroupPicker(true)

  var tomorrow = new Date();
  tomorrow.setMinutes(0)
  tomorrow.setDate(tomorrow.getDate() + 1); 
  $scope.data.start_day = tomorrow
  $scope.data.start_hour = '12:00'
  $scope.data.end_day = new Date(tomorrow); // we need to clone othwerwise they will be treated as one object later in validations
  $scope.data.end_hour = '12:00'
  $scope.data.title = ''
  $scope.data.desc = ''

  $scope.answers = [{desc: '', placeholder: 'Yes, I can make it'}, {desc: '', placeholder: 'No, I can\'t make it'}]
  $scope.removeAnswer = function(index){
    if($scope.answers.length <= 2)
      $scope.validationAlert('You must provide at least two answers.')
    else
      $scope.answers.splice(index, 1);
  }

  $scope.addAnswer = function(){
    $scope.answers.push({desc: '', placeholder: 'Type RSVP answer here'})
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
      $scope.validationAlert('Title cannot be blank.')
      return false
    }
    if($scope.data.desc.length == 0){
      $scope.validationAlert('Description cannot be blank.')
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
      $scope.validationAlert('Event cannot start in the past.')
      return false
    }
    
    if(endTime < startTime){
      $scope.validationAlert('End date must be after start date.')
      return false
    }   

    var isThereNonEmptyAnswer = false
    $scope.answers.forEach(function(a){
      if(a.desc.length == 0)
        isThereNonEmptyAnswer = true
    })

    if(isThereNonEmptyAnswer){
      $scope.validationAlert('RSVP answer cannot be blank.')
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
    var createRequest = questions.createPollEvent(groupID, title, desc, startTime, endTime, $scope.sectionsToPublishIn())
    createRequest.then(function(response){
      var pollID = response.data.id
      var sqAjax = new SequentialAjax()
      $scope.answers.forEach(function(answer){
        sqAjax.add(function(){
          return questions.addOptionToPoll(pollID, answer.desc)
        })
      })
      sqAjax.whenDone().then(function(){
        questions.publishPoll(pollID).then(function(response){
          $scope.hideSpinner();
          $rootScope.showToast('Event successfully created!');
          $rootScope.path('/leader-event/'+response.data.id);
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