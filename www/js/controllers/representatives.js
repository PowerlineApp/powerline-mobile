angular.module('app.controllers').controller('representatives',function ($scope, representatives, flurry, $rootScope) {

  flurry.log('my representatives');
  
  $scope.items = [];

  function loadRepresentatives(showSpinner){
    $scope.items = representatives.getRepresentativesGroups();
    
    if (showSpinner) {
      $scope.showSpinner();
    }
    
    representatives.load().finally(function () {
      $scope.items = representatives.getRepresentativesGroups();
      if (showSpinner) {
        $scope.hideSpinner();
      }
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
  
  $scope.navigateToProfile = function (item) {
    $scope.path('/representative/' + (item.representative ? item.representative.id : 0) + '/' + item.storage_id);
  };

  $scope.pullToRefresh = function(){
    loadRepresentatives();
  };
  
  //if this page is opened from menu or there is not data, we should refresh data
  $scope.$on('$ionicView.enter', function(){
    if($scope.items.length === 0/* || $rootScope.menuClicked*/){
      loadRepresentatives(true);
    }
  });
  
}).controller('representatives.profile', function ($scope, representatives, topBar, $stateParams, $location, loaded, activity, flurry) {
  
  var id = parseInt($stateParams.id, 10),
    storageId = parseInt($stateParams.storageId, 10);

  flurry.log('representative profile', {id: $stateParams.id, storage_id: $stateParams.storageId});

  $scope.data = representatives.get(id, storageId);

  if ($scope.data) {
    representatives.updateInfo(id);
  } else {
    $scope.showSpinner();
    representatives.loadInfo(id, storageId).then(function(){
      $scope.hideSpinner();
    }, function(){
      $scope.hideSpinner();
    });
  }

  $scope.$watch(function () {
    return representatives.get(id, storageId);
  }, function (newValue) {
    $scope.data = newValue;
    if (newValue && newValue.id) {
      $scope.activities = activity.getActivities().filter(function (item) {
        return item.get('owner').type === 'representative' && item.get('owner').id === newValue.id;
      });
    }
  });

  $scope.loadCommittees = function () {
    $scope.showSpinner();
    representatives.loadCommittees($scope.data.storage_id).then(
      function (committees) {
        $scope.hideSpinner();
        $scope.committees = committees;
        $scope.committeesLoaded = true;
        flurry.log('committees loaded', {storage_id: $scope.data.storage_id});
      }, function () {
        $scope.hideSpinner();
      }
    );
  };

  $scope.loadSponsoredBills = function () {
    $scope.showSpinner();
    representatives.loadSponsoredBills($scope.data.storage_id).then(
      function (sponsoredBills) {
        $scope.hideSpinner();
        $scope.sponsoredBills = sponsoredBills;
        $scope.sponsoredBillsLoaded = true;
        flurry.log('sponsored bills loaded', {storage_id: $scope.data.storage_id});
      }, function () {
        $scope.hideSpinner();
      }
    );
  };

});
