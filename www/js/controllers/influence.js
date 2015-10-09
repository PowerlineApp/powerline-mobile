angular.module('app.controllers').controller('influence.profile',
  function ($scope, topBar, users, follows, $stateParams, loaded, $state,
            profile, flurry, activity) {

  var id = parseInt($stateParams.id, 10);

  flurry.log('user profile', {id: id});

  $scope.$emit('showSpinner');
  users.load(id).then(function (data) {
    $scope.data = data;
    $scope.$emit('hideSpinner');
  }, function () {
    $scope.$emit('hideSpinner');
  });

  if (profile.get() && profile.get().id !== id) {
    $scope.follow = follows.getByUserId(id);
  }

  $scope.changeStatus = function (status) {
    if ('unfollow' === status) {
      $scope.confirmAction('Are you sure?').then(function () {
        $scope.follow[status]().then($state.reload, $state.reload);
        flurry.log('unfollow user', {id: id});
      });
    } else {
      $scope.follow[status]().then($state.reload, $state.reload);
      flurry.log('follow user', {id: id});
    }
  };

  if ($scope.follow && $scope.follow.get('status')) {
    activity.fetchFollowingActivities($scope.follow.get('user').id).then(function(activities) {
      $scope.activities = activities.models;
    });
  }

}).controller('influences',function ($scope, topBar, $location, influencesCD, follows, flurry) {

  topBar
    .reset()
    .set('menu', true)
    .set('title', 'My Influences')
    .set('right', {
      btnClass: 'btn-plus',
      click: function () {
        $location.path('/influences/add');
      }
    })
  ;

  flurry.log('my influences');

  $scope.view = influencesCD.view;
  $scope.isEmpty = function () {
    return !$scope.loading && !follows.size();
  };

  $scope.loading = true;
  follows.load().then(function () {
    $scope.$broadcast('follows-loaded');
    $scope.loading = false;
  }, function () {
    $scope.loading = false;
  });

  $scope.$watch(function () {
    return influencesCD.view;
  }, function () {
    $scope.view = influencesCD.view;
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

}).controller('influences.search',function ($scope, topBar, influence, facebook, profile, influencesCD, flurry) {

  topBar
    .reset()
    .set('back', true)
    .set('title', 'My Influences')
  ;
  var user = profile.get();
  $scope.loading = false;

  if (user && user.facebook_id && facebook.getFriends().length) {
    $scope.loading = true;
    influence.loadSuggested(facebook.getFriends()).then(function (suggested) {
      $scope.loading = false;
      $scope.suggested = suggested;
    }, function () {
      $scope.loading = false;
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
    $scope.loading = true;
    item.$changeStatus({status: 'follow'}, loaded, loaded);
    $scope.results = _($scope.results).without(item);
    flurry.log('follow user', {id: item.id});
  };

  $scope.facebookFollow = function (item) {
    $scope.loading = true;
    item.$changeStatus({status: 'follow'}, function () {
      influence.loadSuggested(facebook.getFriends()).then(function (suggested) {
        $scope.loading = false;
        $scope.suggested = suggested;
      }, loaded);
    }, loaded);
  };

  function load() {
    $scope.loading = true;
    influence.search($scope.data.query, $scope.data.page, $scope.data.max_count).then(function (results) {
      _(results).each(function (item) {
        $scope.results.push(item);
      });
      $scope.loading = false;
    }, loaded);
  }

  function loaded() {
    $scope.loading = false;
    influencesCD.view = 'following';
    $scope.path('/influences');
  }

}).controller('influences.notifications', function ($scope, follows, topBar, layout, flurry, $q, socialActivity, socialActivityTabManager, socialActivityHandler) {

  topBar.setHomeBar();
  layout.setContainerClass('followers-notifications');

  flurry.log('social feed');

  $scope.loading = true;
  $scope.tabYou = socialActivityTabManager.getTab(0);
  $scope.tabFollowing = socialActivityTabManager.getTab(1);
  $scope.socialActivityHandler = socialActivityHandler;
  $scope.setCurrentTab = function (key) {
    socialActivityTabManager.setCurrentTab(key);
    socialActivityTabManager.getCurrentTab().setShownAt();
    socialActivityTabManager.getState().setup();
  };

  var promises = [];

  if (socialActivityTabManager.getState().reload) {
    socialActivityTabManager.getCurrentTab().setShownAt();
    socialActivityTabManager.getState().reload = false;
    promises.push(socialActivity.load());
  }

  $scope.currentTab = socialActivityTabManager.getCurrentTab();

  $q.all(promises).finally(function () {
    $scope.loading = false;
  });

  $scope.send = function (promise) {
    if(promise) {
      $scope.loading = true;
      promise.finally(function () {
        $scope.loading = false;
        socialActivityTabManager.getCurrentTab().setShownAt();
        socialActivityTabManager.getState().setup();
      });
    } else {
      socialActivityTabManager.getCurrentTab().setShownAt();
      socialActivityTabManager.getState().setup();
    }
  };

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
