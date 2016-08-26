angular.module('app.controllers').controller('getPostCtrl',function ($scope, topBar, $stateParams, loaded, $cacheFactory, $state,
                                   homeCtrlParams, activity, layout, $ionicPopup, $rootScope, posts) {

  $scope.showSpinner();
  $scope.inEditMode = false;
  $scope.deleteClicked = false;
  $scope.onEditBtnClicked = function(){
    $scope.inEditMode = !$scope.inEditMode;
    if(!$scope.inEditMode)
      $scope.post.updateBodyText()
  };

  $scope.showDeleteConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Post',
      template: 'Are you sure you want to delete this post?'
    });

    confirmPopup.then(function(res) {
      $scope.navigateTo = $rootScope.navigateTo;
      if(res){
        $scope.post.delete()
        // TODO show toast and reload activities
        $scope.back();
      }
    });
  };

  posts.get($stateParams.id).then(function (post) {
    $scope.hideSpinner();
    $scope.post = post;
    //$scope.activeAnswer
  }, function(){
    $scope.hideSpinner();
  });

  $scope.activeAnswer = null
  $scope.isAnswerActive = function(answerType){
    return $scope.activeAnswer == answerType
  }
  $scope.chooseAnswer = function(answerType){
    $scope.activeAnswer = answerType
  }

  $scope.submitDisabled = function(){
    return($scope.activeAnswer == null)
  }
  $scope.submitAnswer = function(){
    if(!$scope.submitDisabled()){
      if($scope.activeAnswer == 'upvote')
        posts.upvote($scope.post.id)
      else if($scope.activeAnswer == 'downvote')
        posts.downvote($scope.post.id)
      else if($scope.activeAnswer == 'ignore')
        posts.ignore($scope.post.id)
    }
  }

})