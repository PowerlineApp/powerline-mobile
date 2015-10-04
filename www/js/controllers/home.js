angular.module('app.controllers').controller('home', function ($scope, topBar, socialActivity, homeCtrlParams,
                                                               profile, activity, groups, flurry, layout) {
  topBar.setHomeBar();
  topBar.set('right', {
    btnClass: 'btn-new-post',
    click: function () {
      $scope.showPostWindow = !$scope.showPostWindow;
      $scope.execApply();
    }
  });

  layout.setContainerClass('news-feed');

  flurry.log('news feed');

  $scope.newPost = function (type) {
    var types = {
      1: 'long petition',
      2: 'quorum'
    };
    $scope.path('/micro-petitions/add/' + types[type] + '/' +
      (homeCtrlParams.filter.selectedGroup ? homeCtrlParams.filter.selectedGroup.id : ''));
  };

  if (!profile.get()) {
    profile.load();
  }
  $scope.filter = homeCtrlParams.filter;

  var activities = activity.getActivities();

  function getActivities() {
    $scope.activities = homeCtrlParams.filter.selectedGroup ? homeCtrlParams.filter.selectedGroup.activities
      : activities.getFilteredModels();
  }

  function getUnansweredCount(activities) {
    return _(activities).reduce(function (memo, activity) {
      return (activity.get('answered') || activity.get('closed') || activity.get('ignore_count')) ? memo : ++memo;
    }, 0);
  }

  function prepare() {
    homeCtrlParams.loaded = true;
    activities.setDeferredRead().sort();
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

    getActivities();
    $scope.loading = false;

    activity.saveRead();
  }

  $scope.$watch('filter.selectedGroup', getActivities);
  $scope.$watch('filter.selectedGroup', function (value) {
    topBar.set('title', value ? value.getTitle() + ' Powerline' : 'Powerline');
  });

  getActivities();

  if (!homeCtrlParams.loaded) {
    $scope.loading = true;
    activity.load().then(function () {
      prepare();
      $scope.$emit('home.activities-reloaded');
    }, prepare).finally(socialActivity.load);
  } else {
    prepare();
  }

  $scope.$on('notification.received', function () {
    activity.load().then(prepare, prepare);
  });

  $scope.$on('activity.reload', function () {
    activity.load().then(prepare, prepare);
  });

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
      steps.push(steps[steps.length-1] + step);
    }
    return steps;
  };
});

angular.module('app.controllers').run(function(homeCtrlParams, $document, $rootScope) {
  $document.bind('resume', function() {
    homeCtrlParams.loaded = false;
    $rootScope.$broadcast('activity.reload');
    $rootScope.execApply();
  });
});

angular.module('app.controllers').controller('preload', function (topBar) {
  topBar.reset().set('title', 'Powerline').set('menu', true);
});

angular.module('app.controllers').directive('iActivity', function($rootScope, questions, petitions, discussion, elapsedFilter) {

  function eventCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/event.html';
  }

  function newsCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/news.html';
    $scope.entity = $scope.activity.get('entity');
    $scope.rate = function(action) {
      $scope.sending = true;
      discussion.loadRoot('poll', $scope.entity.id).then(function(comment) {
        discussion.rate(comment, action).then(function(comment) {
          $scope.activity.set('rate_up', comment.rate_up).set('rate_down', comment.rate_down);
          $scope.sending = false;
        }, function() {
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
    $scope.booster = (85 * ($scope.activity.get('owner').type === 'group' ? 100 : $scope.activity.getQuorumCompletedPercent())) / 100;
    $scope.sign = function(optionId) {
      $scope.sending = true;
      petitions.answer($scope.activity.get('entity').id, optionId).then(function(answer) {
        $scope.activity.set('answer', answer).set('answered', true);
        $scope.sending = false;
      });
    };
    $scope.unsign = function() {
      $scope.sending = true;
      petitions.unsign($scope.activity.get('entity').id, $scope.activity.get('answer').option_id).then(function() {
        $scope.activity.set('answered', false).set('answer', null);
        $scope.sending = false;
      });
    };
  }

  function petitionCtrl($scope) {
    $scope.templateSrc = 'templates/home/activities/petition.html';
    $scope.answer = function() {
      $scope.sending = true;
      if ($scope.answerAction === 'sign') { $scope.sign(); } else { $scope.unsign(); }
      $scope.answerAction = '';
    };
    $scope.$watch(function() {
      return $scope.activity.get('answer');
    }, function(answer) {
      $scope.answerAction = answer ? 'unsign' : 'sign';
    });
    $scope.sign = function() {
      questions.load($scope.activity.get('entity').id).then(function(question){
        question.answer({
          privacy: 0,
          comment: '',
          option_id: question.options[0].id
        }).then(function(answer) {
          $scope.activity.set('answer', answer).set('answered', true);
          $scope.sending = false;
        });
      });
    };
    $scope.unsign = function() {
      $scope.answerAction = '';
      var answer = $scope.activity.get('answer');
      questions.unsignFromPetition(answer.question.id, answer.option_id).then(function() {
        $scope.activity.set('answer', null).set('answered', false);
        $scope.sending = false;
      });
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
    'micro-petition': postCtrl,
    'petition': petitionCtrl,
    'question': questionCtrl
  };

  return {
    scope: {
      activity: '='
    },
    restrict: 'E',
    template: '<ng-include src="templateSrc"></ng-include>',
    controller: function($scope) {
      $scope.navigateTo = $rootScope.navigateTo;
      $scope.navigateToActivity = function(activity, focus) {
        activity.setRead();
        $rootScope.navigateTo('activity', activity, focus);
      };

      $scope.title = $scope.activity.get('title');
      $scope.description = $scope.activity.get('description');
      $scope.avatar_file_path = $scope.activity.get('owner').avatar_file_path;
      $scope.iconClass = $scope.activity.getIcon();
      $scope.official_title = $scope.activity.get('owner').official_title;
      $scope.full_name = [$scope.activity.get('owner').first_name, $scope.activity.get('owner').last_name].join(' ');
      $scope.owner_info_1 = $scope.activity.get('owner_info_1');
      $scope.sent_at_elapsed = elapsedFilter($scope.activity.get('sent_at'));
      $scope.responses_count = $scope.activity.get('responses_count');

      var entity = $scope.activity.get('entity');

      if (ctrlByType[entity.type]) {
        ctrlByType[entity.type]($scope);
      } else if (ctrlByType[entity.type_default]) {
        $scope.templateSrc = 'templates/home/activities/default.html';
      }
    }
  };
});