angular.module('app.controllers').controller('session.registration',
  function ($scope, topBar, session, $location, iStorageMemory, profile, flurry, layout, users, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(false);

    flurry.log('registration');

    $scope.states = profile.states;
    $scope.countries = profile.countries;

    $scope.formClass = '';

    $scope.data = iStorageMemory.get('registration-form-data');

    if (!$scope.data) {
      $scope.data = {};
    }

    $scope.$watch($scope.data, function () {
      iStorageMemory.put('registration-form-data', $scope.data);
    });

    $scope.next = function (registrationForm) {
      registrationForm.$filled = true;
      if (registrationForm.$invalid) {
        $scope.alert('Correct the errors and try again', null, 'Error', 'OK');
      } else {
        $scope.loading = true;
        users.findByUsername($scope.data.username).then(function(users) {
          if (users.length) {
            $scope.alert('The username is already being used', null, 'Error', 'OK');
          } else {
            $scope.path('/registration-step2');
          }
        }).finally(function() {
          $scope.loading = false;
        });
      }
    };
  }).controller('session.terms', function (topBar, flurry) {
    flurry.log('terms');
  });
