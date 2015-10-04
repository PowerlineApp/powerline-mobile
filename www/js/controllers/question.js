angular.module('app.controllers').controller('question',function ($scope, topBar, questions, $routeParams, layout,
                                                                  iStorageMemory, iJoinFilter, activity, flurry) {

  topBar
    .reset()
    .set('back', true)
    .set('title', 'QUESTION')
  ;

  flurry.log('question', {id: $routeParams.id});

  var optionsSubview = 'templates/question/options.html';
  var resultsSubview = 'templates/question/results.html';

  $scope.loading = true;
  $scope.blockedLoading = false;
  activity.setEntityRead({id: Number($routeParams.id), type: 'question'});

  questions.load($routeParams.id).then(function (question) {
    $scope.loading = false;
    $scope.q = question;

    $scope.shareBody = question.subject;
    $scope.shareImage = question.share_picture;

    if (question.is_answered || question.expired) {
      $scope.subview = resultsSubview;
    } else {
      $scope.subview = optionsSubview;
    }

    $scope.answer_message = iStorageMemory.get('question-answered-' + $scope.q.id);
    if (!$scope.answer_message) {
      $scope.answer_message = question.is_answered ? 'You answered' : ' You did not answer';
    }
    layout.focus($routeParams.focus);
  }, function (error) {
    $scope.alert(error, function () {
      $scope.loading = false;
    }, 'Error', 'OK');
  });

  $scope.current = null;

  $scope.data = {
    comment: '',
    privacy: 0
  };

  $scope.selectOption = function (option) {
    if (option) {
      $scope.data.option_id = option.id;
      $scope.current = option;
    } else {
      $scope.data.option_id = null;
      $scope.current = null;
    }
  };
}).controller('question.answer-form',function ($scope, $route, iStorageMemory, homeCtrlParams, flurry) {

  $scope.loading = false;

  $scope.answer = function () {

    $scope.loading = true;
    $scope.$parent.q.answer($scope.data).then(function () {
      homeCtrlParams.loaded = false;
      flurry.log('answer to question', {id: $scope.$parent.q.id});
      $scope.loading = false;
      if ($scope.q.recipients) {
        iStorageMemory.put('question-answered-' + $scope.$parent.q.id, 'Your response “' + $scope.$parent.current.title + '” was sent to ' +
          $scope.$parent.q.recipients);
      }
      $route.reload();

    }, function () {
      $scope.loading = false;
      $route.reload();
    });
  };
}).controller('question.influences',function ($scope, $routeParams, questions, questionCache, loaded, flurry) {
  $scope.q = questionCache.get($routeParams.id);
  questions.loadAnswers($routeParams.id).then(loaded($scope, function (answers) {
    $scope.answers = answers;
  }), loaded($scope));
}).controller('question.news',function ($scope, topBar, $routeParams, questions, iJoinFilter, activity, flurry, layout) {
  topBar
    .reset()
    .set('back', true)
    .set('title', 'NEWS')
  ;

  flurry.log('leader news', {id: $routeParams.id});
  $scope.loading = true;
  activity.setEntityRead({id: Number($routeParams.id), type: 'leader-news'});

  questions.load($routeParams.id).then(function (question) {
    $scope.loading = false;
    $scope.q = question;
    $scope.shareBody = question.subject;
    $scope.shareImage = question.share_picture;
    layout.focus($routeParams.focus);
  }, $scope.back);

}).controller('question.leader-petition', function ($scope, topBar, $routeParams, questions, $route, iJoinFilter,
                                                    serverConfig, homeCtrlParams, activity, flurry, layout) {
  topBar
    .reset()
    .set('back', true)
    .set('title', 'PETITION')
  ;

  flurry.log('leader petition', {id: $routeParams.id});
  $scope.blockedLoading = false;
  $scope.loading = true;
  $scope.data = {
    privacy: 0,
    comment: ''
  };
  activity.setEntityRead({id: Number($routeParams.id), type: 'petition'});

  questions.load($routeParams.id).then(function (question) {
    $scope.loading = false;
    $scope.q = question;
    $scope.data.option_id = question.options[0].id;

    $scope.shareTitle = question.petition_title;
    $scope.shareBody = question.petition_body;
    $scope.shareLink = serverConfig.shareLink + '/petition/' + question.id;
    $scope.shareImage = question.share_picture;
    layout.focus($routeParams.focus);

  }, $scope.back);

  $scope.answer = function () {
    $scope.blockedLoading = true;
    $scope.q.answer($scope.data).then(function () {
      homeCtrlParams.loaded = false;
      flurry.log('answer to leader petition', {id: $scope.q.id});
      $route.reload();
    }, function () {
      $scope.blockedLoading = false;
      $route.reload();
    });
  };

  $scope.unsign = function () {
    $scope.loading = true;
    questions.unsignFromPetition($scope.q.id, $scope.q.options[0].id).then($route.reload, $route.reload);
    flurry.log('unsign petition', {id: $scope.q.id});
    homeCtrlParams.loaded = false;
  };
});
