angular.module('app.controllers').controller('representatives',function ($scope, representatives, iStorageMemory, topBar, flurry) {

  $scope.loading = false;
  $scope.items = representatives.getRepresentativesGroups();
  $scope.navigateToProfile = function (item) {
    $scope.path('/representative/' + (item.representative ? item.representative.id : 0) + '/' + item.storage_id);
  };

  topBar
    .reset()
    .set('menu', true)
    .set('title', 'My Representatives')
  ;

  flurry.log('my representatives');

  if (!$scope.items.length) {
    $scope.loading = true;
  }

  representatives.load().finally(function () {
    $scope.items = representatives.getRepresentativesGroups();
    $scope.loading = false;
  });

}).controller('representatives.profile', function ($scope, representatives, topBar, $stateParams, $location, loaded, activity, flurry) {
  topBar
    .reset()
    .set('back', true)
    .set('title', 'Rep Profile')
  ;
  var id = parseInt($stateParams.id, 10),
    storageId = parseInt($stateParams.storageId, 10)
    ;

  flurry.log('representative profile', {id: $stateParams.id, storage_id: $stateParams.storageId});

  $scope.loading = false;
  $scope.data = representatives.get(id, storageId);

  if ($scope.data) {
    representatives.updateInfo(id);
  } else {
    $scope.loading = true;
    representatives.loadInfo(id, storageId).then(loaded($scope), loaded($scope));
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
    $scope.loading = true;
    representatives.loadCommittees($scope.data.storage_id).then(
      function (committees) {
        $scope.loading = false;
        $scope.committees = committees;
        $scope.committeesLoaded = true;
        flurry.log('committees loaded', {storage_id: $scope.data.storage_id});
      }, function () {
        $scope.loading = false;
      }
    );
  };

  $scope.loadSponsoredBills = function () {
    $scope.loading = true;
    representatives.loadSponsoredBills($scope.data.storage_id).then(
      function (sponsoredBills) {
        $scope.loading = false;
        $scope.sponsoredBills = sponsoredBills;
        $scope.sponsoredBillsLoaded = true;
        flurry.log('sponsored bills loaded', {storage_id: $scope.data.storage_id});
      }, function () {
        $scope.loading = false;
      }
    );
  };

});
