angular.module('app.controllers').controller('settings', function ($scope, topBar, profile, facebook, $route, $timeout, flurry, cards, $q) {

  topBar
    .reset()
    .set('menu', true)
    .set('title', 'Settings')
    .set('right', {
      btnClass: 'btn-text btn-send',
      title: 'Save',
      click: save
    })
  ;

  flurry.log('settings');

  $scope.profile = profile.get();
  $scope.data = {};
  $scope.view = {};
  $scope.loading = true;
  $q.all([profile.load(), cards.load().then(function (cardCollection) {
    $scope.cardCollection = cardCollection;
  })]).then(loaded, loaded);

  function save() {
    $scope.loading = true;
    $scope.data.scheduled_from = $scope.data.scheduled_from_date.toUTCString();
    $scope.data.scheduled_to = $scope.data.scheduled_to_date.toUTCString();
    _($scope.profile).extend($scope.data);
    $scope.profile.$save({action: 'settings'}, function () {
      flurry.log('settings saved');
      $route.reload();
    }, $route.reload);
  }

  $scope.linkToFacebook = function () {
    var promise = $timeout(function () {
      $scope.loading = false;
    }, 2000);
    $scope.loading = true;
    facebook.login().then(function (params) {
      $timeout.cancel(promise);
      $scope.loading = true;
      facebook.loadProfile(params).then(function(data) {
        data.action = 'link-to-facebook';
        $scope.profile.$save(data).then(function () {
          flurry.log('facebook linked');
          $route.reload();
        }, function (response) {
          $scope.loading = false;
          if (response.data.errors.length) {
            $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
          }
        });
      }, function() {
        $scope.loading = false;
      });
    }, function (error) {
      $scope.alert(error, null, 'Error', 'OK');
      $scope.loading = false;
    });
  };

  function loaded() {
    $scope.loading = false;
    $scope.profile = profile.get();
    setFormData();
  }

  $scope.reload = $route.reload;

  $scope.remove = function (card) {
    $scope.confirmAction('Are you sure?').then(function () {
      $scope.loading = true;
      cards.remove(card).then($route.reload, $route.reload);
    });
  };

  function setFormData() {
    $scope.data = _({}).extend($scope.profile);
    $scope.data.scheduled_from_date = new Date($scope.data.scheduled_from || new Date(0).setHours(9));
    $scope.data.scheduled_to_date = new Date($scope.data.scheduled_to || new Date(0).setHours(18));
  }
});