angular.module('app.controllers').controller('getPetitionCtrl',function ($scope,  $stateParams,
                                   layout, $ionicPopup, $rootScope, petitions) {
                  
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

  if (!$scope.petition) {
    $scope.showSpinner();
  }

  $scope.data = {privacy: 'public'}

  $scope.sign = function(){
    $scope.petition.sign($scope.data.privacy)
  }

  $scope.unsign = function(){
    $scope.petition.unsign()
  }

  $scope.signedResultInPercents = 0
  petitions.get($stateParams.id).then(function (petition) {
    $scope.hideSpinner();
    $scope.petition = petition;
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

})