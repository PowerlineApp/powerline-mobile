angular.module('app.controllers').controller('getPostCtrl',function ($scope, topBar, $stateParams, loaded, $cacheFactory, $state,
                                   homeCtrlParams, activity, layout, $ionicPopup, $rootScope, posts, groups) {

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
      template: 'Are you sure you want to delete this post?',
      cssClass: 'popup-by-ionic'
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
      $scope.group = groups.get(post.groupID)
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

  $scope.searchByTag = function(e){
    if (e && e.target.tagName.toLowerCase() === 'hash-tag') {
      $rootScope.openTag(angular.element(e.target).text());
    }
  }

  $scope.isBoostable = function(){
    var notBoostedYet = $scope.post && !$scope.post.isBoosted()
    var currentUserCanBoost = $scope.group && ($scope.group.currentUserIsManager() || $scope.group.currentUserIsOwner())
    return notBoostedYet && currentUserCanBoost
  }

  $scope.onBoostButtonClicked = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Boost Post',
      template: 'Manually boost this item? All group members will be notified immediately. Consider adding a comment to help guide the conversation.',
      cssClass: 'popup-by-ionic',
    });

    confirmPopup.then(function(res) {
      if(res) {
        $scope.showSpinner()
        $scope.post.boost().then(function(){
          $scope.hideSpinner()
          $scope.showToast('Post boosted successfully.')
        }, function(error){
          $scope.hideSpinner()
          $ionicPopup.alert({
            cssClass: 'popup-by-ionic',
            title: 'Failed to create content',
            template: JSON.stringify(error)
          });
        })
      }
    })
  }
})