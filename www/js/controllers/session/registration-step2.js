angular.module('app.controllers').controller('session.registration-step2',
  function ($scope, session, $location, $window, iStorageMemory, profile, layout, $ionicSideMenuDelegate, $ionicPopup, $timeout) {
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.states = profile.states;
    $scope.countries = profile.countries;
    $scope.age = {iAmAdult: false}

    $scope.data = iStorageMemory.get('registration-form-data');

    $scope.$watch($scope.data, function () {
      iStorageMemory.put('registration-form-data', $scope.data);
    });

    $scope.finishProgressMessages = [
      'Your elected leaders at the local level.',
      'Elected leaders at the national level.',
      'Your local group.',
      'Your state group.',
      'Your federal group.'
    ]

    $scope.progressMessageIsFinished = function(pos){
      return pos < $scope.finishProgressPosition
    }

    $scope.finishProgressPopup = null
    $scope.showFinishProgressPopup = function(){
      $scope.finishProgressPosition = 0
      $scope.finishProgressPopup = $ionicPopup.show({
        templateUrl: 'templates/session/_finishing-registration.html',
        title: 'Completing Registration',
        cssClass: 'popup-by-ionic',
        scope: $scope,
        buttons: []
      });
      
      $timeout(function(){ if($scope.finishProgressPopup) $scope.finishProgressPosition++ }, 2000)
      $timeout(function(){ if($scope.finishProgressPopup) $scope.finishProgressPosition++ }, 4000)
      $timeout(function(){ if($scope.finishProgressPopup) $scope.finishProgressPosition++ }, 6000)
      $timeout(function(){ if($scope.finishProgressPopup) $scope.finishProgressPosition++ }, 8000)
    }

    $scope.hideFinishProgressPopup = function(){
      $scope.finishProgressPosition = 5
      $scope.finishProgressPopup.close()
      $scope.finishProgressPopup = null
    }

    $scope.next = function (registrationForm) {
      if(!$scope.age.iAmAdult){
        alert('You must be 13 or older to register to Powerline.')
        return
      }

      registrationForm.$filled = true;
      if (registrationForm.$invalid) {
        $scope.alert('Correct the errors and try again', null, 'Error', 'OK');
      } else {
        if ((new Date()).getFullYear() - (new Date($scope.data.birth)).getFullYear() < 13) {
          return $scope.alert('Sorry - you must be 13 or older in order to use Powerline!', null, '', 'OK');
        }
        $scope.showFinishProgressPopup();
        session.registration($scope.data).then(
          function () {
            $scope.hideFinishProgressPopup();
            iStorageMemory.remove('registration-form-data');
            $location.path('/guide');
          },
          function (response) {
            $scope.hideFinishProgressPopup();
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
