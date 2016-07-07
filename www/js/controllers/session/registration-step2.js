angular.module('app.controllers').controller('session.registration-step2',
  function ($scope, session, $location, $window, iStorageMemory, profile, layout, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.states = profile.states;
    $scope.countries = profile.countries;

    $scope.data = iStorageMemory.get('registration-form-data');

    $scope.$watch($scope.data, function () {
      iStorageMemory.put('registration-form-data', $scope.data);
    });

    $scope.next = function (registrationForm) {
      registrationForm.$filled = true;
      if (registrationForm.$invalid) {
        $scope.alert('Correct the errors and try again', null, 'Error', 'OK');
      } else {
        if ((new Date()).getFullYear() - (new Date($scope.data.birth)).getFullYear() < 13) {
          return $scope.alert('Sorry - you must be 13 or older in order to use Powerline!', null, '', 'OK');
        }
        $scope.showSpinner();
        session.registration($scope.data).then(
          function () {
            $scope.hideSpinner();
            iStorageMemory.remove('registration-form-data');
            $location.path('/guide');
          },
          function (response) {
            $scope.hideSpinner();
            if (response.data && response.data.errors) {
              _(response.data.errors).each(function (error) {
                if (registrationForm[error.property]) {
                  registrationForm[error.property].$setValidity('required', false);
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
