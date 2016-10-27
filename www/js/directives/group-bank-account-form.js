angular.module('app.directives').directive('groupBankAccountForm', function () {
    return {
      restrict: 'E',
      scope: {
        cancel: '&',
        completed: '&',
        group: '='
      },
      templateUrl: 'templates/groups/manage-group/add-group-bank-account.html',
      controller: function ($scope, $rootScope, cards) {
        $scope.group = $scope.group || {}
        $scope.data = {stripe: {}, powerline: {}}

        $scope.data.stripe = {
          account_number: '000123456789',
          routing_number: '110000000',
          country: 'US',
          currency: 'USD',
          account_holder_name: 'John Doe Company',
          account_holder_type: 'company',
        }

        $scope.data.powerline = {
          first_name: 'John',
          last_name: 'Doe',
          ssn_last_4: '1234',
          address_line1: 'Street 1',
          address_line2: '',
          city: 'San Diego',
          state: 'CA',
          postal_code: '12345',
          country: 'US'
        }

        $scope.submit = function () {
          $rootScope.showSpinner();
          $scope.group.addBankAccount($scope.data)
            .then(function (response) {
              $scope.completed(response);
            })
            .catch(function (error) {
              $rootScope.alert(JSON.stringify(error));
            })
            .finally(function () {
              $rootScope.hideSpinner();
            })
          ;
        };
      }
    };
  })