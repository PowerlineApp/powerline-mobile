angular.module('app.controllers').controller('settings', function ($scope, $ionicScrollDelegate, profile, facebook, $state, $timeout, flurry, cards, $q) {

  flurry.log('settings');

  $scope.profile = profile.get();
  $scope.data = {};
  $scope.view = {};
  $scope.showSpinner();
  $q.all([profile.load(), cards.load().then(function (cardCollection) {
    $scope.cardCollection = cardCollection;
  })]).then(loaded, loaded);

  $scope.save = function() {
    $scope.showSpinner();
    $scope.data.scheduled_from = $scope.data.scheduled_from_date.toUTCString();
    $scope.data.scheduled_to = $scope.data.scheduled_to_date.toUTCString();
    _($scope.profile).extend($scope.data);
    $scope.profile.$save({action: 'settings'}, function () {
      flurry.log('settings saved');
      $state.reload();
    }, $state.reload);
  };

  $scope.linkToFacebook = function () {
    var promise = $timeout(function () {
      $scope.hideSpinner();
    }, 2000);
    $scope.showSpinner();
    facebook.login().then(function (params) {
      $timeout.cancel(promise);
      $scope.showSpinner();
      facebook.loadProfile(params).then(function(data) {
        data.action = 'link-to-facebook';
        $scope.profile.$save(data).then(function () {
          flurry.log('facebook linked');
          $state.reload();
        }, function (response) {
          $scope.hideSpinner();
          if (response.data.errors.length) {
            $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
          }
        });
      }, function() {
        $scope.hideSpinner();
      });
    }, function (error) {
      $scope.alert(error, null, 'Error', 'OK');
      $scope.hideSpinner();
    });
  };

  function loaded() {
    $scope.hideSpinner();
    $scope.profile = profile.get();
    setFormData();
  }

  $scope.reload = $state.reload;

  $scope.openCardForm = function(){
    $scope.view.showCardForm = true;
    $ionicScrollDelegate.scrollTo(0, 80, true);
  };
  
  $scope.remove = function (card) {
    $scope.confirmAction('Are you sure?').then(function () {
      $scope.showSpinner();
      cards.remove(card).then($state.reload, $state.reload);
    });
  };

  function setFormData() {
    $scope.data = _({}).extend($scope.profile);
    $scope.data.scheduled_from_date = new Date($scope.data.scheduled_from || new Date(0).setHours(9));
    $scope.data.scheduled_to_date = new Date($scope.data.scheduled_to || new Date(0).setHours(18));
  }
});