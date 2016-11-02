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
        $scope.data = {stripe: {}, powerline: {}}

        $scope.data.stripe = {
          account_number: '',
          routing_number: '',
          country: 'US',
          currency: 'USD',
          account_holder_name: '',
          account_holder_type: 'company',
        }

        var prefillForm = function(){
          $scope.data.powerline = {
            first_name: '',
            last_name: '',
            ssn_last_4: '',
            address_line1: $scope.group.official_address,
            address_line2: '',
            city: $scope.group.official_city,
            state: $scope.group.official_state,
            postal_code: '',
            country: 'US'
          }
        }

        $scope.$watch('group', function (val) {
            prefillForm()
        });

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