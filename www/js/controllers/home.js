angular.module('app.controllers').controller('home', function ($scope, $timeout, socialActivity, homeCtrlParams,
        profile, activity, groups, $ionicScrollDelegate, favorite, $ionicPlatform) {
  $scope.filter = homeCtrlParams.filter;

  $scope.isLoadMore = false;
  var activityCollection = activity.getActivities();

  $scope.changeGroupFilter = function(group){
    var isDifferentGroupThanCurrentlyActive = $scope.filter.selectedGroup != group
    if(!$scope.isSpinnerShow && isDifferentGroupThanCurrentlyActive)
      $scope.showSpinner();
    
    if(isDifferentGroupThanCurrentlyActive){
      // we want to make sure the spinner is displayed prior the rendering starts
      $timeout(function(){
        $scope.filter.selectedGroup = group
      }, 0);
    }

  }

  function refreshListOfActivities() {
    if(homeCtrlParams.filter.selectedGroup)
      $scope.activities = homeCtrlParams.filter.selectedGroup.activities
    else
      $scope.activities = activityCollection.getFilteredModels();
    
    //we want to wait until rendering is finished
    $timeout(function(){
      $scope.hideSpinner()
    }, 0);
  } 

  function setFiltersData() {
    homeCtrlParams.filter.groups = groups.groupsJoinedByCurrentUser();
    _(homeCtrlParams.filter.groups).each(function (group) {
      group.activities = activityCollection.getFilteredModels(group);
      group.inPriorityZoneCount = activityCollection.inPriorityZoneCount(group.activities);
      group.read = !_.some(group.activities, function (item) {
        return !item.get('read');
      });
      if (homeCtrlParams.filter.selectedGroup && homeCtrlParams.filter.selectedGroup.id === group.id) {
        homeCtrlParams.filter.selectedGroup = group;
      }
    });
    homeCtrlParams.filter.inPriorityZoneCount = activityCollection.inPriorityZoneCount(activityCollection.getFilteredModels());
  }

  function prepare() {
    homeCtrlParams.loaded = true;
    activityCollection.sort();
    setFiltersData();

    $scope.loading = false;
    $ionicScrollDelegate.resize();
  }

  function loadActivities(loadType) {
    var prevSize = activityCollection.size();
    activity.load(loadType).then(function () {
      if (loadType === 'append' && prevSize === activityCollection.size()) {
        $scope.isLoadMore = false;
      } else {
        $scope.isLoadMore = true;
      }
      prepare();
      
      $scope.$emit('home.activities-reloaded');
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$broadcast('scroll.infiniteScrollComplete');
      refreshListOfActivities();
    }).finally(socialActivity.load);
  }


  $scope.togglePostWindow = function () {
    $scope.showPostWindow = !$scope.showPostWindow;
    $scope.execApply();
  };

  $scope.createNewContent = function (type) {
    var selectedGroup = homeCtrlParams.filter.selectedGroup ? homeCtrlParams.filter.selectedGroup.id : ''
    var p = '/'+type+'/create/' + selectedGroup
    $scope.path(p);
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
    loadActivities('append');
  };

  $scope.pullToRefresh = function () {
    loadActivities('clearAndLoad');
  };

  $scope.$watch('filter.selectedGroup', refreshListOfActivities);
  $scope.$watch('loading', function () {
    if ($scope.loading) {
      $scope.showSpinner();
    } else if ($scope.loading === false) {
      $scope.hideSpinner();
    }
  });

  $scope.$on('notification.received', function () {
    loadActivities('refresh');
  });

  $scope.$on('activity.reload', function () {
    loadActivities('refresh');
  });

  //move scroll to top when filter is changed
  $scope.$watch('filter.selectedGroup', function (nVal) {
    if (typeof (nVal) !== undefined) {
      $ionicPlatform.ready(function () {
        if($ionicScrollDelegate){
          $ionicScrollDelegate.resize();
          $ionicScrollDelegate.scrollTop();
        }
      })
    }
  });

  //call this when this view is loaded because this view is cached
  $scope.$on('$ionicView.enter', function () {
    if (!profile.get()) {
      profile.load();
    }

    if (!homeCtrlParams.loaded || activity.shouldRefreshActivities()) {
      if (activityCollection.size() === 0) {
        $scope.isLoadMore = true;
      } else {
        loadActivities('refresh');
      }
    } else {
      prepare();
    }

  });
  //call this because cache may be loaded
  setFiltersData();
  refreshListOfActivities();
});

angular.module('app.controllers').run(function (homeCtrlParams, $document, $rootScope) {
  $document.bind('resume', function () {
    homeCtrlParams.loaded = false;
    $rootScope.$broadcast('activity.reload');
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

angular.module('app.controllers').directive('iActivity', function ($rootScope, questions, petitions, discussion, elapsedFilter, follows, session, iParse, $sce, favorite, microPetitions, posts, userPetitions) {

  function eventCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/event.html';
  }

  function newsCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/news.html';
    $scope.entity = $scope.activity.get('entity');
    $scope.rate = function (action) {
      $scope.sending = true;
      discussion.loadRoot('poll', $scope.entity.id).then(function (comment) {
        discussion.rate(comment, action).then(function (comment) {
          $scope.activity.set('rate_up', comment.rate_up).set('rate_down', comment.rate_down);
          $scope.sending = false;
        }, function () {
          $scope.sending = false;
        });
      });
    };
  }

  function paymentCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/payment.html';
  }

  function postCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/post.html';
    $scope.currentUserIsActivityOwner = $scope.activity.get('owner').id == session.user_id
    $scope.booster = $scope.activity.get('owner').type === 'group' ? 100 : $scope.activity.getQuorumCompletedPercent();

    $scope.upvote = function(){
      $scope.sending = true;
      $scope.activity.upvote().then(function(answer){
        $scope.sending = false;
        $scope.showToast('Post upvoted!');
      })
    }

    $scope.downvote = function(){
      $scope.sending = true;
      $scope.activity.downvote().then(function(answer){
        $scope.sending = false;
        $scope.showToast('Post downvoted!');
      })
    }

    $scope.undoVote = function(){
      $scope.sending = true;
      $scope.activity.undoVote().then(function(answer){
        $scope.sending = false;
        $scope.showToast('Post vote undo successful!');
      })
    }

  }

  function userPetitionCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/user-petition.html';

    $scope.sign = function () {
      $scope.sending = true
      $scope.activity.sign().then(function(){
          $scope.sending = false;
          $scope.showToast('User petition signed.');
      })
    };

    $scope.unsign = function () {
      $scope.sending = true;
      $scope.activity.unsign().then(function (response) {
        $scope.sending = false;
        $scope.showToast('User petition unsigned.');
      });
    };    
  }

  function petitionCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/petition.html';

    $scope.sign = function () {
      $scope.sending = true
      $scope.activity.sign().then(function(){
          $scope.sending = false;
          $scope.showToast('Petition signed.');
      })
    };

    $scope.unsign = function () {
      $scope.sending = true
      $scope.activity.unsign().then(function(){
          $scope.sending = false;
          $scope.showToast('Petition unsigned.');
      })
    };
  }

  function questionCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/question.html';
  }

  var ctrlByType = {
    'leader-event': eventCtrl,
    'leader-news': newsCtrl,
    'crowdfunding-payment-request': paymentCtrl,
    'payment-request': paymentCtrl,
    'post': postCtrl,
    'user-petition': userPetitionCtrl,
    'petition': petitionCtrl,
    'question': questionCtrl
  };

  return {
    scope: {
      activity: '='
    },
    restrict: 'E',
    template: '<ng-include src="templateSrc"></ng-include>',
    controller: function ($scope) {
      $scope.activity.prepare()
      $scope.showToast = $rootScope.showToast;
      $scope.navigateTo = $rootScope.navigateTo;
      $scope.isBookmarked = function(){
        return favorite.isBookmarked($scope.activity)
      }
      $scope.bookmarkButtonClicked = function(){
        if($scope.isBookmarked()){
          favorite.removeBookmark($scope.activity)
          $scope.showToast('Item was removed from Favorites');
        } else {
         favorite.addBookmark($scope.activity)
         $scope.showToast('Item was added to Favorites');
        }
      }
      $scope.navigateToActivity = function (activity, focus, e) {

        activity.setRead();
        if (e && e.target.tagName.toLowerCase() === 'hash-tag') {
          $rootScope.openTag(angular.element(e.target).text());
        } else {
          $rootScope.navigateTo('activity', activity, focus);
        }
      };

      // if($scope.activity.get('entity').id == 211)
      //     console.log(JSON.stringify($scope.activity))
      // else return

      $scope.title = $scope.activity.get('title');
      var description_raw = $scope.activity.get('description_html')
      if(description_raw == null || description_raw.length == 0)
        description_raw = $scope.activity.get('description')
      $scope.description = iParse.wrapHashTags(description_raw)
      $scope.avatar_file_path = $scope.activity.get('owner').avatar_file_path;
      $scope.iconClass = $scope.activity.getIcon();
      $scope.sent_at_elapsed = elapsedFilter($scope.activity.get('sent_at'));
      $scope.responses_count = $scope.activity.get('responses_count');
      $scope.comments_count = ($scope.activity.get('comments_count') || 0);
      $scope.isDefaultAvatar = $rootScope.isDefaultAvatar($scope.avatar_file_path);

      var activityOwnerID = $scope.activity.get('owner').id
      var activityOwnerFollow = follows.getOrCreateUser(activityOwnerID);

      $scope.showFollow = follows.loaded && activityOwnerID != session.user_id
      $scope.followClicked = function(){
        if(activityOwnerFollow && activityOwnerFollow.isFollowedByCurrentUser() && activityOwnerFollow.isApproved())
          $scope.showToast('You are following this user');
        else if (activityOwnerFollow && activityOwnerFollow.isFollowedByCurrentUser() && !activityOwnerFollow.isApproved())
          $scope.showToast('Waiting for user to approve...');
        else {
          $scope.sending = true;
          activityOwnerFollow.followByCurrentUser().then(function () {
            $scope.activity.followable = false;
            $scope.sending = false;
            $scope.showToast('Follow request sent!');
            follows.load().then(function(){
              activityOwnerFollow = follows.getOrCreateUser(activityOwnerID);
            })
          });          
          msg = 'Follow request sent!'
        }
      }

      $scope.openUrlInExternalBrowser = function(url){
        if(url.substring(0,4) != 'http')
          url = 'http://'+url
        $rootScope.openSystem(url)
      }

      $scope.followIcons = function(){
        if(activityOwnerFollow && activityOwnerFollow.isFollowedByCurrentUser() && activityOwnerFollow.isApproved())
          return ['icon ion-person calm', 'icon ion-minus-circled']
        else if(activityOwnerFollow && activityOwnerFollow.isFollowedByCurrentUser() && !activityOwnerFollow.isApproved())
          return ['icon ion-person', 'icon ion-android-time calm']
        else
          return ['icon ion-person', 'icon ion-plus-circled calm']
      }

      $scope.subscribeToNotifications = function(){
        $scope.activity.subscribeToNotifications().then(function (response) {
          $scope.showToast('Subscribed to item notifications.');
        })
      }

      $scope.unsubscribeFromNotifications = function(){
        $scope.activity.unsubscribeFromNotifications().then(function (response) {
          $scope.showToast('Unsubscribed from item notifications.');
        })
      }

      var activityType = $scope.activity.dataType()
      if (ctrlByType[activityType]) {
        ctrlByType[activityType]($scope);
      } else {
        $scope.templateSrc = 'templates/home/activities/default.html';
      }
    }
  };
});