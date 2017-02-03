angular.module('app.controllers')
  .controller('question.leader-event', function ($scope, topBar, $stateParams, questions, activity, homeCtrlParams, $state, layout, $ionicPopup, groups) {
    
    $scope.data = {
      comment: '',
      privacy: 'public'
    };

    $scope.placeholders = ['It\'s all about different perspectives. Be kind.',
                            'Don\'t attack people. Understand them.',
                            'Listen first. Then ask questions.',
                            'Take a deep breath.'];
    $scope.placeholder = '';

    $scope.$on('$ionicView.beforeEnter', function(){
      var indexPlaceholder = JSON.parse( window.localStorage.getItem('indexPlaceholder'));
      if (typeof indexPlaceholder === "undefined" || indexPlaceholder == null){
        indexPlaceholder = 0;
      }else{
        indexPlaceholder = parseInt(indexPlaceholder);
      }
      $scope.placeholder = $scope.placeholders[indexPlaceholder%4];
      indexPlaceholder++;
      window.localStorage.setItem( 'indexPlaceholder', JSON.stringify(indexPlaceholder));
    })

    $scope.showSpinner();
    questions.load($stateParams.id).then(function (question) {
      $scope.hideSpinner();
      $scope.q = question;

      $scope.group = groups.get(question.group.id);

      $scope.shareTitle = question.title;
      $scope.shareBody = question.subject;
      //$scope.shareLink = serverConfig.shareLink + '/payment-request/' + question.id;
      $scope.shareImage = question.share_picture;
      layout.focus($stateParams.focus);

    }, function(){
      $scope.hideSpinner();
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
      $scope.showSpinner();
      $scope.q.answer({
        option_id: $scope.data.option.id,
        comment: $scope.data.comment,
        privacy: $scope.data.privacy,
        payment_amount: $scope.data.payment_amount
      }).then(function () {
        homeCtrlParams.loaded = false;
        $scope.addToCalendar();
        $state.reload();
      }, function (error) {
        $scope.hideSpinner();
        $scope.alert(error, function () {
          $state.reload();
        }, 'Error', 'OK');
      });
    };

    $scope.addToCalendar = function () {
      if(window.plugins && window.plugins.calendar){
        window.plugins.calendar.createEventInteractively($scope.q.title, '', $scope.q.subject,
        $scope.q.started_at_date, $scope.q.finished_at_date, angular.noop, angular.noop);
      } else {
        alert('window.plugins.calendar not defined. If you are using browser this is expected behaviour, if you use smartphone, this is bug.')
      }
    };

    $scope.report = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm',
        cssClass: 'popup-by-ionic publish-content',
        content: 'Do you want to download the report for this item?',
        scope: $scope
      });

      confirmPopup.then(function(res) {
        if(res) {
          $scope.showSpinner();
          questions.reportPoll($scope.q.id).then(function () {
            $scope.hideSpinner();
          }, function (err){
            $scope.hideSpinner();
          });
        }
      });
    };
  });