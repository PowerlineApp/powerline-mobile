angular.module('app.controllers')
  .controller('question.payment-request', function ($scope, topBar, $stateParams, questions, $state, serverConfig,
                                                    homeCtrlParams, activity, $http, layout) {

    $scope.data = {
      comment: '',
      privacy: 0
    };


    $scope.showSpinner();
    questions.load($stateParams.id).then(function (question) {
      $scope.hideSpinner();
      $scope.q = question;

      $scope.shareTitle = question.title;
      $scope.shareBody = question.subject;
      $scope.shareLink = serverConfig.shareLink + '/payment-request/' + question.id;
      $scope.shareImage = question.share_picture;

      if (question.answer_entity && !$scope.q.is_crowdfunding) {
        questions.loadCharge(question.answer_entity.id).then(function(charge) {
          $scope.charge = charge;
        });
      }
      layout.focus($stateParams.focus);
    }, function(){
      $scope.hideSpinner();
      $scope.back();
    });

    $scope.select = function (option) {
      console.log(option)
      $scope.data.option = option;
      if (option.payment_amount || (option.is_user_amount  && option.value != "I don't want to donate. Mark as read.")) {
        $scope.data.showCardsInfo = true;
      } else {
        $scope.data.showAnswerForm = true;
      }
    };

    $scope.pay = function () {
      if ($scope.data.option.is_user_amount && !$scope.data.payment_amount && $scope.data.option.value != "I don't want to donate. Mark as read.") {
        $scope.alert('Payment amount cannot be blank');
        return;
      }
      $scope.showSpinner();
      $scope.q.answer({
        option_id: $scope.data.option.id,
        comment: $scope.data.comment,
        privacy: $scope.data.privacy,
        payment_amount:  $scope.data.payment_amount || $scope.data.option.payment_amount
      }).then(function () {
        homeCtrlParams.loaded = false;
        $state.reload();
      }, function (error) {
        $scope.hideSpinner();
        if(error.data){
          if(error.data.error){
            error = error.data.error;
          }else{
            error = error.data;
          }
        }
        $scope.alert(JSON.stringify(error), function () {
          $state.reload();
        }, 'Error', 'OK');

      });
    };

  })
;