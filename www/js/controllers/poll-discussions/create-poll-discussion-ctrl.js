angular.module('app.controllers').controller('createPollDiscussionCtrl',function ($scope, $stateParams,questions, $controller, $http, serverConfig, $rootScope) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});
  $scope.prepareGroupPicker(true)
  
  $scope.data.discussion_description = ''

  $scope.validate = function(){
    if($scope.data.discussion_description.length == 0){
      $scope.validationAlert('Discussion topic cannot be blank.')
      return false
    }
    return true
  }

  $scope.send = function(){
    var groupID = $scope.data.group.id
    var data = {subject: $scope.data.discussion_description,type: 'news'} 
    if($scope.sectionsToPublishIn())
      data.group_sections = $scope.sectionsToPublishIn()
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    $scope.showSpinner();
    var createDiscussionRequest = $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
    createDiscussionRequest.then(function(response){
      var discussionID = response.data.id
      questions.publishPoll(discussionID).then(function(response){
        $scope.hideSpinner();
        $rootScope.showToast('Discussion successfully created!');
        $rootScope.path('/question/news/'+response.data.id);
      }, function(error){
        $scope.hideSpinner();
        console.log(error)
        $scope.createContentAlert('Failed to publish discussion due to: '+JSON.stringify(error.data))
      })
    }, function(error){
      $scope.hideSpinner();
      if(error.status == 403)
        $scope.createContentAlert('You are not allowed to create discussion in this group')
      else
        $scope.createContentAlert('Error occured while creating Poll: '+JSON.stringify(error.data))
    })
  }
})