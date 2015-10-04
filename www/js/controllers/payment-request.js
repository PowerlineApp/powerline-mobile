angular.module('app.controllers')
  .controller('question.payment-request', function ($scope, topBar, $routeParams, questions, $route, serverConfig,
                                                    homeCtrlParams, activity, $http, flurry, layout) {
    topBar
      .reset()
      .set('back', true)
      .set('title', 'PAYMENT REQUEST')
    ;

    $scope.data = {
      comment: '',
      privacy: 0
    };

    flurry.log('payment request', {id: Number($routeParams.id)});

    activity.setEntityRead({id: Number($routeParams.id), type: 'payment-request'});
    activity.setEntityRead({id: Number($routeParams.id), type: 'crowdfunding-payment-request'});

    $scope.loading = true;
    questions.load($routeParams.id).then(function (question) {
      $scope.loading = false;
      $scope.q = question;

      $scope.shareTitle = question.title;
      $scope.shareBody = question.subject;
      $scope.shareLink = serverConfig.shareLink + '/payment-request/' + question.id;
      $scope.shareImage = question.share_picture;

      if (question.answer_entity) {
        questions.loadCharge(question.answer_entity.id).then(function(charge) {
          $scope.charge = charge;
        });
      }
      layout.focus($routeParams.focus);
    }, $scope.back);

    $scope.select = function (option) {
      $scope.data.option = option;
      if (option.payment_amount || option.is_user_amount) {
        $scope.data.showCardsInfo = true;
      } else {
        $scope.data.showAnswerForm = true;
      }
    };

    $scope.pay = function () {
      if ($scope.data.option.is_user_amount && !$scope.data.payment_amount) {
        $scope.alert('Payment amount cannot be blank');
        return;
      }
      $scope.answerLoading = true;
      $scope.q.answer({
        option_id: $scope.data.option.id,
        comment: $scope.data.comment,
        privacy: $scope.data.privacy,
        payment_amount: $scope.data.payment_amount
      }).then(function () {
        homeCtrlParams.loaded = false;
        flurry.log('answer to payment request', {id: Number($routeParams.id)});
        $route.reload();
      }, function (error) {
        $scope.answerLoading = false;
        $scope.alert(error, function () {
          $route.reload();
        }, 'Error', 'OK');

      });
    };

  })
;