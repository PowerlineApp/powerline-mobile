angular.module('app.controllers').controller('createAnnouncementCtrl',function ($scope, $controller, $rootScope, $q, serverConfig, $http) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});
  $scope.prepareGroupPicker(true)
  $scope.data.announcement_text = ''

  $scope.validate = function(){
    if($scope.data.announcement_text.length == 0){
      $scope.validationAlert('Announcement message cannot be blank.')
      return false
    }
    return true
  }

  $scope.send = function(){
    $scope.showSpinner();
    createAnnouncement($scope.data.announcement_text, $scope.data.group.id).then(function(response){
      var aID = response.data.id
      publishAnnouncement(aID).then(function(){
          $scope.hideSpinner();
          $rootScope.showToast('Announcement successfully created!');
          $rootScope.back();
      })

    }, function(error){
      $scope.hideSpinner();
      if(error.status == 403)
        $scope.createContentAlert('You are not allowed to create Announcement in this group')
      else
        $scope.createContentAlert('Error occured while creating Announcement: '+JSON.stringify(error.data))
    })
  }

  var createAnnouncement = function(message, groupID){
    var data = {content: message} 
    if($scope.sectionsToPublishIn())
      data.group_sections = $scope.sectionsToPublishIn()
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/announcements', payload, headers)
  }

  var publishAnnouncement = function(aID){
    return $http.patch(serverConfig.url + '/api/v2/announcements/'+aID)
  } 


})