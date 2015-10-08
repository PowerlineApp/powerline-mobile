angular.module('app.controllers')
  .controller('question.leader-event', function ($scope, topBar, $stateParams, questions, activity, flurry,
                                                 homeCtrlParams, $state, layout) {
    
    $scope.data = {
      comment: '',
      privacy: 0
    };

    flurry.log('leader event', {id: Number($stateParams.id)});

    activity.setEntityRead({id: Number($stateParams.id), type: 'leader-event'});

    $scope.$emit('showSpinner');
    questions.load($stateParams.id).then(function (question) {
      $scope.$emit('hideSpinnerr');
      $scope.q = question;

      $scope.shareTitle = question.title;
      $scope.shareBody = question.subject;
      //$scope.shareLink = serverConfig.shareLink + '/payment-request/' + question.id;
      $scope.shareImage = question.share_picture;
      layout.focus($stateParams.focus);

    }, function(){
      $scope.$emit('hideSpinner');
      $scope.back();
    });

    $scope.select = function (option) {
      $scope.data.option = option;
      if (option.payment_amount || option.is_user_amount) {
        $scope.data.showCardsInfo = true;
      } else {
        $scope.data.showAnswerForm = true;
      }
    };

    $scope.submit = function () {
      $scope.answerLoading = true;
      $scope.q.answer({
        option_id: $scope.data.option.id,
        comment: $scope.data.comment,
        privacy: $scope.data.privacy,
        payment_amount: $scope.data.payment_amount
      }).then(function () {
        homeCtrlParams.loaded = false;
        flurry.log('answer to event', {id: Number($stateParams.id)});
        $scope.addToCalendar();
        $state.reload();
      }, function (error) {
        $scope.answerLoading = false;
        $scope.alert(error, function () {
          $state.reload();
        }, 'Error', 'OK');
      });
    };

    $scope.addToCalendar = function () {
      window.plugins.calendar.createEventInteractively($scope.q.title, '', $scope.q.subject,
        $scope.q.started_at_date, $scope.q.finished_at_date, angular.noop, angular.noop);
    };
  })
;