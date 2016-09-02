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
      if(res){
        $scope.post.delete().then(function(){
          activity.youShouldRefreshActivities()
          $scope.showToast('Post deleted.');
          $scope.back();
        })
      }
    });
  };

  $scope.upvoteResultsInPercents = 0
  $scope.downvoteResultsInPercents = 0
  posts.get($stateParams.id).then(function (post) {
    $scope.hideSpinner();
    $scope.post = post;
    $scope.upvoteResultsInPercents = post.getUpvoteResultsInPercents()
    $scope.downvoteResultsInPercents = post.getDownvoteResultsInPercents()
    $scope.activeAnswerType = post.getMyAnswerType()
  }, function(){
    $scope.hideSpinner();
  });

  $scope.activeAnswerType = null
  $scope.isAnswerActive = function(answerType){
    return $scope.activeAnswerType == answerType
  }
  $scope.chooseAnswer = function(answerType){
    $scope.activeAnswerType = answerType
  }

  $scope.submitDisabled = function(){
    return($scope.activeAnswerType == null)
  }
  $scope.submitAnswer = function(){
    if(!$scope.submitDisabled()){
      if($scope.activeAnswerType == 'upvote')
        posts.upvote($scope.post.id)
      else if($scope.activeAnswerType == 'downvote')
        posts.downvote($scope.post.id)
      else if($scope.activeAnswerType == 'ignore')
        posts.ignore($scope.post.id)
    }
  }

  $scope.canAnswer = function(){
    return $scope.post && !$scope.post.expired() && !$scope.post.ownedByCurrentUser()
  }



})