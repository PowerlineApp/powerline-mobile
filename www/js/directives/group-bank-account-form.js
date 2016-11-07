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

        $scope.countries = [
          {name: 'Austria', value: 'AT'},
          {name: 'Australia', value: 'AU'},
          {name: 'Belgium', value: 'BE'},
          {name: 'Canada', value: 'CA'},
          {name: 'Germany', value: 'DE'},
          {name: 'Denmark', value: 'DK'},
          {name: 'Spain', value: 'ES'},
          {name: 'Finland', value: 'FI'},
          {name: 'France', value: 'FR'},
          {name: 'United', value: 'Kingdom'},
          {name: 'Hong', value: 'Kong'},
          {name: 'Ireland', value: 'IE'},
          {name: 'Italy', value: 'IT'},
          {name: 'Japan', value: 'JP'},
          {name: 'Luxembourg', value: 'LU'},
          {name: 'Netherlands', value: 'NL'},
          {name: 'Norway', value: 'NO'},
          {name: 'Portugal', value: 'PT'},
          {name: 'Sweden', value: 'SE'},
          {name: 'Singapore', value: 'SG'},
          {name: 'United States', value: 'US'}
        ]

        $scope.data.stripe = {
          account_number: '',
          routing_number: '',
          country: $scope.countries[$scope.countries.length - 1],
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
            postal_code: ''
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