angular.module('app.controllers').controller('PostCtrl',function ($scope, topBar, $stateParams, loaded, $cacheFactory, $state,
                                   homeCtrlParams, activity, layout, $ionicPopup, $rootScope, posts) {
                                   
  var cache = $cacheFactory.get('petitionController');
  $scope.petition = cache.get($stateParams.id);

  if (!$scope.post) {
    $scope.showSpinner();
  }

  posts.get($stateParams.id).then(function (post) {
    $scope.hideSpinner();
    $scope.post = post;
      
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
  }, function(){
    $scope.hideSpinner();
  });

})