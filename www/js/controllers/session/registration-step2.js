angular.module('app.controllers').controller('session.registration-step2',
  function ($scope, topBar, session, $location, $window, iStorageMemory, profile, layout, flurry) {

    topBar.reset();
    layout.setBodyClass('hidden-header light');

    $scope.states = profile.states;
    $scope.countries = profile.countries;

    $scope.data = iStorageMemory.get('registration-form-data');

    $scope.$watch($scope.data, function () {
      iStorageMemory.put('registration-form-data', $scope.data);
    });

    $scope.next = function () {
      $scope.registrationForm.$filled = true;
      if ($scope.registrationForm.$invalid) {
        $scope.alert('Correct the errors and try again', null, 'Error', 'OK');
      } else {
        if ((new Date()).getFullYear() - (new Date($scope.data.birth)).getFullYear() < 13) {
          return $scope.alert('Sorry - you must be 13 or older in order to use Powerline!', null, '', 'OK');
        }
        $scope.loading = true;
        session.registration($scope.data).then(
          function () {
            flurry.log('registered');
            $scope.loading = false;
            iStorageMemory.remove('registration-form-data');
            $location.path('/guide');
          },
          function (response) {
            $scope.loading = false;
            if (response.data && response.data.errors) {
              _(response.data.errors).each(function (error) {
                if ($scope.registrationForm[error.property]) {
                  $scope.registrationForm[error.property].$setValidity('required', false);
                }
              });
              if (response.data.errors.length) {
                $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
              }
            } else {
              $scope.alert('Error occurred', null, 'Error', 'OK');
            }
          }
        );
      }
    };
  });
