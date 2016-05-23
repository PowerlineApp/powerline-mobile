angular.module('app.directives')
  .directive('cards', function () {
    return {
      restrict: 'E',
      scope: {
        cancel: '&',
        completed: '&'
      },
      templateUrl: 'templates/profile/cards.html',
      controller: function ($scope, profile, cards, $rootScope) {
        $rootScope.showSpinner();
        cards.load()
          .then(function (collection) {
            if (collection.size()) {
              $scope.completed();
            }
          })
          .finally(function () {
            $rootScope.hideSpinner();
          });
        var user = profile.get() || {};
        $scope.data = {
          name: user.full_name,
          number: '',
          cvc: '',
          expired_month: '',
          expired_year: '',
          address: {
            country_code: 'US',
            city: user.city,
            line1: user.address1,
            line2: user.address2,
            state: user.state,
            postal_code: user.zip
          }
        };

        $scope.submit = function () {
          $rootScope.showSpinner();
          cards.create($scope.data)
            .then(function () {
              $scope.completed();
            })
            .catch(function (error) {
              $rootScope.alert(error);
            })
            .finally(function () {
              $rootScope.hideSpinner();
            })
          ;
        };
      }
    };
  })
  .directive('cardForm', function () {
    return {
      restrict: 'E',
      scope: {
        cancel: '&',
        completed: '&'
      },
      templateUrl: 'templates/profile/cards.html',
      controller: function ($scope, profile, cards, $rootScope) {
        var user = profile.get() || {};
        $scope.data = {
          name: user.full_name,
          number: '',
          cvc: '',
          expired_month: '',
          expired_year: '',
          address: {
            country_code: 'US',
            city: user.city,
            line1: user.address1,
            line2: user.address2,
            state: user.state,
            postal_code: user.zip
          }
        };

        $scope.submit = function () {
          $rootScope.showSpinner();
          cards.create($scope.data)
            .then(function (card) {
              $scope.completed(card);
            })
            .catch(function (error) {
              $rootScope.alert(error);
            })
            .finally(function () {
              $rootScope.hideSpinner();
            })
          ;
        };
      }
    };
  })
;
