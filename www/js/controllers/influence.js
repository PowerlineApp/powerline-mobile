angular.module('app.controllers').controller('influence.profile',
  function ($scope, users, follows, $stateParams, $state, profile, flurry, activity, $rootScope) {

  var id = parseInt($stateParams.id, 10);

  flurry.log('user profile', {id: id});

  $scope.showSpinner();
  users.load(id).then(function (data) {
    $scope.data = data;
    $scope.hideSpinner();
  }, function () {
    $scope.hideSpinner();
  });

  if (profile.get() && profile.get().id !== id) {
    $scope.follow = follows.getByUserId(id);
  }

  $scope.changeStatus = function (status) {
    if ('unfollow' === status) {
      $scope.confirmAction('Are you sure?').then(function () {
        $scope.follow[status]().then(function(){
        $rootScope.$broadcast('influences-updated');
        $state.reload();
      }, $state.reload);
        flurry.log('unfollow user', {id: id});
        $rootScope.$broadcast('influences-updated');
      });
    } else {
      $scope.follow[status]().then(function(){
        $rootScope.$broadcast('influences-updated');
        $state.reload();
      }, $state.reload);
      flurry.log('follow user', {id: id});
    }
  };

  if ($scope.follow && $scope.follow.get('status')) {
    activity.fetchFollowingActivities($scope.follow.get('user').id).then(function(activities) {
      $scope.activities = activities.models;
    });
  }

}).controller('influences',function ($scope, $location, influencesCD, follows, flurry, $rootScope) {

  flurry.log('my influences');

  function loadInfluences(showSpinner){
    if(showSpinner){
      $scope.showSpinner();
    }
    follows.load().then(function () {
      $scope.$broadcast('follows-loaded');
      $scope.$broadcast('scroll.refreshComplete');
      if(showSpinner){
        $scope.hideSpinner();
      }
    }, function () {
      $scope.$broadcast('scroll.refreshComplete');
      if(showSpinner){
        $scope.hideSpinner();
      }
    });
  }

  $scope.view = influencesCD.view;
  $scope.isEmpty = function () {
    return !follows.size();
  };

  $scope.pullToRefresh = function(){
    loadInfluences();
  };

  $scope.$watch(function () {
    return influencesCD.view;
  }, function () {
    $scope.view = influencesCD.view;
  });
  
  $rootScope.$on('influences-updated', function(){
    loadInfluences(true);
  });
  
  //if this page is opened from menu or there is not data, we should refresh data
  $scope.$on('$ionicView.enter', function(){
    if($scope.isEmpty()/* || $rootScope.menuClicked*/){
      loadInfluences(true);
    }
  });
  
}).controller('influences.tabs',function ($scope, influencesCD, facebook, profile) {

  var user = profile.get();
  if (user && user.facebook_id) {
    facebook.loadFriends();
  }

  $scope.switchView = function (view) {
    influencesCD.view = view;
  };

  $scope.tabLinkClass = function (view) {
    return influencesCD.view === view ? 'active' : '';
  };

}).controller('influences.following',function ($scope, follows, flurry) {

  $scope.data = follows.getFollowing();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getFollowing();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getFollowing();
  });

  $scope.unfollow = function (item) {
    $scope.confirmAction('Are you sure?').then(function () {
      item.unfollow();
      follows.remove(item);
      $scope.data = follows.getFollowing();
      flurry.log('unfollow user', {id: item.get('id')});
    });
  };

}).controller('influences.followers',function ($scope, follows, flurry) {

  $scope.data = follows.getFollowers();
  $scope.$watch(follows.size, function () {
    $scope.data = follows.getFollowers();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getFollowers();
  });

  $scope.remove = function (follows) {
    $scope.confirmAction('Are you sure?').then(function () {
      follows.unapprove();
      flurry.log('unapprove user', {id: follows.get('id')});
    });
  };

}).controller('influences.search',function ($scope, influence, facebook, profile, influencesCD, flurry, $rootScope) {

  var user = profile.get();
  
  if (user && user.facebook_id && facebook.getFriends().length) {
    $scope.showSpinner();
    influence.loadSuggested(facebook.getFriends()).then(function (suggested) {
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
    load();
    flurry.log('search influences');
  };

  $scope.more = function () {
    $scope.data.page++;
    load();
  };

  $scope.follow = function (item) {
    $scope.showSpinner();
    item.$changeStatus({status: 'follow'}, loaded, loaded);
    $scope.results = _($scope.results).without(item);
    flurry.log('follow user', {id: item.id});
  };

  $scope.facebookFollow = function (item) {
    $scope.showSpinner();
    item.$changeStatus({status: 'follow'}, function () {
      influence.loadSuggested(facebook.getFriends()).then(function (suggested) {
        $scope.hideSpinner();
        $scope.suggested = suggested;
      }, loaded);
    }, loaded);
  };

  function load() {
    $scope.showSpinner();
    influence.search($scope.data.query, $scope.data.page, $scope.data.max_count).then(function (results) {
      _(results).each(function (item) {
        $scope.results.push(item);
      });
      $scope.hideSpinner();
    }, loaded);
  }

  function loaded() {
    $scope.hideSpinner();
    influencesCD.view = 'following';
    $rootScope.$broadcast('influences-updated');
    $scope.path('/influences');
  }

}).controller('influences.notifications', function ($scope, $state, layout, flurry, $q, socialActivity, socialActivityTabManager, socialActivityHandler) {

  flurry.log('social feed');
  
  function loadNotifications(){
    socialActivityTabManager.getCurrentTab().setShownAt();
    socialActivityTabManager.getState().reload = false;
    $scope.showSpinner();
    socialActivity.load().finally(function(){
      $scope.hideSpinner();
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.tabYou = socialActivityTabManager.getTab(0);
  $scope.tabFollowing = socialActivityTabManager.getTab(1);
  $scope.socialActivityHandler = socialActivityHandler;
  $scope.setCurrentTab = function (tab) {
    socialActivityTabManager.setCurrentTab(tab);
    tab.setShownAt();
    socialActivityTabManager.getState().setup();
  };


  $scope.currentTab = socialActivityTabManager.getCurrentTab();

  $scope.send = function (promise) {
    if(promise) {
      $scope.showSpinner();
      promise.finally(function () {
        $scope.hideSpinner();
        socialActivityTabManager.getCurrentTab().setShownAt();
        socialActivityTabManager.getState().setup();
      });
    } else {
      socialActivityTabManager.getCurrentTab().setShownAt();
      socialActivityTabManager.getState().setup();
    }
  };
  
  $scope.pullToRefresh = function(){
    socialActivityTabManager.getState().reload = true;
    loadNotifications();
  };
  
  $scope.$on('$ionicView.enter', function(){
    if (socialActivityTabManager.getState().reload) {
      loadNotifications();
    }
  });
  

}).directive('saItem', function () {
  return {
    restrict: 'E',
    template: '<ng-include src="template"></ng-include>',
    link: function (scope) {
      scope.template = 'templates/influence/sa-items/' + scope.item.getWidgetType() + '.html';
    }
  };
}).value('influencesCD', {
  view: 'following'
});
