angular.module('app.controllers').controller('getPostCtrl',function ($scope, topBar, $stateParams, loaded, $cacheFactory, $state,
                                   homeCtrlParams, activity, layout, $ionicPopup, $rootScope, posts) {

  $scope.showSpinner();
  $scope.inEditMode = false;
  $scope.deleteClicked = false;
  $scope.onEditBtnClicked = function(){
    $scope.inEditMode = !$scope.inEditMode;
    if(!$scope.inEditMode)
      $scope.post.updateBodyText().then(function(){
        activity.youShouldRefreshActivities()
        $scope.showToast('Post description updated.');       
      })
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

  var loadPost = function(){
    posts.get($stateParams.id).then(function (post) {
      $scope.hideSpinner();
      $scope.post = post;
      $scope.activeAnswerType = post.getMyAnswerType()
    }, function(){
      $scope.hideSpinner();
    });
  }

  loadPost()

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
    if(!$scope.submitDisabled())
      $scope.post.vote($scope.activeAnswerType).then(function(){
        $scope.showToast('Your vote was recorded.');  
        loadPost()
      })
  }

  $scope.undoAnswer = function(){
    $scope.post.unvote().then(function(){
      $scope.showToast('Your vote was removed.');  
      loadPost()
    })
  }  

  $scope.canAnswer = function(){
    return $scope.post && !$scope.post.expired() && !$scope.post.ownedByCurrentUser()
  }

  $scope.selectedAlreadyAnsweredAnswer = function(){
    return $scope.post && $scope.post.getMyAnswerType() && $scope.post.getMyAnswerType() == $scope.activeAnswerType
  }


})