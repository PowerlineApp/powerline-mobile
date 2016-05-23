angular.module('app.controllers').controller('favorite', function ($scope, $timeout, socialActivity, homeCtrlParams,
        profile, favorite, groups, $ionicScrollDelegate) {

  $scope.filter = homeCtrlParams.filter;

  $scope.isLoadMore = false;

  var activities = favorite.getActivities();

  function getActivities() {
    $scope.activities = homeCtrlParams.filter.selectedGroup ? homeCtrlParams.filter.selectedGroup.activities
            : activities.getFilteredModels();
  }

  function getUnansweredCount(activities) {
    return _(activities).reduce(function (memo, favorite) {
      return (favorite.get('answered') || favorite.get('closed') || favorite.get('ignore_count')) ? memo : ++memo;
    }, 0);
  }

  function setFiltersData() {
    homeCtrlParams.filter.groups = groups.getGroupsOptions();
    _(homeCtrlParams.filter.groups).each(function (group) {
      group.activities = activities.getFilteredModels(group);
      group.unansweredCount = getUnansweredCount(group.activities);
      group.read = !_.some(group.activities, function (item) {
        return !item.get('read');
      });
      if (homeCtrlParams.filter.selectedGroup && homeCtrlParams.filter.selectedGroup.id === group.id) {
        homeCtrlParams.filter.selectedGroup = group;
      }
    });
    homeCtrlParams.filter.unansweredCount = getUnansweredCount(activities.getFilteredModels());
  }

  function prepare() {
    homeCtrlParams.loaded = true;
    activities.setDeferredRead().sort();
    setFiltersData();

    getActivities();
    $scope.loading = false;
    $ionicScrollDelegate.resize();

    favorite.saveRead();
  }

  $scope.loadActivities = function(loadType) {
    var prevSize = activities.size();
    favorite.load(loadType).then(function () {
      if (loadType === 'append' && prevSize === activities.size()) {
        $scope.isLoadMore = false;
      } else {
        $scope.isLoadMore = true;
      }
      prepare();
//      $scope.$emit('home.activities-reloaded');
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }, prepare).finally(socialActivity.load);
  }


  $scope.togglePostWindow = function () {
    $scope.showPostWindow = !$scope.showPostWindow;
    $scope.execApply();
  };

  $scope.newPost = function (type) {
    var types = {
      1: 'long petition',
      2: 'quorum'
    };
    $scope.path('/micro-petitions/add/' + types[type] + '/' +
            (homeCtrlParams.filter.selectedGroup ? homeCtrlParams.filter.selectedGroup.id : ''));
    $scope.showPostWindow = false;
  };

  $scope.filterLineStep = function () {
    return 5;
  };

  $scope.steps = function () {
    var items = homeCtrlParams.filter.groups.length - 3;
    items = items > 0 ? items : 0;
    var step = $scope.filterLineStep();
    var stepsCount = Math.ceil(items / step);
    var steps = [3];
    for (var i = 1; i < stepsCount; i++) {
      steps.push(i * step + 3);
    }
    if (items && 0 === items % step) {
      steps.push(steps[steps.length - 1] + step);
    }
    return steps;
  };

  $scope.loadMoreActivities = function () {
    $scope.loadActivities('append');
  };

  $scope.pullToRefresh = function () {
    $scope.loadActivities('clearAndLoad');
  };

  $scope.$watch('filter.selectedGroup', getActivities);
  $scope.$watch('loading', function () {
    if ($scope.loading) {
      $scope.showSpinner();
    } else if ($scope.loading === false) {
      $scope.hideSpinner();
    }
  });

  $scope.$on('notification.received', function () {
    $scope.loadActivities('refresh');
  });

  $scope.$on('favorite.reload', function () {
    $scope.loadActivities('refresh');
  });

  //move scroll to top when filter is changed
  $scope.$watch('filter.selectedGroup', function (nVal) {
    if (typeof (nVal) !== undefined) {
      $timeout(function () {
        $ionicScrollDelegate.resize();
        $ionicScrollDelegate.scrollTop();
      });
    }
  });


  //call this when this view is loaded because this view is cached
  $scope.$on('$ionicView.enter', function () {
      if (activities.size() === 0) {
        $scope.isLoadMore = true;
      } else {
        $scope.loadActivities('refresh');
      }
  });

  //call this because cache may be loaded
  setFiltersData();
  getActivities();
});

angular.module('app.controllers').run(function (homeCtrlParams, $document, $rootScope) {
  $document.bind('resume', function () {
    homeCtrlParams.loaded = false;
    $rootScope.$broadcast('favorite.reload');
    $rootScope.execApply();
  });
});

angular.module('app.controllers').controller('preload', function (topBar, session, profile, $location) {
  if (session.token) {
    if (session.is_registration_complete) {
      profile.load().then(function () {
        profile.checkRemind();
      });
      if (!$location.path() || '/' === $location.path() || '/preload' === $location.path()) {
        $location.path('/main');
      }
    } else {
      $location.path('/profile');
    }
  } else {
    $location.path('/login');
  }
});

angular.module('app.controllers').directive('iActivityFavorite', function ($rootScope, questions, petitions, discussion, elapsedFilter, follows, session, iParse, $sce, favorite, $http, serverConfig) {
  var favorites = favorite.getActivities();

  function eventCtrl($scope) {
    $scope.templateSrc = 'templates/favorite/activities/event.html';
//unfavorite begin

    var type = $scope.favorite.attributes.entity.type;
    var id = $scope.favorite.attributes.id;

    var index = 0
    for (index = 0; index < favorites.models.length; index++){
      var model = favorites.models[index];
      var model_id = model.attributes.id;
      if (model_id == id){
        break;
      }
    }

    $scope.onAddBookmark = function(){
        favorites.models.splice(index, 1);
        $scope.showToast("Removed from Favorites.");
        return $http.post(serverConfig.url + '/api/bookmarks/remove/' + id).then(function (response) {
          
        });        
    }
//unfavorite begin    
  }

  function newsCtrl($scope) {
    $scope.templateSrc = 'templates/favorite/activities/news.html';
    $scope.entity = $scope.favorite.get('entity');
    $scope.rate = function (action) {
      $scope.sending = true;
      discussion.loadRoot('poll', $scope.entity.id).then(function (comment) {
        discussion.rate(comment, action).then(function (comment) {
          $scope.favorite.set('rate_up', comment.rate_up).set('rate_down', comment.rate_down);
          $scope.sending = false;
        }, function () {
          $scope.sending = false;
        });
      });
    };
    //unfavorite begin

    var type = $scope.favorite.attributes.entity.type;
    var id = $scope.favorite.attributes.id;

    var index = 0
    for (index = 0; index < favorites.models.length; index++){
      var model = favorites.models[index];
      var model_id = model.attributes.id;
      if (model_id == id){
        break;
      }
    }

    $scope.onAddBookmark = function(){
        favorites.models.splice(index, 1);
        $scope.showToast("Removed from Favorites.");
        return $http.post(serverConfig.url + '/api/bookmarks/remove/' + id).then(function (response) {
          
        });        
    }
//unfavorite begin
  }

  function paymentCtrl($scope) {
    $scope.templateSrc = 'templates/favorite/activities/payment.html';

  }

  function postCtrl($scope) {
    $scope.templateSrc = 'templates/favorite/activities/post.html';
    $scope.booster = $scope.favorite.get('owner').type === 'group' ? 100 : $scope.favorite.getQuorumCompletedPercent();
    var follow = follows.getByUserId($scope.favorite.get('owner').id);
    $scope.followable = !follow.isFollow();
    if ($scope.followable && follow.isApproved()) {
      $scope.isFollowApproved = true;
    }
    $scope.isFollowShow = follows.loaded && follow.get('user').id !== session.user_id;
    $scope.sign = function (optionId) {
      $scope.sending = true;
      petitions.answer($scope.favorite.get('entity').id, optionId).then(function (answer) {
        $scope.favorite.set('answer', answer).set('answered', true);
        $scope.sending = false;
        if (optionId === 1) {
          $scope.showToast('Post upvoted!');
        }
        if (optionId === 2) {
          $scope.showToast('Post downvoted!');
        }
      });
    };
    $scope.unsign = function () {
      $scope.sending = true;
      petitions.unsign($scope.favorite.get('entity').id, $scope.favorite.get('answer').option_id).then(function () {
        $scope.favorite.set('answered', false).set('answer', null);
        $scope.sending = false;
      });
    };
    $scope.followOwner = function () {
      $scope.sending = true;
      follow.follow().then(function () {
        $scope.favorite.followable = false;
        $scope.sending = false;
        $scope.showToast('Follow request sent!');
      });
    };
    $scope.showToast = $rootScope.showToast;

//unfavorite begin

    var type = $scope.favorite.attributes.entity.type;
    var id = $scope.favorite.attributes.id;

    var index = 0
    for (index = 0; index < favorites.models.length; index++){
      var model = favorites.models[index];
      var model_id = model.attributes.id;
      if (model_id == id){
        break;
      }
    }

    $scope.onAddBookmark = function(){
        favorites.models.splice(index, 1);
        $scope.showToast("Removed from Favorites.");
        return $http.post(serverConfig.url + '/api/bookmarks/remove/' + id).then(function (response) {
          
        });        
    }
//unfavorite begin

  }

  function petitionCtrl($scope) {
    $scope.templateSrc = 'templates/favorite/activities/petition.html';
    $scope.answer = function () {
      $scope.sending = true;
      if ($scope.answerAction === 'sign') {
        $scope.sign();
      } else {
        $scope.unsign();
      }
      $scope.answerAction = '';
    };
    $scope.$watch(function () {
      return $scope.favorite.get('answer');
    }, function (answer) {
      $scope.answerAction = answer ? 'unsign' : 'sign';
    });
    $scope.sign = function () {
      questions.load($scope.favorite.get('entity').id).then(function (question) {
        question.answer({
          privacy: 0,
          comment: '',
          option_id: question.options[0].id
        }).then(function (answer) {
          $scope.favorite.set('answer', answer).set('answered', true);
          $scope.sending = false;
        });
      });
    };
    $scope.unsign = function () {
      $scope.answerAction = '';
      var answer = $scope.favorite.get('answer');
      questions.unsignFromPetition(answer.question.id, answer.option_id).then(function () {
        $scope.favorite.set('answer', null).set('answered', false);
        $scope.sending = false;
      });
    };
//unfavorite begin

    var type = $scope.favorite.attributes.entity.type;
    var id = $scope.favorite.attributes.id;

    var index = 0
    for (index = 0; index < favorites.models.length; index++){
      var model = favorites.models[index];
      var model_id = model.attributes.id;
      if (model_id == id){
        break;
      }
    }

    $scope.onAddBookmark = function(){
        favorites.models.splice(index, 1);
        $scope.showToast("Removed from Favorites.");
        return $http.post(serverConfig.url + '/api/bookmarks/remove/' + id).then(function (response) {
          
        });        
    }
//unfavorite begin
  }

  function questionCtrl($scope) {
    $scope.templateSrc = 'templates/favorite/activities/question.html';

  }

  var ctrlByType = {
    'leader-event': eventCtrl,
    'leader-news': newsCtrl,
    'crowdfunding-payment-request': paymentCtrl,
    'payment-request': paymentCtrl,
    'micro-petition': postCtrl,
    'petition': petitionCtrl,
    'question': questionCtrl
  };

  return {
    scope: {
      favorite: '='
    },
    restrict: 'E',
    template: '<ng-include src="templateSrc"></ng-include>',
    controller: function ($scope) {
      $scope.navigateTo = $rootScope.navigateTo;
      $scope.navigateToActivity = function (favorite, focus, e) {
        favorite.setRead();
        if (e && e.target.tagName.toLowerCase() === 'hash-tag') {
          $rootScope.openTag(angular.element(e.target).text());
        } else {
          $rootScope.navigateTo('favorite', favorite, focus);
        }
      };

      $scope.title = $scope.favorite.get('title');
      $scope.description = $sce.trustAsHtml(iParse.wrapHashTags($scope.favorite.get('description')));
      $scope.avatar_file_path = $scope.favorite.get('owner').avatar_file_path;
      $scope.iconClass = $scope.favorite.getIcon();
      $scope.official_title = $scope.favorite.get('owner').official_title;
      $scope.full_name = [$scope.favorite.get('owner').first_name, $scope.favorite.get('owner').last_name].join(' ');
      $scope.owner_info_1 = $scope.favorite.get('owner_info_1');
      $scope.sent_at_elapsed = elapsedFilter($scope.favorite.get('sent_at'));
      $scope.responses_count = $scope.favorite.get('responses_count');
      $scope.isDefaultAvatar = $rootScope.isDefaultAvatar($scope.avatar_file_path);

      var entity = $scope.favorite.get('entity');

      if (ctrlByType[entity.type]) {
        ctrlByType[entity.type]($scope);
      } else if (ctrlByType[entity.type_default]) {
        $scope.templateSrc = 'templates/home/activities/default.html';
      }
    }
  };
});