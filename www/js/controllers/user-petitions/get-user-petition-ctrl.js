angular.module('app.controllers').controller('getUserPetitionCtrl',function ($scope,  $stateParams,
                                   layout, $ionicPopup, $rootScope, userPetitions, activity) {
                                   
  $scope.placeholders = ['It\'s all about different perspectives. Be kind.',
                          'Don\'t attack people. Understand them.',
                          'Listen first. Then ask questions'];
  $scope.placeholder = '';

  $scope.$on('$ionicView.beforeEnter', function(){
    var indexPlaceholder = JSON.parse( window.localStorage.getItem('indexPlaceholder'));
    if (typeof indexPlaceholder === "undefined" || indexPlaceholder == null){
      indexPlaceholder = 0;
    }else{
      indexPlaceholder = parseInt(indexPlaceholder);
    }
    $scope.placeholder = $scope.placeholders[indexPlaceholder%3];
    indexPlaceholder++;
    window.localStorage.setItem( 'indexPlaceholder', JSON.stringify(indexPlaceholder));
  })

  if (!$scope.userPetition) {
    $scope.showSpinner();
  }

  $scope.sign = function(){
    $scope.userPetition.sign().then(function(){
      $scope.showToast('User petition signed!');
    })
  }

  $scope.unsign = function(){
    $scope.userPetition.unsign().then(function(){
      $scope.showToast('User petition unsigned!');
    })
  }

  $scope.inEditMode = false;
  $scope.onEditBtnClicked = function(){
    $scope.inEditMode = !$scope.inEditMode;
    if(!$scope.inEditMode)
      $scope.userPetition.updateBodyText().then(function(){
          activity.youShouldRefreshActivities()
          $scope.showToast('User petition description updated.');        
      })
  }

  $scope.deleteClicked = false;
  $scope.showDeleteConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      cssClass: 'deleteConfirmTitle',
      title: 'Delete User Petition',
      template: 'Are you sure you want to delete this user petition?'
    });

    confirmPopup.then(function(res) {
      $scope.navigateTo = $rootScope.navigateTo;
      if(res){
        $scope.userPetition.delete().then(function(){
          activity.youShouldRefreshActivities()
          $scope.showToast('User petition deleted.');
          $scope.back();
        })
      }
    });
  };

  $scope.signedResultInPercents = 0
  userPetitions.get($stateParams.id).then(function (userPetition) {
    $scope.hideSpinner();
    $scope.userPetition = userPetition;
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

  $scope.searchByTag = function(e){
    if (e && e.target.tagName.toLowerCase() === 'hash-tag') {
      $rootScope.openTag(angular.element(e.target).text());
    }
  }

})