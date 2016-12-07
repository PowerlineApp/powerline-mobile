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

  $scope.follow = function (user) {
    user.followByCurrentUser()
    $scope.results = _($scope.results).without(user);
  };

  $scope.facebookFollow = function (facebookFriend) {
    var user = follows.getOrCreateUser(facebookFriend.id)
    $scope.follow(user)
    $scope.suggested = _($scope.suggested).without(facebookFriend);
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