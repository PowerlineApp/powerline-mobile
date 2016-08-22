angular.module('app.controllers').controller('influences.search',function ($scope, follows, facebook, profile, influencesCD, $rootScope) {

  var user = profile.get();

  if (user && user.facebook_id && facebook.getFriends().length) {
    $scope.showSpinner();
    follows.loadSuggested(facebook.getFriends()).then(function (suggested) {
      $scope.hideSpinner();
      $scope.suggested = suggested;
    }, function () {
      $scope.hideSpinner();
    });
  }

  $scope.results = [];
  $scope.data = {
    query: '',
    page: 1,
    max_count: 25
  };

  $scope.search = function () {
    $scope.data.page = 1;
    $scope.results = [];
    if($scope.data.query && $scope.data.query.length > 0)
      load();
  };

  $scope.more = function () {
    $scope.data.page++;
    load();
  };

  $scope.follow = function (item) {
    item.followByCurrentUser()
    $scope.results = _($scope.results).without(item);
    $scope.showToast('Follow request sent!');
  };

  $scope.facebookFollow = function (item) {
    $scope.showSpinner();
    item.$changeStatus({status: 'follow'}, function () {
      follows.loadSuggested(facebook.getFriends()).then(function (suggested) {
        $scope.hideSpinner();
        $scope.suggested = suggested;
      }, loaded);
    }, loaded);
  };

  function load() {
    $scope.showSpinner();
    follows.searchForUsersFollowableByCurrentUser($scope.data.query, $scope.data.page, $scope.data.max_count).then(function (results) {
      $scope.results = results
      $scope.hideSpinner();
    }, loaded);
  }

  function loaded() {
    $scope.hideSpinner();
    influencesCD.view = 'following';
    $rootScope.$broadcast('influences-updated');
    $scope.path('/influences');
  }

})