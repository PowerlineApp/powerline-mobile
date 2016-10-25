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
  }).directive('groupCardForm', function () {
    return {
      restrict: 'E',
      scope: {
        cancel: '&',
        completed: '&',
        group: '='
      },
      templateUrl: 'templates/groups/manage-group/add-group-card.html',
      controller: function ($scope, $rootScope, cards) {
        $scope.group = $scope.group || {}
        var prefillForm = function(){
          $scope.data = {
            currency: 'usd',
            type: 'company',
            first_name: '1',
            last_name: '1',
            ssn_last_4: 1235,
            business_name: '1',
            address_line1: '1',
            address_line2: '1',
            city: '1',
            state: '1',
            postal_code: '1',
            country: 'US',
            card: {
              currency: 'usd',
              name: '1', 
              number: 5105105105105100,
              cvc: 123,
              expired_month: 12,
              expired_year: 2018
            }
          };
        }
        $scope.$watch('group', function(newValue, oldValue) {
          prefillForm()
        }, true);

        $scope.submit = function () {
          console.log('submit')
          $rootScope.showSpinner();
          cards.createGroupCard($scope.data, $scope.group)
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
