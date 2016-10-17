angular.module('app.controllers').controller('createPollDiscussionCtrl',function ($scope, $stateParams,questions, groups, profile, $http, serverConfig, $rootScope) {
  $scope.groupID = $stateParams.groupID;
  $scope.groups = groups.groupsJoinedByCurrentUser();
  $scope.data = {discussion_description: ''}

  if ($scope.groupID) 
    $scope.data.group = groups.getGroup($scope.groupID)
  else 
    $scope.data.openChoices = true;

  $scope.send = function(){
    if($scope.data.discussion_description.length == 0){
      alert('Discussion topic cannot be blank.')
      return false
    }

    var groupID = $scope.data.group.id
    var data = {subject: $scope.data.discussion_description,type: 'news'} 
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    $scope.showSpinner();
    var createDiscussionRequest = $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
    createDiscussionRequest.then(function(response){
      var discussionID = response.data.id
      questions.publishPoll(discussionID).then(function(){
        $scope.hideSpinner();
        $rootScope.showToast('Discussion successfully created!');
        $rootScope.back();
      }, function(error){
        $scope.hideSpinner();
        console.log(error)
        alert('Failed to publish discussion due to: '+JSON.stringify(error.data))
      })
    }, function(error){
      $scope.hideSpinner();
      if(error.status == 403)
        $scope.alert('You are not allowed to create discussion in this group')
      else
        $scope.alert('Error occured while creating Poll: '+JSON.stringify(error.data))
    })
  }
})