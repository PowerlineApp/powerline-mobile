angular.module('app.controllers').controller('representatives',function ($scope, representatives, $rootScope) {

  $scope.items = [];
  $scope.noRepresentatives = function(){
    return $scope.items.length == 0
  }

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
    var representativeID = item.representative ? item.representative.id : 0
    var ciceroID = item.storage_id
    $scope.path('/representative/' + representativeID + '/' +ciceroID );
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
  
}).controller('representatives.profile', function ($scope, representatives, topBar, $stateParams, $location, loaded, activity) {
  
  var id = parseInt($stateParams.id, 10),
    storageId = parseInt($stateParams.storageId, 10);

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
      }, function () {
        $scope.hideSpinner();
      }
    );
  };

});
