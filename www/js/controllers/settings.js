angular.module('app.controllers').controller('settings', function ($scope, topBar, profile, facebook, $state, $timeout, flurry, cards, $q) {

  flurry.log('settings');

  $scope.profile = profile.get();
  $scope.data = {};
  $scope.view = {};
  $scope.$emit('showSpinner');
  $q.all([profile.load(), cards.load().then(function (cardCollection) {
    $scope.cardCollection = cardCollection;
  })]).then(loaded, loaded);

  $scope.save = function() {
    $scope.$emit('showSpinner');
    $scope.data.scheduled_from = $scope.data.scheduled_from_date.toUTCString();
    $scope.data.scheduled_to = $scope.data.scheduled_to_date.toUTCString();
    _($scope.profile).extend($scope.data);
    $scope.profile.$save({action: 'settings'}, function () {
      flurry.log('settings saved');
      $state.reload();
    }, $state.reload);
  }

  $scope.linkToFacebook = function () {
    var promise = $timeout(function () {
      $scope.$emit('hideSpinner');
    }, 2000);
    $scope.$emit('showSpinner');
    facebook.login().then(function (params) {
      $timeout.cancel(promise);
      $scope.$emit('showSpinner');
      facebook.loadProfile(params).then(function(data) {
        data.action = 'link-to-facebook';
        $scope.profile.$save(data).then(function () {
          flurry.log('facebook linked');
          $state.reload();
        }, function (response) {
          $scope.$emit('hideSpinner');
          if (response.data.errors.length) {
            $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
          }
        });
      }, function() {
        $scope.$emit('hideSpinner');
      });
    }, function (error) {
      $scope.alert(error, null, 'Error', 'OK');
      $scope.$emit('hideSpinner');
    });
  };

  function loaded() {
    $scope.$emit('hideSpinner');
    $scope.profile = profile.get();
    setFormData();
  }

  $scope.reload = $state.reload;

  $scope.remove = function (card) {
    $scope.confirmAction('Are you sure?').then(function () {
      $scope.$emit('showSpinner');
      cards.remove(card).then($state.reload, $state.reload);
    });
  };

  function setFormData() {
    $scope.data = _({}).extend($scope.profile);
    $scope.data.scheduled_from_date = new Date($scope.data.scheduled_from || new Date(0).setHours(9));
    $scope.data.scheduled_to_date = new Date($scope.data.scheduled_to || new Date(0).setHours(18));
  }
});