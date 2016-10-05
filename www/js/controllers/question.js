angular.module('app.controllers').controller('question',function ($scope, $location, questions, $stateParams, layout,
                                                                  iStorageMemory, activity) {

  var optionsSubview = 'templates/question/options.html';
  var resultsSubview = 'templates/question/results.html';

  $scope.loading = true;
  $scope.blockedLoading = false;

  questions.load($stateParams.id).then(function (question) {
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
    layout.focus($location.search().focus);
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
  
  $scope.$watch('loading', function(){
    if($scope.loading){
      $scope.showSpinner();
    } else if($scope.loading === false) {
      $scope.hideSpinner();
    }
  });
}).controller('question.answer-form',function ($scope, $state, iStorageMemory, homeCtrlParams, $rootScope) {

  $scope.answer = function () {

    $rootScope.showSpinner();
    $scope.$parent.q.answer($scope.data).then(function () {
      homeCtrlParams.loaded = false;
      $scope.hideSpinner();
      if ($scope.q.recipients) {
        iStorageMemory.put('question-answered-' + $scope.$parent.q.id, 'Your response “' + $scope.$parent.current.title + '” was sent to ' +
          $scope.$parent.q.recipients);
      }
      $state.reload();

    }, function () {
      $rootScope.hideSpinner();
      $state.reload();
    });
  };
  
}).controller('question.influences',function ($scope, $stateParams, questions, questionCache, loaded, $rootScope) {
  $scope.q = questionCache.get($stateParams.id);
  $rootScope.showSpinner();
  questions.loadAnswers($stateParams.id).then(function (answers) {
    $rootScope.hideSpinner();
    $scope.answers = answers;
  }, function(){
    $rootScope.hideSpinner();
  });
  
}).controller('question.news',function ($scope, $location, $stateParams, questions, iJoinFilter, activity, layout) {
  
  $scope.showSpinner();
  questions.load($stateParams.id).then(function (question) {
    $scope.hideSpinner();
    $scope.q = question;
    $scope.shareBody = question.subject;
    $scope.shareImage = question.share_picture;
    layout.focus($location.search().focus);
  }, function(){
    $scope.hideSpinner();
    $scope.back();
  });

}).controller('question.leader-petition', function ($scope, $state, $stateParams, questions, iJoinFilter,
                                                    serverConfig, homeCtrlParams, activity, layout) {
  
  $scope.data = {
    privacy: 0,
    comment: ''
  };
  activity.setEntityRead({id: Number($stateParams.id), type: 'petition'});

  $scope.showSpinner();
  questions.load($stateParams.id).then(function (question) {
    $scope.hideSpinner();
    $scope.q = question;
    $scope.data.option_id = question.options[0].id;

    $scope.shareTitle = question.petition_title;
    $scope.shareBody = question.petition_body;
    $scope.shareLink = serverConfig.shareLink + '/petition/' + question.id;
    $scope.shareImage = question.share_picture;
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();  
    $scope.back();
  });

  $scope.answer = function () {
    $scope.showSpinner();
    $scope.q.answer($scope.data).then(function () {
      homeCtrlParams.loaded = false;
      $state.reload();
    }, function () {
      $state.reload();
    });
  };

  $scope.unsign = function () {
    $scope.showSpinner();
    questions.unsignFromPetition($scope.q.id, $scope.q.options[0].id).then($state.reload, $state.reload);
    homeCtrlParams.loaded = false;
  };
});
