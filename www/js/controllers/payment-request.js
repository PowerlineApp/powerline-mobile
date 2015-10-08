angular.module('app.controllers')
  .controller('question.payment-request', function ($scope, topBar, $stateParams, questions, $state, serverConfig,
                                                    homeCtrlParams, activity, $http, flurry, layout) {

    $scope.data = {
      comment: '',
      privacy: 0
    };

    flurry.log('payment request', {id: Number($stateParams.id)});

    activity.setEntityRead({id: Number($stateParams.id), type: 'payment-request'});
    activity.setEntityRead({id: Number($stateParams.id), type: 'crowdfunding-payment-request'});

    $scope.$emit('showSpinner');
    questions.load($stateParams.id).then(function (question) {
      $scope.$emit('hideSpinner');
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

    $scope.pay = function () {
      if ($scope.data.option.is_user_amount && !$scope.data.payment_amount) {
        $scope.alert('Payment amount cannot be blank');
        return;
      }
      $scope.$emit('showSpinner');
      $scope.q.answer({
        option_id: $scope.data.option.id,
        comment: $scope.data.comment,
        privacy: $scope.data.privacy,
        payment_amount: $scope.data.payment_amount
      }).then(function () {
        homeCtrlParams.loaded = false;
        flurry.log('answer to payment request', {id: Number($stateParams.id)});
        $state.reload();
      }, function (error) {
        $scope.$emit('hideSpinner');
        $scope.alert(error, function () {
          $state.reload();
        }, 'Error', 'OK');

      });
    };

  })
;